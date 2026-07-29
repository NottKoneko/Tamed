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

-- 2. PROFILES TABLE (Includes XP, Level, Mood, Custom Species & Custom Theme Logic)
-- 2. PROFILES TABLE (Includes XP, Level, Mood, Custom Species & Custom Theme Logic)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  uid TEXT UNIQUE NOT NULL, -- e.g., 'Username#9021'
  pair_code TEXT UNIQUE,   -- 6-digit pairing PIN code (e.g. '849201')
  role user_role NOT NULL,
  username TEXT NOT NULL CHECK (char_length(username) <= 50),
  pet_species pet_species, -- Only relevant for pets
  custom_species_name TEXT CHECK (custom_species_name IS NULL OR char_length(custom_species_name) <= 50),
  custom_species_icon TEXT, -- e.g., '🐰', '🐲', '🐼'
  pet_nickname TEXT CHECK (pet_nickname IS NULL OR char_length(pet_nickname) <= 50),
  custom_theme_primary TEXT DEFAULT '#8b5cf6', -- Primary accent color (HEX)
  custom_theme_accent TEXT DEFAULT '#ec4899',  -- Secondary accent color (HEX)
  custom_theme_mode TEXT DEFAULT 'light',      -- 'light', 'dark', 'pastel'
  avatar_url TEXT DEFAULT NULL,                -- Custom Profile Picture URL
  praise_terms TEXT CHECK (praise_terms IS NULL OR char_length(praise_terms) <= 200),
  timezone TEXT DEFAULT 'America/Los_Angeles', -- User active timezone
  reminder_time TEXT DEFAULT '21:00', -- Daily check-in reminder time (HH:MM)
  show_xp_bar BOOLEAN DEFAULT TRUE,   -- Toggle visibility of XP progress bar
  pairing_pin TEXT DEFAULT NULL,      -- 4-digit security PIN for sensitive actions
  failed_pin_attempts INTEGER DEFAULT 0, -- Track failed security PIN attempts
  name_changes_today INTEGER DEFAULT 0,       -- Track daily display name changes
  last_name_change_date DATE DEFAULT CURRENT_DATE, -- Date of last display name change
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
  max_pending_proposals INTEGER DEFAULT 3, -- Max pending proposals allowed per pet
  weekend_multiplier NUMERIC DEFAULT 1.0,  -- Weekend point multiplier (e.g. 1.0, 1.5, 2.0)
  custom_currency_name TEXT CHECK (custom_currency_name IS NULL OR char_length(custom_currency_name) <= 50),
  custom_currency_singular TEXT CHECK (custom_currency_singular IS NULL OR char_length(custom_currency_singular) <= 50),
  custom_currency_icon TEXT,     -- e.g. '🫐', '🍪'
  custom_level_titles TEXT,      -- Custom rank titles stored as JSON map (e.g. '{"1":"Novice Pet","2":"Good Pet"}')
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
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 1000),
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
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  assigned_points INTEGER CHECK (assigned_points >= 0),
  status proposal_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reward_proposals ENABLE ROW LEVEL SECURITY;

-- 6. REWARD STORE CATALOG (Active store items)
CREATE TABLE public.reward_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 150),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
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
  title TEXT NOT NULL CHECK (char_length(title) <= 150),
  points_spent INTEGER NOT NULL CHECK (points_spent >= 0),
  status redemption_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- 8. DAILY TASKS & ROUTINES (Set by Owner)
CREATE TABLE public.daily_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
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
  message TEXT NOT NULL CHECK (char_length(message) <= 1000),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.praise_notes ENABLE ROW LEVEL SECURITY;

-- 10. SCHEDULED REMINDERS & INSTANT NUDGES
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID REFERENCES public.pairings(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 500),
  reminder_time TEXT DEFAULT '21:00',
  repeat_option TEXT DEFAULT 'daily',
  is_instant BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

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
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.is_user_in_pairing(UUID) FROM anon;

-- Profiles
CREATE POLICY "Authenticated users can search and view profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Owners can update their pet's profile" ON public.profiles FOR UPDATE USING (
  id IN (SELECT pet_id FROM pairings WHERE owner_id = auth.uid())
);

