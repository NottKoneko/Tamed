/**
 * Currency utility helper mapping pet species to custom species-specific currency name and icon.
 * Database columns remain `points_balance` & `point_cost` internally.
 */

export const getCurrencyInfo = (species = 'puppy') => {
  switch (species) {
    case 'puppy':
      return {
        name: 'Bones',
        singular: 'Bone',
        icon: '🦴',
        symbol: '🦴'
      };
    case 'kitty':
      return {
        name: 'Fish',
        singular: 'Fish',
        icon: '🐟',
        symbol: '🐟'
      };
    case 'fox':
      return {
        name: 'Berries',
        singular: 'Berry',
        icon: '🫐',
        symbol: '🫐'
      };
    case 'custom':
    default:
      return {
        name: 'Stars',
        singular: 'Star',
        icon: '⭐',
        symbol: '⭐'
      };
  }
};

/**
 * Formats a point amount into species currency string.
 * Example: formatCurrency(5, 'puppy') -> "5 🦴 Bones"
 */
export const formatCurrency = (amount = 0, species = 'puppy', showName = true) => {
  const info = getCurrencyInfo(species);
  if (!showName) return `${amount} ${info.icon}`;
  const label = amount === 1 ? info.singular : info.name;
  return `${amount} ${info.icon} ${label}`;
};
