import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { mockBackend } from '../services/mockBackend';
import { Heart, Sparkles, Shield, Key, Link, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const [step, setStep] = useState(1); // 1: role, 2: profile details, 3: account pairing
  const [username, setUsername] = useState('');
  const [timezone, setTimezone] = useState(tryGetTimezone());
  
  /* Pet Specific state */
  const [species, setSpecies] = useState('puppy');
  const [customSpeciesName, setCustomSpeciesName] = useState('Bunny');
  const [customSpeciesIcon, setCustomSpeciesIcon] = useState('🐰');
  const [primaryColor, setPrimaryColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#ec4899');
  const [praiseTerms, setPraiseTerms] = useState('Good girl!');

  /* Step 3 Pairing state */
  const [createdProfile, setCreatedProfile] = useState(null);
  const [partnerUserCode, setPartnerUserCode] = useState('');
  const [partnerPairCode, setPartnerPairCode] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser, pairWithCode, showToast } = useAppStore();

  /* Proceed from Step 2 to Step 3 (Creates profile locally) */
  const handleProceedToPairing = async () => {
    if (!username.trim()) return;
    setLoading(true);
    try {
      let profile;
      if (role === 'owner') {
        profile = await mockBackend.loginOwner(username.trim());
      } else {
        profile = await mockBackend.loginPet(
          username.trim(), 
          species, 
          praiseTerms.trim(), 
          species === 'custom' ? customSpeciesName.trim() : null, 
          species === 'custom' ? customSpeciesIcon.trim() : null,
          species === 'custom' ? primaryColor : '#8b5cf6',
          species === 'custom' ? accentColor : '#ec4899'
        );
      }
      profile.timezone = timezone;
      setCreatedProfile(profile);

      // Pre-fill partner test credentials if applicable
      if (role === 'pet') {
        setPartnerUserCode('Master Alex');
        setPartnerPairCode('849201');
      } else {
        setPartnerUserCode('Little Fox');
        setPartnerPairCode('567812');
      }

      setStep(3);
    } catch (err) {
      showToast(err.message || 'Profile setup failed', 'warning');
    } finally {
      setLoading(false);
    }
  };

  /* Step 3: Link & Complete Setup */
  const handleCompletePairing = async () => {
    if (!createdProfile || !partnerUserCode.trim() || !partnerPairCode.trim()) return;
    setLoading(true);
    try {
      await setUser(createdProfile);
      await pairWithCode(partnerUserCode.trim(), partnerPairCode.trim());
    } catch (err) {
      // Error toast already displayed by store
    } finally {
      setLoading(false);
    }
  };

  /* Step 3: Skip / Set Up Later */
  const handleSkipPairing = async () => {
    if (!createdProfile) return;
    setLoading(true);
    try {
      await setUser(createdProfile);
      showToast('Setup complete! You can pair accounts anytime in Settings ⚙️', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to finish setup', 'warning');
    } finally {
      setLoading(false);
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
      <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '0.875rem',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
          marginBottom: '0.75rem'
        }}>
          <Heart size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', color: 'var(--color-primary-dark)' }}>Tamed</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Gamified behavior-tracking & reward system for couples
        </p>
      </div>

      {/* ── STEP 1: ROLE SELECTION ────────────────────────────── */}
      {step === 1 && (
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
                Set behavior tasks, approve reward requests, and manage point balances.
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
                Complete daily tasks, earn reward points, and request cute treats or favors!
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ── STEP 2: PROFILE DETAILS (OWNER) ───────────────────── */}
      {step === 2 && role === 'owner' && (
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
            <button type="button" className="btn-secondary" onClick={() => { setRole(null); setStep(1); }}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={handleProceedToPairing} disabled={!username.trim() || loading}>
              Next: Account Pairing <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: PROFILE DETAILS (PET) ─────────────────────── */}
      {step === 2 && role === 'pet' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Pet Profile Setup</h2>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Your Pet Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Little Fox / Kitten"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Pet Persona & Species
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {speciesOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSpecies(opt.id)}
                  style={{
                    padding: '0.65rem',
                    borderRadius: 'var(--border-radius)',
                    border: species === opt.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: species === opt.id ? 'var(--color-surface-hover)' : 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Species Inputs */}
          {species === 'custom' && (
            <div style={{ padding: '0.875rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-surface-hover)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Emoji</label>
                  <input type="text" className="input-field" value={customSpeciesIcon} onChange={(e) => setCustomSpeciesIcon(e.target.value)} style={{ textAlign: 'center', fontSize: '1.1rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.2rem' }}>Species Name</label>
                  <input type="text" className="input-field" placeholder="Bunny" value={customSpeciesName} onChange={(e) => setCustomSpeciesName(e.target.value)} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Preset Color Palette</label>
                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {themePalettes.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setPrimaryColor(p.primary); setAccentColor(p.accent); }}
                      style={{
                        padding: '0.35rem 0.6rem', borderRadius: '20px', border: '1px solid var(--color-border)',
                        background: `linear-gradient(135deg, ${p.primary} 0%, ${p.accent} 100%)`,
                        color: '#fff', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
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
            <button type="button" className="btn-secondary" onClick={() => { setRole(null); setStep(1); }}>
              Back
            </button>
            <button type="button" className="btn-primary" onClick={handleProceedToPairing} disabled={!username.trim() || loading}>
              Next: Account Pairing <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: DEDICATED ACCOUNT PAIRING SCREEN (BOTH ROLES) ── */}
      {step === 3 && createdProfile && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>Account Pairing</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Link your dashboard with your partner</p>
            </div>
            <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
              Step 2 of 2
            </span>
          </div>

          {/* Your Generated Credentials Banner */}
          <div style={{
            padding: '1rem', borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-surface-hover)', border: '1.5px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Your Username & Pair Code
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-text-main)', marginTop: '0.15rem' }}>
                {createdProfile.username} <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({createdProfile.uid})</span>
              </div>
            </div>
            <div style={{
              padding: '0.5rem 0.875rem', borderRadius: '12px',
              backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)',
              fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.15em', fontFamily: 'monospace'
            }}>
              {createdProfile.pair_code || '849201'}
            </div>
          </div>

          {/* Partner Credential Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Partner Username / UID
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={role === 'pet' ? 'e.g. Master Alex' : 'e.g. Little Fox'}
                  value={partnerUserCode}
                  onChange={(e) => setPartnerUserCode(e.target.value)}
                  style={{ fontSize: '0.85rem', fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Partner 6-Digit Code
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder={role === 'pet' ? '849201' : '567812'}
                  maxLength={6}
                  value={partnerPairCode}
                  onChange={(e) => setPartnerPairCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', margin: 0 }}>
              🔒 For security, both your partner's Username/UID and 6-digit Pair Code are required to link.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn-primary"
              onClick={handleCompletePairing}
              disabled={!partnerUserCode.trim() || !partnerPairCode.trim() || loading}
            >
              <Link size={18} /> Link & Complete Setup
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleSkipPairing}
              disabled={loading}
              style={{ fontWeight: 600 }}
            >
              Set Up Later / Skip for Now ➔
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'underline', marginTop: '0.25rem', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Back to Profile Setup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
