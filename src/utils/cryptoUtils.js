/**
 * Generates a cryptographically secure random integer in the range [0, maxExclusive).
 * Uses rejection sampling to avoid modulo bias.
 * 
 * @param {number} maxExclusive - The upper bound (exclusive).
 * @returns {number} A secure random integer.
 */
export const getSecureRandomInt = (maxExclusive) => {
  if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
    throw new Error('maxExclusive must be a positive integer');
  }

  const cryptoObj = globalThis.crypto;
  if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function') {
    throw new Error('Secure random generator is unavailable');
  }

  const uint32Max = 0x100000000;
  const limit = uint32Max - (uint32Max % maxExclusive);
  const randomBuffer = new Uint32Array(1);
  let value;

  do {
    cryptoObj.getRandomValues(randomBuffer);
    value = randomBuffer[0];
  } while (value >= limit);

  return value % maxExclusive;
};
