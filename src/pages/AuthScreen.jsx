import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Heart, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    // Pipeline Validation Steps
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

    try {
      if (isLogin) {
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
          setSuccessMsg(`Account created for ${cleanEmail}! 📧 Please check your inbox, or switch to Log In below if confirmed.`);
          setIsLogin(true); // Switch to login tab
        }
      }
    } catch (err) {
      let message = err.message || 'Authentication failed.';
      if (message.includes('User already registered')) {
        message = 'An account with this email already exists. Please switch to Log In.';
      } else if (message.includes('Invalid login credentials')) {
        message = 'Incorrect email or password. Please try again.';
      } else if (message.includes('over_email_send_rate_limit') || message.includes('rate limit exceeded') || err.status === 429) {
        message = '⏳ Email rate limit reached: Supabase limits 1 email per minute. If you already created an account, click "Log In" below!';
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
        
        <div style={{ textAlign: 'center', borderBottom: '1.5px solid var(--color-border)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: 'var(--color-text-main)' }}>
            {isLogin ? 'Welcome Back 👋' : 'Create Account ✨'}
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {isLogin ? 'Sign in with your email to access your relationship codex' : 'Sign up to create your shared couple space'}
          </p>
        </div>

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
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem', color: 'var(--color-text-main)' }}>
              Password
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} color="var(--color-text-muted)" style={{ position: 'absolute', left: '1rem' }} />
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="•••••••• (Min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            {!isLogin && (
              <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '0.3rem', display: 'block' }}>
                Password must contain at least 6 characters.
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.875rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Log In ➔' : 'Create Account ➔')}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
            {isLogin ? "Don't have an account yet? " : "Already have an account? "}
          </span>
          <button
            type="button"
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMsg(null); }}
            style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary-dark)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

      </div>

    </div>
  );
}