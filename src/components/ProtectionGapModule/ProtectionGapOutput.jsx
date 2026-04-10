import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { ShieldAlert, ShieldCheck, TrendingDown, Target, User, Users, Info } from 'lucide-react';

const ProtectionGapOutput = ({ results }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animations after mount
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [results]);

    if (!results) return null;

    const renderIndividualGap = (data, title) => {
        if (!data) return null;

        const isSelf = title === "Self";
        const isCovered = !data.isGap;
        const progressPercentage = Math.min(100, (data.coverage / data.need) * 100) || 0;

        return (
            <div 
                className="card member-gap-card" 
                style={{ 
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none', 
                    borderRadius: '16px',
                    background: 'var(--bg-card)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    transform: animate ? 'translateY(0)' : 'translateY(20px)',
                    opacity: animate ? 1 : 0
                }}
            >
                {/* Decorative background accent */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: isCovered ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f43f5e, #e11d48)'
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', padding: '1.5rem 1.5rem 0' }}>
                    <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: isCovered ? 'var(--accent)' : 'var(--destructive)', fontSize: '1.25rem' }}>
                            {isCovered ? <ShieldCheck size={22} fill="currentColor" color="white" /> : <ShieldAlert size={22} fill="currentColor" color="white" />}
                            {title} Protection Analysis
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                            {isSelf ? <User size={16} /> : <Users size={16} />}
                            {data.name || title}
                        </div>
                    </div>
                    <div style={{ 
                        background: isCovered ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)', 
                        color: isCovered ? '#10b981' : '#f43f5e',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {isCovered ? 'Covered' : 'Gap Detected'}
                    </div>
                </div>

                <div className="gap-visualization" style={{ padding: '0 1.5rem' }}>
                    <div className="vis-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '0.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Life Cover</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{formatCurrency(data.coverage)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target (HLV)</div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>{formatCurrency(data.need)}</div>
                        </div>
                    </div>

                    <div className="progress-container" style={{ margin: '0.75rem 0 1.5rem', height: '12px', background: 'var(--muted)', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{
                            width: animate ? `${progressPercentage}%` : '0%',
                            height: '100%',
                            background: isCovered ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #fb7185, #f43f5e)',
                            transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
                            position: 'relative'
                        }}>
                             <div style={{
                                position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
                                background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                                backgroundSize: '1rem 1rem'
                            }} />
                        </div>
                    </div>
                </div>

                <div className="result-insight" style={{
                    margin: '0 1.5rem 1.5rem',
                    padding: '1.25rem',
                    borderRadius: '12px',
                    background: isCovered ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
                    border: `1px solid ${isCovered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                }}>
                    {isCovered ? (
                        <>
                            <div style={{ background: '#10b981', borderRadius: '50%', padding: '6px', color: 'white', marginTop: '2px' }}>
                                <Target size={16} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', color: '#059669', fontSize: '0.95rem' }}>Sufficiently Covered!</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    Your existing life insurance policies meet or exceed the required human life value target.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ background: '#f43f5e', borderRadius: '50%', padding: '6px', color: 'white', marginTop: '2px' }}>
                                <TrendingDown size={16} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px', color: '#e11d48', fontSize: '0.95rem' }}>Coverage Shortfall</h4>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    You have a protection gap of <strong>{formatCurrency(data.gap)}</strong>. Consider securing additional term life insurance to fully protect your family's future lifestyle.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="protection-gap-output fade-in" style={{ marginTop: '2.5rem' }}>
            <div 
                className="summary-hero" 
                style={{ 
                    marginBottom: '2.5rem', 
                    background: 'linear-gradient(135deg, var(--primary) 0%, #1e3a8a 100%)', 
                    color: 'white', 
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.1 }}>
                    <ShieldCheck size={180} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <Info size={24} color="#60a5fa" />
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Household Protection Target</h2>
                </div>

                <div className="grid" style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                        <label style={{ opacity: 0.8, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>Monthly Expenses</label>
                        <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(results.monthlyExpenditure)}</strong>
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>Base for HLV calculation</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                        <label style={{ opacity: 0.8, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>HLV Multiplier</label>
                        <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>{results.multiplier}x</strong>
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', opacity: 0.7 }}>Based on age & dependents</div>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '1.25rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <label style={{ color: '#93c5fd', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Target Coverage Need</label>
                        <strong style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{formatCurrency(results.protectionNeed)}</strong>
                        <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#93c5fd' }}>Recommended Human Life Value</div>
                    </div>
                </div>
            </div>

            <div className="grid" style={{ gap: '2rem' }}>
                {renderIndividualGap(results.self, "Self")}
                {renderIndividualGap(results.spouse, "Spouse")}
            </div>

            <style>{`
                .member-gap-card:hover {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
                    transform: translateY(-4px) !important;
                }
            `}</style>
        </div>
    );
};

export default ProtectionGapOutput;

