import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Smile, Heart, Sparkles } from 'lucide-react';

export const MascotAvatar = ({ profile, isEditable = false }) => {
  const { updatePetMood } = useAppStore();

  const species = profile?.pet_species || 'puppy';
  const mood = profile?.mood || 'Happy';

  const speciesIcons = {
    puppy: '🐶',
    kitty: '🐱',
    fox: '🦊',
    custom: '✨'
  };

  const moods = [
    { label: 'Happy', icon: '😊' },
    { label: 'Pampered', icon: '👑' },
    { label: 'Sleepy', icon: '😴' },
    { label: 'Proud', icon: '🌟' },
    { label: 'Playful', icon: '🎾' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.5rem'
    }}>
      {/* Avatar Ring Frame */}
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        background: 'var(--gradient-hero)',
        padding: '4px',
        boxShadow: 'var(--shadow-glow)',
        position: 'relative',
        animation: 'float 3s ease-in-out infinite'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          fontSize: '2.75rem',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)'
        }}>
          {speciesIcons[species] || '✨'}
        </div>
        <span style={{
          position: 'absolute',
          bottom: '-2px',
          right: '-2px',
          fontSize: '1.25rem',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '50%',
          padding: '2px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {moods.find(m => m.label === mood)?.icon || '😊'}
        </span>
      </div>

      {/* Mood Selector Buttons if Editable */}
      {isEditable && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center' }}>
          {moods.map((m) => {
            const isSelected = mood === m.label;
            return (
              <button
                key={m.label}
                onClick={() => updatePetMood(m.label)}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.55rem',
                  borderRadius: 'var(--border-radius-full)',
                  border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: isSelected ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
                  transition: 'all 0.15s ease'
                }}
              >
                {m.icon} {m.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
