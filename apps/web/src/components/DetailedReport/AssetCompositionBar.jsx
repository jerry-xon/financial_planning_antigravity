import React, { useState } from 'react';
import { AlertCircle, Info, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { FUTURE_SURPLUS_AVENUE_ID } from './trackSurplusAllocationLogic';

const ASSET_BUCKET_CONFIG = {
    surplus: {
        label: 'Liquid Surplus Pool',
        color: '#7c3aed',
        softBg: 'rgba(124, 58, 237, 0.12)',
        icon: Sparkles,
        description: 'Unallocated compound surplus earning benchmark 10% returns',
    },
    growth: {
        label: 'Market Growth Assets',
        color: '#2563eb',
        softBg: 'rgba(37, 99, 235, 0.12)',
        icon: TrendingUp,
        description: 'SIP Mutual Funds, Direct Equity & Lumpsum Investments',
    },
    fixed: {
        label: 'Fixed Income & Maturities',
        color: '#059669',
        softBg: 'rgba(5, 150, 105, 0.12)',
        icon: ShieldCheck,
        description: 'Guaranteed FDs, RDs, PPF, NPS & Policy Maturity Payouts',
    },
};

const categorizeAssetId = (id) => {
    if (id === FUTURE_SURPLUS_AVENUE_ID) return 'surplus';
    if (['sip', 'equity', 'lumpsum'].includes(id)) return 'growth';
    return 'fixed';
};

const AssetCompositionBar = ({ composition = [], accent }) => {
    const [activeTooltip, setActiveTooltip] = useState(null);

    const total = composition.reduce((sum, item) => sum + item.amount, 0);

    if (total <= 0) {
        return (
            <div className="ymm-composition-empty" style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: 'var(--bg-subtle, #f8fafc)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #64748b)', fontSize: '0.88rem' }}>
                <AlertCircle size={15} />
                <span>Nothing is funding this goal yet.</span>
            </div>
        );
    }

    // Group composition items by risk bucket
    const bucketTotals = { surplus: 0, growth: 0, fixed: 0 };
    composition.forEach((item) => {
        const cat = categorizeAssetId(item.id);
        bucketTotals[cat] += item.amount;
    });

    return (
        <div className="ymm-composition" style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div className="ymm-composition-title" style={{ fontSize: '0.88rem', fontWeight: 650, color: 'var(--text-main, #0f172a)' }}>
                    Suggested Funding Allocation Architecture
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: accent?.ink || 'var(--primary, #2563eb)' }}>
                    Total: {formatCurrency(total)}
                </div>
            </div>

            {/* Visual Multi-Segment Bar */}
            <div
                className="ymm-composition-bar"
                aria-hidden="true"
                style={{
                    display: 'flex',
                    height: '14px',
                    borderRadius: '7px',
                    overflow: 'hidden',
                    background: 'var(--bg-subtle, #e2e8f0)',
                    position: 'relative',
                }}
            >
                {composition.map((item, index) => {
                    const pct = (item.amount / total) * 100;
                    const cat = categorizeAssetId(item.id);
                    const bucket = ASSET_BUCKET_CONFIG[cat];

                    return (
                        <span
                            key={item.id}
                            className="ymm-composition-seg"
                            style={{
                                width: `${pct}%`,
                                background: item.id === FUTURE_SURPLUS_AVENUE_ID
                                    ? '#7c3aed'
                                    : bucket.color,
                                opacity: Math.max(0.65, 1 - index * 0.08),
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease',
                            }}
                            onMouseEnter={() => setActiveTooltip({ ...item, pct, cat, bucket })}
                            onMouseLeave={() => setActiveTooltip(null)}
                        />
                    );
                })}
            </div>

            {/* Hover Tooltip Overlay */}
            {activeTooltip && (
                <div style={{ padding: '6px 12px', background: 'var(--bg-subtle, #f1f5f9)', borderRadius: '8px', marginTop: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-main, #0f172a)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: activeTooltip.bucket.color }} />
                        <strong>{activeTooltip.label}</strong> ({activeTooltip.bucket.label})
                    </div>
                    <div>
                        <strong>{formatCurrency(activeTooltip.amount)}</strong> <span style={{ color: 'var(--text-muted, #64748b)' }}>({activeTooltip.pct.toFixed(1)}%)</span>
                    </div>
                </div>
            )}

            {/* Standardized Risk Category Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '0.75rem' }}>
                {Object.entries(bucketTotals).map(([catKey, amount]) => {
                    if (amount <= 0) return null;
                    const cfg = ASSET_BUCKET_CONFIG[catKey];
                    const Icon = cfg.icon;
                    const pct = (amount / total) * 100;

                    return (
                        <div
                            key={catKey}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '999px',
                                background: cfg.softBg,
                                color: cfg.color,
                                fontSize: '0.78rem',
                                fontWeight: 600,
                            }}
                            title={cfg.description}
                        >
                            <Icon size={12} />
                            <span>{cfg.label}:</span>
                            <strong>{formatCurrency(amount)} ({pct.toFixed(0)}%)</strong>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AssetCompositionBar;
