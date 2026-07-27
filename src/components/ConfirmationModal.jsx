import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const isConfirmed = requiredWord 
    ? typedInput.trim().toUpperCase() === requiredWord.trim().toUpperCase() 
    : true;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isConfirmed) return;
    onConfirm();
    setTypedInput('');
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
          maxWidth: '420px',
          width: '100%',
          margin: 'auto',
          position: 'relative',
          padding: '1.5rem',
          border: danger ? '2px solid var(--color-red)' : '2px solid var(--color-primary)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'popIn 0.2s cubic-bezier(0.165, 0.84, 0.44, 1) forwards'
        }}
        onClick={(e) => e.stopPropagation()}
      >
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

  return createPortal(modalContent, document.body);
};
