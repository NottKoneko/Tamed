import { v4 as uuidv4 } from 'uuid';

// In-memory store
let db = {
  profiles: [],
  pairings: [],
  calendar_entries: [],
  reward_proposals: [], // Store addition requests from Pet
  reward_items: [],     // Active Reward Store Catalog
  redemptions: [],      // Redeemed rewards queue & history
  daily_tasks: [],      // Behavior Codex daily tasks
  praise_notes: []      // Owner praise cards & head pats
};

// Seed initial data
const seedData = () => {
  if (db.profiles.length > 0) return;
  
  const ownerId = 'owner-1';
  const petId = 'pet-1';
  const pairingId = 'pair-1';

  db.profiles.push(
    { 
      id: ownerId, 
      uid: 'Master#1234', 
      role: 'owner', 
      username: 'Master Alex', 
      points_balance: 0,
      xp: 0,
      level: 1,
      mood: 'Happy'
    },
    { 
      id: petId, 
      uid: 'Puppy#5678', 
      role: 'pet', 
      username: 'Little Fox', 
      pet_species: 'fox', 
      praise_terms: 'Good fox!', 
      points_balance: 6,
      xp: 300,
      level: 4,
      mood: 'Happy'
    }
  );

  db.pairings.push(
    { 
      id: pairingId, 
      owner_id: ownerId, 
      pet_id: petId, 
      status: 'active',
      point_value_green: 1,
      point_value_yellow: 0,
      point_value_red: 0
    }
  );

  // Active Reward Store Items
  db.reward_items.push(
    { id: uuidv4(), pairing_id: pairingId, name: '30m Park Trip 🌳', description: 'Fun outing to the local park or nature trail', point_cost: 3, created_at: new Date().toISOString() },
    { id: uuidv4(), pairing_id: pairingId, name: 'Extra Yummy Snack 🍖', description: 'Special treat or favorite ice cream', point_cost: 1, created_at: new Date().toISOString() },
    { id: uuidv4(), pairing_id: pairingId, name: 'Movie Night Cuddles 🍿', description: 'Full cuddle session with favorite movie', point_cost: 5, created_at: new Date().toISOString() }
  );

  // Behavior Codex (Daily Tasks)
  db.daily_tasks.push(
    { id: uuidv4(), pairing_id: pairingId, title: 'Drink 2L of Fresh Water 💧', xp_reward: 25, is_completed: true, task_date: new Date().toISOString().split('T')[0] },
    { id: uuidv4(), pairing_id: pairingId, title: '15 Minutes Outdoor Walk / Stretch 🐾', xp_reward: 25, is_completed: false, task_date: new Date().toISOString().split('T')[0] },
    { id: uuidv4(), pairing_id: pairingId, title: 'Bedtime by 11:00 PM 🛌', xp_reward: 25, is_completed: false, task_date: new Date().toISOString().split('T')[0] }
  );

  // Sample Praise Note
  db.praise_notes.push(
    {
      id: uuidv4(),
      pairing_id: pairingId,
      sender_id: ownerId,
      type: 'headpat',
      message: 'Good girl! Proud of your hard work on your routine today 💖',
      created_at: new Date().toISOString()
    }
  );

  // Add historical green days with points_awarded = 1
  const today = new Date();
  for (let i = 1; i <= 6; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    db.calendar_entries.push({
      id: uuidv4(),
      pairing_id: pairingId,
      entry_date: d.toISOString().split('T')[0],
      status: 'green',
      points_awarded: 1
    });
  }

  // Seed sample pending reward store proposal from Pet
  db.reward_proposals.push(
    { 
      id: uuidv4(), 
      pairing_id: pairingId, 
      requested_by: petId, 
      title: 'Foot Massage & Back Scratch 🐾',
      description: 'Requesting 20 minutes of relaxing back scratches after dinner', 
      assigned_points: 0, 
      status: 'pending', 
      created_at: new Date().toISOString() 
    }
  );
};

seedData();

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

