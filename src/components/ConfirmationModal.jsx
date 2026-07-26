import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

export const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  requiredWord, 
  confirmText = 'Confirm', 
  danger = true, 
  onConfirm, 
  onClose 
}) => {
  const [typedInput, setTypedInput] = useState('');

  if (!isOpen) return null;

  const isConfirmed = requiredWord 
    ? typedInput.trim().toUpperCase() === requiredWord.trim().toUpperCase() 
    : true;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConfirmed) return;
    onConfirm();
    setTypedInput('');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      animation: 'fadeIn 0.2s ease forwards'
    }}>
      <div className="card" style={{
        maxWidth: '400px', width: '100%', padding: '1.5rem',
        border: danger ? '2px solid var(--color-red)' : '2px solid var(--color-primary)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              padding: '0.6rem', borderRadius: '12px',
              backgroundColor: danger ? 'var(--color-red-light)' : 'var(--color-primary-light)',
              color: danger ? 'var(--color-red)' : 'var(--color-primary-dark)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{title}</h3>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          {message}
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requiredWord && (
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-main)', display: 'block', marginBottom: '0.375rem' }}>
                Type <span style={{ color: 'var(--color-red)', fontFamily: 'monospace' }}>"{requiredWord}"</span> to confirm:
              </label>
              <input
                type="text"
                className="input-field"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder={requiredWord}
                autoFocus
                style={{ textAlign: 'center', letterSpacing: '0.1em', fontWeight: 700 }}
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!isConfirmed}
              className="btn-primary" 
              style={{ 
                flex: 1, 
                backgroundColor: danger ? 'var(--color-red)' : 'var(--color-primary)',
                backgroundImage: danger ? 'none' : 'var(--gradient-hero)',
                opacity: isConfirmed ? 1 : 0.4,
                cursor: isConfirmed ? 'pointer' : 'not-allowed'
              }}
            >
              <Check size={18} /> {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
