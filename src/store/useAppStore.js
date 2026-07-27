import { create } from 'zustand';
import { supabase, supabaseBackend } from '../services/supabaseClient';

export const useAppStore = create((set, get) => ({
  session: null,
  userId: null,
  profile: null,
  pairing: null,
  partnerProfile: null,
  
  // Data
  calendar: [],
  tasks: [],
  proposals: [],
  storeItems: [],
  redemptions: [],
  praiseNotes: [],
  
  isLoading: true,
  realtimeChannel: null,
  
  setSession: (session) => set({ session, userId: session?.user?.id }),

  loadInitialData: async () => {
    const { userId } = get();
    if (!userId) {
      set({ isLoading: false });
      return;
    }
    
    try {
      set({ isLoading: true });
      const profile = await supabaseBackend.getProfile(userId);
      set({ profile });
      
      if (profile) {
        const pairing = await supabaseBackend.getPairing(userId);
        if (pairing) {
          set({ pairing });
          const partnerId = profile.role === 'owner' ? pairing.pet_id : pairing.owner_id;
          const partnerProfile = await supabaseBackend.getProfile(partnerId);
          set({ partnerProfile });
          
          // Load app data concurrently
          const [calendar, tasks, proposals, storeItems, redemptions, praiseNotes] = await Promise.all([
             supabaseBackend.getCalendarEntries(pairing.id),
             supabaseBackend.getDailyTasks(pairing.id),
             supabaseBackend.getProposals(pairing.id),
             supabaseBackend.getRewardItems(pairing.id),
             supabaseBackend.getRedemptions(pairing.id),
             supabaseBackend.getPraiseNotes(pairing.id)
          ]);
          
          set({ calendar, tasks, proposals, storeItems, redemptions, praiseNotes });
          get().initRealtime(pairing.id);
        }
      }
    } catch (error) {
      console.error("Failed loading initial data:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createProfile: async (profileData) => {
    const { userId } = get();
    const newProfile = await supabaseBackend.createProfile({ ...profileData, id: userId });
    set({ profile: newProfile });
    return newProfile;
  },

  pairWithCode: async (username, code) => {
    const { userId } = get();
    await supabaseBackend.pairWithCode(userId, username, code);
    await get().loadInitialData(); // Reload everything
  },

  initRealtime: (pairingId) => {
    if (get().realtimeChannel) return;

    const channel = supabase.channel(`tamed-${pairingId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'calendar_entries', filter: `pairing_id=eq.${pairingId}` }, () => get().refreshData('calendar'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_tasks', filter: `pairing_id=eq.${pairingId}` }, () => get().refreshData('tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reward_proposals', filter: `pairing_id=eq.${pairingId}` }, () => get().refreshData('proposals'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reward_items', filter: `pairing_id=eq.${pairingId}` }, () => get().refreshData('storeItems'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'redemptions', filter: `pairing_id=eq.${pairingId}` }, () => get().refreshData('redemptions'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'praise_notes', filter: `pairing_id=eq.${pairingId}` }, () => get().refreshData('praiseNotes'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
         const { profile, partnerProfile } = get();
         if (payload.new.id === profile?.id) set({ profile: payload.new });
         if (payload.new.id === partnerProfile?.id) set({ partnerProfile: payload.new });
      })
      .subscribe();
      
    set({ realtimeChannel: channel });
  },

  refreshData: async (type) => {
    const { pairing } = get();
    if (!pairing) return;
    try {
      if (type === 'calendar') set({ calendar: await supabaseBackend.getCalendarEntries(pairing.id) });
      if (type === 'tasks') set({ tasks: await supabaseBackend.getDailyTasks(pairing.id) });
      if (type === 'proposals') set({ proposals: await supabaseBackend.getProposals(pairing.id) });
      if (type === 'storeItems') set({ storeItems: await supabaseBackend.getRewardItems(pairing.id) });
      if (type === 'redemptions') set({ redemptions: await supabaseBackend.getRedemptions(pairing.id) });
      if (type === 'praiseNotes') set({ praiseNotes: await supabaseBackend.getPraiseNotes(pairing.id) });
    } catch(e) {
      console.error(`Failed to refresh ${type}`, e);
    }
  },

  // Action Methods
  setCalendarEntry: async (date, status) => {
    const { pairing } = get();
    await supabaseBackend.setCalendarEntry(pairing.id, date, status);
  },
  
  createDailyTask: async (taskData) => {
    const { pairing } = get();
    await supabaseBackend.createDailyTask({ ...taskData, pairing_id: pairing.id });
  },

  toggleDailyTask: async (taskId, isCompleted) => await supabaseBackend.toggleDailyTask(taskId, isCompleted),
  deleteDailyTask: async (taskId) => await supabaseBackend.deleteDailyTask(taskId),

  createProposal: async (title, cost) => {
    const { pairing, profile } = get();
    await supabaseBackend.createProposal({ pairing_id: pairing.id, pet_id: profile.id, title, cost });
  },

  processProposal: async (proposalId, status) => await supabaseBackend.processProposal(proposalId, status),

  createRewardItem: async (title, cost) => {
    const { pairing } = get();
    await supabaseBackend.createRewardItem({ pairing_id: pairing.id, title, cost });
  },

  deleteRewardItem: async (itemId) => await supabaseBackend.deleteRewardItem(itemId),

  redeemStoreItem: async (itemId, cost) => {
    const { pairing, profile } = get();
    await supabaseBackend.redeemStoreItem(pairing.id, profile.id, itemId, cost);
  },

  processRedemption: async (redemptionId, status) => await supabaseBackend.processRedemption(redemptionId, status),

  sendPraiseNote: async (message) => {
    const { pairing, profile } = get();
    await supabaseBackend.sendPraiseNote({ pairing_id: pairing.id, sender_id: profile.id, message });
  },

  setPetPoints: async (points) => {
    const { partnerProfile } = get();
    await supabaseBackend.setPetPoints(partnerProfile.id, points);
  },

  addXP: async (amount) => {
    const { partnerProfile } = get();
    await supabaseBackend.addXP(partnerProfile.id, amount);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    const { realtimeChannel } = get();
    if (realtimeChannel) supabase.removeChannel(realtimeChannel);
    set({ session: null, userId: null, profile: null, pairing: null, partnerProfile: null, realtimeChannel: null });
  }
}));