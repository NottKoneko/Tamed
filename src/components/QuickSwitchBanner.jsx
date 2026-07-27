import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { UserCheck, Repeat, Shield, Sparkles } from 'lucide-react';

export const QuickSwitchBanner = () => {
  const { user, quickSwitchRole } = useAppStore();

  // Hide demo testing banner in production Supabase mode
  if (isSupabaseConfigured || !user) return null;

  const isOwner = user.role === 'owner';

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0.625rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      boxShadow: 'var(--shadow-sm)',
      zIndex: 800,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          padding: '0.35rem',
          borderRadius: '50%',
          backgroundColor: isOwner ? 'var(--color-primary-light)' : 'var(--color-surface-hover)',
          color: 'var(--color-primary-dark)',
          display: 'flex',
          alignItems: 'center',
          justify: 'center'
        }}>
          {isOwner ? <Shield size={14} /> : <Sparkles size={14} />}
        </div>
        <div style={{ fontSize: '0.8rem', lineHeight: '1.2' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            Testing Mode
          </span>
          <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>
            {user.username} <span style={{ fontWeight: 500, color: 'var(--color-text-muted)' }}>({user.role})</span>
          </span>
        </div>
      </div>

      <button
        onClick={quickSwitchRole}
        className="btn-secondary"
        style={{
          width: 'auto',
          padding: '0.35rem 0.75rem',
          fontSize: '0.75rem',
          borderRadius: 'var(--border-radius-full)',
          borderColor: 'var(--color-primary-light)',
          color: 'var(--color-primary-dark)',
          fontWeight: 700,
          boxShadow: 'var(--shadow-sm)',
          gap: '0.35rem'
        }}
      >
        <Repeat size={13} /> Switch to {isOwner ? 'Pet 🦊' : 'Owner 🛡️'}
      </button>
    </div>
  );
};
