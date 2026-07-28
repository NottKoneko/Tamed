import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MascotAvatar } from '../components/MascotAvatar';
import { getCurrencyInfo } from '../utils/currency';
import { THEME_MODES, THEME_PRESETS } from '../utils/theme';
import { requestNotificationPermission, scheduleLocalDailyCheckIn } from '../utils/notifications';
import { TIMEZONE_OPTIONS } from './Onboarding';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { DEFAULT_LEVEL_TITLES } from '../utils/xpUtils';
import { 
  Palette, Heart, LogOut, Unlink, Check, Shield, 
  Volume2, VolumeX, Coins, ChevronDown, ChevronUp, Zap, 
  Lock, Bell, Eye, EyeOff, Sparkles, Sliders, Globe, Link, Trophy, User, Camera
} from 'lucide-react';

/* ───── Collapsible Section Component ──────────────────────────────── */
const Section = ({ icon, title, subtitle, accentColor = 'var(--color-primary)', children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
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
    user, pairing, partnerProfile, updateUserProfile,
    updatePraiseAndSpecies, updatePairingPointValues, updatePairingCurrency, 
    updateCustomTheme, updatePetNickname, updateReminderTime, updateTimezone, toggleXPBar, 
    updatePairingRules, updateCustomLevelTitles, pairWithCode, unpair, setUser, soundEnabled, toggleSound, showToast 
  } = useAppStore();

  const isPet = user?.role === 'pet';
  const isOwner = user?.role === 'owner';

  /* Modals */
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUnpairModal, setShowUnpairModal] = useState(false);

  /* Profile Details & PFP state */
  const [avatarUrlInput, setAvatarUrlInput] = useState(user?.avatar_url || '');
  const [usernameInput, setUsernameInput] = useState(user?.username || '');

  /* Pairing input state */
  const [pairUser, setPairUser] = useState('');
  const [pairCode, setPairCode] = useState('');

  /* Pet Persona state */
  const [species, setSpecies] = useState(user?.pet_species || 'puppy');
  const [customSpeciesName, setCustomSpeciesName] = useState(user?.custom_species_name || 'Bunny');
  const [customSpeciesIcon, setCustomSpeciesIcon] = useState(user?.custom_species_icon || '🐰');
  const [petNicknameInput, setPetNicknameInput] = useState(user?.pet_nickname || '');
  const [praiseTerms, setPraiseTerms] = useState(user?.praise_terms || 'Good girl!');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await updateUserProfile({
        avatar_url: avatarUrlInput.trim() || null,
        username: usernameInput.trim() || user?.username,
        pet_nickname: petNicknameInput.trim() || null,
        pet_species: species,
        praise_terms: praiseTerms.trim() || null,
        custom_species_name: species === 'custom' ? customSpeciesName.trim() : null,
        custom_species_icon: species === 'custom' ? customSpeciesIcon.trim() : null
      });
    } catch (err) {
      // Toast already handled by store
    }
  };

  const handlePairSubmit = async (e) => {
    e.preventDefault();
    if (!pairUser.trim() || !pairCode.trim()) return;
    try {
      await pairWithCode(pairUser.trim(), pairCode.trim());
      setPairUser('');
      setPairCode('');
    } catch (err) {
      // Toast already handled by store
    }
  };

  /* Timezone state */
  const [timezoneInput, setTimezoneInput] = useState(user?.timezone || 'America/Los_Angeles');

  /* Notification & Reminders state */
  const [reminderTimeInput, setReminderTimeInput] = useState(user?.reminder_time || '21:00');
  const [notifStatus, setNotifStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );

  /* Theme state */
  const [pagePrimary, setPagePrimary] = useState(user?.custom_theme_primary || '#8b5cf6');
  const [pageAccent, setPageAccent] = useState(user?.custom_theme_accent || '#ec4899');
  const [pageThemeMode, setPageThemeMode] = useState(user?.custom_theme_mode || 'light');

  /* Owner point values & rules */
  const [greenPoints, setGreenPoints] = useState(pairing?.point_value_green ?? 1);
  const [yellowPoints, setYellowPoints] = useState(pairing?.point_value_yellow ?? 0);
  const [redPoints, setRedPoints] = useState(pairing?.point_value_red ?? 0);
  const [maxProposalsInput, setMaxProposalsInput] = useState(pairing?.max_pending_proposals ?? 3);
  const [weekendMultiplierInput, setWeekendMultiplierInput] = useState(pairing?.weekend_multiplier ?? 1.0);

  /* Currency */
  const defaultSpeciesCurrency = getCurrencyInfo(partnerProfile?.pet_species || 'puppy');
  const [selectedCurrencyPreset, setSelectedCurrencyPreset] = useState(
    pairing?.custom_currency_icon ? 'custom' : 'default'
  );
  const [customEmoji, setCustomEmoji] = useState(pairing?.custom_currency_icon || '🍪');
  const [customName, setCustomName] = useState(pairing?.custom_currency_name || 'Cookies');

  /* Custom Progression Titles */
  const [levelTitlesInput, setLevelTitlesInput] = useState(() => {
    let parsed = {};
    try {
      parsed = typeof pairing?.custom_level_titles === 'string'
        ? JSON.parse(pairing.custom_level_titles)
        : (pairing?.custom_level_titles || {});
    } catch (e) {
      parsed = {};
    }
    return {
      1: parsed[1] || DEFAULT_LEVEL_TITLES[1],
      2: parsed[2] || DEFAULT_LEVEL_TITLES[2],
      4: parsed[4] || DEFAULT_LEVEL_TITLES[4],
      7: parsed[7] || DEFAULT_LEVEL_TITLES[7],
      10: parsed[10] || DEFAULT_LEVEL_TITLES[10]
    };
  });

  const handleSaveLevelTitles = (e) => {
    e.preventDefault();
    updateCustomLevelTitles(levelTitlesInput);
  };

  /* Theme palettes */
  const PALETTES = [
    { label: 'Sage Green', primary: '#87a96b', accent: '#588157' },
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
    if (petNicknameInput.trim() !== user?.pet_nickname) {
      updatePetNickname(petNicknameInput.trim());
    }
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

  const handleSavePairingRules = (e) => {
    e.preventDefault();
    updatePairingRules({
      maxPendingProposals: parseInt(maxProposalsInput, 10) || 3,
      weekendMultiplier: parseFloat(weekendMultiplierInput) || 1.0
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

  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    if (res.granted) {
      setNotifStatus('granted');
      scheduleLocalDailyCheckIn(reminderTimeInput);
      showToast('iOS WebApp Push notifications enabled! 🔔', 'success');
    } else {
      setNotifStatus('denied');
      showToast(res.error || 'Notifications denied in browser settings', 'warning');
    }
  };

  const handleSaveReminderTime = (e) => {
    e.preventDefault();
    updateReminderTime(reminderTimeInput);
    if (notifStatus === 'granted') {
      scheduleLocalDailyCheckIn(reminderTimeInput);
    }
  };

  const handleSavePin = (e) => {
    e.preventDefault();
    if (newPin && newPin.length !== 4) {
      showToast('PIN must be 4 digits', 'warning');
      return;
    }
    setPairingPin(newPin || null);
    setShowPinSetupModal(false);
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
        <h1 style={{ fontSize: '1.6rem' }}>Settings & Preferences</h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
          Personalize themes, daily rules, security PIN, and reminders
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
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'white' }}>
            {user?.pet_nickname || user?.username}
          </div>
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

      {/* ── Sound & Display Preferences ────────────────────── */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
        {/* Sound Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

        <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

        {/* XP Bar Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: user?.show_xp_bar !== false ? 'rgba(139,92,246,0.15)' : 'var(--color-surface-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {user?.show_xp_bar !== false ? <Eye size={18} color="var(--color-primary)" /> : <EyeOff size={18} color="var(--color-text-muted)" />}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>XP Progress Bar</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>Show level meter on Home header</div>
            </div>
          </div>
          <button
            onClick={() => toggleXPBar(user?.show_xp_bar === false ? true : false)}
            style={{
              width: '48px', height: '28px', borderRadius: 'var(--border-radius-full)',
              backgroundColor: user?.show_xp_bar !== false ? 'var(--color-primary)' : 'var(--color-surface-hover)',
              border: `2px solid ${user?.show_xp_bar !== false ? 'var(--color-primary)' : 'var(--color-border)'}`,
              transition: 'all 0.2s ease', position: 'relative', cursor: 'pointer', flexShrink: 0
            }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
              position: 'absolute', top: '2px',
              left: user?.show_xp_bar !== false ? 'calc(100% - 22px)' : '2px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
            }} />
          </button>
        </div>
      </div>

      {/* ── 👤 Edit Profile & Photo Section ────────────────── */}
      <Section
        icon={<User />}
        title="Edit Profile & Photo"
        subtitle="Update your profile photo URL, display name, and persona"
        accentColor="var(--color-primary)"
        defaultOpen={true}
      >
        <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Live Profile Card Preview */}
          <div style={{
            padding: '1.25rem',
            borderRadius: 'var(--border-radius-lg)',
            background: 'var(--gradient-hero)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <MascotAvatar 
              profile={{
                ...user,
                avatar_url: avatarUrlInput.trim() || null,
                username: usernameInput.trim() || user?.username,
                pet_species: species,
                custom_species_name: customSpeciesName,
                custom_species_icon: customSpeciesIcon
              }} 
              isEditable={false} 
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85 }}>
                {user?.role?.toUpperCase() || 'USER'} PREVIEW
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {usernameInput.trim() || user?.username || 'Username'}
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                {isPet ? (petNicknameInput.trim() || praiseTerms) : (user?.uid || '')}
              </div>
            </div>
          </div>

          {/* Profile Picture (PFP) URL Input */}
          <div>
            <Label>Profile Picture (PFP Image URL)</Label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://example.com/photo.jpg or imgur link"
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  style={{ paddingLeft: '2.4rem' }}
                />
                <Camera size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              {avatarUrlInput && (
                <button
                  type="button"
                  onClick={() => setAvatarUrlInput('')}
                  className="btn-secondary"
                  style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.75rem' }}
                >
                  Clear Photo 🗑️
                </button>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>
              💡 Paste a direct image link (PNG, JPG, WebP). Leave blank to use your pet mascot emoji.
            </div>
          </div>

          {/* Username Input */}
          <div style={{ display: 'grid', gridTemplateColumns: isPet ? '1fr 1fr' : '1fr', gap: '0.75rem' }}>
            <div>
              <Label>Display Username</Label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Master Alex"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{ fontWeight: 600 }}
              />
            </div>
            {isPet && (
              <div>
                <Label>Pet Nickname / Endearment</Label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Little Fox"
                  value={petNicknameInput}
                  onChange={(e) => setPetNicknameInput(e.target.value)}
                  style={{ fontWeight: 600 }}
                />
              </div>
            )}
          </div>

          {/* Pet Species Persona Configuration */}
          {isPet && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.85rem' }}>
              <div>
                <Label>Pet Species</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {speciesOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSpecies(opt.id)}
                      style={{
                        padding: '0.5rem 0.25rem',
                        borderRadius: 'var(--border-radius)',
                        border: species === opt.id ? `2px solid ${opt.color}` : '1px solid var(--color-border)',
                        backgroundColor: species === opt.id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                        fontWeight: species === opt.id ? 700 : 500,
                        fontSize: '0.8rem',
                        textAlign: 'center'
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {species === 'custom' && (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <Label>Custom Species Name</Label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Bunny, Dragon"
                      value={customSpeciesName}
                      onChange={(e) => setCustomSpeciesName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Emoji Icon</Label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="🐰"
                      maxLength={4}
                      value={customSpeciesIcon}
                      onChange={(e) => setCustomSpeciesIcon(e.target.value)}
                      style={{ textAlign: 'center' }}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Praise & Endearment Terms</Label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Good girl!, Good boy!, Cutie"
                  value={praiseTerms}
                  onChange={(e) => setPraiseTerms(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.25rem' }}>
            <Check size={16} /> Save Profile Changes
          </button>
        </form>
      </Section>

      {/* ── 🔗 Pair Accounts Section ────────────────── */}
      <Section
        icon={<Link />}
        title={pairing ? "Pairing Status" : "Pair Accounts"}
        subtitle={pairing ? `Linked with ${partnerProfile?.username || 'Partner'}` : "Connect your dashboard with your partner's 6-digit pair code"}
        accentColor="#8b5cf6"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Display Current User's 6-Digit Pair Code */}
          <div style={{
            padding: '1rem', borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-surface-hover)', border: '1.5px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Your Username & 6-Digit Pair Code
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text-main)', marginTop: '0.15rem' }}>
                {user?.username} <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({user?.uid})</span>
              </div>
            </div>
            <div style={{
              padding: '0.5rem 0.875rem', borderRadius: '12px',
              backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)',
              fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.15em', fontFamily: 'monospace'
            }}>
              {user?.pair_code || '849201'}
            </div>
          </div>

          {/* Form to enter Partner Credentials (Shown if not paired) */}
          {!pairing && (
            <form onSubmit={handlePairSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'end' }}>
                <div>
                  <Label style={{ minHeight: '1.8rem', display: 'flex', alignItems: 'flex-end' }}>Partner Username or UID</Label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Master Alex"
                    value={pairUser}
                    onChange={(e) => setPairUser(e.target.value)}
                    style={{ fontWeight: 600 }}
                  />
                </div>
                <div>
                  <Label style={{ minHeight: '1.8rem', display: 'flex', alignItems: 'flex-end' }}>Partner 6-Digit Code</Label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. 849201"
                    maxLength={6}
                    value={pairCode}
                    onChange={(e) => setPairCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ fontWeight: 700, letterSpacing: '0.1em', fontFamily: 'monospace' }}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '0.75rem' }} disabled={!pairUser.trim() || !pairCode.trim()}>
                <Link size={16} /> Authenticate & Pair Accounts
              </button>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                🔒 Both Username/UID and 6-digit Pair Code are required for account pairing security.
              </p>
            </form>
          )}

          {pairing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-green)', fontWeight: 700, fontSize: '0.875rem' }}>
              <Check size={18} /> Active Pair Link: {user?.username} ↔ {partnerProfile?.username}
            </div>
          )}
        </div>
      </Section>

      {/* ── ⏰ Daily Check-in Reminder Time ───────────────── */}
      <Section
        icon={<Bell />}
        title="Daily Check-in Reminder"
        subtitle="iOS WebApp & Browser Push Notifications"
        accentColor="#3b82f6"
      >
        <form onSubmit={handleSaveReminderTime} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-surface-hover)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Notification Permission</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Status: {notifStatus.toUpperCase()}</div>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="btn-secondary"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
            >
              Enable Notifications 🔔
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
            <div>
              <Label>Reminder Time</Label>
              <input
                type="time"
                className="input-field"
                value={reminderTimeInput}
                onChange={(e) => setReminderTimeInput(e.target.value)}
                style={{ fontSize: '0.95rem', fontWeight: 700, padding: '0.65rem' }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1.25rem', padding: '0.65rem' }}>
              <Check size={16} /> Save Time
            </button>
          </div>
        </form>
      </Section>

      {/* ── 🌍 Timezone Settings ───────────────────────────── */}
      <Section
        icon={<Globe />}
        title="Timezone"
        subtitle="Configure active timezone for daily tasks & calendar logs"
        accentColor="#10b981"
      >
        <form onSubmit={(e) => { e.preventDefault(); updateTimezone(timezoneInput); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <Label>Select Timezone</Label>
            <select
              className="input-field"
              value={timezoneInput}
              onChange={(e) => setTimezoneInput(e.target.value)}
              style={{ fontWeight: 600, fontSize: '0.9rem' }}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.65rem' }}>
            <Check size={16} /> Save Timezone
          </button>
        </form>
      </Section>

      {/* ── 🎨 Page Theme & Colors ─────────────────────────── */}
      <Section
        icon={<Palette />}
        title="Page Theme & Colors"
        subtitle="Customize your entire app environment & palette"
        accentColor="var(--color-primary)"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Real-time Theme Preview Card */}
          <div style={{
            borderRadius: 'var(--border-radius-lg)',
            padding: '1.25rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={16} color="var(--color-primary)" />
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-dark)', letterSpacing: '0.04em' }}>
                  Live App Theme Preview
                </span>
              </div>
              <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', fontSize: '0.675rem' }}>
                {THEME_MODES[pageThemeMode]?.name || 'Light'} Mode
              </span>
            </div>

            {/* Live Hero Gradient Strip */}
            <div style={{
              height: '48px',
              borderRadius: 'var(--border-radius)',
              background: `linear-gradient(135deg, ${pagePrimary} 0%, ${pageAccent} 100%)`,
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              color: 'white',
              boxShadow: `0 4px 14px ${pagePrimary}40`
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', letterSpacing: '-0.01em' }}>
                Tamed Live Preview ✨
              </span>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
                  Primary {pagePrimary}
                </span>
                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '999px', backgroundColor: 'rgba(255,255,255,0.25)', fontWeight: 700 }}>
                  Accent {pageAccent}
                </span>
              </div>
            </div>
          </div>

          {/* ✨ Preconfigured Theme Sets */}
          <div>
            <Label>✨ Curated Theme Presets</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {THEME_PRESETS.map((preset) => {
                const isActive = (
                  pageThemeMode === preset.mode &&
                  pagePrimary.toLowerCase() === preset.primary.toLowerCase() &&
                  pageAccent.toLowerCase() === preset.accent.toLowerCase()
                );
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setPagePrimary(preset.primary);
                      setPageAccent(preset.accent);
                      setPageThemeMode(preset.mode);
                      updateCustomTheme(preset.primary, preset.accent, preset.mode);
                    }}
                    style={{
                      padding: '0.9rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      border: isActive ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isActive ? 'rgba(139, 92, 246, 0.08)' : 'var(--color-surface)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isActive ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                        {preset.name}
                      </span>
                      {isActive ? (
                        <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.6rem', padding: '0.12rem 0.5rem' }}>
                          Active ✓
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.9rem' }}>{preset.icon}</span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      {preset.subtitle}
                    </div>

                    {/* Dual Color Swatch Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <div style={{
                        height: '10px',
                        flex: 1,
                        borderRadius: '5px',
                        backgroundColor: preset.primary,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                      }} />
                      <div style={{
                        height: '10px',
                        flex: 1,
                        borderRadius: '5px',
                        backgroundColor: preset.accent,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                      }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Environment Modes */}
          <div>
            <Label>Environment Background Modes</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              {Object.values(THEME_MODES).map((mode) => {
                const active = pageThemeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setPageThemeMode(mode.id);
                      updateCustomTheme(pagePrimary, pageAccent, mode.id);
                    }}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      border: active ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      backgroundColor: mode.surface,
                      cursor: 'pointer', 
                      transition: 'all 0.15s ease',
                      boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.825rem', fontWeight: 800, color: mode.textMain }}>{mode.name}</span>
                      {active && (
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', height: '8px' }}>
                      <div style={{ height: '100%', flex: 2, borderRadius: '4px', backgroundColor: mode.background }} />
                      <div style={{ height: '100%', flex: 1, borderRadius: '4px', backgroundColor: mode.border === 'rgba(255,255,255,0.08)' ? 'rgba(255,255,255,0.2)' : mode.border }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Palettes */}
          <div>
            <Label>Quick Color Palettes</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {PALETTES.map((p) => {
                const isSelected = pagePrimary.toLowerCase() === p.primary.toLowerCase();
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setPagePrimary(p.primary);
                      setPageAccent(p.accent);
                      updateCustomTheme(p.primary, p.accent, pageThemeMode);
                    }}
                    style={{
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--border-radius-full)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.1)' : 'var(--color-surface)',
                      fontWeight: isSelected ? 800 : 600,
                      fontSize: '0.775rem',
                      color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-main)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: isSelected ? '0 2px 8px rgba(139, 92, 246, 0.2)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.primary, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: p.accent, flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Pickers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            {[
              { label: 'Primary Color', value: pagePrimary, set: setPagePrimary },
              { label: 'Accent Color', value: pageAccent, set: setPageAccent }
            ].map(({ label, value, set }) => (
              <div key={label} style={{
                padding: '0.85rem',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <Label style={{ marginBottom: 0 }}>{label}</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <label style={{
                    width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0, cursor: 'pointer',
                    backgroundColor: value, boxShadow: `0 0 0 2px var(--color-surface), 0 0 0 4px ${value}60`,
                    overflow: 'hidden', display: 'block'
                  }}>
                    <input
                      type="color"
                      value={value}
                      onChange={e => {
                        const val = e.target.value;
                        set(val);
                        const nextPrim = label === 'Primary Color' ? val : pagePrimary;
                        const nextAcc = label === 'Accent Color' ? val : pageAccent;
                        updateCustomTheme(nextPrim, nextAcc, pageThemeMode);
                      }}
                      style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={value}
                    onChange={e => {
                      const val = e.target.value;
                      set(val);
                      if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
                        const nextPrim = label === 'Primary Color' ? val : pagePrimary;
                        const nextAcc = label === 'Accent Color' ? val : pageAccent;
                        updateCustomTheme(nextPrim, nextAcc, pageThemeMode);
                      }
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.5rem 0.65rem', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── OWNER: Proposal Limits & Weekend Multiplier ───────── */}
      {isOwner && (
        <Section
          icon={<Sliders />}
          title="Proposal Limits & Weekend Multipliers"
          subtitle="Configure proposal limits & weekend multipliers"
          accentColor="#ec4899"
        >
          <form onSubmit={handleSavePairingRules} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
              <div>
                <Label style={{ minHeight: '1.8rem', display: 'flex', alignItems: 'flex-end' }}>Max Pending Proposals</Label>
                <input
                  type="number"
                  min="1" max="10"
                  className="input-field"
                  value={maxProposalsInput}
                  onChange={(e) => setMaxProposalsInput(e.target.value)}
                  style={{ textAlign: 'center', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', display: 'block', minHeight: '1.8rem' }}>
                  Limit pending requests per pet (1-10)
                </span>
              </div>

              <div>
                <Label>Weekend XP Multiplier</Label>
                <select
                  className="input-field"
                  value={weekendMultiplierInput}
                  onChange={(e) => setWeekendMultiplierInput(e.target.value)}
                  style={{ fontWeight: 700, padding: '0.65rem' }}
                >
                  <option value="1.0">1.0x (Standard)</option>
                  <option value="1.5">1.5x (Bonus Weekends)</option>
                  <option value="2.0">2.0x (Double Points)</option>
                </select>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', display: 'block' }}>
                  Sat & Sun point multiplier
                </span>
              </div>
            </div>

            <button type="submit" className="btn-primary">
              <Check size={16} /> Save Rules & Multipliers
            </button>
          </form>
        </Section>
      )}

      {/* ── OWNER: Progression Ranks & Level Titles ─────────── */}
      {isOwner && (
        <Section
          icon={<Trophy />}
          title="Progression Rank Titles"
          subtitle="Customize rank progression titles awarded at higher levels"
          accentColor="#8b5cf6"
        >
          <form onSubmit={handleSaveLevelTitles} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { level: 1, label: 'Level 1 Rank' },
              { level: 2, label: 'Level 2–3 Rank' },
              { level: 4, label: 'Level 4–6 Rank' },
              { level: 7, label: 'Level 7–9 Rank' },
              { level: 10, label: 'Level 10+ Rank' }
            ].map(({ level, label }) => (
              <div key={level} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', alignItems: 'center' }}>
                <Label style={{ marginBottom: 0 }}>{label}</Label>
                <input
                  type="text"
                  className="input-field"
                  value={levelTitlesInput[level] || ''}
                  onChange={(e) => setLevelTitlesInput({ ...levelTitlesInput, [level]: e.target.value })}
                  placeholder={DEFAULT_LEVEL_TITLES[level]}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </div>
            ))}

            <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
              <Check size={16} /> Save Progression Titles
            </button>
          </form>
        </Section>
      )}

      {/* ── OWNER: Currency ────────────────────────────────── */}
      {isOwner && (
        <Section
          icon={<Coins />}
          title="Point Currency"
          subtitle="What does your pet earn?"
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

      {/* ── PET: Species Persona & Nickname ─────────────────── */}
      {isPet && (
        <Section
          icon={<Heart />}
          title="Pet Persona & Nickname"
          subtitle="Your species identity, nickname, and praise phrase"
          accentColor="var(--color-primary)"
        >
          <form onSubmit={handleSavePetPersona} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <Label>Pet Nickname / Title</Label>
              <input 
                type="text" 
                className="input-field" 
                value={petNicknameInput} 
                onChange={e => setPetNicknameInput(e.target.value)} 
                placeholder="e.g. Princess Fluff, Captain Bark" 
              />
            </div>

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
              <Check size={16} /> Save Persona & Nickname
            </button>
          </form>
        </Section>
      )}

      {/* ── High-Friction Account Controls ──────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
        {partnerProfile && (
          <button 
            onClick={() => setShowUnpairModal(true)} 
            className="btn-secondary" 
            style={{ color: 'var(--color-red)', borderColor: 'var(--color-red)' }}
          >
            <Unlink size={16} /> Unpair from {partnerProfile.username}
          </button>
        )}
        <button onClick={() => setShowLogoutModal(true)} className="btn-secondary">
          <LogOut size={16} /> Log Out / Switch Account
        </button>
      </div>

      {/* ── High-Friction Unpair Modal ──────────────────────── */}
      <ConfirmationModal
        isOpen={showUnpairModal}
        title="Unpair Account?"
        message="Unpairing will break your active calendar & reward link with your partner. To prevent accidental unpairing, type UNPAIR below:"
        requiredWord="UNPAIR"
        confirmText="Confirm Unpair"
        danger={true}
        onConfirm={() => {
          unpair();
          setShowUnpairModal(false);
        }}
        onClose={() => setShowUnpairModal(false)}
      />

      {/* ── High-Friction Logout Modal ──────────────────────── */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Log Out of Tamed?"
        message="Are you sure you want to log out of your session?"
        confirmText="Log Out"
        danger={false}
        onConfirm={() => {
          setUser(null);
          setShowLogoutModal(false);
        }}
        onClose={() => setShowLogoutModal(false)}
      />

    </div>
  );
};
