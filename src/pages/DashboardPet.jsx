import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar } from '../components/Calendar';
import { RemindersSection } from '../components/RemindersSection';
import { Sparkles, Trophy, Gift } from 'lucide-react';

export const DashboardPet = () => {
  const { user, pairing, calendarEntries, setActiveTab, partnerProfile } = useAppStore();

  const totalPoints = user?.points_balance || 0;
  const greenDaysCount = (calendarEntries || []).filter((e) => e.status === 'green').length;

  const speciesIcon = {
    puppy: '🐶',
    kitty: '🐱',
    fox: '🦊',
    custom: '✨'
  }[user?.pet_species || 'puppy'];

  if (!pairing) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary)' }}>
            <Sparkles size={36} color="var(--color-primary)" />
          </div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Schedule Locked (Unpaired)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '340px', lineHeight: '1.4' }}>
            Daily check-in logs and green day tracking require an active pairing with your owner.
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
      {/* Dynamic Motivational Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-hover))',
        border: '2px solid var(--color-primary-light)',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{speciesIcon}</span>
          <div>
            <h1 style={{ fontSize: '1.35rem', color: 'var(--color-primary-dark)' }}>
              {user?.praise_terms || 'Good girl!'} {user?.username} ♡
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
              {partnerProfile ? `Paired with ${partnerProfile.username}` : 'Green days earn reward points!'}
            </p>
          </div>
        </div>
      </div>

      {/* Gamification Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
          <div style={{ padding: '0.625rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)' }}>
            <Trophy size={24} color="var(--color-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Points Balance</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)' }}>{totalPoints} pts</strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem' }}>
          <div style={{ padding: '0.625rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)' }}>
            <Sparkles size={24} color="var(--color-green)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>Green Days</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-green)' }}>{greenDaysCount} days</strong>
          </div>
        </div>
      </div>

      {/* Request Trigger Banner */}
      <button
        onClick={() => setActiveTab('rewards')}
        className="btn-primary"
        style={{ padding: '1rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)' }}
      >
        <Gift size={20} /> Request a Reward in Rewards Hub
      </button>

      {/* Active Reminders & Nudges */}
      <RemindersSection isOwner={false} />

      {/* Interactive Calendar */}
      <Calendar isOwner={false} />
    </div>
  );
};
