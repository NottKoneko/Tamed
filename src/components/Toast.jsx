import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast = () => {
  const toast = useAppStore((state) => state.toast);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} color="#22c55e" />,
    warning: <AlertCircle size={20} color="#ef4444" />,
    info: <Info size={20} color="var(--color-primary)" />
  };

  return (
    <div style={{
      position: 'fixed',
      top: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2.5rem)',
      maxWidth: '480px',
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-lg)',
      borderRadius: 'var(--border-radius)',
      padding: '0.875rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      zIndex: 1000,
      animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      {icons[toast.type] || <Bell size={20} />}
      <span style={{ fontSize: '0.925rem', fontWeight: 500, color: 'var(--color-text-main)' }}>
        {toast.message}
      </span>
    </div>
  );
};
