import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables. Check your .env.local or Cloudflare Pages settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const supabaseBackend = {
  // Profiles
  getProfile: async (userId) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"
    return data;
  },
  
  createProfile: async (profileData) => {
    const { data, error } = await supabase.from('profiles').insert([profileData]).select().single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
  },

  // Pairings
  pairWithCode: async (userId, username, pairCode) => {
    const { data: partner, error: partnerError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('username', username)
      .eq('pair_code', pairCode)
      .single();
      
    if (partnerError || !partner) throw new Error("Invalid username or pair code");

    const { data: currentUser, error: currentError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
      
    if (currentError) throw currentError;
    if (currentUser.role === partner.role) throw new Error("You must pair with an account of the opposite role.");

    const owner_id = currentUser.role === 'owner' ? userId : partner.id;
    const pet_id = currentUser.role === 'pet' ? userId : partner.id;

    const { data: pairing, error: pairingError } = await supabase
      .from('pairings')
      .insert([{ owner_id, pet_id }])
      .select()
      .single();

    if (pairingError) throw pairingError;
    return pairing;
  },

  unpair: async (pairingId) => {
    const { error } = await supabase.from('pairings').delete().eq('id', pairingId);
    if (error) throw error;
    return true;
  },
  
  getPairing: async (userId) => {
     const { data, error } = await supabase
      .from('pairings')
      .select('*')
      .or(`owner_id.eq.${userId},pet_id.eq.${userId}`)
      .single();
     if (error && error.code !== 'PGRST116') throw error;
     return data;
  },

  // Calendar
  getCalendarEntries: async (pairingId) => {
    const { data, error } = await supabase.from('calendar_entries').select('*').eq('pairing_id', pairingId);
    if (error) throw error;
    return data;
  },

  setCalendarEntry: async (pairingId, date, status) => {
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
    const { data, error } = await supabase.from('daily_tasks').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  createDailyTask: async (taskData) => {
    const { data, error } = await supabase.from('daily_tasks').insert([taskData]).select().single();
    if (error) throw error;
    return data;
  },

  toggleDailyTask: async (taskId, isCompleted) => {
    const { data, error } = await supabase.from('daily_tasks').update({ is_completed: isCompleted }).eq('id', taskId).select().single();
    if (error) throw error;
    return data;
  },

  deleteDailyTask: async (taskId) => {
    const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
    if (error) throw error;
    return true;
  },

  // Proposals
  getProposals: async (pairingId) => {
    const { data, error } = await supabase.from('reward_proposals').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  createProposal: async (proposalData) => {
    const { data, error } = await supabase.from('reward_proposals').insert([proposalData]).select().single();
    if (error) throw error;
    return data;
  },

  processProposal: async (proposalId, status) => {
    const { data, error } = await supabase.from('reward_proposals').update({ status }).eq('id', proposalId).select().single();
    if (error) throw error;
    return data;
  },

  // Store & Redemptions
  getRewardItems: async (pairingId) => {
    const { data, error } = await supabase.from('reward_items').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  createRewardItem: async (itemData) => {
    const { data, error } = await supabase.from('reward_items').insert([itemData]).select().single();
    if (error) throw error;
    return data;
  },

  deleteRewardItem: async (itemId) => {
    const { error } = await supabase.from('reward_items').delete().eq('id', itemId);
    if (error) throw error;
    return true;
  },

  getRedemptions: async (pairingId) => {
    const { data, error } = await supabase.from('redemptions').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  redeemStoreItem: async (pairingId, petId, itemId, cost) => {
    const { data: petProfile } = await supabase.from('profiles').select('points').eq('id', petId).single();
    if (petProfile.points < cost) throw new Error("Not enough points!");

    await supabase.from('profiles').update({ points: petProfile.points - cost }).eq('id', petId);
    const { data, error } = await supabase.from('redemptions').insert([{ pairing_id: pairingId, reward_item_id: itemId, status: 'pending' }]).select().single();
    
    if (error) throw error;
    return data;
  },

  processRedemption: async (redemptionId, status) => {
     const { data, error } = await supabase.from('redemptions').update({ status }).eq('id', redemptionId).select().single();
     if (error) throw error;
     return data;
  },

  // Praise Notes
  getPraiseNotes: async (pairingId) => {
     const { data, error } = await supabase.from('praise_notes').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
     if (error) throw error;
     return data;
  },
  
  sendPraiseNote: async (noteData) => {
    const { data, error } = await supabase.from('praise_notes').insert([noteData]).select().single();
    if (error) throw error;
    return data;
  },

  // Core Mechanics
  setPetPoints: async (petId, points) => {
    const { data, error } = await supabase.rpc('set_pet_points', { p_pet_id: petId, p_points: points });
    if (error) throw error;
    return data;
  },
  
  addXP: async (petId, amount) => {
    const { data, error } = await supabase.rpc('add_xp', { p_profile_id: petId, p_amount: amount });
    if (error) throw error;
    return data;
  }
};