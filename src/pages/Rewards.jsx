import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { formatCurrency, getCurrencyInfo } from '../utils/currency';
import { PinModal } from '../components/PinModal';
import { Gift, Plus, Trash2, CheckCircle2, XCircle, Clock, Sparkles, Send, Tag, ShoppingBag, History, Lock } from 'lucide-react';

export const Rewards = () => {
  const { 
    user, 
    pairing,
    partnerProfile,
    proposals,
    rewardItems, 
    redemptions, 
    createRewardItem, 
    deleteRewardItem, 
    submitRewardProposal,
    redeemStoreItem,
    processProposal,
    processRedemption,
    showToast,
    verifyPin,
    setActiveTab
  } = useAppStore();

  const isOwner = user?.role === 'owner';
  const activeSpecies = user?.role === 'pet' ? user?.pet_species : (partnerProfile?.pet_species || 'puppy');
  const petPoints = user?.points_balance || partnerProfile?.points_balance || 0;

  // PIN modal state
  const [pinAction, setPinAction] = useState(null); // { type, payload }

  // Pet proposal form state
  const [isProposing, setIsProposing] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');

  // Owner form state
  const [isCreatingStoreItem, setIsCreatingStoreItem] = useState(false);
  const [storeItemName, setStoreItemName] = useState('');
  const [storeItemDesc, setStoreItemDesc] = useState('');
  const [storeItemPoints, setStoreItemPoints] = useState(1);

  // Owner point cost assignment per proposal ID
  const [assignedCosts, setAssignedCosts] = useState({});

  const handleCostChange = (propId, val) => {
    setAssignedCosts((prev) => ({ ...prev, [propId]: val }));
  };

  const pendingProposals = (proposals || []).filter((p) => p.status === 'pending');
  const pendingRedemptions = (redemptions || []).filter((r) => r.status === 'pending');

  const maxProposals = pairing?.max_pending_proposals || 3;

  const handlePetSubmitProposal = (e) => {
    e.preventDefault();
    if (!propTitle.trim()) return;

    if (pendingProposals.length >= maxProposals) {
      showToast(`Proposal limit reached (${maxProposals} max pending). Wait for Owner approval!`, 'warning');
      return;
    }

    submitRewardProposal(propTitle.trim(), propDesc.trim());
    setPropTitle('');
    setPropDesc('');
    setIsProposing(false);
  };

  const handleOwnerCreateStoreItem = (e) => {
    e.preventDefault();
    if (!storeItemName.trim()) return;
    createRewardItem(storeItemName.trim(), storeItemDesc.trim(), parseInt(storeItemPoints, 10));
    setStoreItemName('');
    setStoreItemDesc('');
    setStoreItemPoints(1);
    setIsCreatingStoreItem(false);
  };

  const handleOwnerApproveRedemption = (redemptionId, status) => {
    processRedemption(redemptionId, status);
  };

  const handlePinVerifySuccess = (inputPin) => {
    if (!verifyPin(inputPin)) return false;

    if (pinAction?.type === 'CREATE_ITEM') {
      const { name, desc, points } = pinAction.payload;
      createRewardItem(name, desc, points);
      setStoreItemName('');
      setStoreItemDesc('');
      setStoreItemPoints(1);
      setIsCreatingStoreItem(false);
    } else if (pinAction?.type === 'PROCESS_REDEMPTION') {
      const { id, status } = pinAction.payload;
      processRedemption(id, status);
    }

    setPinAction(null);
    return true;
  };

  const handleOwnerApproveProposal = (prop) => {
    const cost = assignedCosts[prop.id] !== undefined ? assignedCosts[prop.id] : (prop.assigned_points || 1);
    processProposal(prop.id, 'approved', cost);
  };

  const redemptionStatusBadge = {
    pending: <span style={{ backgroundColor: 'var(--color-yellow)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Awaiting Owner Approval</span>,
    approved: <span style={{ backgroundColor: 'var(--color-green)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Approved & Fulfilled 🎉</span>,
    denied: <span style={{ backgroundColor: 'var(--color-red)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Denied (Points Refunded)</span>
  };

  if (!pairing) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-accent)' }}>
            <Gift size={36} color="var(--color-accent)" />
          </div>
          <h2 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Reward Store Locked (Unpaired)</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', maxWidth: '340px', lineHeight: '1.4' }}>
            The Reward Store & Wish Proposals are shared between partners. Connect with your partner to start creating store rewards!
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
      {/* Top Title & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>Reward Hub</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>
            {isOwner ? 'Manage store catalog & process redemptions' : `Available Balance: ${formatCurrency(petPoints, activeSpecies, true, pairing)}`}
          </p>
        </div>

        {/* Action Buttons */}
        {isOwner ? (
          <button 
            onClick={() => setIsCreatingStoreItem(!isCreatingStoreItem)} 
            className="btn-secondary" 
            style={{ width: 'auto', padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} /> {isCreatingStoreItem ? 'Close Form' : 'Add Store Item'}
          </button>
        ) : (
          <button 
            onClick={() => setIsProposing(!isProposing)} 
            className="btn-primary" 
            style={{ width: 'auto', padding: '0.5rem 0.875rem', fontSize: '0.85rem' }}
          >
            <Send size={15} /> {isProposing ? 'Close Form' : 'Propose Reward Idea'}
          </button>
        )}
      </div>

      {/* PET: Propose New Store Reward */}
      {!isOwner && isProposing && (
        <form onSubmit={handlePetSubmitProposal} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Gift size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.1rem' }}>Propose Reward Idea for Store</h2>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Suggest a new reward! Once your Owner approves it, it will be added to the Reward Store so you can redeem it with your {getCurrencyInfo(activeSpecies, pairing).name.toLowerCase()}.
          </p>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Reward Name / Favor
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Foot massage & back scratch"
              value={propTitle}
              onChange={(e) => setPropTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Description / Details
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="e.g. 20 minute relaxing scratch session after dinner while watching TV"
              value={propDesc}
              onChange={(e) => setPropDesc(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn-primary">
            <Send size={16} /> Send Proposal to Owner
          </button>
        </form>
      )}

      {/* OWNER: Add Store Item Directly */}
      {isOwner && isCreatingStoreItem && (
        <form onSubmit={handleOwnerCreateStoreItem} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Create Fixed Store Reward</h2>
          
          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Reward Title
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 30m Park Trip / Ice Cream Date"
              value={storeItemName}
              onChange={(e) => setStoreItemName(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Description
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Fun outing to the local park or nature trail"
              value={storeItemDesc}
              onChange={(e) => setStoreItemDesc(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
              Cost: {formatCurrency(storeItemPoints, activeSpecies, true, pairing)}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={storeItemPoints}
              onChange={(e) => setStoreItemPoints(e.target.value)}
              style={{ width: '100%', accentColor: 'var(--color-primary)' }}
            />
          </div>

          <button type="submit" className="btn-primary">
            Save Store Item
          </button>
        </form>
      )}

      {/* OWNER INBOX 1: Pending Redemptions Queue */}
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
            🎁 Pending Redemptions Inbox ({(pendingRedemptions || []).length})
          </h2>
          
          {(pendingRedemptions || []).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No pending point redemption claims.
            </p>
          ) : (
            pendingRedemptions.map((red) => (
              <div key={red.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderLeft: '4px solid var(--color-accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{red.title}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      Spent <b>{formatCurrency(red.points_spent, activeSpecies, true, pairing)}</b> on {new Date(red.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <span style={{ backgroundColor: 'var(--color-yellow)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                    Needs Approval
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    onClick={() => handleOwnerApproveRedemption(red.id, 'approved')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.825rem', backgroundColor: 'var(--color-green)' }}
                  >
                    <CheckCircle2 size={16} /> Approve Redemption
                  </button>
                  <button
                    onClick={() => handleOwnerApproveRedemption(red.id, 'denied')}
                    className="btn-secondary"
                    style={{ flex: 1, padding: '0.55rem', fontSize: '0.825rem', color: 'var(--color-red)', borderColor: 'var(--color-red)' }}
                  >
                    <XCircle size={16} /> Deny & Refund
                  </button>
                </div>
              </div>
            ))
          )}

      {/* Security PIN Verification Modal */}
      <PinModal
        isOpen={Boolean(pinAction)}
        title="Security Verification Required"
        onVerify={handlePinVerifySuccess}
        onClose={() => setPinAction(null)}
      />
        </div>
      )}

      {/* OWNER INBOX 2: Pet Store Proposals */}
      {isOwner && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <h2 style={{ fontSize: '1.15rem' }}>💡 Store Idea Proposals Inbox ({(pendingProposals || []).length})</h2>
          
          {(pendingProposals || []).length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              No pending store idea proposals.
            </p>
          ) : (
            pendingProposals.map((prop) => {
              const currentCost = assignedCosts[prop.id] !== undefined ? assignedCosts[prop.id] : (prop.assigned_points || 1);
              return (
                <div key={prop.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{prop.title}</h3>
                      {prop.description && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.375rem' }}>
                          "{prop.description}"
                        </p>
                      )}
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Clock size={12} /> {new Date(prop.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <span style={{ backgroundColor: 'var(--color-yellow)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      New Proposal
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={16} color="var(--color-primary)" />
                      <label style={{ fontSize: '0.825rem', fontWeight: 600 }}>
                        Set Cost ({getCurrencyInfo(activeSpecies, pairing).name}):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        className="input-field"
                        value={currentCost}
                        onChange={(e) => handleCostChange(prop.id, parseInt(e.target.value, 10) || 0)}
                        style={{ width: '80px', padding: '0.35rem 0.5rem', textAlign: 'center' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOwnerApproveProposal(prop)}
                        className="btn-primary"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: 'var(--color-green)' }}
                      >
                        <CheckCircle2 size={14} /> Approve & Add ({formatCurrency(currentCost, activeSpecies, false, pairing)})
                      </button>
                      <button
                        onClick={() => processProposal(prop.id, 'denied')}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', width: 'auto', color: 'var(--color-red)', borderColor: 'var(--color-red)' }}
                      >
                        <XCircle size={14} /> Deny
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REWARD STORE CATALOG */}
      <div>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={20} color="var(--color-primary)" /> Reward Store Catalog
        </h2>

        {(rewardItems || []).length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
            <Gift size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
            <p>No rewards in the store yet.</p>
            {!isOwner && <p style={{ fontSize: '0.8rem' }}>Propose reward ideas above! Once approved by your Owner, they will appear here to redeem!</p>}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {(rewardItems || []).map((item) => {
              const canAfford = petPoints >= item.point_cost;
              return (
                <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1, paddingRight: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.05rem', marginBottom: '0.25rem' }}>{item.name}</h3>
                    {item.description && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{item.description}</p>
                    )}
                    <span style={{
                      display: 'inline-block',
                      marginTop: '0.375rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-dark)',
                      fontSize: '0.85rem'
                    }}>
                      Cost: {formatCurrency(item.point_cost, activeSpecies, true, pairing)}
                    </span>
                  </div>

                  <div>
                    {isOwner ? (
                      <button
                        onClick={() => deleteRewardItem(item.id)}
                        style={{ padding: '0.5rem', color: 'var(--color-red)' }}
                        title="Remove from store"
                      >
                        <Trash2 size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => redeemStoreItem(item)}
                        disabled={!canAfford}
                        className="btn-primary"
                        style={{
                          width: 'auto',
                          padding: '0.5rem 0.875rem',
                          fontSize: '0.825rem',
                          opacity: canAfford ? 1 : 0.5,
                          cursor: canAfford ? 'pointer' : 'not-allowed'
                        }}
                      >
                        <Sparkles size={14} /> Redeem ({formatCurrency(item.point_cost, activeSpecies, false, pairing)})
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PET: Redemptions History */}
      {!isOwner && (redemptions || []).length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--color-green)" /> My Point Redemptions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {redemptions.map((red) => (
              <div key={red.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem' }}>
                <div>
                  <strong style={{ fontSize: '0.95rem', display: 'block', marginBottom: '0.25rem' }}>{red.title}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Redeemed on {new Date(red.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-red)', display: 'block', marginBottom: '0.25rem' }}>
                    -{formatCurrency(red.points_spent, activeSpecies, true, pairing)}
                  </span>
                  {redemptionStatusBadge[red.status]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