class MockBackend {
  subscribers = new Set();

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, payload) {
    this.subscribers.forEach(cb => cb({ event, payload }));
  }

  // Helper to calculate Level from total XP
  calculateLevel(xp = 0) {
    return Math.floor(xp / 100) + 1;
  }

  // Add XP to profile and trigger level update
  addXP(profileId, amount) {
    const pet = db.profiles.find(p => p.id === profileId);
    if (pet) {
      pet.xp = (pet.xp || 0) + amount;
      const newLevel = this.calculateLevel(pet.xp);
      const leveledUp = newLevel > (pet.level || 1);
      pet.level = newLevel;
      this.notify('PROFILE_UPDATED', { ...pet, leveledUp });
      return pet;
    }
  }

  // --- Auth & Profiles ---
  async loginOwner(username) {
    await delay();
    let profile = db.profiles.find(p => p.username === username && p.role === 'owner');
    if (!profile) {
      const uid = `${username}#${Math.floor(1000 + Math.random() * 9000)}`;
      profile = { id: uuidv4(), uid, role: 'owner', username, points_balance: 0, xp: 0, level: 1, mood: 'Happy' };
      db.profiles.push(profile);
    }
    return profile;
  }

  async loginPet(username, species, praiseTerms, customSpeciesName = null, customSpeciesIcon = null, customThemePrimary = '#8b5cf6', customThemeAccent = '#ec4899') {
    await delay();
    let profile = db.profiles.find(p => p.username === username && p.role === 'pet');
    if (!profile) {
      const uid = `${username}#${Math.floor(1000 + Math.random() * 9000)}`;
      profile = { 
        id: uuidv4(), 
        uid, 
        role: 'pet', 
        username, 
        pet_species: species, 
        custom_species_name: customSpeciesName,
        custom_species_icon: customSpeciesIcon,
        custom_theme_primary: customThemePrimary,
        custom_theme_accent: customThemeAccent,
        praise_terms: praiseTerms, 
        points_balance: 0, 
        xp: 0, 
        level: 1, 
        mood: 'Happy' 
      };
      db.profiles.push(profile);
    }
    return profile;
  }

  async getProfile(id) {
    await delay();
    return db.profiles.find(p => p.id === id);
  }

  async updateProfile(id, updates) {
    await delay();
    const idx = db.profiles.findIndex(p => p.id === id);
    if (idx > -1) {
      db.profiles[idx] = { ...db.profiles[idx], ...updates };
      this.notify('PROFILE_UPDATED', db.profiles[idx]);
      return db.profiles[idx];
    }
    throw new Error("Profile not found");
  }

  // --- Points & Pairing Settings ---
  async setPetPoints(pairingId, newPoints) {
    await delay();
    const pairing = db.pairings.find(p => p.id === pairingId);
    if (!pairing) throw new Error("Pairing not found");
    const pet = db.profiles.find(p => p.id === pairing.pet_id);
    if (!pet) throw new Error("Pet profile not found");
    
    pet.points_balance = Math.max(0, newPoints);
    this.notify('PROFILE_UPDATED', pet);
    return pet;
  }

  async updatePairingPointValues(pairingId, { green = 1, yellow = 0, red = 0 }) {
    await delay();
    const pairing = db.pairings.find(p => p.id === pairingId);
    if (!pairing) throw new Error("Pairing not found");

    pairing.point_value_green = parseInt(green, 10);
    pairing.point_value_yellow = parseInt(yellow, 10);
    pairing.point_value_red = parseInt(red, 10);

    this.notify('PAIRING_UPDATED', pairing);
    return pairing;
  }

  async updatePairingCurrency(pairingId, { name, singular, icon }) {
    await delay();
    const pairing = db.pairings.find(p => p.id === pairingId);
    if (!pairing) throw new Error("Pairing not found");

    pairing.custom_currency_name = name || null;
    pairing.custom_currency_singular = singular || name || null;
    pairing.custom_currency_icon = icon || null;

    this.notify('PAIRING_UPDATED', pairing);
    return pairing;
  }

  // --- Pairings ---
  async pairWithCode(petId, ownerUid) {
    await delay();
    const owner = db.profiles.find(p => p.uid === ownerUid && p.role === 'owner');
    if (!owner) throw new Error("Invalid pairing code");
    
    let pairing = db.pairings.find(p => p.owner_id === owner.id && p.pet_id === petId);
    if (!pairing) {
      pairing = { 
        id: uuidv4(), 
        owner_id: owner.id, 
        pet_id: petId, 
        status: 'active',
        point_value_green: 1,
        point_value_yellow: 0,
        point_value_red: 0
      };
      db.pairings.push(pairing);
    }
    return pairing;
  }

  async getPairingForUser(userId) {
    await delay();
    return db.pairings.find(p => p.owner_id === userId || p.pet_id === userId);
  }

  async unpair(pairingId) {
    await delay();
    db.pairings = db.pairings.filter(p => p.id !== pairingId);
    this.notify('UNPAIRED', { pairingId });
  }

  // --- Calendar ---
  async getCalendarEntries(pairingId) {
    await delay();
    return db.calendar_entries.filter(c => c.pairing_id === pairingId);
  }

  async updatePairingRules(pairingId, { maxPendingProposals = 3, weekendMultiplier = 1.0 }) {
    await delay();
    const pairing = db.pairings.find(p => p.id === pairingId);
    if (!pairing) throw new Error("Pairing not found");

    pairing.max_pending_proposals = parseInt(maxPendingProposals, 10) || 3;
    pairing.weekend_multiplier = parseFloat(weekendMultiplier) || 1.0;

    this.notify('PAIRING_UPDATED', pairing);
    return pairing;
  }

  async setCalendarEntry(pairingId, dateStr, status) {
    await delay();
    let entry = db.calendar_entries.find(c => c.pairing_id === pairingId && c.entry_date === dateStr);
    const pairing = db.pairings.find(p => p.id === pairingId);

    if (!pairing) throw new Error("Pairing not found");

    // Check if weekend for multiplier
    const dateObj = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sun or Sat
    const multiplier = (isWeekend && pairing.weekend_multiplier) ? parseFloat(pairing.weekend_multiplier) : 1.0;

    // Determine points for new status based on current pairing configuration
    let basePoints = 0;
    if (status === 'green') basePoints = pairing.point_value_green ?? 1;
    else if (status === 'yellow') basePoints = pairing.point_value_yellow ?? 0;
    else if (status === 'red') basePoints = pairing.point_value_red ?? 0;

    const newPointsAwarded = Math.round(basePoints * multiplier);

    const oldPointsAwarded = entry ? (entry.points_awarded ?? 0) : 0;
    const oldStatus = entry?.status;
    const pointsDelta = newPointsAwarded - oldPointsAwarded;

    const pet = db.profiles.find(p => p.id === pairing.pet_id);
    if (pet) {
      if (pointsDelta !== 0) {
        pet.points_balance = Math.max(0, pet.points_balance + pointsDelta);
        this.notify('PROFILE_UPDATED', pet);
      }
      if (status === 'green' && oldStatus !== 'green') {
        this.addXP(pet.id, 50); // Award +50 XP for Green Day!
      }
    }

    if (entry) {
      entry.status = status;
      entry.points_awarded = newPointsAwarded;
    } else {
      entry = { 
        id: uuidv4(), 
        pairing_id: pairingId, 
        entry_date: dateStr, 
        status, 
        points_awarded: newPointsAwarded 
      };
      db.calendar_entries.push(entry);
    }
    
    this.notify('CALENDAR_UPDATED', entry);
    return entry;
  }

  // --- Behavior Codex (Daily Tasks) ---
  async getDailyTasks(pairingId) {
    await delay();
    return db.daily_tasks.filter(t => t.pairing_id === pairingId);
  }

  async createDailyTask(pairingId, title) {
    await delay();
    const task = {
      id: uuidv4(),
      pairing_id: pairingId,
      title,
      xp_reward: 25,
      is_completed: false,
      task_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };
    db.daily_tasks.push(task);
    this.notify('DAILY_TASK_CREATED', task);
    return task;
  }

  async toggleDailyTask(taskId) {
    await delay();
    const task = db.daily_tasks.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");

    task.is_completed = !task.is_completed;
    const pairing = db.pairings.find(p => p.id === task.pairing_id);

    if (task.is_completed && pairing) {
      this.addXP(pairing.pet_id, task.xp_reward || 25); // Award +25 XP
    }

    this.notify('DAILY_TASK_UPDATED', task);
    return task;
  }

  async overrideDailyTask(taskId, isCompleted = true) {
    await delay();
    const task = db.daily_tasks.find(t => t.id === taskId);
    if (!task) throw new Error("Task not found");

    const wasCompleted = task.is_completed;
    task.is_completed = isCompleted;
    const pairing = db.pairings.find(p => p.id === task.pairing_id);

    if (isCompleted && !wasCompleted && pairing) {
      this.addXP(pairing.pet_id, task.xp_reward || 25);
    }

    this.notify('DAILY_TASK_UPDATED', task);
    return task;
  }

  async deleteDailyTask(taskId) {
    await delay();
    db.daily_tasks = db.daily_tasks.filter(t => t.id !== taskId);
    this.notify('DAILY_TASK_DELETED', { taskId });
  }

  // --- Praise Notes ---
  async getPraiseNotes(pairingId) {
    await delay();
    return db.praise_notes.filter(n => n.pairing_id === pairingId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async sendPraiseNote(pairingId, senderId, type, message) {
    await delay();
    const note = {
      id: uuidv4(),
      pairing_id: pairingId,
      sender_id: senderId,
      type: type || 'headpat',
      message,
      created_at: new Date().toISOString()
    };
    db.praise_notes.push(note);
    this.notify('PRAISE_NOTE_CREATED', note);
    return note;
  }

  // --- 1. REWARD PROPOSALS ---
  async getProposals(pairingId) {
    await delay();
    return db.reward_proposals.filter(r => r.pairing_id === pairingId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async createProposal(pairingId, petId, title, description) {
    await delay();
    const proposal = {
      id: uuidv4(),
      pairing_id: pairingId,
      requested_by: petId,
      title,
      description: description || '',
      assigned_points: 0,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.reward_proposals.push(proposal);
    this.notify('PROPOSAL_CREATED', proposal);
    return proposal;
  }

  async processProposal(proposalId, status, assignedPointsCost = 0) {
    await delay();
    const prop = db.reward_proposals.find(r => r.id === proposalId);
    if (!prop) throw new Error("Proposal not found");
    
    const cost = parseInt(assignedPointsCost, 10) || 0;
    prop.status = status;
    prop.assigned_points = cost;

    if (status === 'approved') {
      const newItem = {
        id: uuidv4(),
        pairing_id: prop.pairing_id,
        name: prop.title,
        description: prop.description || '',
        point_cost: cost,
        created_at: new Date().toISOString()
      };
      db.reward_items.push(newItem);
      this.notify('REWARD_ITEM_CREATED', newItem);
    }

    this.notify('PROPOSAL_UPDATED', prop);
    return prop;
  }

  // --- 2. REWARD STORE CATALOG ---
  async getRewardItems(pairingId) {
    await delay();
    return db.reward_items.filter(r => r.pairing_id === pairingId);
  }

  async createRewardItem(pairingId, name, description, pointCost) {
    await delay();
    const item = {
      id: uuidv4(),
      pairing_id: pairingId,
      name,
      description: description || '',
      point_cost: parseInt(pointCost, 10),
      created_at: new Date().toISOString()
    };
    db.reward_items.push(item);
    this.notify('REWARD_ITEM_CREATED', item);
    return item;
  }

  async deleteRewardItem(itemId) {
    await delay();
    db.reward_items = db.reward_items.filter(r => r.id !== itemId);
    this.notify('REWARD_ITEM_DELETED', { itemId });
  }

  // --- 3. REDEMPTIONS ---
  async getRedemptions(pairingId) {
    await delay();
    return db.redemptions.filter(r => r.pairing_id === pairingId).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  }

  async redeemStoreItem(pairingId, petId, rewardItem) {
    await delay();
    const pet = db.profiles.find(p => p.id === petId);
    if (!pet) throw new Error("Pet profile not found");

    if (pet.points_balance < rewardItem.point_cost) {
      throw new Error(`You need ${rewardItem.point_cost} pts, but only have ${pet.points_balance} pts!`);
    }

    pet.points_balance -= rewardItem.point_cost;
    this.notify('PROFILE_UPDATED', pet);

    const redemption = {
      id: uuidv4(),
      pairing_id: pairingId,
      reward_id: rewardItem.id,
      pet_id: petId,
      title: rewardItem.name,
      points_spent: rewardItem.point_cost,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.redemptions.push(redemption);
    this.notify('REDEMPTION_CREATED', redemption);
    return redemption;
  }

  async processRedemption(redemptionId, status) {
    await delay();
    const redemption = db.redemptions.find(r => r.id === redemptionId);
    if (!redemption) throw new Error("Redemption request not found");

    const pairing = db.pairings.find(p => p.id === redemption.pairing_id);

    if (status === 'denied' && redemption.status !== 'denied') {
      if (pairing) {
        const pet = db.profiles.find(p => p.id === pairing.pet_id);
        if (pet) {
          pet.points_balance += redemption.points_spent;
          this.notify('PROFILE_UPDATED', pet);
        }
      }
    }

    redemption.status = status;
    this.notify('REDEMPTION_UPDATED', redemption);
    return redemption;
  }
}

export const mockBackend = new MockBackend();
