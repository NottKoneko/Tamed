import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { mockBackend } from '../services/mockBackend';
import { Heart, Sparkles, Shield, Key } from 'lucide-react';

const tryGetTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';
  } catch (e) {
    return 'America/Los_Angeles';
  }
};

export const TIMEZONE_OPTIONS = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC'
];

export const Onboarding = () => {
  const [role, setRole] = useState(null); // 'owner' | 'pet'
  const [username, setUsername] = useState('');
  const [timezone, setTimezone] = useState(tryGetTimezone());
  const [species, setSpecies] = useState('puppy');
  const [customSpeciesName, setCustomSpeciesName] = useState('Bunny');
  const [customSpeciesIcon, setCustomSpeciesIcon] = useState('🐰');
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [praiseTerms, setPraiseTerms] = useState('Good girl!');
  const [pairingCode, setPairingCode] = useState('');
  const [step, setStep] = useState(1);
  const { setUser, pairWithCode, showToast } = useAppStore();

  const handleOwnerComplete = async () => {
    if (!username.trim()) return;
    try {
      const profile = await mockBackend.loginOwner(username.trim());
      profile.timezone = timezone;
      await setUser(profile);
    } catch (err) {
      showToast(err.message || 'Login failed', 'warning');
    }
  };

  const handlePetComplete = async () => {
    if (!username.trim() || !pairingCode.trim()) return;
    try {
      const profile = await mockBackend.loginPet(
        username.trim(), 
        species, 
        praiseTerms.trim(), 
        species === 'custom' ? customSpeciesName.trim() : null, 
        species === 'custom' ? customSpeciesIcon.trim() : null,
        species === 'custom' ? primaryColor : '#8b5cf6',
        species === 'custom' ? accentColor : '#ec4899'
      );
      profile.timezone = timezone;
      await setUser(profile);
      await pairWithCode(pairingCode.trim());
    } catch (err) {
      showToast(err.message || 'Pairing failed. Try Master#1234', 'warning');
    }
  };

  const themePalettes = [
    { label: 'Neon Violet', primary: '#8b5cf6', accent: '#ec4899' },
    { label: 'Emerald Mint', primary: '#10b981', accent: '#06b6d4' },
    { label: 'Sunset Coral', primary: '#f97316', accent: '#f59e0b' },
    { label: 'Ocean Cyber', primary: '#0284c7', accent: '#6366f1' },
    { label: 'Midnight Rose', primary: '#be185d', accent: '#9333ea' }
  ];

  const speciesOptions = [
    { id: 'puppy', label: 'Puppy 🐶', desc: 'Pastel pinks & paw prints' },
    { id: 'kitty', label: 'Kitty 🐱', desc: 'Soft blues & lilac whiskers' },
    { id: 'fox', label: 'Fox 🦊', desc: 'Warm autumn ambers' },
    { id: 'custom', label: 'Custom ⚙️', desc: 'Clean neutral slate baseline' }
  ];

  return (
    <div className="page-container" style={{ justifyContent: 'center', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.875rem',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
          marginBottom: '1rem'
        }}>
          <Heart size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)' }}>Puppy Schedule</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Gamified behavior-tracking & reward system for couples
        </p>
      </div>

      {!role && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', textAlign: 'center' }}>Choose Your Role</h2>

          <button
            onClick={() => { setRole('owner'); setStep(2); }}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              border: '2px solid var(--color-border)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)' }}>
              <Shield size={28} color="var(--color-primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Owner / Master</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                Set behavior statuses, approve reward requests, and manage points balance.
              </p>
            </div>
          </button>

          <button
            onClick={() => { setRole('pet'); setStep(2); }}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              textAlign: 'left',
              cursor: 'pointer',
              border: '2px solid var(--color-border)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)' }}>
              <Sparkles size={28} color="var(--color-accent)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Pet / Submissive</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
                Track green days, earn reward points, and request cute treats or favors!
              </p>
            </div>
          </button>
        </div>
      )}

      {/* OWNER ONBOARDING */}
      {role === 'owner' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Owner Profile Setup</h2>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Your Username / Title
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Master Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Timezone
            </label>
            <select
              className="input-field"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              style={{ fontWeight: 600 }}
            >
              {TIMEZONE_OPTIONS.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setRole(null)}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={handleOwnerComplete} disabled={!username.trim()}>
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* PET ONBOARDING */}
      {role === 'pet' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Pet Profile & Customization</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                Pet Name / Nickname
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Little Fox"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
                Timezone
              </label>
              <select
                className="input-field"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Select Species Aesthetic
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {speciesOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSpecies(opt.id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    border: species === opt.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: species === opt.id ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Persona Details */}
          {species === 'custom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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

              {/* Custom Theme Prompt Card */}
              <div style={{ 
                padding: '1rem', 
                borderRadius: 'var(--border-radius)', 
                background: `linear-gradient(135deg, ${primaryColor}22 0%, ${accentColor}22 100%)`, 
                border: `1.5px solid ${primaryColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', display: 'block' }}>
                    🎨 Custom Pet Theme Configurator
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Pick a curated palette or customize your theme colors:
                  </span>
                </div>

                {/* Preset Palettes */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {themePalettes.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setPrimaryColor(p.primary); setAccentColor(p.accent); }}
                      style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: 'var(--border-radius-full)',
                        border: primaryColor === p.primary ? '2px solid var(--color-text-main)' : '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        fontSize: '0.725rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.primary }} />
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: p.accent }} />
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Live Color Inputs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Primary Accent</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                      <input type="text" className="input-field" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} style={{ fontSize: '0.75rem', padding: '0.3rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Secondary Accent</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                      <input type="text" className="input-field" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} style={{ fontSize: '0.75rem', padding: '0.3rem' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Custom Praise Term
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Good girl! / Good boy!"
              value={praiseTerms}
              onChange={(e) => setPraiseTerms(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Owner Pairing Code (UID)
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Master#1234"
              value={pairingCode}
              onChange={(e) => setPairingCode(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>
              Tip: Use <b>Master#1234</b> for testing mock mode!
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setRole(null)}>
              Back
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handlePetComplete}
              disabled={!username.trim() || !pairingCode.trim()}
            >
              Complete Onboarding
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
