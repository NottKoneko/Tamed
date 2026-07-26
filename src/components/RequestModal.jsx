import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { X, Gift, Sparkles } from 'lucide-react';

export const RequestModal = () => {
  const { isModalOpen, setIsModalOpen, submitRequest, user } = useAppStore();
  const [title, setTitle] = useState('');
  const [pointsCost, setPointsCost] = useState(1);

  if (!isModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    submitRequest(title.trim(), parseInt(pointsCost, 10));
    setTitle('');
    setPointsCost(1);
    setIsModalOpen(false);
  };

  const presetRewards = [
    { title: '30m Walk / Park Trip 🌳', cost: 2 },
    { title: 'Extra Treat / Favorite Snack 🍖', cost: 1 },
    { title: 'Movie Night Cuddles 🍿', cost: 3 },
    { title: 'Sleep in Late Ticket 🛌', cost: 5 }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      zIndex: 1000,
      padding: '1.5rem'
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '440px',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        position: 'relative'
      }}>
        <button
          onClick={() => setIsModalOpen(false)}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Gift size={24} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.25rem' }}>Request a Reward</h2>
        </div>

        {/* Preset quick buttons */}
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '0.5rem' }}>
            Quick Ideas:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {presetRewards.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTitle(item.title);
                  setPointsCost(item.cost);
                }}
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-surface-hover)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)'
                }}
              >
                {item.title} ({item.cost} pts)
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Reward Title
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Back scratch for 15 mins"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.375rem' }}>
              Points Cost: {pointsCost}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={pointsCost}
              onChange={(e) => setPointsCost(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <span>1 pt</span>
              <span>5 pts</span>
              <span>10 pts</span>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="btn-primary">
              <Sparkles size={18} /> Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
