import React from 'react';
import {
    CheckCircle2,
    AlertTriangle,
    AlertCircle,
    TrendingUp,
    ShieldCheck,
    Target,
    PieChart,
} from 'lucide-react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

const ExecutiveKpiDashboard = ({ totals, meta }) => {
    if (!totals || !meta?.hasGoals) return null;

    const {
        totalGoalLiability = 0,
        totalProjectedWealth = 0,
        totalRemainingGap = 0,
        solvencyRatio = 100,
        solvencyStatus,
        fullyFundedCount = 0,
        partiallyFundedCount = 0,
        shortfallCount = 0,
        totalGoalCount = 0,
    } = totals;

    const StatusIcon = solvencyStatus?.tone === 'success'
        ? CheckCircle2
        : solvencyStatus?.tone === 'warning'
            ? AlertTriangle
            : AlertCircle;

    return (
        <div className="card ymm-kpi-dashboard" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-card, #ffffff)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color, #f1f5f9)' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color="var(--primary, #2563eb)" />
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                            Financial Readiness & Plan Solvency
                        </h3>
                    </div>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted, #64748b)' }}>
                        Aggregated projection matching investments against total inflation-adjusted goal liabilities.
                    </p>
                </div>
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 14px',
                        borderRadius: '999px',
                        background: solvencyStatus?.soft || 'rgba(5, 150, 105, 0.12)',
                        color: solvencyStatus?.color || '#059669',
                        fontWeight: 650,
                        fontSize: '0.88rem',
                    }}
                >
                    <StatusIcon size={16} />
                    <span>{solvencyStatus?.label || 'Fully On Track'}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
                {/* Metric 1: Total Liability */}
                <div className="ymm-kpi-card" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #f1f5f9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Total Goal Liability</span>
                        <Target size={16} style={{ color: '#64748b' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(totalGoalLiability)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
                        Inflation-adjusted future cost
                    </div>
                </div>

                {/* Metric 2: Projected Wealth */}
                <div className="ymm-kpi-card" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #f1f5f9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Projected Wealth</span>
                        <TrendingUp size={16} style={{ color: '#059669' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#059669', fontVariantNumeric: 'tabular-nums' }}>
                        {formatCurrency(totalProjectedWealth)}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
                        Allocated from all streams
                    </div>
                </div>

                {/* Metric 3: Solvency Ratio */}
                <div className="ymm-kpi-card" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #f1f5f9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Plan Solvency Ratio</span>
                        <PieChart size={16} style={{ color: solvencyStatus?.color || '#2563eb' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: solvencyStatus?.color || '#059669', fontVariantNumeric: 'tabular-nums' }}>
                        {solvencyRatio}%
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: '#e2e8f0', marginTop: '0.5rem', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${Math.min(100, Math.max(0, solvencyRatio))}%`,
                                height: '100%',
                                background: solvencyStatus?.color || '#059669',
                                transition: 'width 0.4s ease',
                            }}
                        />
                    </div>
                </div>

                {/* Metric 4: Goal Coverage Summary */}
                <div className="ymm-kpi-card" style={{ padding: '1rem', borderRadius: '12px', background: 'var(--bg-subtle, #f8fafc)', border: '1px solid var(--border-color, #f1f5f9)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>Goals Coverage</span>
                        <CheckCircle2 size={16} style={{ color: '#2563eb' }} />
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', fontVariantNumeric: 'tabular-nums' }}>
                        {fullyFundedCount} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted, #64748b)' }}>of {totalGoalCount} Covered</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', marginTop: '0.25rem', display: 'flex', gap: '8px' }}>
                        {partiallyFundedCount > 0 && <span style={{ color: '#b45309' }}>{partiallyFundedCount} Partial</span>}
                        {shortfallCount > 0 && <span style={{ color: '#dc2626' }}>{shortfallCount} Unfunded</span>}
                        {totalRemainingGap <= 0 && <span style={{ color: '#059669' }}>0 Shortfall</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecutiveKpiDashboard;
