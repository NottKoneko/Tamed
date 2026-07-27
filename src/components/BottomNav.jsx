import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Home as HomeIcon, Calendar, Gift, Settings } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: <HomeIcon size={20} /> },
    { id: 'schedule', label: 'Schedule', icon: <Calendar size={20} /> },
    { id: 'rewards', label: 'Rewards', icon: <Gift size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '480px',
      backgroundColor: 'var(--color-surface)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--border-radius-full)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0.5rem 0.75rem',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 900
    }}>
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center',
              gap: '0.2rem',
              color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text-muted)',
              flex: 1,
              padding: '0.45rem 0.25rem',
              borderRadius: 'var(--border-radius-full)',
              backgroundColor: isActive ? 'var(--color-surface-hover)' : 'transparent',
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isActive ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            <div style={{
              color: isActive ? 'var(--color-primary)' : 'inherit',
              transition: 'color 0.2s ease'
            }}>
              {item.icon}
            </div>
            <span style={{ 
              fontSize: '0.7rem', 
              fontWeight: isActive ? 700 : 500,
              letterSpacing: '-0.01em'
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
