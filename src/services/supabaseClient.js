import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const supabaseBackend = {
  // Profiles
  getProfile: async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  createProfile: async (profileData) => {
    if (!supabase) return null;
    // Ensure UID & Pair Code are present
    const uid = profileData.uid || `${profileData.username}#${Math.floor(1000 + Math.random() * 9000)}`;
    const pair_code = profileData.pair_code || Math.floor(100000 + Math.random() * 900000).toString();
    
    const payload = {
      ...profileData,
      uid,
      pair_code,
      points_balance: profileData.points_balance ?? 0,
      xp: profileData.xp ?? 0,
      level: profileData.level ?? 1,
      mood: profileData.mood || 'Happy'
    };

    const { data, error } = await supabase.from('profiles').upsert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId, updates) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  getPairing: async (userId) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('pairings')
      .select('*')
      .or(`owner_id.eq.${userId},pet_id.eq.${userId}`)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  // Calendar
  getCalendarEntries: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('calendar_entries').select('*').eq('pairing_id', pairingId);
    if (error) throw error;
    return data || [];
  },

  setCalendarEntry: async (pairingId, date, status) => {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('process_calendar_entry', {
      p_pairing_id: pairingId,
      p_date: date,
      p_status: status
    });
    if (error) throw error;
    return data;
  },

  // Daily Tasks
  getDailyTasks: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('daily_tasks').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  createDailyTask: async (pairingId, title) => {
    if (!supabase) return null;
    const taskData = {
      pairing_id: pairingId,
      title,
      xp_reward: 25,
      is_completed: false,
      task_date: new Date().toISOString().split('T')[0]
    };
    const { data, error } = await supabase.from('daily_tasks').insert([taskData]).select().single();
    if (error) throw error;
    return data;
  },

  toggleDailyTask: async (taskId, isCompleted) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('daily_tasks').update({ is_completed: isCompleted }).eq('id', taskId).select().single();
    if (error) throw error;
    return data;
  },

  deleteDailyTask: async (taskId) => {
    if (!supabase) return true;
    const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
    if (error) throw error;
    return true;
  },

  // Proposals
  getProposals: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('reward_proposals').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createProposal: async (pairingId, petId, title, description = '') => {
    if (!supabase) return null;
    const proposalData = {
      pairing_id: pairingId,
      requested_by: petId,
      title,
      description,
      assigned_points: 0,
      status: 'pending'
    };
    const { data, error } = await supabase.from('reward_proposals').insert([proposalData]).select().single();
    if (error) throw error;
    return data;
  },

  processProposal: async (proposalId, status, assignedPointsCost = 0) => {
    if (!supabase) return null;
    const cost = parseInt(assignedPointsCost, 10) || 0;
    const { data: prop, error } = await supabase.from('reward_proposals').update({ status, assigned_points: cost }).eq('id', proposalId).select().single();
    if (error) throw error;

    if (status === 'approved' && prop) {
      await supabase.from('reward_items').insert([{
        pairing_id: prop.pairing_id,
        name: prop.title,
        description: prop.description || '',
        point_cost: cost
      }]);
    }
    return prop;
  },

  // Store Items & Redemptions
  getRewardItems: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('reward_items').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createRewardItem: async (pairingId, name, description, pointCost) => {
    if (!supabase) return null;
    const itemData = {
      pairing_id: pairingId,
      name,
      description: description || '',
      point_cost: parseInt(pointCost, 10) || 0
    };
    const { data, error } = await supabase.from('reward_items').insert([itemData]).select().single();
    if (error) throw error;
    return data;
  },

  deleteRewardItem: async (itemId) => {
    if (!supabase) return true;
    const { error } = await supabase.from('reward_items').delete().eq('id', itemId);
    if (error) throw error;
    return true;
  },

  getRedemptions: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('redemptions').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  redeemStoreItem: async (pairingId, petId, rewardItem) => {
    if (!supabase) return null;
    const { data: petProfile } = await supabase.from('profiles').select('points_balance').eq('id', petId).single();
    const balance = petProfile?.points_balance || 0;
    if (balance < rewardItem.point_cost) {
      throw new Error(`You need ${rewardItem.point_cost} pts, but only have ${balance} pts!`);
    }

    // Deduct points balance
    await supabase.from('profiles').update({ points_balance: balance - rewardItem.point_cost }).eq('id', petId);
    
    const { data, error } = await supabase.from('redemptions').insert([{ 
      pairing_id: pairingId, 
      reward_id: rewardItem.id,
      pet_id: petId,
      title: rewardItem.name,
      points_spent: rewardItem.point_cost,
      status: 'pending' 
    }]).select().single();
    
    if (error) throw error;
    return data;
  },

  processRedemption: async (redemptionId, status) => {
    if (!supabase) return null;
    const { data: redemption, error } = await supabase.from('redemptions').update({ status }).eq('id', redemptionId).select().single();
    if (error) throw error;

    if (status === 'denied' && redemption) {
      const { data: petProfile } = await supabase.from('profiles').select('points_balance').eq('id', redemption.pet_id).single();
      if (petProfile) {
        await supabase.from('profiles').update({ points_balance: (petProfile.points_balance || 0) + redemption.points_spent }).eq('id', redemption.pet_id);
      }
    }
    return redemption;
  },

  // Praise Notes
  getPraiseNotes: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('praise_notes').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  sendPraiseNote: async (pairingId, senderId, type, message) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('praise_notes').insert([{
      pairing_id: pairingId,
      sender_id: senderId,
      type: type || 'headpat',
      message
    }]).select().single();
    if (error) throw error;
    return data;
  },

  // Core Mechanics
  setPetPoints: async (petId, points) => {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('set_pet_points', { p_pet_id: petId, p_points: points });
    if (error) throw error;
    return data;
  },

  addXP: async (petId, amount) => {
    if (!supabase) return null;
    const { data, error } = await supabase.rpc('add_xp', { p_profile_id: petId, p_amount: amount });
    if (error) throw error;
    return data;
  },

  // Pairings
  pairWithCode: async (currentUserId, targetUsernameOrUid, targetPairCode) => {
    if (!supabase) return null;
    const cleanUser = (targetUsernameOrUid || '').trim().toLowerCase();
    const cleanCode = (targetPairCode || '').trim();

    if (!cleanUser || !cleanCode) {
      throw new Error("Both Username/UID and 6-digit Pair Code are required for secure pairing!");
    }

    // Fetch current user profile
    const { data: me, error: meError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUserId)
      .single();

    if (meError || !me) throw new Error("Your user profile was not found. Please try logging out and in again.");

    // Fetch profiles to find matching partner
    const { data: profiles, error: targetError } = await supabase
      .from('profiles')
      .select('*');

    if (targetError) throw targetError;

    const target = (profiles || []).find(p => 
      p.id !== me.id &&
      (p.username.toLowerCase() === cleanUser || p.uid.toLowerCase() === cleanUser) &&
      (p.pair_code === cleanCode || (p.uid && p.uid.toLowerCase() === cleanCode))
    );

    if (!target) {
      throw new Error(`Partner "${targetUsernameOrUid}" with pair code "${targetPairCode}" not found. Please verify their Username/UID and 6-digit Pair Code.`);
    }

    if (me.role === target.role) {
      throw new Error(`Pairing requires one Owner and one Pet role. Both your account and ${target.username}'s account currently have the "${me.role}" role.`);
    }

    const ownerId = me.role === 'owner' ? me.id : target.id;
    const petId = me.role === 'pet' ? me.id : target.id;

    // Check existing pairing
    const { data: existingPairings } = await supabase
      .from('pairings')
      .select('*');

    const existing = (existingPairings || []).find(p => p.owner_id === ownerId && p.pet_id === petId);

    if (existing) {
      const { data, error } = await supabase
        .from('pairings')
        .update({ status: 'active' })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('pairings')
        .insert([{ owner_id: ownerId, pet_id: petId, status: 'active' }])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  unpair: async (pairingId) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('pairings').delete().eq('id', pairingId);
    if (error) throw error;
    return data;
  }
};