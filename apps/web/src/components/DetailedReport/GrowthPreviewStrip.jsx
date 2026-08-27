import React from 'react';
import { TrendingUp, Target, Info } from 'lucide-react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import ReportReveal from './ReportReveal';

const GrowthPreviewStrip = ({ growthPreview }) => {
    if (!growthPreview?.hasDraft) return null;

    const hasMarginalImpacts = growthPreview.marginalImpacts && growthPreview.marginalImpacts.length > 0;
    const hasTotalDelta = growthPreview.totalDelta > 0;

    if (hasTotalDelta || hasMarginalImpacts) {
        return (
            <ReportReveal className="pymtw-growth-strip card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 className="pymtw-zone-title" style={{ margin: 0 }}>
                        <Target size={18} />
                        Impact on Next Goals
                    </h3>
                </div>
                <p className="pymtw-zone-sub" style={{ marginBottom: '1.25rem' }}>
                    Direct wealth added to your upcoming milestones by these planned allocations
                </p>

                <div className="pymtw-growth-totals" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {hasMarginalImpacts ? (
                        growthPreview.marginalImpacts.map((impact) => {
                            const yearsText = Math.round(impact.yearsAway) <= 1 ? '1 year' : `${Math.round(impact.yearsAway)} years`;
                            const targetYearText = impact.targetYear || (new Date().getFullYear() + Math.round(impact.yearsAway));
                            const breakdowns = impact.breakdowns || [];

                            return (
                                <div
                                    key={impact.goalId}
                                    style={{
                                        background: 'var(--bg-card-nested, rgba(0, 0, 0, 0.02))',
                                        border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
                                        borderRadius: '10px',
                                        padding: '1.1rem 1.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.85rem',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <div>
                                            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main, #1e293b)', display: 'block' }}>
                                                {impact.goalName}
                                            </span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--accent, #0284c7)', fontWeight: 500 }}>
                                                Target: {targetYearText} (in {yearsText})
                                            </span>
                                        </div>
                                        <strong
                                            className={impact.addedAmount > 0 ? 'pymtw-delta-positive' : undefined}
                                            style={{ fontSize: '1.25rem', whiteSpace: 'nowrap' }}
                                        >
                                            {impact.addedAmount > 0 ? `+${formatCurrency(impact.addedAmount)}` : formatCurrency(impact.addedAmount)}
                                        </strong>
                                    </div>

                                    {breakdowns.length > 0 && (
                                        <div
                                            style={{
                                                fontSize: '0.82rem',
                                                color: 'var(--text-secondary, #475569)',
                                                background: 'var(--bg-subtle, rgba(2, 132, 199, 0.05))',
                                                borderRadius: '6px',
                                                padding: '0.75rem 0.9rem',
                                                borderLeft: '3px solid var(--accent, #0284c7)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '0.4rem',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, color: 'var(--text-main, #0f172a)', marginBottom: '0.15rem' }}>
                                                <Info size={14} style={{ color: 'var(--accent, #0284c7)' }} />
                                                <span>How this is calculated:</span>
                                            </div>
                                            {breakdowns.map((b, idx) => (
                                                <div key={idx} style={{ lineHeight: '1.45' }}>
                                                    • A <strong>{b.label}</strong> of {formatCurrency(b.amount)}{b.inputMode === 'monthly' ? '/mo' : ''} till <strong>{targetYearText}</strong> will add <strong>+{formatCurrency(b.addedAmount)}</strong> for <em>{impact.goalName}</em> (at {b.rate}% p.a.).
                                                </div>
                                            ))}
                                            {breakdowns.length > 1 && (
                                                <div style={{ marginTop: '0.25rem', paddingTop: '0.4rem', borderTop: '1px dashed var(--border-color, rgba(0, 0, 0, 0.12))', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
                                                    Total added for {impact.goalName}: +{formatCurrency(impact.addedAmount)}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ minWidth: '200px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>No upcoming goals. Add goals to see direct impact!</span>
                            <br />
                            <strong className={growthPreview.totalDelta > 0 ? 'pymtw-delta-positive' : undefined} style={{ fontSize: '1.25rem', marginTop: '0.5rem', display: 'inline-block' }}>
                                Overall Portfolio: {growthPreview.totalDelta > 0 ? `+${formatCurrency(growthPreview.totalDelta)}` : formatCurrency(growthPreview.totalDelta)}
                            </strong>
                        </div>
                    )}
                </div>
            </ReportReveal>
        );
    }

    // Fallback for protection-only drafts
    return (
        <ReportReveal className="pymtw-growth-strip card">
            <h3 className="pymtw-zone-title">
                <TrendingUp size={18} />
                Growth preview
            </h3>
            <p className="pymtw-zone-sub">
                Projected corpus till your retirement by {growthPreview.retirementYear}
            </p>

            <div className="pymtw-growth-totals">
                <div>
                    <span>Current corpus</span>
                    <strong>{formatCurrency(growthPreview.baselineTotal)}</strong>
                </div>
                <div>
                    <span>Corpus after Allocation</span>
                    <strong className="pymtw-growth-scenario">{formatCurrency(growthPreview.scenarioTotal)}</strong>
                </div>
                <div>
                    <span>Net Uplift</span>
                    <strong className={growthPreview.totalDelta > 0 ? 'pymtw-delta-positive' : undefined}>
                        {growthPreview.totalDelta > 0
                            ? `+${formatCurrency(growthPreview.totalDelta)}`
                            : formatCurrency(growthPreview.totalDelta || 0)}
                    </strong>
                </div>
            </div>
        </ReportReveal>
    );
};

export default GrowthPreviewStrip;
