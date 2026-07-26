/**
 * Dynamic Custom Theme Engine Helper.
 * Dynamically applies custom primary, accent, and gradient CSS variables onto documentElement.
 */

export const applyCustomTheme = (profile) => {
  const root = document.documentElement;
  const species = profile?.pet_species || 'puppy';

  root.setAttribute('data-theme', species);

  if (species === 'custom') {
    const primary = profile?.custom_theme_primary || '#8b5cf6';
    const accent = profile?.custom_theme_accent || '#ec4899';

    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-dark', adjustBrightness(primary, -20));
    root.style.setProperty('--color-primary-light', adjustBrightness(primary, 40));
    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`);
    root.style.setProperty('--shadow-glow', `0 0 25px ${primary}40`);
  } else {
    // Reset any inline overrides to let CSS attribute selectors rule
    root.style.removeProperty('--color-primary');
    root.style.removeProperty('--color-primary-dark');
    root.style.removeProperty('--color-primary-light');
    root.style.removeProperty('--color-accent');
    root.style.removeProperty('--gradient-hero');
    root.style.removeProperty('--shadow-glow');
  }
};

/**
 * Utility to adjust hex color brightness
 */
function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;

  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}
