import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar } from '../components/Calendar';
import { RemindersSection } from '../components/RemindersSection';
import { UserCheck, Heart } from 'lucide-react';

export const DashboardOwner = () => {
  const { pairing, partnerProfile, setActiveTab } = useAppStore();

  const petPoints = partnerProfile?.points_balance || 0;

  if (!pairing) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary)' }}>
            <Heart size={36} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Schedule Locked (Unpaired)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '340px', lineHeight: '1.4' }}>
            Daily check-in logs and green day tracking require an active pairing with your partner.
          </p>
          <button onClick={() => setActiveTab('home')} className="btn-primary" style={{ width: 'auto', padding: '0.65rem 1.25rem', marginTop: '0.5rem' }}>
            Link Accounts on Home Screen ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Pairing Info */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{ padding: '0.625rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)' }}>
          {partnerProfile ? <UserCheck size={24} color="var(--color-green)" /> : <Heart size={24} color="var(--color-text-muted)" />}
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Paired Pet</span>
          <strong style={{ fontSize: '1.1rem' }}>
            {partnerProfile ? `${partnerProfile.username} (${partnerProfile.pet_species || 'Pet'})` : 'No Pet Paired Yet'}
          </strong>
        </div>
        {partnerProfile && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Points</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary-dark)' }}>{petPoints} pts</strong>
          </div>
        )}
      </div>

      {/* 2nd Card: Calendar (Moved to second to top card) */}
      <Calendar isOwner={true} />

      {/* 3rd Card: Reminders & Instant Nudges */}
      <RemindersSection isOwner={true} />
    </div>
  );
};
