-- ==========================================
-- PUPPY SCHEDULE: Supabase Postgres Schema
-- ==========================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('owner', 'pet');
CREATE TYPE pet_species AS ENUM ('puppy', 'kitty', 'fox', 'custom');
CREATE TYPE pairing_status AS ENUM ('pending', 'active');
CREATE TYPE day_status AS ENUM ('green', 'yellow', 'red', 'none');
CREATE TYPE proposal_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE redemption_status AS ENUM ('pending', 'approved', 'denied');
CREATE TYPE praise_type AS ENUM ('headpat', 'treat', 'note');

-- 2. PROFILES TABLE (Includes XP, Level, and Mood)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL, -- e.g., 'Username#9021'
  role user_role NOT NULL,
  username TEXT NOT NULL,
  pet_species pet_species, -- Only relevant for pets
  praise_terms TEXT,       -- Custom praise text
  points_balance INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  mood TEXT DEFAULT 'Happy',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. PAIRINGS TABLE (Includes customizable day point values & custom currency type)
CREATE TABLE public.pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status pairing_status DEFAULT 'pending',
  point_value_green INTEGER DEFAULT 1,
  point_value_yellow INTEGER DEFAULT 0,
  point_value_red INTEGER DEFAULT 0,
  custom_currency_name TEXT,     -- e.g. 'Berries', 'Cookies'
  custom_currency_singular TEXT, -- e.g. 'Berry', 'Cookie'
  custom_currency_icon TEXT,     -- e.g. '🫐', '🍪'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, pet_id)
);
ALTER TABLE public.pairings ENABLE ROW LEVEL SECURITY;

-- 4. CALENDAR ENTRIES TABLE (Includes historical points_awarded snapshot)
CREATE TABLE public.calendar_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  status day_status DEFAULT 'none',
  points_awarded INTEGER DEFAULT 0, -- Preserves historical points value at time of logging
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pairing_id, entry_date)
);
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

-- 5. REWARD PROPOSALS (Pet requests new item to be added to Store)
CREATE TABLE public.reward_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assigned_points INTEGER CHECK (assigned_points >= 0),
  status proposal_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reward_proposals ENABLE ROW LEVEL SECURITY;

-- 6. REWARD STORE CATALOG (Active store items)
CREATE TABLE public.reward_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  point_cost INTEGER NOT NULL CHECK (point_cost >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reward_items ENABLE ROW LEVEL SECURITY;

-- 7. REDEEMED REWARDS (Pet spends points on store items, requires Owner approval)
CREATE TABLE public.redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES public.reward_items(id) ON DELETE SET NULL,
  pet_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  points_spent INTEGER NOT NULL CHECK (points_spent >= 0),
  status redemption_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- 8. DAILY TASKS / BEHAVIOR CODEX (Routines set by Owner)
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 25,
  is_completed BOOLEAN DEFAULT false,
  task_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- 9. PRAISE NOTES & HEAD PATS
CREATE TABLE public.praise_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type praise_type DEFAULT 'headpat',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.praise_notes ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- ROW LEVEL SECURITY POLICIES
-- ==========================================

CREATE OR REPLACE FUNCTION is_user_in_pairing(p_pairing_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pairings 
    WHERE id = p_pairing_id 
    AND (owner_id = auth.uid() OR pet_id = auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles
CREATE POLICY "Users can view their own profile and their partner's" ON public.profiles FOR SELECT USING (id = auth.uid() OR id IN (SELECT owner_id FROM pairings WHERE pet_id = auth.uid()) OR id IN (SELECT pet_id FROM pairings WHERE owner_id = auth.uid()));
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Owners can update their pet's profile" ON public.profiles FOR UPDATE USING (
  id IN (SELECT pet_id FROM pairings WHERE owner_id = auth.uid())
);

-- Pairings
CREATE POLICY "Users can view their own pairings" ON public.pairings FOR SELECT USING (owner_id = auth.uid() OR pet_id = auth.uid());
CREATE POLICY "Owners can update pairing settings" ON public.pairings FOR UPDATE USING (owner_id = auth.uid());

-- Calendar
CREATE POLICY "Users can view calendar for their pairings" ON public.calendar_entries FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Only owners can modify calendar entries" ON public.calendar_entries FOR ALL USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

-- Proposals
CREATE POLICY "Users can view proposals for their pairings" ON public.reward_proposals FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Pets can insert proposals" ON public.reward_proposals FOR INSERT WITH CHECK (auth.uid() = requested_by AND auth.uid() IN (SELECT pet_id FROM pairings WHERE id = pairing_id));
CREATE POLICY "Only owners can update proposals" ON public.reward_proposals FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

-- Reward Items
CREATE POLICY "Users can view reward items for their pairings" ON public.reward_items FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Only owners can modify reward items" ON public.reward_items FOR ALL USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

-- Redemptions
CREATE POLICY "Users can view redemptions for their pairings" ON public.redemptions FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Pets can insert redemptions" ON public.redemptions FOR INSERT WITH CHECK (auth.uid() = pet_id AND auth.uid() IN (SELECT pet_id FROM pairings WHERE id = pairing_id));
CREATE POLICY "Only owners can update redemptions" ON public.redemptions FOR UPDATE USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

-- Daily Tasks
CREATE POLICY "Users can view daily tasks for their pairings" ON public.daily_tasks FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Only owners can insert or delete daily tasks" ON public.daily_tasks FOR ALL USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));
CREATE POLICY "Pets can update daily task completion" ON public.daily_tasks FOR UPDATE USING (is_user_in_pairing(pairing_id));

-- Praise Notes
CREATE POLICY "Users can view praise notes for their pairings" ON public.praise_notes FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Owners can insert praise notes" ON public.praise_notes FOR INSERT WITH CHECK (auth.uid() = sender_id AND auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

-- ==========================================
-- REALTIME
-- ==========================================
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE reward_proposals;
ALTER PUBLICATION supabase_realtime ADD TABLE reward_items;
ALTER PUBLICATION supabase_realtime ADD TABLE redemptions;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE praise_notes;
ALTER PUBLICATION supabase_realtime ADD TABLE pairings;
