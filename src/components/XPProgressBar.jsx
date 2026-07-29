import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../store/useAppStore';
import { UserAvatar } from './UserAvatar';
import { Sparkles, Trophy, ChevronRight, Zap, X, Check, Lock, Info } from 'lucide-react';
import { getXPProgressDetails, getLevelTitle } from '../utils/xpUtils';

export const XPProgressBar = ({ xp = 0, customTitles = null }) => {
  const [showRoadmapModal, setShowRoadmapModal] = useState(false);
  const { user } = useAppStore();

  const details = getXPProgressDetails(xp);
  const currentLevel = details.level;
  const nextLevel = currentLevel + 1;

  const currentTitle = getLevelTitle(currentLevel, customTitles);
  const nextTitle = getLevelTitle(nextLevel, customTitles);

  const roadmapTiers = [
    { minLevel: 1, maxLevel: 1, minXP: 0, maxXP: 99 },
    { minLevel: 2, maxLevel: 3, minXP: 100, maxXP: 449 },
    { minLevel: 4, maxLevel: 6, minXP: 450, maxXP: 999 },
    { minLevel: 7, maxLevel: 9, minXP: 1000, maxXP: 2699 },
    { minLevel: 10, maxLevel: '10+', minXP: 2700, maxXP: null }
  ];

  return (
    <>
      {/* XP Progress Card Container (Clickable) */}
      <div 
        onClick={() => setShowRoadmapModal(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setShowRoadmapModal(true)}
        style={{
          position: 'sticky',
          top: '0.75rem',
          zIndex: 30,
          backgroundColor: 'var(--color-surface)',
          backdropFilter: 'blur(12px)',
          borderRadius: 'var(--border-radius-lg)',
          padding: '1.125rem 1.25rem',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
          maxHeight: '220px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
      >
        {/* Top Header Row: Floating Current Rank -> Next Rank */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          gap: '0.5rem'
        }}>
          {/* Floating Current Progression Rank */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0 }}>
            {user?.avatar_url ? (
              <UserAvatar profile={user} size={30} border={true} />
            ) : (
              <div style={{
                padding: '0.35rem',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'rgba(139, 92, 246, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                flexShrink: 0
              }}>
                <Trophy size={16} color="var(--color-primary)" />
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary-dark)', letterSpacing: '0.04em' }}>
                Current Rank
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Lvl {currentLevel} • <span style={{ fontWeight: 600 }}>{currentTitle}</span>
              </div>
            </div>
          </div>

          {/* Transition Arrow Divider */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.4, flexShrink: 0 }}>
            <ChevronRight size={16} color="var(--color-text-muted)" />
          </div>

          {/* Floating Next Progression Rank Target */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end', minWidth: 0 }}>
            <div style={{ minWidth: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: '#ec4899', letterSpacing: '0.04em' }}>
                Next Rank
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Lvl {nextLevel} • <span style={{ fontWeight: 600, color: 'var(--color-text-muted)' }}>{nextTitle}</span>
              </div>
            </div>
            <div style={{
              padding: '0.35rem',
              borderRadius: 'var(--border-radius)',
              backgroundColor: 'rgba(236, 72, 153, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={16} color="#ec4899" />
            </div>
          </div>
        </div>

        {/* XP Progress Bar Track */}
        <div style={{ position: 'relative' }}>
          <div style={{
            height: '14px',
            width: '100%',
            backgroundColor: 'var(--color-surface-hover)',
            borderRadius: 'var(--border-radius-full)',
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid var(--color-border)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)'
          }}>
            <div style={{
              height: '100%',
              width: `${details.progressPercent}%`,
              backgroundImage: 'var(--gradient-hero)',
              borderRadius: 'var(--border-radius-full)',
              transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.45)'
            }} />
          </div>
        </div>

        {/* Footer Info Row: Exact Progress & XP Remaining */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.775rem',
          fontWeight: 700
        }}>
          <span style={{ color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
            <Zap size={13} color="var(--color-primary)" />
            {details.xpInCurrentLevel} / {details.xpNeededForNextLevel} XP ({details.progressPercent}%)
          </span>

          <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
            Need <strong style={{ color: 'var(--color-primary-dark)' }}>+{details.xpRemainingToLevelUp} XP</strong> for Lvl {nextLevel}
            <Info size={12} style={{ opacity: 0.65, marginLeft: '0.15rem' }} />
          </span>
        </div>
      </div>

      {/* ── PROGRESSION ROADMAP POPUP MODAL (PORTAL TO BODY) ───────── */}
      {showRoadmapModal && createPortal(
        <div 
          onClick={() => setShowRoadmapModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--border-radius-lg)',
              width: '100%',
              maxWidth: '460px',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-glow)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trophy size={20} color="var(--color-primary)" />
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                    Progression Roadmap
                  </h2>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                  Complete daily tasks to earn XP and unlock higher rank titles!
                </p>
              </div>
              <button 
                onClick={() => setShowRoadmapModal(false)}
                style={{
                  backgroundColor: 'var(--color-surface-hover)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  cursor: 'pointer',
                  color: 'var(--color-text-muted)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Status Overview */}
            <div style={{
              background: 'var(--gradient-hero)',
              borderRadius: 'var(--border-radius)',
              padding: '1rem 1.125rem',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.85, fontWeight: 700, letterSpacing: '0.04em' }}>
                  Your Current Level & Rank
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.1rem' }}>
                  Level {currentLevel} • {currentTitle}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.15rem' }}>
                  Total Cumulative XP: <strong>{xp} XP</strong>
                </div>
              </div>
              <Sparkles size={28} color="#ffffff" style={{ opacity: 0.9 }} />
            </div>

            {/* Roadmap Timeline Tiers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roadmapTiers.map((tier) => {
                const title = getLevelTitle(tier.minLevel, customTitles);
                const isCurrentTier = (
                  tier.maxLevel === '10+' 
                    ? currentLevel >= 10 
                    : (currentLevel >= tier.minLevel && currentLevel <= tier.maxLevel)
                );
                const isUnlocked = currentLevel >= tier.minLevel;

                const levelText = tier.maxLevel === '10+'
                  ? 'Level 10+'
                  : tier.minLevel === tier.maxLevel
                    ? `Level ${tier.minLevel}`
                    : `Level ${tier.minLevel}–${tier.maxLevel}`;

                return (
                  <div 
                    key={tier.minLevel}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: isCurrentTier 
                        ? 'rgba(139, 92, 246, 0.12)' 
                        : isUnlocked 
                          ? 'var(--color-surface-hover)' 
                          : 'var(--color-surface)',
                      border: isCurrentTier 
                        ? '2px solid var(--color-primary)' 
                        : '1px solid var(--color-border)',
                      position: 'relative'
                    }}
                  >
                    {/* Status Icon (Centered) */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isCurrentTier 
                        ? 'var(--color-primary)' 
                        : isUnlocked 
                          ? 'var(--color-green-light)' 
                          : 'var(--color-surface-hover)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      color: isCurrentTier 
                        ? 'white' 
                        : isUnlocked 
                          ? 'var(--color-green)' 
                          : 'var(--color-text-muted)'
                    }}>
                      {isUnlocked ? <Check size={18} strokeWidth={2.8} /> : <Lock size={16} />}
                    </div>

                    {/* Tier Info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isCurrentTier ? 'var(--color-primary-dark)' : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {levelText}
                        </span>
                        {isCurrentTier && (
                          <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                            Active Rank
                          </span>
                        )}
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.925rem', color: isUnlocked ? 'var(--color-text-main)' : 'var(--color-text-muted)', marginTop: '0.1rem' }}>
                        {title}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                        {tier.maxXP ? `${tier.minXP} – ${tier.maxXP} XP` : `${tier.minXP}+ XP`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer Close Button */}
            <button 
              onClick={() => setShowRoadmapModal(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.75rem', marginTop: '0.25rem' }}
            >
              Close Roadmap
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
