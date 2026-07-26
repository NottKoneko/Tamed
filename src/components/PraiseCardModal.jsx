import React from 'react';
import { Heart, Sparkles, X, Gift } from 'lucide-react';
import { playSound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

export const PraiseCardModal = ({ note, onClose }) => {
  if (!note) return null;

  const typeIcons = {
    headpat: '🐾',
    treat: '🍖',
    note: '💌'
  };

  const typeTitles = {
    headpat: 'Head Pat Received!',
    treat: 'Surprise Treat Delivered!',
    note: 'Love Note from Owner'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        position: 'relative',
        animation: 'popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        border: '2px solid var(--color-primary-light)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{
          fontSize: '3.5rem',
          margin: '0.5rem auto 1rem',
          animation: 'float 3s ease-in-out infinite'
        }}>
          {typeIcons[note.type] || '💖'}
        </div>

        <span className="badge" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary-dark)', margin: '0 auto 0.75rem' }}>
          <Sparkles size={12} /> {typeTitles[note.type] || 'Special Praise'}
        </span>

        <h2 style={{ fontSize: '1.3rem', color: 'var(--color-primary-dark)', marginBottom: '0.75rem' }}>
          Praise from Your Owner!
        </h2>

        <p style={{
          fontSize: '1rem',
          color: 'var(--color-text-main)',
          fontStyle: 'italic',
          backgroundColor: 'var(--color-surface-hover)',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          border: '1px solid var(--color-border)',
          marginBottom: '1.25rem'
        }}>
          "{note.message}"
        </p>

        <button
          onClick={() => {
            playSound('praise');
            triggerConfetti();
            onClose();
          }}
          className="btn-primary"
        >
          <Heart size={18} /> Thank You, Master!
        </button>
      </div>
    </div>
  );
};
