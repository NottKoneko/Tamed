import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { MascotAvatar } from '../components/MascotAvatar';
import { XPProgressBar } from '../components/XPProgressBar';
import { formatCurrency, getCurrencyInfo } from '../utils/currency';
import { 
  Trophy, Sparkles, Plus, Minus, Gift, Calendar as CalendarIcon, Shield, 
  Flame, Heart, Send, CheckCircle2, Circle, Trash2, Tag, Award, MoreVertical, Check, RotateCcw
} from 'lucide-react';

export const Home = () => {
  const { 
    user, 
    pairing,
    partnerProfile, 
    calendarEntries, 
    setPetPoints, 
    setActiveTab, 
    proposals = [], 
    rewardItems = [],
    dailyTasks = [],
    createDailyTask,
    toggleDailyTask,
    overrideDailyTask,
    deleteDailyTask,
    sendPraiseNote
  } = useAppStore();

  const isOwner = user?.role === 'owner';
  const petProfile = isOwner ? partnerProfile : user;

  const activeSpecies = user?.role === 'pet' ? user?.pet_species : (partnerProfile?.pet_species || 'puppy');

  const currentPoints = petProfile?.points_balance || 0;
  const xp = petProfile?.xp || 0;
  const level = petProfile?.level || 1;
  const greenDaysCount = (calendarEntries || []).filter((e) => e.status === 'green').length;
  const pendingProposalsCount = (proposals || []).filter((r) => r.status === 'pending').length;

  const [customPointsInput, setCustomPointsInput] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [praiseType, setPraiseType] = useState('headpat');
  const [praiseMessage, setPraiseMessage] = useState('');
  const [isSendingPraise, setIsSendingPraise] = useState(false);
  const [activeTaskMenuId, setActiveTaskMenuId] = useState(null);

  const handleAdjustPoints = (delta) => {
    setPetPoints(Math.max(0, currentPoints + delta));
  };

  const handleSetCustomPoints = (e) => {
    e.preventDefault();
    const val = parseInt(customPointsInput, 10);
    if (!isNaN(val)) {
      setPetPoints(val);
      setCustomPointsInput('');
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    createDailyTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const handleSendPraise = (e) => {
    e.preventDefault();
    if (!praiseMessage.trim()) return;
    sendPraiseNote(praiseType, praiseMessage.trim());
    setPraiseMessage('');
    setIsSendingPraise(false);
  };

  return (
    <div className="page-container">
      {/* Hero Welcome Card with Mascot Avatar */}
      <div style={{
        background: 'var(--gradient-hero)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '1.5rem',
        color: 'white',
        boxShadow: 'var(--shadow-glow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', zIndex: 1, position: 'relative' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85, fontWeight: 700 }}>
              {isOwner ? 'Master Control' : 'Pet Dashboard'}
            </span>
            <h1 style={{ fontSize: '1.4rem', color: 'white', marginTop: '0.1rem' }}>
              {isOwner 
                ? `Managing ${partnerProfile?.pet_nickname || partnerProfile?.username || 'Pet'}` 
                : `${user?.praise_terms || 'Good girl!'} ${user?.pet_nickname || user?.username}`}
            </h1>
            <p style={{ fontSize: '0.825rem', opacity: 0.9, marginTop: '0.25rem' }}>
              {isOwner 
                ? `Paired with ${partnerProfile?.pet_nickname || partnerProfile?.username || 'No Pet'} (${partnerProfile?.uid || ''})` 
                : `Paired with ${partnerProfile?.username || 'Owner'}`}
            </p>

            <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}>
                Mood: {petProfile?.mood || 'Happy'}
              </span>
              {pairing?.weekend_multiplier > 1.0 && (
                <span className="badge" style={{ backgroundColor: 'rgba(245,158,11,0.3)', color: '#fef3c7', backdropFilter: 'blur(4px)', border: '1px solid rgba(245,158,11,0.5)' }}>
                  ⚡ {pairing.weekend_multiplier}x Weekend Points
                </span>
              )}
            </div>
          </div>

          <MascotAvatar profile={petProfile} isEditable={!isOwner} />
        </div>
      </div>

      {/* Level & XP Progress Bar */}
      {user?.show_xp_bar !== false && (
        <XPProgressBar xp={xp} level={level} />
      )}

      {/* Gamification Stats Summary Grid (Species Currency Wrapper) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1.125rem' }}>
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-surface-hover)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}>
            <Trophy size={24} color="var(--color-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block' }}>Balance</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary-dark)', letterSpacing: '-0.02em' }}>
              {formatCurrency(currentPoints, activeSpecies, true, pairing)}
            </strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1.125rem' }}>
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--border-radius)',
            backgroundColor: 'var(--color-green-light)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center'
          }}>
            <Flame size={24} color="var(--color-green)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, display: 'block' }}>Green Days</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-green)', letterSpacing: '-0.02em' }}>
              {greenDaysCount} days
            </strong>
          </div>
        </div>
      </div>

      {/* Calendar Color Legend Card */}
      <div className="card" style={{ padding: '1rem 1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '0.95rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarIcon size={16} color="var(--color-primary)" /> Calendar Color Legend
          </h3>
          <span style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Daily Point Values
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-green-light)', border: '1px solid var(--color-green)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#065f46', marginBottom: '0.15rem' }}>🟢 Green</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#047857' }}>
              +{pairing?.point_value_green ?? 1} {getCurrencyInfo(activeSpecies, pairing).icon}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, color: '#065f46' }}>+50 XP</div>
          </div>

          <div style={{ padding: '0.5rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-yellow-light)', border: '1px solid var(--color-yellow)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.15rem' }}>🟡 Yellow</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b45309' }}>
              +{pairing?.point_value_yellow ?? 0} {getCurrencyInfo(activeSpecies, pairing).icon}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, color: '#92400e' }}>Neutral</div>
          </div>

          <div style={{ padding: '0.5rem', borderRadius: 'var(--border-radius)', backgroundColor: 'var(--color-red-light)', border: '1px solid var(--color-red)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.15rem' }}>🔴 Red</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b91c1c' }}>
              +{pairing?.point_value_red ?? 0} {getCurrencyInfo(activeSpecies, pairing).icon}
            </div>
            <div style={{ fontSize: '0.65rem', opacity: 0.8, color: '#991b1b' }}>Rough</div>
          </div>
        </div>
      </div>

      {/* OWNER: Praise Transmitter Card */}
      {isOwner && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={20} color="var(--color-accent)" /> Send Praise or Head Pat
            </h2>
            <button 
              onClick={() => setIsSendingPraise(!isSendingPraise)} 
              className="btn-secondary"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            >
              {isSendingPraise ? 'Cancel' : 'Send Praise'}
            </button>
          </div>

          {isSendingPraise && (
            <form onSubmit={handleSendPraise} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { type: 'headpat', label: 'Pat Head 🐾' },
                  { type: 'treat', label: 'Send Treat 🍖' },
                  { type: 'note', label: 'Love Note 💌' }
                ].map((t) => (
                  <button
                    key={t.type}
                    type="button"
                    onClick={() => setPraiseType(t.type)}
                    style={{
                      flex: 1,
                      fontSize: '0.75rem',
                      padding: '0.4rem',
                      borderRadius: 'var(--border-radius)',
                      border: praiseType === t.type ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                      backgroundColor: praiseType === t.type ? 'var(--color-surface-hover)' : 'var(--color-surface)',
                      fontWeight: praiseType === t.type ? 700 : 500
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                className="input-field"
                placeholder="Write a sweet note (e.g. Good girl! Proud of you 💖)"
                value={praiseMessage}
                onChange={(e) => setPraiseMessage(e.target.value)}
                required
              />

              <button type="submit" className="btn-primary" style={{ padding: '0.65rem' }}>
                <Send size={15} /> Deliver to Pet
              </button>
            </form>
          )}
        </div>
      )}

      {/* DAILY TASKS (+25 XP) */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} color="var(--color-primary)" /> Daily Tasks
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Complete daily tasks for <b>+25 XP</b> each! Auto-updates day status 🟢🟡🔴
            </span>
          </div>
          {isOwner && (
            <span className="badge" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary-dark)' }}>
              {(dailyTasks || []).length} Tasks
            </span>
          )}
        </div>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {(dailyTasks || []).length === 0 ? (
            <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No daily tasks set for today.
            </p>
          ) : (
            (dailyTasks || []).map((task) => (
              <div
                key={task.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: task.is_completed ? 'var(--color-green-light)' : 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                <div 
                  onClick={() => !isOwner && toggleDailyTask(task.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flex: 1, cursor: isOwner ? 'default' : 'pointer' }}
                >
                  {task.is_completed ? (
                    <CheckCircle2 size={20} color="var(--color-green)" />
                  ) : (
                    <Circle size={20} color="var(--color-text-muted)" />
                  )}
                  <span style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    textDecoration: task.is_completed ? 'line-through' : 'none',
                    color: task.is_completed ? 'var(--color-green)' : 'var(--color-text-main)'
                  }}>
                    {task.title}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                    +{task.xp_reward || 25} XP
                  </span>

                  {/* Owner 3-Dots Menu */}
                  {isOwner && (
                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setActiveTaskMenuId(activeTaskMenuId === task.id ? null : task.id)}
                        style={{ padding: '0.2rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeTaskMenuId === task.id && (
                        <div style={{
                          position: 'absolute', right: 0, top: '100%', zIndex: 50, marginTop: '4px',
                          backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)',
                          borderRadius: 'var(--border-radius)', boxShadow: 'var(--shadow-md)',
                          padding: '0.35rem', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '0.2rem'
                        }}>
                          <button
                            onClick={() => {
                              overrideDailyTask(task.id, !task.is_completed);
                              setActiveTaskMenuId(null);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.4rem',
                              padding: '0.45rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
                              borderRadius: '6px', textAlign: 'left',
                              color: task.is_completed ? 'var(--color-yellow)' : 'var(--color-green)',
                              backgroundColor: 'var(--color-surface-hover)'
                            }}
                          >
                            {task.is_completed ? <RotateCcw size={14} /> : <Check size={14} />}
                            {task.is_completed ? 'Mark Incomplete' : 'Override Checkoff'}
                          </button>

                          <button
                            onClick={() => {
                              deleteDailyTask(task.id);
                              setActiveTaskMenuId(null);
                            }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.4rem',
                              padding: '0.45rem 0.6rem', fontSize: '0.78rem', fontWeight: 600,
                              borderRadius: '6px', textAlign: 'left',
                              color: 'var(--color-red)',
                              backgroundColor: 'var(--color-surface-hover)'
                            }}
                          >
                            <Trash2 size={14} /> Delete Task
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* OWNER: Add Routine Form */}
        {isOwner && (
          <form onSubmit={handleCreateTask} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Add new routine task (e.g. Drink 2L Water)"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-secondary" style={{ width: 'auto', padding: '0.75rem 1rem' }}>
              <Plus size={16} /> Add Task
            </button>
          </form>
        )}
      </div>

      {/* OWNER: Points Management Control Panel */}
      {isOwner && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} color="var(--color-primary)" /> Points Adjuster
            </h2>
            <span className="badge" style={{ backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-primary-dark)' }}>
              {getCurrencyInfo(activeSpecies, pairing).name}
            </span>
          </div>

          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
            Directly adjust or set <b>{partnerProfile?.username || 'Pet'}</b>'s available {getCurrencyInfo(activeSpecies, pairing).name.toLowerCase()} balance.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => handleAdjustPoints(-1)} className="btn-secondary" style={{ flex: 1, padding: '0.65rem' }}>
              <Minus size={15} /> -1 {getCurrencyInfo(activeSpecies, pairing).icon}
            </button>
            <button onClick={() => handleAdjustPoints(1)} className="btn-primary" style={{ flex: 1, padding: '0.65rem' }}>
              <Plus size={15} /> +1 {getCurrencyInfo(activeSpecies, pairing).icon}
            </button>
            <button onClick={() => handleAdjustPoints(5)} className="btn-primary" style={{ flex: 1, padding: '0.65rem', backgroundColor: 'var(--color-green)' }}>
              <Plus size={15} /> +5 {getCurrencyInfo(activeSpecies, pairing).icon}
            </button>
          </div>

          <form onSubmit={handleSetCustomPoints} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              type="number"
              className="input-field"
              placeholder={`Set total ${getCurrencyInfo(activeSpecies, pairing).name.toLowerCase()}`}
              value={customPointsInput}
              onChange={(e) => setCustomPointsInput(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn-secondary" style={{ width: 'auto', padding: '0.75rem 1.25rem' }}>
              Set Total
            </button>
          </form>
        </div>
      )}

      {/* Navigation Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
        <button
          onClick={() => setActiveTab('schedule')}
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid var(--color-border)'
          }}
        >
          <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)', width: 'fit-content' }}>
            <CalendarIcon size={22} color="var(--color-primary)" />
          </div>
          <div>
            <strong style={{ fontSize: '1rem', display: 'block' }}>Daily Schedule</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {isOwner ? 'Log status entries' : 'Track green behavior'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            textAlign: 'left',
            cursor: 'pointer',
            border: '1px solid var(--color-border)',
            position: 'relative'
          }}
        >
          <div style={{ padding: '0.6rem', borderRadius: '12px', backgroundColor: 'var(--color-surface-hover)', width: 'fit-content' }}>
            <Gift size={22} color="var(--color-accent)" />
          </div>
          <div>
            <strong style={{ fontSize: '1rem', display: 'block' }}>Reward Store</strong>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {isOwner ? `${(rewardItems || []).length} items catalog` : 'Redeem earned points'}
            </span>
          </div>
          {pendingProposalsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              backgroundColor: 'var(--color-red)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--border-radius-full)'
            }}>
              {pendingProposalsCount} new
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
