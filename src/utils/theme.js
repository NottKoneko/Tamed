/**
 * Full-Page Custom Theme Engine
 * Applies custom accent colors and environment modes across the entire app with optimal contrast.
 */

export const THEME_MODES = {
  dark: {
    id: 'dark',
    name: '🌙 Midnight Dark',
    background: '#0f0d1a',
    surface: 'rgba(30, 27, 46, 0.85)',
    surfaceHover: 'rgba(45, 42, 66, 0.9)',
    textMain: '#eef0f6',
    textMuted: '#9da5b8',
    border: 'rgba(255, 255, 255, 0.08)',
    shadowBase: '0,0,0',
    shadowAlpha: '0.45',
    cardGradient: 'linear-gradient(160deg, rgba(42, 38, 64, 0.9) 0%, rgba(20, 17, 32, 0.95) 100%)'
  },
  dark2: {
    id: 'dark2',
    name: '🖤 Obsidian Black',
    background: '#050507',
    surface: 'rgba(16, 16, 20, 0.88)',
    surfaceHover: 'rgba(28, 28, 35, 0.92)',
    textMain: '#f0f2f8',
    textMuted: '#8a92a8',
    border: 'rgba(255, 255, 255, 0.07)',
    shadowBase: '0,0,0',
    shadowAlpha: '0.65',
    cardGradient: 'linear-gradient(160deg, rgba(22, 22, 30, 0.92) 0%, rgba(8, 8, 12, 0.97) 100%)'
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
    shadowAlpha: '0.10',
    cardGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
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
    shadowAlpha: '0.10',
    cardGradient: 'linear-gradient(135deg, #fffdf9 0%, #fdf8f0 100%)'
  }
};

export const THEME_PRESETS = [
  {
    id: 'creamy_moss',
    name: 'Creamy Moss 🌿',
    subtitle: 'Soft Cream 🍦 x Sage Green 🌿',
    mode: 'soft',
    primary: '#4a7c59',
    accent: '#87a96b',
    icon: '🌿'
  },
  {
    id: 'midnight_royal',
    name: 'Midnight Royal 👑',
    subtitle: 'Midnight Dark 🌙 x Royal Violet 💜',
    mode: 'dark',
    primary: '#8b5cf6',
    accent: '#ec4899',
    icon: '👑'
  },
  {
    id: 'obsidian_ember',
    name: 'Obsidian Ember 🔥',
    subtitle: 'Obsidian Black 🖤 x Amber Glow 🌅',
    mode: 'dark2',
    primary: '#ea580c',
    accent: '#f59e0b',
    icon: '🔥'
  },
  {
    id: 'blush_rose',
    name: 'Blush Rose 🌸',
    subtitle: 'Clean Light ☀️ x Rose Pink 💖',
    mode: 'light',
    primary: '#ec4899',
    accent: '#a855f7',
    icon: '🌸'
  },
  {
    id: 'ocean_breeze',
    name: 'Ocean Breeze 🌊',
    subtitle: 'Clean Light ☀️ x Deep Cyan 💙',
    mode: 'light',
    primary: '#3b82f6',
    accent: '#06b6d4',
    icon: '🌊'
  },
  {
    id: 'matcha_latte',
    name: 'Matcha Latte 🍵',
    subtitle: 'Soft Cream 🍦 x Forest Matcha 🍃',
    mode: 'soft',
    primary: '#2d6a4f',
    accent: '#74c69d',
    icon: '🍵'
  }
];

export const applyCustomTheme = (profile) => {
  const root = document.documentElement;

  // Clear previous inline styles so base resets apply cleanly
  root.style.cssText = '';

  const species = profile?.pet_species || 'custom';
  root.setAttribute('data-theme', species);

  const customPrimary = profile?.custom_theme_primary;
  const customAccent = profile?.custom_theme_accent;
  const customMode = profile?.custom_theme_mode || 'light';

  const modeConfig = THEME_MODES[customMode] || THEME_MODES.light;
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
    root.style.setProperty('--color-primary-dark', adjustBrightness(primary, 30));
    root.style.setProperty('--color-primary-light', `${primary}28`);
    // Softer semantic colors — muted enough to not feel harsh
    root.style.setProperty('--color-green', '#34d399');
    root.style.setProperty('--color-green-light', 'rgba(52, 211, 153, 0.15)');
    root.style.setProperty('--color-yellow', '#fbbf24');
    root.style.setProperty('--color-yellow-light', 'rgba(251, 191, 36, 0.15)');
    root.style.setProperty('--color-red', '#f87171');
    root.style.setProperty('--color-red-light', 'rgba(248, 113, 113, 0.15)');
  } else {
    root.style.setProperty('--color-primary-dark', adjustBrightness(primary, -22));
    root.style.setProperty('--color-primary-light', `${primary}18`);
    root.style.setProperty('--color-green', '#10b981');
    root.style.setProperty('--color-green-light', '#d1fae5');
    root.style.setProperty('--color-yellow', '#f59e0b');
    root.style.setProperty('--color-yellow-light', '#fef3c7');
    root.style.setProperty('--color-red', '#ef4444');
    root.style.setProperty('--color-red-light', '#fee2e2');
  }

  // Full-page environment mode variables
  root.style.setProperty('--color-background', modeConfig.background);
  root.style.setProperty('--color-surface', modeConfig.surface);
  root.style.setProperty('--color-surface-hover', modeConfig.surfaceHover);
  root.style.setProperty('--color-text-main', modeConfig.textMain);
  root.style.setProperty('--color-text-muted', modeConfig.textMuted);
  root.style.setProperty('--color-border', modeConfig.border);
  // Use the premium card gradient from the mode config
  root.style.setProperty('--gradient-card', modeConfig.cardGradient || `linear-gradient(135deg, ${modeConfig.surface} 0%, ${modeConfig.background} 100%)`);

  // Environment shadows — much richer on dark to give depth
  const shadowBase = modeConfig.shadowBase;
  const shadowAlpha = parseFloat(modeConfig.shadowAlpha);
  if (isDarkMode) {
    root.style.setProperty('--shadow-sm', `0 2px 12px rgba(${shadowBase},${shadowAlpha * 0.6})`);
    root.style.setProperty('--shadow-md', `0 8px 32px rgba(${shadowBase},${shadowAlpha})`);
    root.style.setProperty('--shadow-lg', `0 20px 60px rgba(${shadowBase},${shadowAlpha * 1.3})`);
  } else {
    root.style.setProperty('--shadow-sm', `0 2px 8px rgba(${shadowBase},${shadowAlpha * 0.7})`);
    root.style.setProperty('--shadow-md', `0 6px 24px rgba(${shadowBase},${shadowAlpha})`);
    root.style.setProperty('--shadow-lg', `0 16px 48px rgba(${shadowBase},${shadowAlpha * 1.4})`);
  }
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
