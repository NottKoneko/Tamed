import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Heart, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: 'transparent' };
  if (pass.length < 6) return { score: 1, label: 'Weak (Min 6 chars)', color: 'var(--color-red)' };
  const hasLetter = /[a-zA-Z]/.test(pass);
  const hasNum = /[0-9]/.test(pass);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pass);

  if (pass.length >= 10 && hasLetter && hasNum && hasSpecial) {
    return { score: 3, label: 'Strong password 💪', color: 'var(--color-green)' };
  } else if (pass.length >= 6 && ((hasLetter && hasNum) || hasSpecial)) {
    return { score: 2, label: 'Fair password 👍', color: 'var(--color-yellow)' };
  }
  return { score: 1, label: 'Weak (Add numbers or symbols)', color: 'var(--color-red)' };
};

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Pre-fill remembered email if saved
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('tamed_remembered_email');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch (e) {
      // Ignore localStorage restrictions
    }
  }, []);

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    // ── FORGOT PASSWORD FLOW ──
    if (mode === 'forgot') {
      if (!cleanEmail || !validateEmail(cleanEmail)) {
        setError('Please enter a valid email address to receive password reset instructions.');
        return;
      }
      setLoading(true);
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: window.location.origin
        });
        if (resetError) throw resetError;
        setSuccessMsg(`Password reset instructions sent to ${cleanEmail}! 📧 Please check your inbox.`);
      } catch (err) {
        setError(err.message || 'Failed to send reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── LOGIN & SIGNUP VALIDATION ──
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!cleanPass) {
      setError('Please enter a password.');
      return;
    }
    if (cleanPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // Save or clear remembered email
    try {
      if (rememberMe) {
        localStorage.setItem('tamed_remembered_email', cleanEmail);
      } else {
        localStorage.removeItem('tamed_remembered_email');
      }
    } catch (e) {}

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password: cleanPass 
        });
        if (signInError) throw signInError;
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ 
          email: cleanEmail, 
          password: cleanPass 
        });

        if (signUpError) {
          // Smart Fallback: If account was created on previous attempt or rate limited, attempt instant sign in!
          if (signUpError.message?.includes('rate_limit') || signUpError.message?.includes('already registered') || signUpError.message?.includes('exceeded')) {
            const { error: autoSignInError } = await supabase.auth.signInWithPassword({
              email: cleanEmail,
              password: cleanPass
            });
            if (!autoSignInError) {
              return; // Auto-login succeeded!
            }
          }
          throw signUpError;
        }

        // Check if email confirmation is required by Supabase project
        if (signUpData && !signUpData.session) {
          // Attempt instant background sign in
          const { data: directSignIn } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: cleanPass
          });

          if (directSignIn?.session) {
            return; // Logged in instantly!
          }

          setSuccessMsg(`Account created for ${cleanEmail}! 📧 If you don't receive an email within 60s, disable "Confirm Email" in your Supabase Auth settings or click "Log In" above to sign in.`);
          setMode('login'); // Switch to login tab
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      let message = '';
      if (typeof err === 'string') message = err;
      else if (typeof err?.message === 'string' && err.message) message = err.message;
      else if (typeof err?.error_description === 'string' && err.error_description) message = err.error_description;
      else if (typeof err?.msg === 'string' && err.msg) message = err.msg;
      else if (typeof err?.error === 'string' && err.error) message = err.error;

      // Friendly error overrides
      if (message.includes('Email not confirmed')) {
        message = '📧 Email not confirmed yet! Please check your inbox for the confirmation email, or switch to Log In if confirmed.';
      } else if (message.includes('User already registered')) {
        message = 'An account with this email already exists. Please switch to Log In above!';
      } else if (message.includes('Invalid login credentials')) {
        message = 'Incorrect email or password. Please double check and try again.';
      } else if (message.includes('over_email_send_rate_limit') || message.includes('rate limit') || err?.status === 429) {
        message = '⏳ Email rate limit reached: Please wait 60 seconds before trying again, or switch to Log In above!';
      } else if (message.includes('Failed to fetch')) {
        message = '🌐 Network error: Unable to reach authentication server. Please check your connection or ad-blocker.';
      }

      if (!message || message === '{}' || message === '[object Object]') {
        message = 'Authentication failed. Please check your email, password, and internet connection.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '1.5rem 1.25rem 3rem' }}>
      
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          display: 'inline-flex',
          padding: '1rem',
          borderRadius: '50%',
          backgroundImage: 'var(--gradient-hero)',
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow)',
          marginBottom: '0.85rem'
        }}>
          <Heart size={38} fill="#ffffff" />
        </div>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.03em', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Tamed
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', marginTop: '0.25rem', fontWeight: 500 }}>
          Relationship codex & reward system for couples
        </p>
      </div>

      {/* Auth Card */}
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Segmented Mode Switcher (Log In | Sign Up) */}
        {mode !== 'forgot' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--border-radius)',
            padding: '0.25rem',
            border: '1px solid var(--color-border)'
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              style={{
                padding: '0.6rem',
                borderRadius: 'calc(var(--border-radius) - 0.2rem)',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: mode === 'login' ? 'var(--color-surface)' : 'transparent',
                color: mode === 'login' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                boxShadow: mode === 'login' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              style={{
                padding: '0.6rem',
                borderRadius: 'calc(var(--border-radius) - 0.2rem)',
                fontSize: '0.875rem',
                fontWeight: 700,
                backgroundColor: mode === 'signup' ? 'var(--color-surface)' : 'transparent',
                color: mode === 'signup' ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                boxShadow: mode === 'signup' ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '0.75rem' }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
              style={{ padding: '0.35rem', borderRadius: '8px', color: 'var(--color-text-muted)' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Reset Password</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Enter your email to receive a reset link</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-green-light)',
            color: 'var(--color-green)',
            fontSize: '0.825rem',
            fontWeight: 600,
            border: '1px solid var(--color-green)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '0.875rem 1rem',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-red-light)',
            color: 'var(--color-red)',
            fontSize: '0.825rem',
            fontWeight: 600,
            border: '1px solid var(--color-red)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <span>{typeof error === 'string' ? error : 'Authentication failed. Please check your credentials.'}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          
          {/* Email Input */}
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
              <input
                type="email"
                required
                autoComplete="email"
                className="input-field"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
                autoFocus
              />
            </div>
          </div>

          {/* Password Input (Hidden during Forgot Password mode) */}
          {mode !== 'forgot' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccessMsg(null); }}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-dark)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.75rem', paddingRight: '2.75rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.85rem', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Meter (Sign Up Mode) */}
              {mode === 'signup' && password.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : 'var(--color-border)', transition: 'all 0.3s ease' }} />
                    <div style={{ flex: 1, backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : 'var(--color-border)', transition: 'all 0.3s ease' }} />
                    <div style={{ flex: 1, backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : 'var(--color-border)', transition: 'all 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.725rem', color: passwordStrength.color, marginTop: '0.25rem', display: 'block', fontWeight: 600 }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Remember Me Checkbox (Log In Mode) */}
          {mode === 'login' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--color-primary)' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                Remember my email for fast login
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.875rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : (
              mode === 'forgot' ? 'Send Reset Instructions ➔' : (
                mode === 'login' ? 'Log In ➔' : 'Create Account ➔'
              )
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)', fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
          <ShieldCheck size={14} color="var(--color-primary)" />
          <span>Encrypted end-to-end authentication</span>
        </div>

      </div>

    </div>
  );
}