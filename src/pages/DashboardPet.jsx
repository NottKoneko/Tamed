import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Calendar } from '../components/Calendar';
import { Sparkles, Trophy, Gift } from 'lucide-react';

export const DashboardPet = () => {
  const { user, calendarEntries, setActiveTab, partnerProfile } = useAppStore();

  const totalPoints = user?.points_balance || 0;
  const greenDaysCount = (calendarEntries || []).filter((e) => e.status === 'green').length;

  const speciesIcon = {
    puppy: '🐶',
    kitty: '🐱',
    fox: '🦊',
    custom: '✨'
  }[user?.pet_species || 'puppy'];

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

      {/* Interactive Calendar */}
      <Calendar isOwner={false} />
    </div>
  );
};
