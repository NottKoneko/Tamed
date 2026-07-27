import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Lock, X, Check } from 'lucide-react';

export const PinModal = ({ isOpen, title = 'Security Verification', onVerify, onClose }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    try {
      const result = await onVerify(pin);
      if (result === false || (result && typeof result === 'object' && result.success === false)) {
        setError((typeof result === 'object' && result.message) ? result.message : 'Incorrect Security PIN code');
        setPin('');
      } else {
        setPin('');
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Verification error');
      setPin('');
    }
  };

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100dvh',
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="card" 
        style={{
          maxWidth: '380px',
          width: '100%',
          margin: 'auto',
          position: 'relative',
          padding: '1.5rem',
          border: '2px solid var(--color-primary)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
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
              onChange={(e) => { setPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setError(''); }}
              placeholder="••••"
              maxLength={4}
              autoFocus
              style={{ textAlign: 'center', fontSize: '1.75rem', letterSpacing: '0.5em', fontWeight: 800 }}
            />
            {error && (
              <div style={{ fontSize: '0.75rem', color: 'var(--color-red)', marginTop: '0.375rem', textAlign: 'center', fontWeight: 600 }}>
                {error}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
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

  return createPortal(modalContent, document.body);
};
