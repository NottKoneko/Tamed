import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { mockBackend } from '../services/mockBackend';
import { 
  Heart, Sparkles, Shield, Key, Link, ArrowRight, CheckCircle2, 
  Crown, Flame, Copy, Check, ChevronLeft, Globe, User, Zap, Award
} from 'lucide-react';

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
  const [step, setStep] = useState(1); // 1: role, 2: profile, 3: pairing
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
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setUser, createInitialProfile, pairWithCode, showToast } = useAppStore();

  /* Proceed from Step 2 to Step 3 (Creates profile) */
  const handleProceedToPairing = async () => {
    if (!username.trim() || username.trim().length < 2) {
      showToast('Please enter a valid name (at least 2 characters)', 'warning');
      return;
    }
    setLoading(true);
    try {
      const profileDetails = {
        role,
        username: username.trim(),
        timezone,
        pet_species: species,
        praise_terms: praiseTerms.trim(),
        custom_species_name: species === 'custom' ? customSpeciesName.trim() : null,
        custom_species_icon: species === 'custom' ? customSpeciesIcon.trim() : null,
        custom_theme_primary: species === 'custom' ? primaryColor : '#8b5cf6',
        custom_theme_accent: species === 'custom' ? accentColor : '#ec4899'
      };

      const profile = await createInitialProfile(profileDetails);
      setCreatedProfile(profile);

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
      await pairWithCode(partnerUserCode.trim(), partnerPairCode.trim());
    } catch (err) {
      // Toast handled by store
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
      showToast('Welcome to Tamed! You can pair accounts anytime in Settings ⚙️', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to finish setup', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    showToast('Pair Code copied to clipboard! 📋', 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const themePalettes = [
    { label: 'Neon Violet', primary: '#8b5cf6', accent: '#ec4899' },
    { label: 'Emerald Mint', primary: '#10b981', accent: '#06b6d4' },
    { label: 'Sunset Coral', primary: '#f97316', accent: '#f59e0b' },
    { label: 'Ocean Cyber', primary: '#0284c7', accent: '#6366f1' },
    { label: 'Midnight Rose', primary: '#be185d', accent: '#9333ea' }
  ];

  const speciesOptions = [
    { id: 'puppy', label: 'Puppy 🐶', desc: 'Pinks, soft paws & praise' },
    { id: 'kitty', label: 'Kitty 🐱', desc: 'Lilacs, soft blue whiskers' },
    { id: 'fox', label: 'Fox 🦊', desc: 'Burnt amber, autumn tones' },
    { id: 'custom', label: 'Custom ⚙️', desc: 'Your own custom persona' }
  ];

  const praisePresets = [
    'Good girl!',
    'Good boy!',
    'Cute puppy!',
    'My little kitten!',
    'Good pet!',
    'Good submissive!'
  ];

  return (
    <div className="page-container" style={{ justifyContent: 'center', minHeight: '100vh', padding: '1.5rem 1.25rem 3rem' }}>
      
      {/* Top Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '50%',
          backgroundImage: 'var(--gradient-hero)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: '0.75rem'
        }}>
          <Heart size={36} fill="#ffffff" />
        </div>
        <h1 style={{ fontSize: '2.25rem', letterSpacing: '-0.03em', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Tamed
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem', fontWeight: 500 }}>
          Relationship codex & reward system for couples
        </p>

        {/* Stepper Progress Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
          {[
            { num: 1, label: 'Role' },
            { num: 2, label: 'Profile' },
            { num: 3, label: 'Pairing' }
          ].map((st, idx) => {
            const isActive = step === st.num;
            const isDone = step > st.num;
            return (
              <React.Fragment key={st.num}>
                {idx > 0 && (
                  <div style={{
                    height: '2px', width: '24px',
                    backgroundColor: isDone ? 'var(--color-primary)' : 'var(--color-border)',
                    transition: 'all 0.3s ease'
                  }} />
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.3rem 0.75rem', borderRadius: 'var(--border-radius-full)',
                  backgroundColor: isActive ? 'var(--color-primary)' : isDone ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
                  color: isActive ? '#ffffff' : isDone ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                  fontSize: '0.75rem', fontWeight: 700,
                  transition: 'all 0.3s ease'
                }}>
                  {isDone ? <CheckCircle2 size={13} /> : st.num}
                  <span>{st.label}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ── STEP 1: ROLE SELECTION ────────────────────────────── */}
      {step === 1 && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.35rem' }}>Select Your Role</h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              You can switch roles anytime using the quick switch bar
            </p>
          </div>

          {/* Owner Role Card */}
          <button
            onClick={() => { setRole('owner'); setStep(2); }}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.125rem',
              textAlign: 'left',
              cursor: 'pointer',
              border: role === 'owner' ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              transition: 'all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1)',
              padding: '1.25rem'
            }}
          >
            <div style={{
              padding: '0.85rem', borderRadius: '16px',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)',
              flexShrink: 0
            }}>
              <Shield size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)' }}>Owner / Master 👑</h3>
                <span className="badge" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
                  Leader
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                Assign daily behavior tasks, set reward values, approve treat requests, and manage point balances.
              </p>
            </div>
          </button>

          {/* Pet Role Card */}
          <button
            onClick={() => { setRole('pet'); setStep(2); }}
            className="card"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1.125rem',
              textAlign: 'left',
              cursor: 'pointer',
              border: role === 'pet' ? '2px solid var(--color-accent)' : '1.5px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              transition: 'all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1)',
              padding: '1.25rem'
            }}
          >
            <div style={{
              padding: '0.85rem', borderRadius: '16px',
              backgroundColor: '#fce7f3',
              color: '#db2777',
              flexShrink: 0
            }}>
              <Sparkles size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)' }}>Pet / Submissive 🐾</h3>
                <span className="badge" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
                  Reward Earner
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', lineHeight: 1.45 }}>
                Check off daily tasks, collect reward points, propose new treat ideas, and earn sweet praise!
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ── STEP 2: PROFILE DETAILS (OWNER) ───────────────────── */}
      {step === 2 && role === 'owner' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)' }}>
              <Crown size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Owner Profile Setup</h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>Configure your title and timezone</p>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Your Title / Username
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Master Alex / Sir"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Primary Timezone
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
            <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '0.35rem', display: 'block' }}>
              Used to automatically refresh daily task statuses at midnight.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setRole(null); setStep(1); }} style={{ flex: 1 }}>
              <ChevronLeft size={18} /> Back
            </button>
            <button type="button" className="btn-primary" onClick={handleProceedToPairing} disabled={!username.trim() || loading} style={{ flex: 2 }}>
              Next: Account Pairing <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: PROFILE DETAILS (PET) ─────────────────────── */}
      {step === 2 && role === 'pet' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: '#fce7f3', color: '#db2777' }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Pet Profile Setup</h2>
              <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>Customize your pet name & persona</p>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Your Pet Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Little Fox / Kitten"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Pet Persona & Theme Preset
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {speciesOptions.map((opt) => {
                const isSel = species === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSpecies(opt.id)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--border-radius)',
                      border: isSel ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      backgroundColor: isSel ? 'var(--color-primary-light)' : 'var(--color-surface)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: isSel ? 'var(--color-primary-dark)' : 'var(--color-text-main)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Species Options */}
          {species === 'custom' && (
            <div style={{ padding: '1rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Emoji</label>
                  <input type="text" className="input-field" value={customSpeciesIcon} onChange={(e) => setCustomSpeciesIcon(e.target.value)} style={{ textAlign: 'center', fontSize: '1.25rem', padding: '0.5rem' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.2rem' }}>Species Name</label>
                  <input type="text" className="input-field" placeholder="Bunny" value={customSpeciesName} onChange={(e) => setCustomSpeciesName(e.target.value)} style={{ padding: '0.5rem 0.75rem' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Preset Color Palette</label>
                <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  {themePalettes.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setPrimaryColor(p.primary); setAccentColor(p.accent); }}
                      style={{
                        padding: '0.35rem 0.65rem', borderRadius: '20px', border: '1.5px solid var(--color-border)',
                        background: `linear-gradient(135deg, ${p.primary} 0%, ${p.accent} 100%)`,
                        color: '#fff', fontSize: '0.675rem', fontWeight: 700, flexShrink: 0
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
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Default Praise Term
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Good girl! / Good boy!"
              value={praiseTerms}
              onChange={(e) => setPraiseTerms(e.target.value)}
              style={{ marginBottom: '0.4rem' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {praisePresets.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setPraiseTerms(term)}
                  style={{
                    padding: '0.25rem 0.6rem', borderRadius: '14px',
                    fontSize: '0.7rem', fontWeight: 600,
                    backgroundColor: praiseTerms === term ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
                    color: praiseTerms === term ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--color-text-main)' }}>
              Primary Timezone
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

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => { setRole(null); setStep(1); }} style={{ flex: 1 }}>
              <ChevronLeft size={18} /> Back
            </button>
            <button type="button" className="btn-primary" onClick={handleProceedToPairing} disabled={!username.trim() || loading} style={{ flex: 2 }}>
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

          {/* Info Banner */}
          <div style={{
            padding: '0.875rem', borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-surface-hover)', border: '1px solid var(--color-border)'
          }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.45 }}>
              Enter your partner's <b>Full Username</b> and <b>6-digit Pair Code</b> to link your accounts. Or log in and pair up later!
            </p>
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
              style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', marginTop: '0.25rem' }}
            >
              ← Back to profile setup
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
