/**
 * Update Stacker & Debouncer Utility
 * Packages rapid database updates into a single update call (latest-wins debouncing)
 * or queues them to prevent race conditions and database request spam.
 */

const pendingDebouncers = new Map();

/**
 * Stack and debounce database updates per entity key.
 * Local UI state updates instantly, while database network calls are packaged together.
 * 
 * @param {string} key - Unique identifier for the update pipeline (e.g. 'points:user_123', 'theme:user_123')
 * @param {Function} updateFn - Async function performing the database update
 * @param {number} delayMs - Quiet window in milliseconds before sending update to DB (default: 400ms)
 * @returns {Promise<any>}
 */
export const stackUpdate = (key, updateFn, delayMs = 400) => {
  return new Promise((resolve, reject) => {
    if (pendingDebouncers.has(key)) {
      const existing = pendingDebouncers.get(key);
      clearTimeout(existing.timer);
    }

    const timer = setTimeout(async () => {
      pendingDebouncers.delete(key);
      try {
        const result = await updateFn();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }, delayMs);

    pendingDebouncers.set(key, { timer, resolve, reject });
  });
};

/**
 * Immediately flushes pending stacked updates (e.g., before signout or component unmount).
 */
export const flushStackedUpdates = () => {
  const pending = Array.from(pendingDebouncers.entries());
  pendingDebouncers.clear();
  pending.forEach(([key, item]) => {
    clearTimeout(item.timer);
  });
};
