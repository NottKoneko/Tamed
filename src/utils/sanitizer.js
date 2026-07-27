/**
 * Input Sanitizer Utility
 * Trims and escapes raw user string inputs to prevent XSS script injection and HTML tampering.
 */

/**
 * Escapes special HTML characters to prevent XSS injection.
 * @param {string} str - Raw user input string
 * @returns {string} Sanitized string
 */
export const sanitizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Trims string input and enforces maximum character length limit.
 * @param {string} str - Raw user input string
 * @param {number} maxLength - Maximum allowed length
 * @returns {string} Truncated and trimmed string
 */
export const clampInput = (str, maxLength = 500) => {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, maxLength);
};