-- Pairings
CREATE POLICY "Users can view their own pairings" ON public.pairings FOR SELECT USING (owner_id = auth.uid() OR pet_id = auth.uid());
CREATE POLICY "Users can update their pairings" ON public.pairings FOR UPDATE USING (owner_id = auth.uid() OR pet_id = auth.uid());
CREATE POLICY "Users can delete their pairings" ON public.pairings FOR DELETE USING (owner_id = auth.uid() OR pet_id = auth.uid());

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
CREATE POLICY "Pets and owners can delete redemptions" ON public.redemptions FOR DELETE USING (is_user_in_pairing(pairing_id));

-- Daily Tasks
CREATE POLICY "Users can view daily tasks for their pairings" ON public.daily_tasks FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Only owners can insert or delete daily tasks" ON public.daily_tasks FOR ALL USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));
CREATE POLICY "Pets can update daily task completion" ON public.daily_tasks FOR UPDATE USING (is_user_in_pairing(pairing_id));

-- Praise Notes
CREATE POLICY "Users can view praise notes for their pairings" ON public.praise_notes FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Owners can insert praise notes" ON public.praise_notes FOR INSERT WITH CHECK (auth.uid() = sender_id AND auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

-- Reminders
CREATE POLICY "Users can view reminders for their pairings" ON public.reminders FOR SELECT USING (is_user_in_pairing(pairing_id));
CREATE POLICY "Owners can insert reminders" ON public.reminders FOR INSERT WITH CHECK (auth.uid() = created_by AND auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));
CREATE POLICY "Owners can update or delete reminders" ON public.reminders FOR ALL USING (auth.uid() IN (SELECT owner_id FROM pairings WHERE id = pairing_id));

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
ALTER PUBLICATION supabase_realtime ADD TABLE reminders;






















-- 1. Profile INSERT Policy (Required for user onboarding)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 1b. Pairings INSERT Policy (Required for account pairing)
CREATE POLICY "Users can insert pairings" 
ON public.pairings FOR INSERT 
WITH CHECK (auth.uid() = owner_id OR auth.uid() = pet_id);

-- 2. Trigger function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$func$ LANGUAGE plpgsql SET search_path = public, pg_temp;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pairings_updated_at
BEFORE UPDATE ON public.pairings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2b. Trigger function for Database-Enforced Display Name Rate Limiting (Max 5 per day)
CREATE OR REPLACE FUNCTION check_display_name_rate_limit()
RETURNS TRIGGER AS $func$
BEGIN
  IF (NEW.username IS DISTINCT FROM OLD.username) OR (NEW.pet_nickname IS DISTINCT FROM OLD.pet_nickname) THEN
    IF OLD.last_name_change_date IS NULL OR OLD.last_name_change_date < CURRENT_DATE THEN
      NEW.name_changes_today := 1;
      NEW.last_name_change_date := CURRENT_DATE;
    ELSE
      IF COALESCE(OLD.name_changes_today, 0) >= 5 THEN
        RAISE EXCEPTION 'Daily display name change limit reached (max 5 changes per day). Please try again tomorrow.';
      END IF;

      NEW.name_changes_today := COALESCE(OLD.name_changes_today, 0) + 1;
      NEW.last_name_change_date := CURRENT_DATE;
    END IF;
  END IF;

  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS enforce_display_name_rate_limit ON public.profiles;
CREATE TRIGGER enforce_display_name_rate_limit
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION check_display_name_rate_limit();

-- 3. RPC: Add XP and handle leveling logic
CREATE OR REPLACE FUNCTION add_xp(p_profile_id UUID, p_amount INT)
RETURNS VOID AS $func$
DECLARE
  current_xp INT;
  current_level INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT xp, level INTO current_xp, current_level FROM public.profiles WHERE id = p_profile_id;
  
  current_xp := COALESCE(current_xp, 0) + p_amount;
  current_level := 1 + (current_xp / 100); -- Basic progression constraint: 100 XP per level
  
  UPDATE public.profiles SET xp = current_xp, level = current_level WHERE id = p_profile_id;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.add_xp(UUID, INT) FROM anon;

