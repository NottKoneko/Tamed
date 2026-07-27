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
      justifyContent: 'center',
      gap: '0.75rem',
      padding: '0.25rem',
      flexShrink: 0
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
        animation: 'float 3s ease-in-out infinite',
        flexShrink: 0
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
          fontSize: '2.75rem',
          lineHeight: 1,
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
          userSelect: 'none'
        }}>
          <span style={{ display: 'inline-block', transform: 'translateY(1px)' }}>
            {species === 'custom' ? (profile?.custom_species_icon || '✨') : (speciesIcons[species] || '✨')}
          </span>
        </div>
        <span style={{
          position: 'absolute',
          bottom: '0px',
          right: '0px',
          width: '30px',
          height: '30px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          fontSize: '1.1rem',
          lineHeight: 1,
          boxShadow: 'var(--shadow-sm)',
          border: '1.5px solid var(--color-border)',
          userSelect: 'none'
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
