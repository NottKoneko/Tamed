import { createClient } from '@supabase/supabase-js';
import { stackUpdate } from '../utils/updateStacker';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

import { getLocalDateString } from '../utils/dateUtils';
import { getSecureRandomInt } from '../utils/cryptoUtils';
import { calculateLevelFromXP } from '../utils/xpUtils';

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
    const uid = profileData.uid || `${profileData.username}#${1000 + getSecureRandomInt(9000)}`;
    const pair_code = profileData.pair_code || (100000 + getSecureRandomInt(900000)).toString();
    
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
    return stackUpdate(`profile:${userId}`, async () => {
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
      if (error) throw error;
      return data;
    }, 350);
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

    // Try stored procedure RPC first
    const { data: rpcData, error: rpcErr } = await supabase.rpc('process_calendar_entry', {
      p_pairing_id: pairingId,
      p_date: date,
      p_status: status
    });
    if (!rpcErr) return rpcData;

    // Direct table fallback with points balance calculation
    const { data: pairing } = await supabase.from('pairings').select('*').eq('id', pairingId).maybeSingle();
    if (!pairing) throw new Error('Pairing not found');

    const { data: existing } = await supabase
      .from('calendar_entries')
      .select('*')
      .eq('pairing_id', pairingId)
      .eq('entry_date', date)
      .maybeSingle();

    const oldPoints = existing ? (existing.points_awarded || 0) : 0;

    let newPoints = 0;
    if (status === 'green') {
      const dateObj = new Date(date + 'T00:00:00');
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      const multiplier = isWeekend && pairing.weekend_multiplier ? parseFloat(pairing.weekend_multiplier) : 1.0;
      newPoints = Math.round((pairing.point_value_green ?? 1) * multiplier);
    } else if (status === 'yellow') {
      newPoints = pairing.point_value_yellow ?? 0;
    } else if (status === 'red') {
      newPoints = pairing.point_value_red ?? 0;
    }

    const pointsDelta = newPoints - oldPoints;

    if (status === 'none') {
      await supabase
        .from('calendar_entries')
        .delete()
        .eq('pairing_id', pairingId)
        .eq('entry_date', date);
    } else {
      await supabase
        .from('calendar_entries')
        .upsert({
          pairing_id: pairingId,
          entry_date: date,
          status: status,
          points_awarded: newPoints
        }, { onConflict: 'pairing_id,entry_date' });
    }

    if (pointsDelta !== 0 && pairing.pet_id) {
      const { data: petProfile } = await supabase.from('profiles').select('points_balance').eq('id', pairing.pet_id).maybeSingle();
      if (petProfile) {
        const updatedBalance = Math.max(0, (petProfile.points_balance || 0) + pointsDelta);
        await supabase.from('profiles').update({ points_balance: updatedBalance }).eq('id', pairing.pet_id);
      }
    }

    return true;
  },

  // Daily Tasks
  getDailyTasks: async (pairingId) => {
    if (!supabase) return [];
    const todayStr = getLocalDateString();
    const { data, error } = await supabase.from('daily_tasks').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Auto-reset tasks completed on previous days
    const staleTasks = data.filter(t => t.is_completed && (!t.task_date || t.task_date < todayStr));
    if (staleTasks.length > 0) {
      const staleIds = staleTasks.map(t => t.id);
      await supabase
        .from('daily_tasks')
        .update({ is_completed: false, task_date: todayStr })
        .in('id', staleIds);

      staleTasks.forEach(t => {
        t.is_completed = false;
        t.task_date = todayStr;
      });
    }

    return data;
  },

  createDailyTask: async (pairingId, title) => {
    if (!supabase) return null;
    const taskData = {
      pairing_id: pairingId,
      title,
      xp_reward: 25,
      is_completed: false,
      task_date: getLocalDateString()
    };
    const { data, error } = await supabase.from('daily_tasks').insert([taskData]).select().single();
    if (error) throw error;
    return data;
  },

  toggleDailyTask: async (taskId, isCompleted) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('daily_tasks').update({ is_completed: isCompleted, task_date: getLocalDateString() }).eq('id', taskId).select().single();
    if (error) throw error;
    return data;
  },

  overrideDailyTask: async (taskId, isCompleted = true) => {
    if (!supabase) return null;
    const { data, error } = await supabase.from('daily_tasks').update({ is_completed: isCompleted, task_date: getLocalDateString() }).eq('id', taskId).select().single();
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
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('process_redemption', {
      p_redemption_id: redemptionId,
      p_status: status
    });
    if (!rpcErr) return rpcRes;

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

  cancelRedemption: async (redemptionId) => {
    if (!supabase) return null;
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('cancel_redemption', {
      p_redemption_id: redemptionId
    });
    if (!rpcErr) return rpcRes;

    const { data: redemption } = await supabase.from('redemptions').select('*').eq('id', redemptionId).maybeSingle();
    if (redemption) {
      if (redemption.status !== 'pending') {
        throw new Error("Once approved or denied, redemption requests cannot be taken back.");
      }
      const { data: petProfile } = await supabase.from('profiles').select('points_balance').eq('id', redemption.pet_id).single();
      if (petProfile) {
        await supabase.from('profiles').update({ points_balance: (petProfile.points_balance || 0) + redemption.points_spent }).eq('id', redemption.pet_id);
      }
    }
    const { error } = await supabase.from('redemptions').delete().eq('id', redemptionId);
    if (error) throw error;
    return true;
  },

  clearRedemptionHistory: async (redemptionId) => {
    if (!supabase) return null;
    const { error } = await supabase.from('redemptions').delete().eq('id', redemptionId);
    if (error) throw error;
    return true;
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

  // Reminders
  getReminders: async (pairingId) => {
    if (!supabase) return [];
    const { data, error } = await supabase.from('reminders').select('*').eq('pairing_id', pairingId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  createReminder: async (pairingId, createdBy, reminderPayload) => {
    if (!supabase) return null;
    const reminderData = {
      pairing_id: pairingId,
      created_by: createdBy,
      title: reminderPayload.title,
      message: reminderPayload.message || '',
      reminder_time: reminderPayload.reminderTime || '21:00',
      repeat_option: reminderPayload.repeatOption || 'daily',
      is_instant: Boolean(reminderPayload.isInstant),
      is_active: true
    };
    const { data, error } = await supabase.from('reminders').insert([reminderData]).select().single();
    if (error) throw error;
    return data;
  },

  deleteReminder: async (reminderId) => {
    if (!supabase) return true;
    const { error } = await supabase.from('reminders').delete().eq('id', reminderId);
    if (error) throw error;
    return true;
  },

  // Core Mechanics
  setPetPoints: async (petId, points) => {
    if (!supabase) return null;
    const newBalance = Math.max(0, parseInt(points, 10) || 0);
    return stackUpdate(`setPetPoints:${petId}`, async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ points_balance: newBalance })
        .eq('id', petId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }, 400);
  },

  addXP: async (petId, amount) => {
    if (!supabase) return null;
    const { data: profile } = await supabase.from('profiles').select('xp, level').eq('id', petId).single();
    if (!profile) return null;
    const newXP = (profile.xp || 0) + amount;
    const newLevel = calculateLevelFromXP(newXP);
    const { data, error } = await supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', petId).select().single();
    if (error) throw error;
    return data;
  },

  removeXP: async (petId, amount) => {
    if (!supabase) return null;
    const { data: profile } = await supabase.from('profiles').select('xp, level').eq('id', petId).single();
    if (!profile) return null;
    const newXP = Math.max(0, (profile.xp || 0) - amount);
    const newLevel = calculateLevelFromXP(newXP);
    const { data, error } = await supabase.from('profiles').update({ xp: newXP, level: newLevel }).eq('id', petId).select().single();
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
  },

  updatePairingPointValues: async (pairingId, pointValues) => {
    if (!supabase) return null;
    return stackUpdate(`pairingPointValues:${pairingId}`, async () => {
      const { data, error } = await supabase
        .from('pairings')
        .update({
          point_value_green: parseInt(pointValues.green ?? 1, 10),
          point_value_yellow: parseInt(pointValues.yellow ?? 0, 10),
          point_value_red: parseInt(pointValues.red ?? 0, 10)
        })
        .eq('id', pairingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }, 400);
  },

  updatePairingCurrency: async (pairingId, currencyConfig) => {
    if (!supabase) return null;
    return stackUpdate(`pairingCurrency:${pairingId}`, async () => {
      const { data, error } = await supabase
        .from('pairings')
        .update({
          custom_currency_name: currencyConfig.name || null,
          custom_currency_singular: currencyConfig.singular || currencyConfig.name || null,
          custom_currency_icon: currencyConfig.icon || null
        })
        .eq('id', pairingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }, 400);
  },

  updatePairingRules: async (pairingId, { maxPendingProposals, weekendMultiplier }) => {
    if (!supabase) return null;
    return stackUpdate(`pairingRules:${pairingId}`, async () => {
      const { data, error } = await supabase
        .from('pairings')
        .update({
          max_pending_proposals: parseInt(maxPendingProposals, 10) || 3,
          weekend_multiplier: parseFloat(weekendMultiplier) || 1.0
        })
        .eq('id', pairingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }, 400);
  },

  updateCustomLevelTitles: async (pairingId, customLevelTitles) => {
    if (!supabase) return null;
    return stackUpdate(`customLevelTitles:${pairingId}`, async () => {
      const { data, error } = await supabase
        .from('pairings')
        .update({ custom_level_titles: customLevelTitles })
        .eq('id', pairingId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }, 400);
  },

  verifySecurityPin: async (userId, pin) => {
    if (!supabase) return { success: true, locked: false };
    const { data, error } = await supabase.rpc('verify_security_pin', { p_user_id: userId, p_pin: pin });
    if (error) throw error;
    return data;
  }
};