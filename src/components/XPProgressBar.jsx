import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

export const getLevelTitle = (level = 1) => {
  if (level >= 10) return 'Supreme Royalty 👑';
  if (level >= 7) return 'Royal Paw 🐾';
  if (level >= 4) return 'Pampered Prince(ss) 💖';
  if (level >= 2) return 'Good Pet 🌟';
  return 'Novice Pet 🐣';
};

export const XPProgressBar = ({ xp = 0, level = 1 }) => {
  const xpPerLevel = 100;
  const currentLevelXP = xp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXP / xpPerLevel) * 100));
  const title = getLevelTitle(level);

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--border-radius)',
      padding: '0.875rem 1rem',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Trophy size={16} color="var(--color-primary)" />
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-primary-dark)' }}>
            Level {level}
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            • {title}
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          {currentLevelXP} / {xpPerLevel} XP
        </span>
      </div>

      {/* Progress Bar Container */}
      <div style={{
        height: '10px',
        width: '100%',
        backgroundColor: 'var(--color-surface-hover)',
        borderRadius: 'var(--border-radius-full)',
        overflow: 'hidden',
        position: 'relative',
        border: '1px solid var(--color-border)'
      }}>
        <div style={{
          height: '100%',
          width: `${progressPercent}%`,
          backgroundImage: 'var(--gradient-hero)',
          borderRadius: 'var(--border-radius-full)',
          transition: 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          boxShadow: '0 0 10px var(--color-primary-light)'
        }} />
      </div>
    </div>
  );
};
