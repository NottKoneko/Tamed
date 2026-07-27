/**
 * Sliding Window Client-Side Rate Limiter
 * Provides immediate UX feedback to prevent UI spam, rapid double submits, and brute-force attempts.
 */

const attempts = new Map();

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
  const userAttempts = (attempts.get(key) || []).filter(timestamp => now - timestamp < windowMs);

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
  attempts.set(key, userAttempts);

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
  attempts.delete(key);
};
