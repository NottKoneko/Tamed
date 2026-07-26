/**
 * Currency utility helper mapping pet species to custom species-specific currency name and icon.
 * Supports Owner custom currency overrides from pairing configuration.
 * Database columns remain `points_balance` & `point_cost` internally.
 */

export const getCurrencyInfo = (species = 'puppy', pairing = null) => {
  if (pairing && pairing.custom_currency_name && pairing.custom_currency_icon) {
    return {
      name: pairing.custom_currency_name,
      singular: pairing.custom_currency_singular || pairing.custom_currency_name,
      icon: pairing.custom_currency_icon,
      symbol: pairing.custom_currency_icon
    };
  }

  const safeSpecies = species || 'puppy';
  switch (safeSpecies) {
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
 * Formats a point amount into species/custom currency string.
 * Example: formatCurrency(5, 'puppy', true, pairing) -> "5 🦴 Bones"
 */
export const formatCurrency = (amount = 0, species = 'puppy', showName = true, pairing = null) => {
  const info = getCurrencyInfo(species, pairing);
  if (!showName) return `${amount} ${info.icon}`;
  const label = amount === 1 ? info.singular : info.name;
  return `${amount} ${info.icon} ${label}`;
};
