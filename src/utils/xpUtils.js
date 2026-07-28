/**
 * Utility functions for progressive leveling system and XP calculations.
 */

// XP required to pass from Level L to Level L+1:
// Level 1 -> 2: 100 XP
// Level 2 -> 3: 150 XP
// Level 3 -> 4: 200 XP
// Level 4 -> 5: 250 XP
// Level 5 -> 6: 300 XP ... and so on.
export const getXPRequiredForNextLevel = (level) => {
  const safeLevel = Math.max(1, parseInt(level, 10) || 1);
  return 100 + (safeLevel - 1) * 50;
};

// Cumulative XP required to reach a specific level:
export const getCumulativeXPForLevel = (level) => {
  const safeLevel = Math.max(1, parseInt(level, 10) || 1);
  if (safeLevel <= 1) return 0;
  let total = 0;
  for (let l = 1; l < safeLevel; l++) {
    total += getXPRequiredForNextLevel(l);
  }
  return total;
};

// Calculate current level from total cumulative XP
export const calculateLevelFromXP = (xp = 0) => {
  const safeXP = Math.max(0, parseInt(xp, 10) || 0);
  let level = 1;
  while (safeXP >= getCumulativeXPForLevel(level + 1)) {
    level++;
  }
  return level;
};

// Calculate detailed XP progress statistics
export const getXPProgressDetails = (xp = 0) => {
  const safeXP = Math.max(0, parseInt(xp, 10) || 0);
  const currentLevel = calculateLevelFromXP(safeXP);
  const minXPForCurrentLevel = getCumulativeXPForLevel(currentLevel);
  const minXPForNextLevel = getCumulativeXPForLevel(currentLevel + 1);

  const xpInCurrentLevel = safeXP - minXPForCurrentLevel;
  const xpNeededForNextLevel = minXPForNextLevel - minXPForCurrentLevel;
  const xpRemainingToLevelUp = Math.max(0, minXPForNextLevel - safeXP);

  const progressPercent = Math.min(
    100,
    Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
  );

  return {
    level: currentLevel,
    totalXP: safeXP,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    xpRemainingToLevelUp,
    minXPForCurrentLevel,
    minXPForNextLevel,
    progressPercent
  };
};

// Default titles per level / rank tier
export const DEFAULT_LEVEL_TITLES = {
  1: 'Novice Pet 🐣',
  2: 'Good Pet 🌟',
  4: 'Pampered Prince(ss) 💖',
  7: 'Royal Paw 🐾',
  10: 'Supreme Royalty 👑'
};

// Resolve level title taking into account custom titles override
export const getLevelTitle = (level = 1, customTitles = null) => {
  const safeLevel = Math.max(1, parseInt(level, 10) || 1);

  // Parse if JSON string
  let parsedTitles = customTitles;
  if (typeof customTitles === 'string') {
    try {
      parsedTitles = JSON.parse(customTitles);
    } catch (e) {
      parsedTitles = null;
    }
  }

  // Check if custom title object provided
  if (parsedTitles && typeof parsedTitles === 'object') {
    if (parsedTitles[safeLevel]) return parsedTitles[safeLevel];
    // Fallback to highest matching lower key in parsedTitles
    const customKeys = Object.keys(parsedTitles)
      .map(Number)
      .filter((k) => !isNaN(k) && k <= safeLevel)
      .sort((a, b) => b - a);
    if (customKeys.length > 0 && parsedTitles[customKeys[0]]) {
      return parsedTitles[customKeys[0]];
    }
  }

  // Default fallback progression
  if (safeLevel >= 10) return DEFAULT_LEVEL_TITLES[10];
  if (safeLevel >= 7) return DEFAULT_LEVEL_TITLES[7];
  if (safeLevel >= 4) return DEFAULT_LEVEL_TITLES[4];
  if (safeLevel >= 2) return DEFAULT_LEVEL_TITLES[2];
  return DEFAULT_LEVEL_TITLES[1];
};
