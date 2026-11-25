import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import InsuranceInput from '../../../../apps/web/src/components/InsuranceModule/InsuranceInput';

export default function B2BLifePolicyDetailsModal({
  isOpen,
  onClose,
  targetMember,
  policies,
  setPolicies,
}) {
  if (!isOpen || !targetMember) return null;

  const memberName = targetMember.name || targetMember.relation;
  const relationLabel = targetMember.relation ? ` (${targetMember.relation})` : '';

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1.5rem',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="card fade-in"
        style={{
          width: '100%',
          maxWidth: '960px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '1.5rem',
          background: 'var(--bg-main, #ffffff)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--primary, #0f766e)', fontSize: '1.25rem' }}>
              Life insurance policy details
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted, #64748b)' }}>
              Insured Member: <strong style={{ color: '#0f172a' }}>{memberName}{relationLabel}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.25rem',
            }}
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {/* Pass ONLY the target member so only their policy forms appear */}
        <InsuranceInput
          familyMembers={[targetMember]}
          policies={policies}
          setPolicies={setPolicies}
          isProposed={false}
        />

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
