import React, { useState } from 'react';
import { Lock, X, Check } from 'lucide-react';

export const PinModal = ({ isOpen, title = 'Security Verification', onVerify, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    const success = onVerify(pin);
    if (!success) {
      setError('Incorrect Security PIN code');
      setPin('');
    } else {
      setPin('');
      setError('');
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      animation: 'fadeIn 0.2s ease forwards'
    }}>
      <div className="card" style={{
        maxWidth: '360px', width: '100%', padding: '1.5rem',
        border: '2px solid var(--color-primary)', boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              padding: '0.5rem', borderRadius: '10px',
              backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary)'
            }}>
              <Lock size={22} />
            </div>
            <h3 style={{ fontSize: '1.05rem' }}>{title}</h3>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          Enter your 4-digit security PIN code to proceed:
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <input
              type="password"
              className="input-field"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 4));
                setError('');
              }}
              placeholder="••••"
              maxLength={4}
              autoFocus
              style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em', fontWeight: 700 }}
            />
            {error && (
              <span style={{ fontSize: '0.75rem', color: 'var(--color-red)', marginTop: '0.375rem', display: 'block', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              <Check size={18} /> Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
