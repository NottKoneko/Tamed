/**
 * Returns exact YYYY-MM-DD string in local timezone (prevents UTC rollover bugs).
 * @param {Date|string|number} dateInput 
 * @returns {string} 'YYYY-MM-DD'
 */
export const getLocalDateString = (dateInput = new Date()) => {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
