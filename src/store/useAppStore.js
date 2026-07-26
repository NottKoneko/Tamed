import { create } from 'zustand';
import { mockBackend } from '../services/mockBackend';
import { playSound, setSoundEnabled, isSoundEnabled } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

export const useAppStore = create((set, get) => ({
  user: null, 
  pairing: null, 
  partnerProfile: null,
  calendarEntries: [], 
  proposals: [],     
  rewardItems: [],   
  redemptions: [],   
  dailyTasks: [],
  praiseNotes: [],
  activePraiseModal: null,
  soundEnabled: true,
  activeTab: 'home', 
  toast: null,
  unsubscribeRealtime: null,

  toggleSound: () => {
    const next = !get().soundEnabled;
    set({ soundEnabled: next });
    setSoundEnabled(next);
    get().showToast(next ? 'Sound effects enabled 🔔' : 'Sound effects muted 🔕', 'info');
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 3500);
  },

  setActiveTab: (tab) => {
    playSound('click');
    set({ activeTab: tab });
  },

  setActivePraiseModal: (note) => set({ activePraiseModal: note }),

  setUser: async (user) => {
    set({ user });
    if (user) {
      document.documentElement.setAttribute('data-theme', user.pet_species || 'puppy');
      await get().loadPairingData();
      get().setupRealtime();
    } else {
      set({ pairing: null, partnerProfile: null, calendarEntries: [], proposals: [], rewardItems: [], redemptions: [], dailyTasks: [], praiseNotes: [] });
    }
  },

  quickSwitchRole: async () => {
    playSound('click');
    const { user } = get();
    const targetRole = user?.role === 'owner' ? 'pet' : 'owner';
    
    if (targetRole === 'pet') {
      const pet = await mockBackend.loginPet('Little Fox', 'fox', 'Good fox!');
      await get().setUser(pet);
    } else {
      const owner = await mockBackend.loginOwner('Master Alex');
      await get().setUser(owner);
    }
    get().showToast(`Switched view to ${targetRole.toUpperCase()}`, 'info');
  },

  loadPairingData: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const pairing = await mockBackend.getPairingForUser(user.id);
      set({ pairing });

      if (pairing) {
        const partnerId = user.role === 'owner' ? pairing.pet_id : pairing.owner_id;
        const partnerProfile = await mockBackend.getProfile(partnerId);
        
        const species = user.role === 'pet' ? user.pet_species : (partnerProfile?.pet_species || 'puppy');
        document.documentElement.setAttribute('data-theme', species || 'puppy');

        const [calendarEntries, proposals, rewardItems, redemptions, dailyTasks, praiseNotes] = await Promise.all([
          mockBackend.getCalendarEntries(pairing.id),
          mockBackend.getProposals(pairing.id),
          mockBackend.getRewardItems(pairing.id),
          mockBackend.getRedemptions(pairing.id),
          mockBackend.getDailyTasks(pairing.id),
          mockBackend.getPraiseNotes(pairing.id)
        ]);

        set({ partnerProfile, calendarEntries, proposals, rewardItems, redemptions, dailyTasks, praiseNotes });
      }
    } catch (err) {
      console.error('Error loading pairing data:', err);
    }
  },

  setupRealtime: () => {
    const prevUnsub = get().unsubscribeRealtime;
    if (prevUnsub) prevUnsub();

    const unsub = mockBackend.subscribe(({ event, payload }) => {
      const { user, pairing, showToast } = get();
      if (!user) return;

      if (event === 'PROFILE_UPDATED') {
        if (payload.id === user.id) {
          if (payload.leveledUp) {
            playSound('levelUp');
            triggerConfetti();
            showToast(`LEVEL UP! You reached Level ${payload.level}! 🎉`, 'success');
          }
          set({ user: { ...user, ...payload } });
          if (payload.pet_species) {
            document.documentElement.setAttribute('data-theme', payload.pet_species);
          }
        } else if (get().partnerProfile && payload.id === get().partnerProfile.id) {
          set({ partnerProfile: { ...get().partnerProfile, ...payload } });
        }
      }

      if (event === 'PRAISE_NOTE_CREATED') {
        if (pairing && payload.pairing_id === pairing.id) {
          get().loadPairingData();
          if (user.role === 'pet') {
            playSound('praise');
            triggerConfetti();
            set({ activePraiseModal: payload });
          }
        }
      }

      if (event === 'DAILY_TASK_CREATED' || event === 'DAILY_TASK_UPDATED' || event === 'DAILY_TASK_DELETED') {
        if (pairing) get().loadPairingData();
      }

      if (event === 'CALENDAR_UPDATED') {
        if (pairing && payload.pairing_id === pairing.id) {
          get().loadPairingData();
          if (user.role === 'pet') {
            playSound('praise');
            if (payload.status === 'green') triggerConfetti();
            showToast(`Owner updated schedule! Day marked as ${payload.status.toUpperCase()} 🌟`, 'info');
          }
        }
      }

      if (event === 'PROPOSAL_CREATED') {
        if (pairing && payload.pairing_id === pairing.id) {
          get().loadPairingData();
          if (user.role === 'owner') {
            playSound('click');
            showToast(`New reward store proposal: "${payload.title}"`, 'info');
          }
        }
      }

      if (event === 'PROPOSAL_UPDATED') {
        if (pairing && payload.pairing_id === pairing.id) {
          get().loadPairingData();
          if (user.role === 'pet') {
            playSound('praise');
            showToast(`Proposal "${payload.title}" was ${payload.status}!`, 'info');
          }
        }
      }

      if (event === 'REWARD_ITEM_CREATED' || event === 'REWARD_ITEM_DELETED') {
        if (pairing) get().loadPairingData();
      }

      if (event === 'REDEMPTION_CREATED') {
        if (pairing && payload.pairing_id === pairing.id) {
          get().loadPairingData();
          if (user.role === 'owner') {
            playSound('click');
            showToast(`Pet requested to redeem "${payload.title}" (${payload.points_spent} pts)! 🎁`, 'info');
          }
        }
      }

      if (event === 'REDEMPTION_UPDATED') {
        if (pairing && payload.pairing_id === pairing.id) {
          get().loadPairingData();
          if (user.role === 'pet') {
            if (payload.status === 'approved') {
              playSound('levelUp');
              triggerConfetti();
            }
            showToast(`Redemption for "${payload.title}" was ${payload.status}!`, 'info');
          }
        }
      }
    });

    set({ unsubscribeRealtime: unsub });
  },

  // Pet Mood Update
  updatePetMood: async (mood) => {
    const { user, showToast } = get();
    if (!user) return;
    try {
      const updated = await mockBackend.updateProfile(user.id, { mood });
      set({ user: updated });
      playSound('click');
      showToast(`Mood set to "${mood}"!`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Pairing Point Values Update (Owner)
  updatePairingPointValues: async (pointValues) => {
    const { pairing, showToast } = get();
    if (!pairing) return;
    try {
      const updatedPairing = await mockBackend.updatePairingPointValues(pairing.id, pointValues);
      set({ pairing: updatedPairing });
      playSound('click');
      showToast('Color point values updated! (Does not affect past entries)', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Behavior Codex (Daily Tasks)
  createDailyTask: async (title) => {
    const { pairing, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.createDailyTask(pairing.id, title);
      await get().loadPairingData();
      playSound('click');
      showToast(`Added task "${title}"`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  toggleDailyTask: async (taskId) => {
    const { showToast } = get();
    try {
      const updated = await mockBackend.toggleDailyTask(taskId);
      await get().loadPairingData();
      if (updated.is_completed) {
        playSound('taskComplete');
        showToast('Task completed! +25 XP awarded 🎉', 'success');
      }
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  deleteDailyTask: async (taskId) => {
    const { showToast } = get();
    try {
      await mockBackend.deleteDailyTask(taskId);
      await get().loadPairingData();
      showToast('Daily task removed', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Praise Notes
  sendPraiseNote: async (type, message) => {
    const { pairing, user, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.sendPraiseNote(pairing.id, user.id, type, message);
      await get().loadPairingData();
      playSound('praise');
      triggerConfetti();
      showToast('Praise sent to your Pet! 💖', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Owner Points Override
  setPetPoints: async (newPoints) => {
    const { pairing, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.setPetPoints(pairing.id, newPoints);
      await get().loadPairingData();
      playSound('click');
      showToast(`Pet points balance updated to ${newPoints} pts`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Owner Reward Store Management
  createRewardItem: async (name, description, pointCost) => {
    const { pairing, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.createRewardItem(pairing.id, name, description, pointCost);
      await get().loadPairingData();
      playSound('click');
      showToast(`Added "${name}" to Reward Store!`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  deleteRewardItem: async (itemId) => {
    const { showToast } = get();
    try {
      await mockBackend.deleteRewardItem(itemId);
      await get().loadPairingData();
      showToast('Reward item removed', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  submitRewardProposal: async (title, description) => {
    const { pairing, user, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.createProposal(pairing.id, user.id, title, description);
      await get().loadPairingData();
      playSound('click');
      showToast('Reward proposal sent to Owner!', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  processProposal: async (proposalId, status, assignedPointsCost = 0) => {
    const { showToast } = get();
    try {
      await mockBackend.processProposal(proposalId, status, assignedPointsCost);
      playSound(status === 'approved' ? 'praise' : 'click');
      showToast(status === 'approved' ? `Approved & added to Store at ${assignedPointsCost} pts!` : `Proposal ${status}`, 'success');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  redeemStoreItem: async (rewardItem) => {
    const { pairing, user, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.redeemStoreItem(pairing.id, user.id, rewardItem);
      await get().loadPairingData();
      playSound('click');
      showToast(`Requested redemption for "${rewardItem.name}" (${rewardItem.point_cost} pts)! Sent to Owner for approval.`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  processRedemption: async (redemptionId, status) => {
    const { showToast } = get();
    try {
      await mockBackend.processRedemption(redemptionId, status);
      playSound(status === 'approved' ? 'levelUp' : 'click');
      if (status === 'approved') triggerConfetti();
      showToast(status === 'approved' ? 'Redemption Approved & Fulfilled! 🎉' : 'Redemption Denied (Points refunded)', 'info');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  setCalendarStatus: async (dateStr, status) => {
    const { pairing, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.setCalendarEntry(pairing.id, dateStr, status);
      await get().loadPairingData();
      playSound('click');
      if (status === 'green') triggerConfetti();
      showToast(`Marked ${dateStr} as ${status}`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updatePraiseAndSpecies: async (species, praiseTerms) => {
    const { user, showToast } = get();
    try {
      const updated = await mockBackend.updateProfile(user.id, { pet_species: species, praise_terms: praiseTerms });
      set({ user: updated });
      document.documentElement.setAttribute('data-theme', species);
      playSound('praise');
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  pairWithCode: async (code) => {
    const { user, showToast } = get();
    try {
      await mockBackend.pairWithCode(user.id, code);
      playSound('levelUp');
      triggerConfetti();
      showToast('Successfully paired accounts! 🎉', 'success');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message || 'Failed to pair', 'warning');
      throw err;
    }
  },

  unpair: async () => {
    const { pairing, showToast } = get();
    if (!pairing) return;
    try {
      await mockBackend.unpair(pairing.id);
      set({ pairing: null, partnerProfile: null, calendarEntries: [], proposals: [], rewardItems: [], redemptions: [], dailyTasks: [], praiseNotes: [] });
      showToast('Unpaired successfully.', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  }
}));
