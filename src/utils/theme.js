/**
 * Full-Page Custom Theme Engine
 * Applies custom accent colors and environment modes across the entire app with optimal contrast.
 */

export const THEME_MODES = {
  dark: {
    id: 'dark',
    name: '🌙 Midnight Dark',
    background: '#13111e',
    surface: '#1e1b2e',
    surfaceHover: '#2d2a42',
    textMain: '#f8fafc',
    textMuted: '#cbd5e1',
    border: 'rgba(255, 255, 255, 0.12)',
    shadowBase: '0,0,0',
    shadowAlpha: '0.40'
  },
  dark2: {
    id: 'dark2',
    name: '🖤 Obsidian Black',
    background: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    textMain: '#ffffff',
    textMuted: '#e2e8f0',
    border: 'rgba(255, 255, 255, 0.14)',
    shadowBase: '0,0,0',
    shadowAlpha: '0.60'
  },
  light: {
    id: 'light',
    name: '☀️ Clean Light',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    shadowBase: '100,116,139',
    shadowAlpha: '0.10'
  },
  soft: {
    id: 'soft',
    name: '🌸 Soft Cream',
    background: '#fdf8f0',
    surface: '#fffdf9',
    surfaceHover: '#fff4e6',
    textMain: '#1c1408',
    textMuted: '#78614a',
    border: '#ecdeca',
    shadowBase: '120,90,60',
    shadowAlpha: '0.10'
  }
};

export const applyCustomTheme = (profile) => {
  const root = document.documentElement;

  // Clear previous inline styles so base resets apply cleanly
  root.style.cssText = '';

  const species = profile?.pet_species || 'custom';
  root.setAttribute('data-theme', species);

  const customPrimary = profile?.custom_theme_primary;
  const customAccent = profile?.custom_theme_accent;
  const customMode = profile?.custom_theme_mode || 'dark';

  const modeConfig = THEME_MODES[customMode] || THEME_MODES.dark;
  const isDarkMode = customMode === 'dark' || customMode === 'dark2';

  // Determine primary & accent color fallbacks based on species
  let primary = customPrimary;
  let accent = customAccent;

  if (!primary) {
    if (species === 'puppy') primary = '#ec4899';
    else if (species === 'kitty') primary = '#6366f1';
    else if (species === 'fox') primary = '#ea580c';
    else primary = '#8b5cf6';
  }

  if (!accent) {
    if (species === 'puppy') accent = '#a855f7';
    else if (species === 'kitty') accent = '#a855f7';
    else if (species === 'fox') accent = '#d97706';
    else accent = '#ec4899';
  }

  // Set Accent Colors
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`);
  root.style.setProperty('--shadow-glow', `0 0 32px ${primary}50`);

  // High contrast adjustments for dark vs light modes
  if (isDarkMode) {
    // In dark mode, primary-dark must be brightened for crisp, high-contrast headings & badges!
    root.style.setProperty('--color-primary-dark', adjustBrightness(primary, 30));
    root.style.setProperty('--color-primary-light', `${primary}35`);
    root.style.setProperty('--color-green-light', 'rgba(16, 185, 129, 0.22)');
    root.style.setProperty('--color-yellow-light', 'rgba(245, 158, 11, 0.22)');
    root.style.setProperty('--color-red-light', 'rgba(239, 68, 68, 0.22)');
  } else {
    root.style.setProperty('--color-primary-dark', adjustBrightness(primary, -22));
    root.style.setProperty('--color-primary-light', `${primary}18`);
    root.style.setProperty('--color-green-light', '#d1fae5');
    root.style.setProperty('--color-yellow-light', '#fef3c7');
    root.style.setProperty('--color-red-light', '#fee2e2');
  }

  // Full-page environment mode variables
  root.style.setProperty('--color-background', modeConfig.background);
  root.style.setProperty('--color-surface', modeConfig.surface);
  root.style.setProperty('--color-surface-hover', modeConfig.surfaceHover);
  root.style.setProperty('--color-text-main', modeConfig.textMain);
  root.style.setProperty('--color-text-muted', modeConfig.textMuted);
  root.style.setProperty('--color-border', modeConfig.border);
  root.style.setProperty('--gradient-card', `linear-gradient(135deg, ${modeConfig.surface} 0%, ${modeConfig.background} 100%)`);

  // Environment shadows
  const shadowBase = modeConfig.shadowBase;
  const shadowAlpha = parseFloat(modeConfig.shadowAlpha);
  root.style.setProperty('--shadow-sm', `0 2px 8px rgba(${shadowBase},${shadowAlpha * 0.7})`);
  root.style.setProperty('--shadow-md', `0 6px 24px rgba(${shadowBase},${shadowAlpha})`);
  root.style.setProperty('--shadow-lg', `0 16px 48px rgba(${shadowBase},${shadowAlpha * 1.4})`);
};

function adjustBrightness(hex, percent) {
  if (!hex || !hex.startsWith('#')) return hex;
  let num = parseInt(hex.slice(1), 16);
  if (isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  const clamp = (v) => Math.max(0, Math.min(255, v));

  const R = clamp((num >> 16) + amt);
  const G = clamp(((num >> 8) & 0xff) + amt);
  const B = clamp((num & 0xff) + amt);

  return '#' + [R, G, B].map(c => c.toString(16).padStart(2, '0')).join('');
}
