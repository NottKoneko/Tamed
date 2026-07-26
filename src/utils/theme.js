/**
 * Dynamic Custom Theme Engine.
 * Dynamically applies full page themes (Backgrounds, Cards, Text, Accent, Gradients) onto documentElement.
 */

export const THEME_MODES = {
  dark: {
    id: 'dark',
    name: 'Midnight Dark 🌙',
    background: '#0b0f19',
    surface: '#151c2c',
    surfaceHover: '#1e293b',
    textMain: '#f8fafc',
    textMuted: '#94a3b8',
    border: '#1e293b',
    gradientCard: 'linear-gradient(135deg, #151c2c 0%, #0f172a 100%)'
  },
  light: {
    id: 'light',
    name: 'Clean Light ☀️',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceHover: '#f1f5f9',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0',
    gradientCard: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
  },
  pastel: {
    id: 'pastel',
    name: 'Soft Lavender 🌸',
    background: '#fcf7ff',
    surface: '#ffffff',
    surfaceHover: '#f5edff',
    textMain: '#2e1065',
    textMuted: '#6b21a8',
    border: '#e9d5ff',
    gradientCard: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk Neon ⚡',
    background: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    textMain: '#fafafa',
    textMuted: '#a1a1aa',
    border: '#27272a',
    gradientCard: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)'
  }
};

export const applyCustomTheme = (profile) => {
  const root = document.documentElement;
  const species = profile?.pet_species || 'puppy';

  // Base species data-theme attribute
  root.setAttribute('data-theme', species);

  const customPrimary = profile?.custom_theme_primary;
  const customAccent = profile?.custom_theme_accent;
  const customMode = profile?.custom_theme_mode || 'dark';

  // If user has custom theme colors or mode configured:
  if (customPrimary || customAccent || customMode) {
    const primary = customPrimary || '#8b5cf6';
    const accent = customAccent || '#ec4899';
    const modeConfig = THEME_MODES[customMode] || THEME_MODES.dark;

    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-primary-dark', adjustBrightness(primary, -20));
    root.style.setProperty('--color-primary-light', adjustBrightness(primary, 40));
    root.style.setProperty('--color-accent', accent);

    // Apply FULL PAGE environment styling
    root.style.setProperty('--color-background', modeConfig.background);
    root.style.setProperty('--color-surface', modeConfig.surface);
    root.style.setProperty('--color-surface-hover', modeConfig.surfaceHover);
    root.style.setProperty('--color-text-main', modeConfig.textMain);
    root.style.setProperty('--color-text-muted', modeConfig.textMuted);
    root.style.setProperty('--color-border', modeConfig.border);
    root.style.setProperty('--gradient-card', modeConfig.gradientCard);

    root.style.setProperty('--gradient-hero', `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`);
    root.style.setProperty('--shadow-glow', `0 0 25px ${primary}40`);
  } else {
    // Reset all inline styles to default preset CSS
    root.removeAttribute('style');
  }
};

function adjustBrightness(hex, percent) {
  if (!hex) return '#8b5cf6';
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
