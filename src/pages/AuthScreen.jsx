import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Heart, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (signUpError) throw signUpError;
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
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

        {error && (
          <div style={{
            padding: '0.875rem',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-red-light)',
            color: 'var(--color-red)',
            fontSize: '0.825rem',
            fontWeight: 600,
            border: '1px solid var(--color-red)'
          }}>
            {error}
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
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
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
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
            style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--color-primary-dark)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

      </div>

    </div>
  );
}