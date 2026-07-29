import React from 'react';

export const UserAvatar = ({ profile, size = 44, border = true, style = {}, className = '' }) => {
  const isPet = profile?.role === 'pet' || Boolean(profile?.pet_species);
  const species = profile?.pet_species || 'puppy';
  const speciesIcons = { puppy: '🐶', kitty: '🐱', fox: '🦊', custom: '✨' };

  const fallbackIcon = isPet
    ? (species === 'custom' ? (profile?.custom_species_icon || '✨') : (speciesIcons[species] || '🐶'))
    : (profile?.username ? profile.username.charAt(0).toUpperCase() : '👑');

  return (
    <div
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: 'var(--color-surface-hover)',
        border: border ? '2px solid var(--color-primary-light)' : 'none',
        boxShadow: 'var(--shadow-sm)',
        display: 'grid',
        placeItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        fontSize: `${size * 0.48}px`,
        lineHeight: 1,
        fontWeight: 800,
        color: 'var(--color-primary-dark)',
        userSelect: 'none',
        position: 'relative',
        ...style
      }}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile?.username || 'User PFP'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span style={{ display: 'inline-block', transform: 'translateY(0.5px)' }}>
          {fallbackIcon}
        </span>
      )}
    </div>
  );
};