-- 4. RPC: Set exact Pet points
CREATE OR REPLACE FUNCTION set_pet_points(p_pet_id UUID, p_points INT)
RETURNS VOID AS $func$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles SET points_balance = GREATEST(0, p_points) WHERE id = p_pet_id;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.set_pet_points(UUID, INT) FROM anon;

-- 5. RPC: Verify Security PIN with Native Postgres Brute-Force Rate Limiting & Lockout
CREATE OR REPLACE FUNCTION verify_security_pin(p_user_id UUID, p_pin TEXT)
RETURNS JSONB AS $func$
DECLARE
  stored_pin TEXT;
  attempts INT;
  lock_until TIMESTAMPTZ;
BEGIN
  SELECT pairing_pin, COALESCE(failed_pin_attempts, 0), locked_until 
  INTO stored_pin, attempts, lock_until 
  FROM public.profiles 
  WHERE id = p_user_id;

  -- 1. Check if user is currently locked out
  IF lock_until IS NOT NULL AND lock_until > NOW() THEN
    RETURN jsonb_build_object(
      'success', false, 
      'locked', true, 
      'message', 'PIN attempts locked. Try again after ' || to_char(lock_until, 'HH24:MI:SS UTC')
    );
  END IF;

  -- 2. If PIN is not set, allow action by default
  IF stored_pin IS NULL OR stored_pin = '' THEN
    RETURN jsonb_build_object('success', true, 'locked', false);
  END IF;

  -- 3. Check matching PIN
  IF stored_pin = p_pin THEN
    -- Reset failed attempts on success
    UPDATE public.profiles 
    SET failed_pin_attempts = 0, locked_until = NULL 
    WHERE id = p_user_id;

    RETURN jsonb_build_object('success', true, 'locked', false);
  ELSE
    attempts := attempts + 1;

    -- Trigger 15 minute lockout on 5 consecutive failures
    IF attempts >= 5 THEN
      lock_until := NOW() + INTERVAL '15 minutes';
      UPDATE public.profiles 
      SET failed_pin_attempts = attempts, locked_until = lock_until 
      WHERE id = p_user_id;

      RETURN jsonb_build_object(
        'success', false, 
        'locked', true, 
        'message', 'Too many failed PIN attempts. Security locked for 15 minutes.'
      );
    ELSE
      UPDATE public.profiles 
      SET failed_pin_attempts = attempts 
      WHERE id = p_user_id;

      RETURN jsonb_build_object(
        'success', false, 
        'locked', false, 
        'attempts_remaining', (5 - attempts),
        'message', 'Incorrect Security PIN code. ' || (5 - attempts) || ' attempts remaining.'
      );
    END IF;
  END IF;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.verify_security_pin(UUID, TEXT) FROM anon;

-- 6. RPC: Process Redemption (Approve or Deny with points refund)
CREATE OR REPLACE FUNCTION process_redemption(p_redemption_id UUID, p_status redemption_status)
RETURNS JSONB AS $func$
DECLARE
  v_redemption RECORD;
BEGIN
  SELECT * INTO v_redemption FROM public.redemptions WHERE id = p_redemption_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found';
  END IF;

  UPDATE public.redemptions 
  SET status = p_status 
  WHERE id = p_redemption_id;

  -- Refund points if denied and was not previously denied
  IF p_status = 'denied' AND v_redemption.status != 'denied' THEN
    UPDATE public.profiles 
    SET points_balance = COALESCE(points_balance, 0) + v_redemption.points_spent 
    WHERE id = v_redemption.pet_id;
  END IF;

  RETURN jsonb_build_object(
    'id', p_redemption_id,
    'status', p_status,
    'pet_id', v_redemption.pet_id,
    'points_spent', v_redemption.points_spent
  );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.process_redemption(UUID, redemption_status) FROM anon;

