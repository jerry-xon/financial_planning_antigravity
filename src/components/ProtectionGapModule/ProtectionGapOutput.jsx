import React from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { ShieldAlert, ShieldCheck, TrendingDown, Target, User, Users } from 'lucide-react';

const ProtectionGapOutput = ({ results }) => {
    if (!results) return null;

    const renderIndividualGap = (data, title) => {
        if (!data) return null;

        const isSelf = title === "Self";

        return (
            <div className="card" style={{ borderLeft: `6px solid ${data.isGap ? 'var(--primary)' : 'var(--accent)'}`, marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: data.isGap ? 'var(--primary)' : 'var(--accent)' }}>
                    {data.isGap ? <ShieldAlert size={20} /> : <ShieldCheck size={20} />}
                    {title} Protection Analysis
                </h3>

                <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {isSelf ? <User size={16} /> : <Users size={16} />}
                    {data.name}
                </div>

                <div className="gap-visualization" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <div className="vis-row">
                        <div className="label-col" style={{ fontSize: '0.85rem' }}>Life Insurance Coverage</div>
                        <div className="value-col" style={{ fontWeight: 600 }}>{formatCurrency(data.coverage)}</div>
                    </div>

                    <div className="progress-container" style={{ margin: '1rem 0', height: '10px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${Math.min(100, (data.coverage / data.need) * 100)}%`,
                            height: '100%',
                            background: data.isGap ? 'var(--primary)' : 'var(--accent)'
                        }} />
                    </div>

                    <div className="vis-row">
                        <div className="label-col" style={{ fontSize: '0.85rem' }}>Protection Needed (HLV)</div>
                        <div className="value-col" style={{ fontWeight: 600 }}>{formatCurrency(data.need)}</div>
                    </div>
                </div>

                <div className="result-insight" style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: data.isGap ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    {data.isGap ? (
                        <>
                            <TrendingDown color="var(--primary)" size={18} />
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                <strong>Gap: {formatCurrency(data.gap)}</strong>. Consider additional term insurance.
                            </p>
                        </>
                    ) : (
                        <>
                            <Target color="var(--accent)" size={18} />
                            <p style={{ margin: 0, fontSize: '0.875rem' }}>
                                <strong>Sufficiently Covered!</strong>
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="protection-gap-output fade-in" style={{ marginTop: '2rem' }}>
            <div className="card" style={{ marginBottom: '2rem', background: 'var(--primary)', color: 'white', padding: '1.5rem' }}>
                <div className="grid">
                    <div>
                        <label style={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Household Expenses</label>
                        <strong style={{ display: 'block', fontSize: '1.4rem', marginTop: '4px' }}>{formatCurrency(results.monthlyExpenditure)}</strong>
                    </div>
                    <div>
                        <label style={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HLV Multiplier</label>
                        <strong style={{ display: 'block', fontSize: '1.4rem', marginTop: '4px' }}>{results.multiplier}x</strong>
                    </div>
                    <div>
                        <label style={{ opacity: 0.8, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Coverage Need</label>
                        <strong style={{ display: 'block', fontSize: '1.4rem', marginTop: '4px' }}>{formatCurrency(results.protectionNeed)}</strong>
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gap: '1.5rem' }}>
                {renderIndividualGap(results.self, "Self")}
                {renderIndividualGap(results.spouse, "Spouse")}
            </div>

            <style>{`
                .vis-row { display: flex; justify-content: space-between; align-items: center; }
                .label-col { color: var(--text-muted); }
            `}</style>
        </div>
    );
};

export default ProtectionGapOutput;
