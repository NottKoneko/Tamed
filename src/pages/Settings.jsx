import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getCurrencyInfo } from '../utils/currency';
import { THEME_MODES } from '../utils/theme';
import { Palette, Heart, LogOut, Unlink, Check, Shield, Volume2, VolumeX, Coins, ChevronDown, ChevronUp, Zap } from 'lucide-react';

/* ───── Collapsible Section Component ──────────────────────────────── */
const Section = ({ icon, title, subtitle, accentColor = 'var(--color-primary)', children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
          padding: '1.125rem 1.25rem',
          background: 'none', textAlign: 'left',
          borderBottom: open ? `1px solid var(--color-border)` : 'none'
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
          background: `${accentColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { size: 18, color: accentColor })}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-text-main)' }}>{title}</div>
          {subtitle && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.1rem' }}>{subtitle}</div>}
        </div>
        {open
          ? <ChevronUp size={16} color="var(--color-text-muted)" />
          : <ChevronDown size={16} color="var(--color-text-muted)" />
        }
      </button>
      {open && (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          {children}
        </div>
      )}
    </div>
  );
};

/* ───── Label Component ─────────────────────────────────────────────── */
const Label = ({ children }) => (
  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════════════════════ */
export const Settings = () => {
  const {
    user, pairing, partnerProfile,
    updatePraiseAndSpecies, updatePairingPointValues, updatePairingCurrency,
    updateCustomTheme, unpair, setUser, soundEnabled, toggleSound
  } = useAppStore();

  const isPet = user?.role === 'pet';
  const isOwner = user?.role === 'owner';

  /* Pet Persona state */
  const [species, setSpecies] = useState(user?.pet_species || 'puppy');
  const [customSpeciesName, setCustomSpeciesName] = useState(user?.custom_species_name || 'Bunny');
  const [customSpeciesIcon, setCustomSpeciesIcon] = useState(user?.custom_species_icon || '🐰');
  const [praiseTerms, setPraiseTerms] = useState(user?.praise_terms || 'Good girl!');

  /* Theme state */
  const [pagePrimary, setPagePrimary] = useState(user?.custom_theme_primary || '#8b5cf6');
  const [pageAccent, setPageAccent] = useState(user?.custom_theme_accent || '#ec4899');
  const [pageThemeMode, setPageThemeMode] = useState(user?.custom_theme_mode || 'dark');

  /* Owner point values */
  const [greenPoints, setGreenPoints] = useState(pairing?.point_value_green ?? 1);
  const [yellowPoints, setYellowPoints] = useState(pairing?.point_value_yellow ?? 0);
  const [redPoints, setRedPoints] = useState(pairing?.point_value_red ?? 0);

  /* Currency */
  const defaultSpeciesCurrency = getCurrencyInfo(partnerProfile?.pet_species || 'puppy');
  const [selectedCurrencyPreset, setSelectedCurrencyPreset] = useState(
    pairing?.custom_currency_icon ? 'custom' : 'default'
  );
  const [customEmoji, setCustomEmoji] = useState(pairing?.custom_currency_icon || '🍪');
  const [customName, setCustomName] = useState(pairing?.custom_currency_name || 'Cookies');

  /* Theme palettes */
  const PALETTES = [
    { label: 'Violet', primary: '#8b5cf6', accent: '#ec4899' },
    { label: 'Emerald', primary: '#10b981', accent: '#06b6d4' },
    { label: 'Coral', primary: '#f97316', accent: '#f59e0b' },
    { label: 'Ocean', primary: '#0284c7', accent: '#6366f1' },
    { label: 'Rose', primary: '#be185d', accent: '#9333ea' },
    { label: 'Sapphire', primary: '#3b82f6', accent: '#a855f7' },
    { label: 'Lime', primary: '#84cc16', accent: '#22c55e' },
    { label: 'Crimson', primary: '#dc2626', accent: '#ea580c' },
  ];

  /* Species options */
  const speciesOptions = [
    { id: 'puppy', label: 'Puppy 🐶', desc: 'Pinks & Paws', color: '#ec4899' },
    { id: 'kitty', label: 'Kitty 🐱', desc: 'Blues & Lilacs', color: '#6366f1' },
    { id: 'fox', label: 'Fox 🦊', desc: 'Ambers & Earths', color: '#ea580c' },
    { id: 'custom', label: 'Custom ⚙️', desc: 'You decide!', color: '#8b5cf6' }
  ];

  /* Currency presets */
  const currencyPresets = [
    { id: 'default', label: `Default (${defaultSpeciesCurrency.icon})`, icon: defaultSpeciesCurrency.icon, name: defaultSpeciesCurrency.name },
    { id: 'bones', label: 'Bones', icon: '🦴', name: 'Bones' },
    { id: 'fish', label: 'Fish', icon: '🐟', name: 'Fish' },
    { id: 'berries', label: 'Berries', icon: '🫐', name: 'Berries' },
    { id: 'acorns', label: 'Acorns', icon: '🌰', name: 'Acorns' },
    { id: 'stars', label: 'Stars', icon: '⭐', name: 'Stars' },
    { id: 'treats', label: 'Treats', icon: '🍬', name: 'Treats' },
    { id: 'gems', label: 'Gems', icon: '💎', name: 'Gems' },
    { id: 'custom', label: 'Custom', icon: '✏️', name: 'Custom' }
  ];

  const handleSavePetPersona = (e) => {
    e.preventDefault();
    updatePraiseAndSpecies(
      species, praiseTerms,
      species === 'custom' ? customSpeciesName.trim() : null,
      species === 'custom' ? customSpeciesIcon.trim() : null
    );
  };

  const handleSavePageTheme = (e) => {
    e.preventDefault();
    updateCustomTheme(pagePrimary, pageAccent, pageThemeMode);
  };

  const handleSavePointValues = (e) => {
    e.preventDefault();
    updatePairingPointValues({
      green: parseInt(greenPoints, 10) || 0,
      yellow: parseInt(yellowPoints, 10) || 0,
      red: parseInt(redPoints, 10) || 0
    });
  };

  const handleSaveCurrency = (e) => {
    e.preventDefault();
    if (selectedCurrencyPreset === 'default') {
      updatePairingCurrency({ name: null, singular: null, icon: null });
    } else if (selectedCurrencyPreset === 'custom') {
      updatePairingCurrency({ name: customName.trim() || 'Points', singular: customName.trim() || 'Points', icon: customEmoji.trim() || '⭐' });
    } else {
      const preset = currencyPresets.find(p => p.id === selectedCurrencyPreset);
      if (preset) updatePairingCurrency({ name: preset.name, singular: preset.name, icon: preset.icon });
    }
  };

  /* ── Styles ───────────────────────────────────────────────────────── */
  const chipStyle = (active, activeColor = 'var(--color-primary)') => ({
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--border-radius-full)',
    border: active ? `2px solid ${activeColor}` : '1.5px solid var(--color-border)',
    backgroundColor: active ? `${activeColor}18` : 'var(--color-surface-hover)',
    fontSize: '0.8rem', fontWeight: active ? 700 : 500,
    color: active ? activeColor : 'var(--color-text-main)',
    cursor: 'pointer', transition: 'all 0.15s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
  });

  return (
    <div className="page-container">

      {/* ── Page Header ────────────────────────────────────── */}
      <div>
        <h1 style={{ fontSize: '1.6rem' }}>Settings</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
          Personalize your experience
        </p>
      </div>

      {/* ── Account Card ───────────────────────────────────── */}
      <div className="card" style={{
        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem',
        background: 'var(--gradient-hero)', border: 'none'
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {isPet ? <Heart size={22} color="white" /> : <Shield size={22} color="white" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>{user?.username}</div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
            {user?.role?.toUpperCase()} · {user?.uid}
          </div>
        </div>
        {pairing && (
          <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
            backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.3rem 0.6rem',
            borderRadius: 'var(--border-radius-full)'
          }}>
            Paired ✓
          </div>
        )}
      </div>

      {/* ── Sound Toggle ───────────────────────────────────── */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            backgroundColor: soundEnabled ? 'rgba(16,185,129,0.15)' : 'var(--color-surface-hover)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {soundEnabled ? <Volume2 size={18} color="#10b981" /> : <VolumeX size={18} color="var(--color-text-muted)" />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sound Effects</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Chimes for praise & level ups</div>
          </div>
        </div>
        <button
          onClick={toggleSound}
          style={{
            width: '48px', height: '28px', borderRadius: 'var(--border-radius-full)',
            backgroundColor: soundEnabled ? '#10b981' : 'var(--color-surface-hover)',
            border: `2px solid ${soundEnabled ? '#10b981' : 'var(--color-border)'}`,
            transition: 'all 0.2s ease', position: 'relative', cursor: 'pointer', flexShrink: 0
          }}
        >
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
            position: 'absolute', top: '2px',
            left: soundEnabled ? 'calc(100% - 22px)' : '2px',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }} />
        </button>
      </div>

      {/* ── Page Theme & Colors ─────────────────────────────── */}
      <Section
        icon={<Palette />}
        title="Page Theme & Colors"
        subtitle="Customize your entire app environment"
        accentColor="var(--color-primary)"
      >
        <form onSubmit={handleSavePageTheme} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Environment Mode */}
          <div>
            <Label>Environment Mode</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {Object.values(THEME_MODES).map((mode) => {
                const active = pageThemeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPageThemeMode(mode.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--border-radius)',
                      border: active ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      backgroundColor: mode.surface,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      boxShadow: active ? 'var(--shadow-glow)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: mode.textMain }}>{mode.name}</div>
                    <div style={{ marginTop: '0.35rem', display: 'flex', gap: '4px' }}>
                      <div style={{ height: '6px', flex: 1, borderRadius: '3px', backgroundColor: mode.background }} />
                      <div style={{ height: '6px', flex: 1, borderRadius: '3px', backgroundColor: mode.border === 'rgba(255,255,255,0.08)' ? 'rgba(255,255,255,0.1)' : mode.border }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Palettes */}
          <div>
            <Label>Quick Palettes</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {PALETTES.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => { setPagePrimary(p.primary); setPageAccent(p.accent); }}
                  style={chipStyle(pagePrimary === p.primary)}
                >
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: p.primary, flexShrink: 0 }} />
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: p.accent, flexShrink: 0 }} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Primary', value: pagePrimary, set: setPagePrimary },
              { label: 'Accent', value: pageAccent, set: setPageAccent }
            ].map(({ label, value, set }) => (
              <div key={label}>
                <Label>{label}</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, cursor: 'pointer',
                    backgroundColor: value, boxShadow: `0 0 0 3px var(--color-surface), 0 0 0 5px ${value}60`,
                    overflow: 'hidden', display: 'block'
                  }}>
                    <input type="color" value={value} onChange={e => set(e.target.value)}
                      style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  </label>
                  <input type="text" className="input-field" value={value}
                    onChange={e => set(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.55rem 0.75rem', fontFamily: 'monospace' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Live Preview Strip */}
          <div style={{
            height: '48px', borderRadius: 'var(--border-radius)',
            background: `linear-gradient(135deg, ${pagePrimary} 0%, ${pageAccent} 100%)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: `0 4px 20px ${pagePrimary}40`
          }}>
            <Zap size={14} color="rgba(255,255,255,0.9)" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white', letterSpacing: '0.04em' }}>
              PREVIEW GRADIENT
            </span>
          </div>

          <button type="submit" className="btn-primary">
            <Check size={16} /> Apply Theme
          </button>
        </form>
      </Section>

      {/* ── OWNER: Currency ────────────────────────────────── */}
      {isOwner && (
        <Section
          icon={<Coins />}
          title="Point Currency"
          subtitle="What do your pet earns?"
          accentColor="var(--color-accent)"
        >
          <form onSubmit={handleSaveCurrency} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <Label>Currency Type</Label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                {currencyPresets.map((preset) => {
                  const active = selectedCurrencyPreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedCurrencyPreset(preset.id)}
                      style={{
                        padding: '0.65rem 0.4rem',
                        borderRadius: 'var(--border-radius)',
                        border: active ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: active ? 'var(--color-primary)18' : 'var(--color-surface-hover)',
                        cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.15rem', lineHeight: 1 }}>{preset.icon}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: active ? 700 : 500, marginTop: '0.25rem', color: active ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {preset.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCurrencyPreset === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', padding: '0.875rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-surface-hover)' }}>
                <div>
                  <Label>Emoji</Label>
                  <input type="text" className="input-field" value={customEmoji} onChange={e => setCustomEmoji(e.target.value)}
                    placeholder="🍪" style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.6rem' }} maxLength={4} />
                </div>
                <div>
                  <Label>Currency Name</Label>
                  <input type="text" className="input-field" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Cookies" />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Currency
            </button>
          </form>
        </Section>
      )}

      {/* ── OWNER: Point Values ─────────────────────────────── */}
      {isOwner && (
        <Section
          icon={<Shield />}
          title="Daily Color Points"
          subtitle="Points awarded per calendar day color"
          accentColor="#10b981"
        >
          <form onSubmit={handleSavePointValues} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
              Changes only apply to future entries — past day balances are preserved.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { emoji: '🟢', label: 'Green', value: greenPoints, set: setGreenPoints, bg: 'var(--color-green-light)', border: 'var(--color-green)', text: '#065f46' },
                { emoji: '🟡', label: 'Yellow', value: yellowPoints, set: setYellowPoints, bg: 'var(--color-yellow-light)', border: 'var(--color-yellow)', text: '#92400e' },
                { emoji: '🔴', label: 'Red', value: redPoints, set: setRedPoints, bg: 'var(--color-red-light)', border: 'var(--color-red)', text: '#991b1b' },
              ].map(({ emoji, label, value, set, bg, border, text }) => (
                <div key={label} style={{ padding: '0.75rem', borderRadius: 'var(--border-radius)', backgroundColor: bg, border: `1.5px solid ${border}` }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: text, marginBottom: '0.4rem' }}>{emoji} {label}</div>
                  <input type="number" className="input-field" value={value} onChange={e => set(e.target.value)}
                    style={{ textAlign: 'center', fontWeight: 700, padding: '0.45rem', fontSize: '1.05rem', backgroundColor: 'rgba(255,255,255,0.6)' }} />
                </div>
              ))}
            </div>
            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Point Rules
            </button>
          </form>
        </Section>
      )}

      {/* ── PET: Species Persona ────────────────────────────── */}
      {isPet && (
        <Section
          icon={<Heart />}
          title="Pet Persona & Praise"
          subtitle="Your species identity and praise phrase"
          accentColor="var(--color-primary)"
        >
          <form onSubmit={handleSavePetPersona} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <Label>Species Persona</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {speciesOptions.map((opt) => {
                  const active = species === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSpecies(opt.id)}
                      style={{
                        padding: '0.875rem',
                        borderRadius: 'var(--border-radius)',
                        border: active ? `2px solid ${opt.color}` : '1.5px solid var(--color-border)',
                        backgroundColor: active ? `${opt.color}15` : 'var(--color-surface-hover)',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: active ? opt.color : 'var(--color-text-main)' }}>{opt.label}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{opt.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {species === 'custom' && (
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '0.5rem', padding: '0.875rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-surface-hover)' }}>
                <div>
                  <Label>Emoji</Label>
                  <input type="text" className="input-field" value={customSpeciesIcon} onChange={e => setCustomSpeciesIcon(e.target.value)}
                    placeholder="🐰" style={{ textAlign: 'center', fontSize: '1.2rem', padding: '0.6rem' }} maxLength={4} />
                </div>
                <div>
                  <Label>Species Name</Label>
                  <input type="text" className="input-field" value={customSpeciesName} onChange={e => setCustomSpeciesName(e.target.value)} placeholder="e.g. Bunny, Dragon" />
                </div>
              </div>
            )}

            <div>
              <Label>Praise Phrase</Label>
              <input type="text" className="input-field" value={praiseTerms} onChange={e => setPraiseTerms(e.target.value)} placeholder="e.g. Good girl! / Good boy!" />
            </div>

            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Persona
            </button>
          </form>
        </Section>
      )}

      {/* ── Account Controls ────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {partnerProfile && (
          <button onClick={unpair} className="btn-secondary" style={{ color: 'var(--color-red)', borderColor: 'var(--color-red)' }}>
            <Unlink size={16} /> Unpair from {partnerProfile.username}
          </button>
        )}
        <button onClick={() => setUser(null)} className="btn-secondary">
          <LogOut size={16} /> Log Out / Switch Account
        </button>
      </div>

    </div>
  );
};
