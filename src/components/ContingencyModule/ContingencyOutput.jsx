import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { AlertCircle, CheckCircle, Info, TrendingUp, DollarSign, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';

const ContingencyOutput = ({ results }) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setAnimate(true), 100);
        return () => clearTimeout(timer);
    }, [results]);

    if (!results) return null;

    const progressPercentage = Math.min(100, (results.availableFunds / results.idealFundsRequired) * 100) || 0;

    return (
        <div className="contingency-output fade-in" style={{ marginTop: '2.5rem' }}>
            <div 
                className="summary-hero" 
                style={{ 
                    marginBottom: '2.5rem', 
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                    color: 'white', 
                    borderRadius: '16px',
                    padding: '2rem',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{ position: 'absolute', top: '-20%', right: '-5%', opacity: 0.05 }}>
                    <ShieldCheck size={200} />
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.2)', padding: '8px', borderRadius: '50%' }}>
                        <Info size={24} color="#38bdf8" />
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 600 }}>Contingency Fund Analysis</h2>
                </div>

                <div className="grid" style={{ position: 'relative', zIndex: 1, gap: '1.5rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8' }}>
                            <DollarSign size={16} />
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Monthly Needs (Exp + EMIs)</label>
                        </div>
                        <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>{formatCurrency(results.monthlyTotal)}</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#94a3b8' }}>
                            <Clock size={16} />
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Buffer Period</label>
                        </div>
                        <strong style={{ display: 'block', fontSize: '1.5rem', fontWeight: 700 }}>{results.contingencyPeriod} Months</strong>
                    </div>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1.5rem', borderRadius: '12px', backdropFilter: 'blur(10px)', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#38bdf8' }}>
                            <TrendingUp size={16} />
                            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Ideal Emergency Buffer</label>
                        </div>
                        <strong style={{ display: 'block', fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{formatCurrency(results.idealFundsRequired)}</strong>
                    </div>
                </div>
            </div>

            <div 
                className="comparison-card card" 
                style={{ 
                    padding: '2rem', 
                    borderRadius: '16px',
                    border: 'none',
                    background: 'var(--bg-card)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                    marginBottom: '2rem'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Available Funds</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(results.availableFunds)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Target Buffer</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(results.idealFundsRequired)}</div>
                    </div>
                </div>

                <div className="progress-container" style={{ margin: '1rem 0 2rem', height: '16px', background: 'var(--muted)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
                    <div style={{
                        width: animate ? `${progressPercentage}%` : '0%',
                        height: '100%',
                        background: results.isHealthy ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #f59e0b, #d97706)',
                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute', top: 0, left: 0, bottom: 0, right: 0,
                            background: 'linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)',
                            backgroundSize: '1rem 1rem'
                        }} />
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    background: results.isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    border: `1px solid ${results.isHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{results.isHealthy ? 'Surplus Amount' : 'Net Shortfall'}</span>
                    <strong style={{ 
                        fontSize: '1.2rem',
                        color: results.isHealthy ? '#10b981' : '#ef4444' 
                    }}>
                        {formatCurrency(Math.abs(results.netShortfall))}
                    </strong>
                </div>
            </div>

            <div className="suggestion-box" style={{
                padding: '1.5rem',
                borderRadius: '12px',
                background: results.isHealthy ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                border: `1px solid ${results.isHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
            }}>
                <div style={{
                    background: results.isHealthy ? '#10b981' : '#f59e0b',
                    borderRadius: '50%',
                    padding: '8px',
                    color: 'white',
                    display: 'flex',
                    flexShrink: 0,
                    marginTop: '2px'
                }}>
                    {results.isHealthy ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>
                <div>
                    <strong style={{ display: 'block', marginBottom: '0.4rem', color: results.isHealthy ? '#059669' : '#d97706', fontSize: '1.1rem' }}>
                        {results.isHealthy ? 'Healthy Buffer Maintained' : 'Attention Needed'}
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>{results.suggestion}</p>
                </div>
            </div>
        </div>
    );
};

export default ContingencyOutput;
