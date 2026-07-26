import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Gift, CheckCircle2, XCircle, PauseCircle, Clock, Plus } from 'lucide-react';

export const Requests = () => {
  const { user, requests, updateRequestStatus, setIsModalOpen } = useAppStore();

  const isOwner = user?.role === 'owner';

  const statusBadge = {
    pending: <span style={{ backgroundColor: 'var(--color-yellow)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Pending</span>,
    approved: <span style={{ backgroundColor: 'var(--color-green)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Approved</span>,
    denied: <span style={{ backgroundColor: 'var(--color-red)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Denied</span>,
    held: <span style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary-dark)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>On Hold</span>
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>{isOwner ? 'Approval Inbox' : 'Reward Requests'}</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
            {isOwner ? 'Review and manage pet reward requests' : 'Your requested favors and treat history'}
          </p>
        </div>
        {!isOwner && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary" style={{ width: 'auto', padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}>
            <Plus size={16} /> New
          </button>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--color-text-muted)' }}>
          <Gift size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
          <p style={{ fontWeight: 500 }}>No requests submitted yet!</p>
          {!isOwner && (
            <button onClick={() => setIsModalOpen(true)} className="btn-secondary" style={{ marginTop: '1rem', width: 'auto', display: 'inline-flex' }}>
              Create First Request
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {requests.map((req) => (
            <div key={req.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{req.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {req.points_cost} pts
                  </div>
                  {statusBadge[req.status]}
                </div>
              </div>

              {/* Owner Action Buttons for Pending/Held Requests */}
              {isOwner && req.status !== 'approved' && req.status !== 'denied' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => updateRequestStatus(req.id, 'approved')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', backgroundColor: 'var(--color-green)' }}
                  >
                    <CheckCircle2 size={14} /> Approve (-{req.points_cost}pts)
                  </button>
                  <button
                    onClick={() => updateRequestStatus(req.id, 'held')}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto' }}
                  >
                    <PauseCircle size={14} /> Hold
                  </button>
                  <button
                    onClick={() => updateRequestStatus(req.id, 'denied')}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', width: 'auto', color: 'var(--color-red)', borderColor: 'var(--color-red)' }}
                  >
                    <XCircle size={14} /> Deny
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
