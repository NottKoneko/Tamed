import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar } from '../components/Calendar';
import { Shield, Copy, UserCheck, Heart } from 'lucide-react';

export const DashboardOwner = () => {
  const { user, partnerProfile, calendarEntries, showToast } = useAppStore();

  const petPoints = partnerProfile?.points_balance || 0;
  const greenDaysCount = (calendarEntries || []).filter((e) => e.status === 'green').length;

  const copyPairingCode = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      showToast('Pairing code copied to clipboard!', 'success');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="card" style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '4px solid var(--color-primary)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem' }}>Owner Dashboard</h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
              Logged in as <b>{user?.username}</b> ({user?.uid})
            </p>
          </div>
          <button onClick={copyPairingCode} className="btn-secondary" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
            <Copy size={14} /> Copy Code
          </button>
        </div>
      </div>

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

      {/* Calendar (Owner edit mode) */}
      <Calendar isOwner={true} />
    </div>
  );
};
