import { create } from 'zustand';
import { supabase, supabaseBackend, isSupabaseConfigured } from '../services/supabaseClient';
import { mockBackend } from '../services/mockBackend';
import { playSound, setSoundEnabled } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { applyCustomTheme } from '../utils/theme';
import { checkRateLimit, cleanupRateLimitStorage } from '../utils/rateLimiter';
import { sanitizeText, clampInput } from '../utils/sanitizer';
import { getLocalDateString } from '../utils/dateUtils';
import { getSecureRandomInt } from '../utils/cryptoUtils';

const sendNativeNotification = (title, body) => {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const options = {
        body: body || 'Tamed Check-in Alert 🐾',
        icon: '/favicon.svg',
        badge: '/favicon.svg'
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, options);
        }).catch(() => {
          new Notification(title, options);
        });
      } else {
        new Notification(title, options);
      }
    } catch (e) {
      console.warn('Native Notification call failed:', e);
    }
  }
};

export const useAppStore = create((set, get) => ({
  session: null,
  user: null, 
  profile: null, // alias for user
  pairing: null, 
  partnerProfile: null,
  calendarEntries: [], 
  proposals: [],     
  rewardItems: [],   
  redemptions: [],   
  dailyTasks: [],
  praiseNotes: [],
  reminders: [],
  activePraiseModal: null,
  soundEnabled: true,
  activeTab: 'home', 
  toast: null,
  isLoading: false,
  realtimeChannel: null,
  lastLoadedDate: null,

  checkDayRollover: async () => {
    const { lastLoadedDate, user, pairing } = get();
    if (!user || !pairing) return;
    const todayStr = getLocalDateString();
    if (lastLoadedDate && lastLoadedDate !== todayStr) {
      set({ lastLoadedDate: todayStr });
      await get().loadPairingData();
      await get().evaluateAutoCalendarStatus();
    }
  },

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
  setSession: (session) => set({ session }),

  setUser: (user) => {
    set({ user, profile: user });
    if (user) {
      applyCustomTheme(user);
      get().loadPairingData();
    } else {
      set({ pairing: null, partnerProfile: null, calendarEntries: [], proposals: [], rewardItems: [], redemptions: [], dailyTasks: [], praiseNotes: [] });
    }
  },

  createInitialProfile: async (profileDetails) => {
    const { session } = get();
    const activeUserId = session?.user?.id;
    
    if (isSupabaseConfigured && session && activeUserId) {
      const uid = `${profileDetails.username}#${1000 + getSecureRandomInt(9000)}`;
      const pair_code = (100000 + getSecureRandomInt(900000)).toString();
      
      const payload = {
        id: activeUserId,
        uid,
        pair_code,
        role: profileDetails.role,
        username: profileDetails.username,
        pet_species: profileDetails.pet_species || (profileDetails.role === 'pet' ? 'puppy' : null),
        custom_species_name: profileDetails.custom_species_name || null,
        custom_species_icon: profileDetails.custom_species_icon || null,
        custom_theme_primary: profileDetails.custom_theme_primary || '#8b5cf6',
        custom_theme_accent: profileDetails.custom_theme_accent || '#ec4899',
        custom_theme_mode: 'light',
        praise_terms: profileDetails.praise_terms || (profileDetails.role === 'pet' ? 'Good girl!' : null),
        timezone: profileDetails.timezone || 'America/Los_Angeles',
        points_balance: 0,
        xp: 0,
        level: 1,
        mood: 'Happy'
      };

      const created = await supabaseBackend.createProfile(payload);
      set({ user: created, profile: created });
      applyCustomTheme(created);
      return created;
    } else {
      let profile;
      if (profileDetails.role === 'owner') {
        profile = await mockBackend.loginOwner(profileDetails.username);
      } else {
        profile = await mockBackend.loginPet(
          profileDetails.username,
          profileDetails.pet_species,
          profileDetails.praise_terms,
          profileDetails.custom_species_name,
          profileDetails.custom_species_icon,
          profileDetails.custom_theme_primary,
          profileDetails.custom_theme_accent
        );
      }
      profile.timezone = profileDetails.timezone;
      set({ user: profile, profile });
      applyCustomTheme(profile);
      return profile;
    }
  },

  // Load user & pairing data (works with Supabase when configured, or mockBackend)
  loadPairingData: async () => {
    const { user, session } = get();
    const activeUserId = user?.id || session?.user?.id;
    if (!activeUserId) return;

    try {
      set({ isLoading: true });
      let currentProfile = user;
      let pairingData = null;

      if (isSupabaseConfigured && session) {
        currentProfile = await supabaseBackend.getProfile(activeUserId);
        if (currentProfile) {
          set({ user: currentProfile, profile: currentProfile });
          applyCustomTheme(currentProfile);
          pairingData = await supabaseBackend.getPairing(activeUserId);
        }
      } else {
        pairingData = await mockBackend.getPairingForUser(activeUserId);
      }

      set({ pairing: pairingData });

      if (pairingData && currentProfile) {
        const partnerId = currentProfile.role === 'owner' ? pairingData.pet_id : pairingData.owner_id;
        
        let partnerProfile = null;
        let calendarEntries = [];
        let proposals = [];
        let rewardItems = [];
        let redemptions = [];
        let dailyTasks = [];
        let praiseNotes = [];
        let reminders = [];

        cleanupRateLimitStorage();
        if (isSupabaseConfigured && session) {
          await supabaseBackend.pruneStaleData(pairingData.id);
          [partnerProfile, calendarEntries, proposals, rewardItems, redemptions, dailyTasks, praiseNotes, reminders] = await Promise.all([
            supabaseBackend.getProfile(partnerId),
            supabaseBackend.getCalendarEntries(pairingData.id),
            supabaseBackend.getProposals(pairingData.id),
            supabaseBackend.getRewardItems(pairingData.id),
            supabaseBackend.getRedemptions(pairingData.id),
            supabaseBackend.getDailyTasks(pairingData.id),
            supabaseBackend.getPraiseNotes(pairingData.id),
            supabaseBackend.getReminders(pairingData.id)
          ]);
        } else {
          await mockBackend.pruneStaleData(pairingData.id);
          [partnerProfile, calendarEntries, proposals, rewardItems, redemptions, dailyTasks, praiseNotes, reminders] = await Promise.all([
            mockBackend.getProfile(partnerId),
            mockBackend.getCalendarEntries(pairingData.id),
            mockBackend.getProposals(pairingData.id),
            mockBackend.getRewardItems(pairingData.id),
            mockBackend.getRedemptions(pairingData.id),
            mockBackend.getDailyTasks(pairingData.id),
            mockBackend.getPraiseNotes(pairingData.id),
            mockBackend.getReminders(pairingData.id)
          ]);
        }

        const species = currentProfile.role === 'pet' ? currentProfile.pet_species : (partnerProfile?.pet_species || 'puppy');
        document.documentElement.setAttribute('data-theme', species || 'puppy');

        set({ partnerProfile, calendarEntries, proposals, rewardItems, redemptions, dailyTasks, praiseNotes, reminders, lastLoadedDate: getLocalDateString() });

        // Auto-popup unread Praise Cards & Instant Nudges received recently
        if (praiseNotes && praiseNotes.length > 0) {
          const latestNote = praiseNotes[0];
          const isReceived = currentProfile && latestNote.sender_id !== currentProfile.id;
          const isRecent = (Date.now() - new Date(latestNote.created_at).getTime()) < 10 * 60 * 1000;
          const alreadySeen = localStorage.getItem(`seen_praise_${latestNote.id}`);
          if (isReceived && isRecent && !alreadySeen && !get().activePraiseModal) {
            localStorage.setItem(`seen_praise_${latestNote.id}`, 'true');
            set({ activePraiseModal: latestNote });
            playSound('praise');
            triggerConfetti();
            sendNativeNotification('💖 New Praise Card Received!', latestNote.message || 'You received a praise card from your partner!');
          }
        }

        if (reminders && reminders.length > 0) {
          const latestNudge = reminders.find(r => r.is_instant);
          if (latestNudge) {
            const isReceived = currentProfile && latestNudge.created_by !== currentProfile.id;
            const isRecent = (Date.now() - new Date(latestNudge.created_at).getTime()) < 10 * 60 * 1000;
            const alreadySeen = localStorage.getItem(`seen_nudge_${latestNudge.id}`);
            if (isReceived && isRecent && !alreadySeen) {
              localStorage.setItem(`seen_nudge_${latestNudge.id}`, 'true');
              playSound('praise');
              get().showToast(`⚡ Nudge: ${latestNudge.title}${latestNudge.message ? ` - "${latestNudge.message}"` : ''}`, 'info');
              sendNativeNotification(`⚡ Nudge: ${latestNudge.title}`, latestNudge.message || 'Your partner sent a check-in nudge!');
            }
          }
        }

        get().setupRealtime(pairingData.id);
      }
    } catch (err) {
      console.error('Error loading pairing data:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Alias for loadPairingData used in App.jsx
  loadInitialData: async () => {
    await get().loadPairingData();
  },

  // Supabase Realtime / Mock PubSub
  setupRealtime: (pairingId) => {
    if (isSupabaseConfigured && supabase && pairingId) {
      if (get().realtimeChannel) return;

      const channel = supabase.channel(`tamed-${pairingId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'praise_notes' }, (payload) => {
          const { user, showToast } = get();
          const note = payload.new;
          if (user && note && note.sender_id !== user.id) {
            localStorage.setItem(`seen_praise_${note.id}`, 'true');
            set({ activePraiseModal: note });
            playSound('praise');
            triggerConfetti();
            showToast('New Praise Card received! 💖', 'success');
            sendNativeNotification('💖 New Praise Card Received!', note.message || 'You received a praise card from your partner!');
          }
          get().loadPairingData();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reminders' }, (payload) => {
          const { user, showToast } = get();
          const rem = payload.new;
          if (user && rem && rem.created_by !== user.id) {
            localStorage.setItem(`seen_nudge_${rem.id}`, 'true');
            playSound('praise');
            triggerConfetti();
            showToast(`⚡ Nudge: ${rem.title}${rem.message ? ` - "${rem.message}"` : ''}`, 'info');
            sendNativeNotification(`⚡ Nudge: ${rem.title}`, rem.message || 'Your partner sent a check-in nudge!');
          }
          get().loadPairingData();
        })
        .on('postgres_changes', { event: '*', schema: 'public' }, () => {
          get().loadPairingData();
        })
        .subscribe();

      set({ realtimeChannel: channel });
    } else {
      mockBackend.subscribe(({ event, payload }) => {
        const { user, pairing, showToast } = get();
        if (!user) return;

        if (event === 'PRAISE_NOTE_CREATED' && payload.sender_id !== user.id) {
          localStorage.setItem(`seen_praise_${payload.id}`, 'true');
          set({ activePraiseModal: payload });
          playSound('praise');
          triggerConfetti();
          showToast('New Praise Card received! 💖', 'success');
          sendNativeNotification('💖 New Praise Card Received!', payload.message || 'You received a praise card!');
        }

        if (event === 'REMINDER_CREATED' && payload.created_by !== user.id) {
          localStorage.setItem(`seen_nudge_${payload.id}`, 'true');
          playSound('praise');
          triggerConfetti();
          showToast(`⚡ Nudge: ${payload.title}${payload.message ? ` - "${payload.message}"` : ''}`, 'info');
          sendNativeNotification(`⚡ Nudge: ${payload.title}`, payload.message || 'Your partner sent a check-in nudge!');
        }

        if (event === 'PROFILE_UPDATED' && payload.id === user.id) {
          if (payload.leveledUp) {
            playSound('levelUp');
            triggerConfetti();
            showToast(`LEVEL UP! You reached Level ${payload.level}! 🎉`, 'success');
          }
          set({ user: { ...user, ...payload }, profile: { ...user, ...payload } });
        }
        if (pairing) get().loadPairingData();
      });
    }
  },

  // Quick switch between demo roles
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

  // Pet Mood Update
  updatePetMood: async (mood) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, { mood });
      } else {
        updated = await mockBackend.updateProfile(user.id, { mood });
      }
      set({ user: updated, profile: updated });
      playSound('click');
      showToast(`Mood set to "${mood}"!`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Profile Details & PFP Avatar Update
  updateUserProfile: async (updates) => {
    const { user, session, showToast } = get();
    if (!user) return;

    // Sliding window rate limit check for display name & nickname changes (Max 3 changes per 60s)
    const isNameChanged = (updates.username && updates.username !== user.username) || 
                          (updates.pet_nickname !== undefined && updates.pet_nickname !== user.pet_nickname);

    if (isNameChanged) {
      // 1. Short-term burst check: Max 3 changes per 60 seconds
      const burstCheck = checkRateLimit(`name_change_burst:${user.id}`, 3, 60000);
      if (!burstCheck.allowed) {
        showToast(`Rate limit reached: Please wait ${burstCheck.retryAfterSeconds}s before changing your display name again. ⏳`, 'warning');
        return;
      }

      // 2. Persistent daily check: Max 5 changes per 24 hours (86,400,000 ms)
      const dailyCheck = checkRateLimit(`name_change_daily:${user.id}`, 5, 86400000);
      if (!dailyCheck.allowed) {
        const hoursRemaining = Math.ceil(dailyCheck.retryAfterSeconds / 3600);
        showToast(`Daily limit reached: Display name can be changed max 5 times per day. Try again in ~${hoursRemaining} hour(s). ⏳`, 'warning');
        return;
      }
    }

    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, updates);
      } else {
        updated = await mockBackend.updateProfile(user.id, updates);
      }
      set({ user: updated, profile: updated });
      await get().loadPairingData();
      playSound('click');
      showToast('Profile updated successfully! ✨', 'success');
      return updated;
    } catch (err) {
      showToast(err.message, 'warning');
      throw err;
    }
  },

  // Permanent Account & Data Erasure (GDPR / Data Privacy Compliance)
  deleteAccount: async (password) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.deleteAccount(user.id, password);
      } else {
        await mockBackend.deleteAccount(user.id, password);
      }
      set({
        user: null,
        profile: null,
        session: null,
        pairing: null,
        partnerProfile: null,
        dailyTasks: [],
        calendarEntries: [],
        proposals: [],
        rewardItems: [],
        redemptions: [],
        nudges: []
      });
      showToast('Your account and personal data have been permanently erased.', 'info');
      return true;
    } catch (err) {
      showToast(err.message, 'warning');
      throw err;
    }
  },

  // Daily Tasks & Routines
  createDailyTask: async (title) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.createDailyTask(pairing.id, title);
      } else {
        await mockBackend.createDailyTask(pairing.id, title);
      }
      await get().loadPairingData();
      playSound('click');
      showToast(`Added task "${title}"`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  evaluateAutoCalendarStatus: async () => {
    const { dailyTasks, pairing } = get();
    if (!pairing || !dailyTasks || dailyTasks.length === 0) return;

    const todayStr = getLocalDateString();
    const total = dailyTasks.length;
    const completed = dailyTasks.filter(t => t.is_completed).length;

    let targetStatus = 'red';
    if (completed === total && total > 0) {
      targetStatus = 'green';
    } else if (total > 0 && (completed / total) >= (1 / 3)) {
      targetStatus = 'yellow';
    }

    try {
      await get().setCalendarStatus(todayStr, targetStatus);
    } catch (err) {
      console.error("Auto calendar evaluation error:", err);
    }
  },

  toggleDailyTask: async (taskId) => {
    const { dailyTasks, session, showToast, pairing } = get();
    const task = (dailyTasks || []).find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.is_completed;
    const xpReward = task.xp_reward || 25;

    // Optimistically update store dailyTasks state immediately
    const updatedTasks = (dailyTasks || []).map(t =>
      t.id === taskId ? { ...t, is_completed: newStatus } : t
    );
    set({ dailyTasks: updatedTasks });

    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.toggleDailyTask(taskId, newStatus);
        if (pairing?.pet_id) {
          if (newStatus) {
            await supabaseBackend.addXP(pairing.pet_id, xpReward);
          } else {
            await supabaseBackend.removeXP(pairing.pet_id, xpReward);
          }
        }
      } else {
        await mockBackend.toggleDailyTask(taskId, newStatus);
      }
      await get().evaluateAutoCalendarStatus();
      await get().loadPairingData();
      if (newStatus) {
        playSound('taskComplete');
        showToast(`Task completed! +${xpReward} XP awarded 🎉`, 'success');
      } else {
        showToast(`Task undone. -${xpReward} XP removed ↩️`, 'info');
      }
    } catch (err) {
      showToast(err.message, 'warning');
      get().loadPairingData();
    }
  },

  overrideDailyTask: async (taskId, isCompleted = true) => {
    const { dailyTasks, session, showToast, pairing } = get();
    const task = (dailyTasks || []).find(t => t.id === taskId);
    const wasCompleted = task?.is_completed;
    const xpReward = task?.xp_reward || 25;

    // Optimistically update store dailyTasks state immediately
    const updatedTasks = (dailyTasks || []).map(t =>
      t.id === taskId ? { ...t, is_completed: isCompleted } : t
    );
    set({ dailyTasks: updatedTasks });

    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.overrideDailyTask(taskId, isCompleted);
        if (pairing?.pet_id) {
          if (isCompleted && !wasCompleted) {
            await supabaseBackend.addXP(pairing.pet_id, xpReward);
          } else if (!isCompleted && wasCompleted) {
            await supabaseBackend.removeXP(pairing.pet_id, xpReward);
          }
        }
      } else {
        await mockBackend.overrideDailyTask(taskId, isCompleted);
      }
      await get().evaluateAutoCalendarStatus();
      await get().loadPairingData();
      playSound('praise');
      showToast(isCompleted ? 'Owner override: Task marked complete! 🟢' : 'Owner override: Task marked incomplete ↩️', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
      get().loadPairingData();
    }
  },

  deleteDailyTask: async (taskId) => {
    const { session, showToast } = get();
    // Optimistically update store dailyTasks state immediately
    const updatedTasks = (get().dailyTasks || []).filter(t => t.id !== taskId);
    set({ dailyTasks: updatedTasks });

    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.deleteDailyTask(taskId);
      } else {
        await mockBackend.deleteDailyTask(taskId);
      }
      await get().evaluateAutoCalendarStatus();
      await get().loadPairingData();
      showToast('Daily task removed', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
      get().loadPairingData();
    }
  },

  // Praise Notes
  sendPraiseNote: async (type, message) => {
    const { pairing, user, session, showToast } = get();
    if (!pairing) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.sendPraiseNote(pairing.id, user.id, type, message);
      } else {
        await mockBackend.sendPraiseNote(pairing.id, user.id, type, message);
      }
      await get().loadPairingData();
      playSound('praise');
      triggerConfetti();
      showToast('Praise sent to your Pet! 💖', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Reminders & Instant Nudges
  sendInstantNudge: async (title, message = '') => {
    const { pairing, user, session, showToast } = get();
    if (!pairing || !user) return;

    // Sliding window rate limit check: max 3 instant nudges per 60 seconds
    const rateCheck = checkRateLimit(`instant_nudge:${user.id}`, 3, 60000);
    if (!rateCheck.allowed) {
      showToast(`Rate limit reached! Please wait ${rateCheck.retryAfterSeconds}s before sending another instant nudge. ⏳`, 'warning');
      return;
    }

    try {
      const payload = {
        title: title || 'Instant Nudge! 🔔',
        message: message || 'Your owner is sending a gentle check-in nudge!',
        reminderTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        repeatOption: 'once',
        isInstant: true
      };

      if (isSupabaseConfigured && session) {
        await supabaseBackend.createReminder(pairing.id, user.id, payload);
      } else {
        await mockBackend.createReminder(pairing.id, user.id, payload);
      }

      await get().loadPairingData();
      playSound('praise');
      triggerConfetti();
      showToast('Instant nudge sent to your Pet! 🔔', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  createScheduledReminder: async (title, reminderTime, repeatOption = 'daily', message = '') => {
    const { pairing, user, session, showToast } = get();
    if (!pairing || !user) return;

    try {
      const payload = {
        title,
        message,
        reminderTime,
        repeatOption,
        isInstant: false
      };

      if (isSupabaseConfigured && session) {
        await supabaseBackend.createReminder(pairing.id, user.id, payload);
      } else {
        await mockBackend.createReminder(pairing.id, user.id, payload);
      }

      await get().loadPairingData();
      playSound('click');
      showToast(`Scheduled reminder "${title}" for ${reminderTime} ⏰`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  deleteReminder: async (reminderId) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.deleteReminder(reminderId);
      } else {
        await mockBackend.deleteReminder(reminderId);
      }
      await get().loadPairingData();
      showToast('Reminder removed', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  // Points Management
  setPetPoints: async (newPoints) => {
    const { pairing, partnerProfile, user, session, showToast } = get();
    const petId = user?.role === 'pet' ? user.id : partnerProfile?.id;
    if (!pairing || !petId) return;

    const targetBalance = Math.max(0, parseInt(newPoints, 10) || 0);

    // Optimistically update UI state immediately
    if (partnerProfile && partnerProfile.id === petId) {
      set({ partnerProfile: { ...partnerProfile, points_balance: targetBalance } });
    }
    if (user && user.id === petId) {
      set({ user: { ...user, points_balance: targetBalance }, profile: { ...user, points_balance: targetBalance } });
    }

    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.setPetPoints(petId, targetBalance);
      } else {
        await mockBackend.setPetPoints(petId, targetBalance);
      }
      playSound('click');
    } catch (err) {
      showToast(err.message, 'warning');
      get().loadPairingData();
    }
  },

  // Calendar Management
  setCalendarStatus: async (dateStr, status) => {
    const { pairing, partnerProfile, user, session, showToast } = get();
    if (!pairing) return;

    // Optimistically update calendar entries state
    const currentEntries = get().calendarEntries || [];
    const existingIdx = currentEntries.findIndex(e => e.entry_date === dateStr);
    let updatedEntries = [...currentEntries];

    const oldEntry = existingIdx !== -1 ? currentEntries[existingIdx] : null;
    const oldPoints = oldEntry ? (oldEntry.points_awarded || 0) : 0;

    let newPoints = 0;
    if (status === 'green') {
      const dateObj = new Date(dateStr + 'T00:00:00');
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const multiplier = isWeekend && pairing.weekend_multiplier ? parseFloat(pairing.weekend_multiplier) : 1.0;
      newPoints = Math.round((pairing.point_value_green ?? 1) * multiplier);
    } else if (status === 'yellow') {
      newPoints = pairing.point_value_yellow ?? 0;
    } else if (status === 'red') {
      newPoints = pairing.point_value_red ?? 0;
    }

    const pointsDelta = newPoints - oldPoints;

    if (existingIdx !== -1) {
      if (status === 'none') {
        updatedEntries.splice(existingIdx, 1);
      } else {
        updatedEntries[existingIdx] = { ...updatedEntries[existingIdx], status, points_awarded: newPoints };
      }
    } else if (status !== 'none') {
      updatedEntries.push({
        id: `temp-${dateStr}`,
        pairing_id: pairing.id,
        entry_date: dateStr,
        status,
        points_awarded: newPoints
      });
    }

    // Optimistically update pet points balance in store
    const petId = pairing.pet_id;
    if (pointsDelta !== 0 && petId) {
      if (user && user.id === petId) {
        const newBal = Math.max(0, (user.points_balance || 0) + pointsDelta);
        set({ user: { ...user, points_balance: newBal }, profile: { ...user, points_balance: newBal } });
      }
      if (partnerProfile && partnerProfile.id === petId) {
        const newBal = Math.max(0, (partnerProfile.points_balance || 0) + pointsDelta);
        set({ partnerProfile: { ...partnerProfile, points_balance: newBal } });
      }
    }

    set({ calendarEntries: updatedEntries });

    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.setCalendarEntry(pairing.id, dateStr, status);
      } else {
        await mockBackend.setCalendarEntry(pairing.id, dateStr, status);
      }
      playSound('click');
      if (status === 'green') triggerConfetti();
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
      get().loadPairingData();
    }
  },

  // Store Management
  createRewardItem: async (name, description, pointCost) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.createRewardItem(pairing.id, name, description, pointCost);
      } else {
        await mockBackend.createRewardItem(pairing.id, name, description, pointCost);
      }
      await get().loadPairingData();
      playSound('click');
      showToast(`Added "${name}" to Reward Store!`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  deleteRewardItem: async (itemId) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.deleteRewardItem(itemId);
      } else {
        await mockBackend.deleteRewardItem(itemId);
      }
      await get().loadPairingData();
      showToast('Reward item removed', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updateRewardItem: async (itemId, name, description, pointCost) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.updateRewardItem(itemId, name, description, pointCost);
      } else {
        await mockBackend.updateRewardItem(itemId, name, description, pointCost);
      }
      await get().loadPairingData();
      playSound('click');
      showToast(`Updated "${name}" in Store!`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  submitRewardProposal: async (title, description) => {
    const { pairing, user, session, showToast } = get();
    if (!pairing) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.createProposal(pairing.id, user.id, title, description);
      } else {
        await mockBackend.createProposal(pairing.id, user.id, title, description);
      }
      await get().loadPairingData();
      playSound('click');
      showToast('Reward proposal sent to Owner!', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  processProposal: async (proposalId, status, assignedPointsCost = 0) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.processProposal(proposalId, status, assignedPointsCost);
      } else {
        await mockBackend.processProposal(proposalId, status, assignedPointsCost);
      }
      playSound(status === 'approved' ? 'praise' : 'click');
      showToast(status === 'approved' ? `Approved & added to Store at ${assignedPointsCost} pts!` : `Proposal ${status}`, 'success');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  redeemStoreItem: async (rewardItem) => {
    const { pairing, user, session, showToast } = get();
    if (!pairing || !user) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.redeemStoreItem(pairing.id, user.id, rewardItem);
      } else {
        await mockBackend.redeemStoreItem(pairing.id, user.id, rewardItem);
      }
      await get().loadPairingData();
      playSound('click');
      showToast(`Requested redemption for "${rewardItem.name}" (${rewardItem.point_cost} pts)! Sent to Owner for approval.`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  processRedemption: async (redemptionId, status) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.processRedemption(redemptionId, status);
      } else {
        await mockBackend.processRedemption(redemptionId, status);
      }
      playSound(status === 'approved' ? 'levelUp' : 'click');
      if (status === 'approved') triggerConfetti();
      showToast(status === 'approved' ? 'Redemption Approved & Fulfilled! 🎉' : 'Redemption Denied (Points refunded)', 'info');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  cancelRedemption: async (redemptionId) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.cancelRedemption(redemptionId);
      } else {
        await mockBackend.cancelRedemption(redemptionId);
      }
      playSound('click');
      showToast('Redemption request taken back! Points refunded ↩️', 'info');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  clearRedemptionHistory: async (redemptionId) => {
    const { session, showToast } = get();
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.clearRedemptionHistory(redemptionId);
      } else {
        await mockBackend.clearRedemptionHistory(redemptionId);
      }
      showToast('Cleared from redemption history', 'info');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  setCalendarStatus: async (dateStr, status) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.setCalendarEntry(pairing.id, dateStr, status);
      } else {
        await mockBackend.setCalendarEntry(pairing.id, dateStr, status);
      }
      await get().loadPairingData();
      playSound('click');
      if (status === 'green') triggerConfetti();
      showToast(`Marked ${dateStr} as ${status.toUpperCase()}`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updatePraiseAndSpecies: async (species, praiseTerms, customSpeciesName = null, customSpeciesIcon = null, customThemePrimary = null, customThemeAccent = null) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      const updates = { 
        pet_species: species, 
        praise_terms: praiseTerms,
        custom_species_name: customSpeciesName,
        custom_species_icon: customSpeciesIcon
      };
      if (customThemePrimary) updates.custom_theme_primary = customThemePrimary;
      if (customThemeAccent) updates.custom_theme_accent = customThemeAccent;

      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, updates);
      } else {
        updated = await mockBackend.updateProfile(user.id, updates);
      }
      set({ user: updated, profile: updated });
      applyCustomTheme(updated);
      playSound('praise');
      showToast('Profile & species settings saved!', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updateCustomTheme: async (primary, accent, mode = 'light') => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      const updates = {
        custom_theme_primary: primary,
        custom_theme_accent: accent,
        custom_theme_mode: mode
      };
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, updates);
      } else {
        updated = await mockBackend.updateProfile(user.id, updates);
      }
      set({ user: updated, profile: updated });
      applyCustomTheme(updated);
      playSound('praise');
      triggerConfetti();
      showToast('Page theme colors updated! 🎨', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updatePetNickname: async (nickname) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, { pet_nickname: nickname });
      } else {
        updated = await mockBackend.updateProfile(user.id, { pet_nickname: nickname });
      }
      set({ user: updated, profile: updated });
      showToast('Pet nickname updated! 🐾', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updateReminderTime: async (timeStr) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, { reminder_time: timeStr });
      } else {
        updated = await mockBackend.updateProfile(user.id, { reminder_time: timeStr });
      }
      set({ user: updated, profile: updated });
      showToast(`Daily reminder time set to ${timeStr} ⏰`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  toggleXPBar: async (show) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, { show_xp_bar: show });
      } else {
        updated = await mockBackend.updateProfile(user.id, { show_xp_bar: show });
      }
      set({ user: updated, profile: updated });
      showToast(show ? 'XP Bar is now visible 📊' : 'XP Bar hidden 🙈', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  setPairingPin: async (pin) => {
    const { user, session, showToast } = get();
    if (!user) return;
    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateProfile(user.id, { pairing_pin: pin });
      } else {
        updated = await mockBackend.updateProfile(user.id, { pairing_pin: pin });
      }
      set({ user: updated, profile: updated });
      showToast(pin ? 'Security PIN enabled 🔒' : 'Security PIN removed 🔓', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  verifyPin: async (inputPin) => {
    const { user, session } = get();
    if (!user?.pairing_pin) return { success: true, locked: false };

    // Rate limit client check
    const rateCheck = checkRateLimit(`pin:${user.id}`, 5, 60000);
    if (!rateCheck.allowed) {
      return {
        success: false,
        locked: true,
        message: `Too many PIN attempts. Please wait ${rateCheck.retryAfterSeconds}s.`
      };
    }

    if (isSupabaseConfigured && session) {
      return await supabaseBackend.verifySecurityPin(user.id, inputPin);
    } else {
      return await mockBackend.verifySecurityPin(user.id, inputPin);
    }
  },

  updatePairingPointValues: async (pointValues) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      let updatedPairing;
      if (isSupabaseConfigured && session) {
        updatedPairing = await supabaseBackend.updatePairingPointValues(pairing.id, pointValues);
      } else {
        updatedPairing = await mockBackend.updatePairingPointValues(pairing.id, pointValues);
      }
      set({ pairing: updatedPairing });
      playSound('click');
      showToast('Color point values updated!', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updatePairingCurrency: async (currencyConfig) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      let updatedPairing;
      if (isSupabaseConfigured && session) {
        updatedPairing = await supabaseBackend.updatePairingCurrency(pairing.id, currencyConfig);
      } else {
        updatedPairing = await mockBackend.updatePairingCurrency(pairing.id, currencyConfig);
      }
      set({ pairing: updatedPairing });
      playSound('praise');
      triggerConfetti();
      showToast(`Point type updated to ${currencyConfig.icon || '⭐'} ${currencyConfig.name || 'Points'}!`, 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updatePairingRules: async ({ maxPendingProposals, weekendMultiplier }) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      let updated;
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updatePairingRules(pairing.id, { maxPendingProposals, weekendMultiplier });
      } else {
        updated = await mockBackend.updatePairingRules(pairing.id, { maxPendingProposals, weekendMultiplier });
      }
      set({ pairing: updated });
      showToast('Pairing proposal limits & weekend multiplier saved! ⚙️', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  updateCustomLevelTitles: async (titlesMap) => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      let updated;
      const titlesJson = typeof titlesMap === 'string' ? titlesMap : JSON.stringify(titlesMap);
      if (isSupabaseConfigured && session) {
        updated = await supabaseBackend.updateCustomLevelTitles(pairing.id, titlesJson);
      } else {
        updated = await mockBackend.updateCustomLevelTitles(pairing.id, titlesJson);
      }
      set({ pairing: updated });
      playSound('praise');
      showToast('Custom progression rank titles saved! 👑', 'success');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  pairWithCode: async (targetUsernameOrUid, targetPairCode) => {
    const { user, session, showToast } = get();
    const activeUserId = user?.id || session?.user?.id;

    // Rate limit pairing attempts
    const rateCheck = checkRateLimit(`pair:${activeUserId}`, 5, 60000);
    if (!rateCheck.allowed) {
      const msg = `Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`;
      showToast(msg, 'warning');
      throw new Error(msg);
    }

    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.pairWithCode(activeUserId, targetUsernameOrUid, targetPairCode);
      } else {
        await mockBackend.pairWithCode(activeUserId, targetUsernameOrUid, targetPairCode);
      }
      playSound('levelUp');
      triggerConfetti();
      showToast('Secure pairing complete! 🎉', 'success');
      await get().loadPairingData();
    } catch (err) {
      showToast(err.message || 'Failed to pair', 'warning');
      throw err;
    }
  },

  unpair: async () => {
    const { pairing, session, showToast } = get();
    if (!pairing) return;
    try {
      if (isSupabaseConfigured && session) {
        await supabaseBackend.unpair(pairing.id);
      } else {
        await mockBackend.unpair(pairing.id);
      }
      set({ pairing: null, partnerProfile: null, calendarEntries: [], proposals: [], rewardItems: [], redemptions: [], dailyTasks: [], praiseNotes: [] });
      showToast('Unpaired successfully.', 'info');
    } catch (err) {
      showToast(err.message, 'warning');
    }
  },

  signOut: async () => {
    const { realtimeChannel } = get();
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (realtimeChannel && supabase) {
      supabase.removeChannel(realtimeChannel);
    }
    set({ session: null, user: null, profile: null, pairing: null, partnerProfile: null, realtimeChannel: null });
    get().showToast('Logged out successfully.', 'info');
  }
}));