-- 7. RPC: Cancel Redemption (Take Back Request & Refund Points - Pending Only)
CREATE OR REPLACE FUNCTION cancel_redemption(p_redemption_id UUID)
RETURNS JSONB AS $func$
DECLARE
  v_redemption RECORD;
BEGIN
  SELECT * INTO v_redemption FROM public.redemptions WHERE id = p_redemption_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Redemption request not found';
  END IF;

  -- Block taking back requests once approved or denied
  IF v_redemption.status != 'pending' THEN
    RAISE EXCEPTION 'Once approved or denied, redemption requests cannot be taken back.';
  END IF;

  -- Delete redemption record
  DELETE FROM public.redemptions WHERE id = p_redemption_id;

  -- Refund points spent back to Pet profile
  UPDATE public.profiles 
  SET points_balance = COALESCE(points_balance, 0) + v_redemption.points_spent 
  WHERE id = v_redemption.pet_id;

  RETURN jsonb_build_object(
    'id', p_redemption_id,
    'status', 'cancelled',
    'points_refunded', v_redemption.points_spent
  );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.cancel_redemption(UUID) FROM anon;

-- 8. RPC: Process Calendar Entry (Atomic Status Toggle & Points Award)
DROP FUNCTION IF EXISTS process_calendar_entry(UUID, DATE, TEXT);
CREATE OR REPLACE FUNCTION process_calendar_entry(
  p_pairing_id UUID,
  p_date DATE,
  p_status TEXT
)
RETURNS JSONB AS $func$
DECLARE
  v_pairing RECORD;
  v_existing RECORD;
  v_new_points INT := 0;
  v_old_points INT := 0;
  v_delta INT := 0;
  v_is_weekend BOOLEAN;
  v_multiplier NUMERIC := 1.0;
BEGIN
  SELECT * INTO v_pairing FROM public.pairings WHERE id = p_pairing_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pairing not found';
  END IF;

  SELECT * INTO v_existing FROM public.calendar_entries 
  WHERE pairing_id = p_pairing_id AND entry_date = p_date;

  IF v_existing IS NOT NULL THEN
    v_old_points := COALESCE(v_existing.points_awarded, 0);
  END IF;

  -- Determine points for status
  IF p_status = 'green' THEN
    v_is_weekend := EXTRACT(DOW FROM p_date) IN (0, 6);
    IF v_is_weekend AND v_pairing.weekend_multiplier IS NOT NULL THEN
      v_multiplier := v_pairing.weekend_multiplier;
    END IF;
    v_new_points := ROUND(COALESCE(v_pairing.point_value_green, 1) * v_multiplier);
  ELSIF p_status = 'yellow' THEN
    v_new_points := COALESCE(v_pairing.point_value_yellow, 0);
  ELSIF p_status = 'red' THEN
    v_new_points := COALESCE(v_pairing.point_value_red, 0);
  END IF;

  IF p_status = 'none' THEN
    DELETE FROM public.calendar_entries WHERE pairing_id = p_pairing_id AND entry_date = p_date;
  ELSE
    INSERT INTO public.calendar_entries (pairing_id, entry_date, status, points_awarded)
    VALUES (p_pairing_id, p_date, p_status, v_new_points)
    ON CONFLICT (pairing_id, entry_date)
    DO UPDATE SET status = EXCLUDED.status, points_awarded = EXCLUDED.points_awarded;
  END IF;

  v_delta := v_new_points - v_old_points;

  IF v_delta != 0 THEN
    UPDATE public.profiles 
    SET points_balance = GREATEST(0, COALESCE(points_balance, 0) + v_delta)
    WHERE id = v_pairing.pet_id;
  END IF;

  RETURN jsonb_build_object(
    'pairing_id', p_pairing_id,
    'entry_date', p_date,
    'status', p_status,
    'points_awarded', v_new_points,
    'points_delta', v_delta
  );
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.process_calendar_entry(UUID, DATE, TEXT) FROM anon;

-- MIGRATION UTILITY (Run if upgrading existing database):
-- ALTER TABLE public.pairings ADD COLUMN IF NOT EXISTS custom_level_titles TEXT;