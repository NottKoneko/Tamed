import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar } from '../components/Calendar';
import { RemindersSection } from '../components/RemindersSection';
import { Shield, Copy, UserCheck, Heart } from 'lucide-react';

export const DashboardOwner = () => {
  const { user, pairing, partnerProfile, calendarEntries, showToast, setActiveTab } = useAppStore();

  const petPoints = partnerProfile?.points_balance || 0;
  const greenDaysCount = (calendarEntries || []).filter((e) => e.status === 'green').length;

  const copyPairingCode = () => {
    if (!user?.uid) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(user.uid);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = user.uid;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast('Pairing code copied to clipboard!', 'success');
    } catch (err) {
      showToast(`Pairing code: ${user.uid}`, 'info');
    }
  };

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
      {/* Header */}
      <div className="card" style={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'var(--color-surface)',
        border: '1.5px solid var(--color-primary-light)',
        paddingLeft: '1.35rem'
      }}>
        {/* Vibrant Left Accent Strip */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          backgroundColor: 'var(--color-primary)'
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem' }}>Owner Dashboard & Schedule</h1>
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

      {/* Reminders & Instant Nudges */}
      <RemindersSection isOwner={true} />

      {/* Calendar (Owner edit mode) */}
      <Calendar isOwner={true} />
    </div>
  );
};
