/**
 * Sliding Window Client-Side Rate Limiter
 * Provides immediate UX feedback to prevent UI spam, rapid double submits, and brute-force attempts.
 * Supports localStorage persistence so long-term daily limits survive page refreshes.
 */

const memoryAttempts = new Map();

const getStoredAttempts = (key, windowMs) => {
  const now = Date.now();
  let list = memoryAttempts.get(key) || [];

  try {
    const raw = localStorage.getItem(`tamed_rl_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    }
  } catch (e) {}

  return list.filter(timestamp => now - timestamp < windowMs);
};

const saveStoredAttempts = (key, list) => {
  memoryAttempts.set(key, list);
  try {
    localStorage.setItem(`tamed_rl_${key}`, JSON.stringify(list));
  } catch (e) {}
};

/**
 * Checks whether an action is allowed based on max attempts within a time window.
 * 
 * @param {string} key - Action key (e.g. 'pairing_lookup', 'pin_verify:user123', 'praise_note')
 * @param {number} maxAttempts - Maximum allowed attempts in window (default: 5)
 * @param {number} windowMs - Time window in milliseconds (default: 60000ms / 1 min)
 * @returns {{ allowed: boolean, retryAfterSeconds: number, remaining: number }}
 */
export const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const userAttempts = getStoredAttempts(key, windowMs);

  if (userAttempts.length >= maxAttempts) {
    const oldestAttempt = userAttempts[0];
    const retryAfterSeconds = Math.ceil((oldestAttempt + windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, retryAfterSeconds),
      remaining: 0
    };
  }

  userAttempts.push(now);
  saveStoredAttempts(key, userAttempts);

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: maxAttempts - userAttempts.length
  };
};

/**
 * Resets rate limit attempts for a given key upon successful verification.
 */
export const resetRateLimit = (key) => {
  memoryAttempts.delete(key);
  try {
    localStorage.removeItem(`tamed_rl_${key}`);
  } catch (e) {}
};

/**
 * Garbage cleans expired rate limit entries from localStorage.
 */
export const cleanupRateLimitStorage = () => {
  try {
    const now = Date.now();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tamed_rl_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(ts => now - ts < 86400000);
            if (valid.length === 0) {
              keysToRemove.push(key);
            } else if (valid.length !== parsed.length) {
              localStorage.setItem(key, JSON.stringify(valid));
            }
          }
        }
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {}
};
