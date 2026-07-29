import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { UserAvatar } from './UserAvatar';
import { Bell, Zap, Plus, Trash2, Clock, Calendar as CalendarIcon, Sparkles, Send } from 'lucide-react';

export const RemindersSection = ({ isOwner = false }) => {
  const { 
    reminders, 
    sendInstantNudge, 
    createScheduledReminder, 
    deleteReminder, 
    partnerProfile 
  } = useAppStore();

  // Instant nudge custom text input
  const [customNudge, setCustomNudge] = useState('');

  // Scheduled reminder form state
  const [isAdding, setIsAdding] = useState(false);
  const [remTitle, setRemTitle] = useState('');
  const [remMessage, setRemMessage] = useState('');
  const [remTime, setRemTime] = useState('21:00');
  const [remRepeat, setRemRepeat] = useState('daily');

  // Presets for quick 1-click instant nudges
  const instantPresets = [
    { label: 'Drink Water 💧', title: 'Drink Fresh Water 💧', msg: 'Stay hydrated! Time for a fresh glass of water.' },
    { label: 'Time to Stretch 🐾', title: 'Time to Stretch 🐾', msg: 'Take 5 minutes to stand up, stretch, and relax.' },
    { label: 'Bedtime Check 🛌', title: 'Bedtime Check-in 🛌', msg: 'Wind down time! Get ready for bed.' },
    { label: 'Head Pats 💖', title: 'Head Pat Check-in 💖', msg: 'Owner sends a warm hug and gentle head pat!' }
  ];

  const handleSendPreset = (preset) => {
    sendInstantNudge(preset.title, preset.msg);
  };

  const handleSendCustomNudge = (e) => {
    e.preventDefault();
    if (!customNudge.trim()) return;
    sendInstantNudge('Instant Nudge! 🔔', customNudge.trim());
    setCustomNudge('');
  };

  const handleCreateScheduled = (e) => {
    e.preventDefault();
    if (!remTitle.trim()) return;
    createScheduledReminder(remTitle.trim(), remTime, remRepeat, remMessage.trim());
    setRemTitle('');
    setRemMessage('');
    setRemTime('21:00');
    setRemRepeat('daily');
    setIsAdding(false);
  };

  const scheduledReminders = (reminders || []).filter(r => !r.is_instant);
  const recentNudges = (reminders || []).filter(r => r.is_instant);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
      
      {/* 1. INSTANT NUDGES SECTION (Owner sending / Pet receiving) */}
      <div className="card" style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--color-surface), var(--color-surface-hover))',
        border: '1.5px solid var(--color-primary-light)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.875rem',
        paddingLeft: '1.35rem'
      }}>
        {/* Vibrant Left Accent Strip */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          backgroundColor: 'var(--color-accent)'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={20} color="var(--color-accent)" />
            <h2 style={{ fontSize: '1.1rem' }}>
              {isOwner ? 'Send Instant Nudge ⚡' : 'Recent Instant Nudges ⚡'}
            </h2>
          </div>
        </div>

        {isOwner ? (
          <>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              Send an instant real-time notification to <b>{partnerProfile?.username || 'your Pet'}</b>!
            </p>

            {/* Presets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {instantPresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPreset(p)}
                  className="btn-secondary"
                  style={{
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.8rem',
                    justifyContent: 'flex-start',
                    gap: '0.375rem',
                    fontWeight: 600
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Instant Nudge Form */}
            <form onSubmit={handleSendCustomNudge} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Type a quick custom nudge..."
                value={customNudge}
                onChange={(e) => setCustomNudge(e.target.value)}
                style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.825rem' }}
              />
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: 'auto', padding: '0.5rem 0.875rem', fontSize: '0.825rem' }}
              >
                <Send size={14} /> Send
              </button>
            </form>
          </>
        ) : (
          /* PET View: Recent Instant Nudges list */
          recentNudges.length === 0 ? (
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No instant nudges received recently. Your owner can send you real-time check-ins here!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentNudges.slice(0, 3).map((nudge) => (
                <div 
                  key={nudge.id} 
                  style={{ 
                    padding: '0.625rem 0.875rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <UserAvatar profile={partnerProfile} size={30} border={true} />
                    <div>
                      <strong style={{ fontSize: '0.875rem', display: 'block' }}>{nudge.title}</strong>
                      {nudge.message && <span style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)' }}>{nudge.message}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {new Date(nudge.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* 2. SCHEDULED REMINDERS SECTION */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} color="var(--color-primary)" /> Scheduled Reminders ({scheduledReminders.length})
          </h2>
          {isOwner && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="btn-secondary"
              style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Plus size={15} /> {isAdding ? 'Cancel' : 'Schedule Reminder'}
            </button>
          )}
        </div>

        {/* Schedule Reminder Form (Owner) */}
        {isOwner && isAdding && (
          <form onSubmit={handleCreateScheduled} className="card" style={{ 
            position: 'relative',
            overflow: 'hidden',
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.875rem', 
            marginBottom: '0.875rem', 
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
            <h3 style={{ fontSize: '1rem' }}>Schedule New Pet Reminder</h3>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Reminder Title
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Bedtime check-in / Outdoor walk"
                value={remTitle}
                onChange={(e) => setRemTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Reminder Time
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={remTime}
                  onChange={(e) => setRemTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                  Frequency
                </label>
                <select
                  className="input-field"
                  value={remRepeat}
                  onChange={(e) => setRemRepeat(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekdays">Mon - Fri</option>
                  <option value="weekends">Weekends</option>
                  <option value="once">One-time</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                Message / Details (Optional)
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Remember to fill 2L water bottle before bed"
                value={remMessage}
                onChange={(e) => setRemMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
              <Clock size={16} /> Save Scheduled Reminder
            </button>
          </form>
        )}

        {/* Scheduled Reminders Cards List */}
        {scheduledReminders.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--color-text-muted)' }}>
            <Bell size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.875rem' }}>No scheduled reminders set.</p>
            {isOwner && <p style={{ fontSize: '0.775rem' }}>Click "Schedule Reminder" above to set daily check-in times for your Pet!</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {scheduledReminders.map((rem) => (
              <div 
                key={rem.id} 
                className="card" 
                style={{ 
                  display: 'flex', 
                  justify: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.875rem 1rem' 
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.925rem' }}>{rem.title}</strong>
                    <span style={{ 
                      backgroundColor: 'var(--color-primary-light)', 
                      color: 'var(--color-primary-dark)', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.725rem', 
                      fontWeight: 700 
                    }}>
                      ⏰ {rem.reminder_time}
                    </span>
                  </div>

                  {rem.message && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      "{rem.message}"
                    </p>
                  )}

                  <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)' }}>
                    Repeats: <b style={{ textTransform: 'capitalize' }}>{rem.repeat_option}</b>
                  </span>
                </div>

                {isOwner && (
                  <button
                    onClick={() => deleteReminder(rem.id)}
                    style={{ padding: '0.4rem', color: 'var(--color-red)' }}
                    title="Remove reminder"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
