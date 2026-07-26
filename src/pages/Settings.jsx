import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getCurrencyInfo } from '../utils/currency';
import { Palette, Heart, LogOut, Unlink, Check, Shield, Volume2, VolumeX, Coins } from 'lucide-react';

export const Settings = () => {
  const { 
    user, 
    pairing, 
    partnerProfile, 
    updatePraiseAndSpecies, 
    updatePairingPointValues, 
    updatePairingCurrency, 
    unpair, 
    setUser, 
    soundEnabled, 
    toggleSound 
  } = useAppStore();

  const isPet = user?.role === 'pet';
  const isOwner = user?.role === 'owner';

  // Pet state
  const [species, setSpecies] = useState(user?.pet_species || 'puppy');
  const [customSpeciesName, setCustomSpeciesName] = useState(user?.custom_species_name || 'Bunny');
  const [customSpeciesIcon, setCustomSpeciesIcon] = useState(user?.custom_species_icon || '🐰');
  const [praiseTerms, setPraiseTerms] = useState(user?.praise_terms || 'Good girl!');

  // Owner daily point value state
  const [greenPoints, setGreenPoints] = useState(pairing?.point_value_green ?? 1);
  const [yellowPoints, setYellowPoints] = useState(pairing?.point_value_yellow ?? 0);
  const [redPoints, setRedPoints] = useState(pairing?.point_value_red ?? 0);

  // Owner point type / currency customization state
  const defaultSpeciesCurrency = getCurrencyInfo(partnerProfile?.pet_species || 'puppy');
  const [selectedCurrencyPreset, setSelectedCurrencyPreset] = useState(
    pairing?.custom_currency_icon ? 'custom' : 'default'
  );
  const [customEmoji, setCustomEmoji] = useState(pairing?.custom_currency_icon || '🍪');
  const [customName, setCustomName] = useState(pairing?.custom_currency_name || 'Cookies');

  const handleSave = (e) => {
    e.preventDefault();
    updatePraiseAndSpecies(
      species, 
      praiseTerms, 
      species === 'custom' ? customSpeciesName.trim() : null, 
      species === 'custom' ? customSpeciesIcon.trim() : null
    );
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
      const trimmedName = customName.trim() || 'Points';
      const trimmedEmoji = customEmoji.trim() || '⭐';
      updatePairingCurrency({ name: trimmedName, singular: trimmedName, icon: trimmedEmoji });
    } else {
      const preset = currencyPresets.find(p => p.id === selectedCurrencyPreset);
      if (preset) {
        updatePairingCurrency({ name: preset.name, singular: preset.name, icon: preset.icon });
      }
    }
  };

  const speciesOptions = [
    { id: 'puppy', label: 'Puppy 🐶', desc: 'Pastel pinks & Bones 🦴', color: '#ec4899' },
    { id: 'kitty', label: 'Kitty 🐱', desc: 'Soft blues & Fish 🐟', color: '#6366f1' },
    { id: 'fox', label: 'Fox 🦊', desc: 'Autumn & Berries 🫐', color: '#ea580c' },
    { id: 'custom', label: 'Custom ⚙️', desc: 'Slate baseline & Stars ⭐', color: '#475569' }
  ];

  const currencyPresets = [
    { id: 'default', label: `Pet Default (${defaultSpeciesCurrency.icon})`, icon: defaultSpeciesCurrency.icon, name: defaultSpeciesCurrency.name },
    { id: 'bones', label: 'Bones 🦴', icon: '🦴', name: 'Bones' },
    { id: 'fish', label: 'Fish 🐟', icon: '🐟', name: 'Fish' },
    { id: 'berries', label: 'Berries 🫐', icon: '🫐', name: 'Berries' },
    { id: 'acorns', label: 'Acorns 🌰', icon: '🌰', name: 'Acorns' },
    { id: 'stars', label: 'Stars ⭐', icon: '⭐', name: 'Stars' },
    { id: 'treats', label: 'Treats 🍬', icon: '🍬', name: 'Treats' },
    { id: 'gems', label: 'Gems 💎', icon: '💎', name: 'Gems' },
    { id: 'custom', label: 'Custom 🎨', icon: '🎨', name: 'Custom (Emoji & Name)' }
  ];

  return (
    <div className="page-container">
      <div>
        <h1 style={{ fontSize: '1.5rem' }}>Settings & Preferences</h1>
        <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
          Personalize app aesthetics, point currency, daily rules, and audio
        </p>
      </div>

      {/* Account Info Header */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--border-radius)',
          backgroundColor: 'var(--color-surface-hover)',
          color: 'var(--color-primary-dark)'
        }}>
          {isPet ? <Heart size={26} /> : <Shield size={26} />}
        </div>
        <div style={{ flex: 1 }}>
          <strong style={{ fontSize: '1.15rem', display: 'block', color: 'var(--color-primary-dark)' }}>
            {user?.username}
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Role: <b>{user?.role?.toUpperCase()}</b> ({user?.uid})
          </span>
        </div>
      </div>

      {/* Sound Toggle */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong style={{ fontSize: '1rem', display: 'block' }}>Sound Effects</strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Playful synth chimes for leveling up & praise</span>
        </div>
        <button
          onClick={toggleSound}
          className="btn-secondary"
          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          {soundEnabled ? <Volume2 size={18} color="var(--color-green)" /> : <VolumeX size={18} color="var(--color-text-muted)" />}
          {soundEnabled ? 'Enabled' : 'Muted'}
        </button>
      </div>

      {/* OWNER: Point Type & Currency Customizer */}
      {isOwner && (
        <form onSubmit={handleSaveCurrency} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid var(--color-accent)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Coins size={20} color="var(--color-accent)" /> Point Type & Currency Customization
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Customize the currency icon and name used for points across your pairing dashboard, reward store, and redemptions.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Select Currency Preset
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {currencyPresets.map((preset) => {
                const isSelected = selectedCurrencyPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedCurrencyPreset(preset.id)}
                    style={{
                      padding: '0.65rem 0.5rem',
                      borderRadius: 'var(--border-radius)',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                      fontSize: '0.8rem',
                      fontWeight: isSelected ? 700 : 500,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1rem', display: 'block', marginBottom: '0.2rem' }}>{preset.icon}</span>
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Emoji & Name Input (only if 'custom' selected) */}
          {selectedCurrencyPreset === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', backgroundColor: 'var(--color-background)', padding: '0.875rem', borderRadius: 'var(--border-radius)' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Emoji Icon
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customEmoji}
                  onChange={(e) => setCustomEmoji(e.target.value)}
                  placeholder="e.g. 🍪"
                  style={{ textAlign: 'center', fontSize: '1.1rem' }}
                  maxLength={4}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Currency Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Cookies"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" style={{ padding: '0.65rem' }}>
            <Check size={18} /> Update Point Type
          </button>
        </form>
      )}

      {/* OWNER: Calendar Point Values Configuration */}
      {isOwner && (
        <form onSubmit={handleSavePointValues} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--color-primary)" /> Daily Color Point Values
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
              Configure points awarded when logging schedule colors. <i>(Adjusting values will only apply to future entries and will not alter past day balances)</i>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-green-light)', border: '1px solid var(--color-green)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#065f46', display: 'block', marginBottom: '0.35rem' }}>
                🟢 Green Day
              </label>
              <input
                type="number"
                className="input-field"
                value={greenPoints}
                onChange={(e) => setGreenPoints(e.target.value)}
                style={{ textAlign: 'center', fontWeight: 700, padding: '0.4rem' }}
              />
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-yellow-light)', border: '1px solid var(--color-yellow)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '0.35rem' }}>
                🟡 Yellow Day
              </label>
              <input
                type="number"
                className="input-field"
                value={yellowPoints}
                onChange={(e) => setYellowPoints(e.target.value)}
                style={{ textAlign: 'center', fontWeight: 700, padding: '0.4rem' }}
              />
            </div>

            <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-red-light)', border: '1px solid var(--color-red)' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', display: 'block', marginBottom: '0.35rem' }}>
                🔴 Red Day
              </label>
              <input
                type="number"
                className="input-field"
                value={redPoints}
                onChange={(e) => setRedPoints(e.target.value)}
                style={{ textAlign: 'center', fontWeight: 700, padding: '0.4rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.65rem' }}>
            <Check size={18} /> Update Color Point Rules
          </button>
        </form>
      )}

      {/* Pet Aesthetics Customization Form */}
      {isPet && (
        <form onSubmit={handleSave} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={20} color="var(--color-primary)" /> Aesthetic & Species Persona
          </h2>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
              Select Theme Persona
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {speciesOptions.map((opt) => {
                const isSelected = species === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSpecies(opt.id)}
                    style={{
                      padding: '0.875rem',
                      borderRadius: 'var(--border-radius)',
                      border: isSelected ? `2px solid ${opt.color}` : '1.5px solid var(--color-border)',
                      backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                      textAlign: 'left',
                      position: 'relative',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</span>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: opt.color }} />
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Species Persona Details */}
          {species === 'custom' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem', backgroundColor: 'var(--color-surface-hover)', padding: '0.875rem', borderRadius: 'var(--border-radius)' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Species Emoji
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customSpeciesIcon}
                  onChange={(e) => setCustomSpeciesIcon(e.target.value)}
                  placeholder="e.g. 🐰"
                  style={{ textAlign: 'center', fontSize: '1.1rem' }}
                  maxLength={4}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Custom Species Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={customSpeciesName}
                  onChange={(e) => setCustomSpeciesName(e.target.value)}
                  placeholder="e.g. Bunny, Dragon, Panda"
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Custom Praise Phrase
            </label>
            <input
              type="text"
              className="input-field"
              value={praiseTerms}
              onChange={(e) => setPraiseTerms(e.target.value)}
              placeholder="e.g. Good girl! / Good boy!"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
            <Check size={18} /> Save Settings
          </button>
        </form>
      )}

      {/* Account Management & Controls */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h2 style={{ fontSize: '1.15rem' }}>Account Controls</h2>
        
        {partnerProfile && (
          <button onClick={unpair} className="btn-secondary" style={{ color: 'var(--color-red)', borderColor: 'var(--color-red-light)' }}>
            <Unlink size={18} /> Unpair from {partnerProfile.username}
          </button>
        )}

        <button onClick={() => setUser(null)} className="btn-secondary">
          <LogOut size={18} /> Log Out / Switch Account
        </button>
      </div>
    </div>
  );
};
