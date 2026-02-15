import React from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const ContingencyOutput = ({ results }) => {
    if (!results) return null;

    return (
        <div className="contingency-output fade-in" style={{ marginTop: '2rem' }}>
            <div className="card" style={{ borderTop: `5px solid ${results.isHealthy ? 'var(--accent)' : 'var(--primary)'}` }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Info color="var(--primary)" /> Contingency Fund Analysis
                </h2>

                <div className="grid">
                    <div className="stat-box">
                        <label>Monthly Needs (Exp + EMIs)</label>
                        <strong>{formatCurrency(results.monthlyTotal)}</strong>
                    </div>
                    <div className="stat-box">
                        <label>Buffer Period</label>
                        <strong>{results.contingencyPeriod} Months</strong>
                    </div>
                    <div className="stat-box" style={{ background: 'var(--bg-main)' }}>
                        <label>Ideal Emergency Buffer</label>
                        <strong style={{ fontSize: '1.4rem', color: 'var(--primary)' }}>{formatCurrency(results.idealFundsRequired)}</strong>
                    </div>
                </div>

                <div className="comparison-card" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span>Available Emergency Funds</span>
                        <strong>{formatCurrency(results.availableFunds)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <span>{results.isHealthy ? 'Surplus Amount' : 'Net Shortfall'}</span>
                        <strong style={{ color: results.isHealthy ? 'var(--accent)' : 'var(--primary)' }}>
                            {formatCurrency(Math.abs(results.netShortfall))}
                        </strong>
                    </div>
                </div>

                <div className="suggestion-box" style={{
                    marginTop: '2rem',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    background: results.isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    display: 'flex',
                    gap: '12px'
                }}>
                    {results.isHealthy ? <CheckCircle color="var(--accent)" /> : <AlertCircle color="var(--primary)" />}
                    <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Recommendation:</strong>
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>{results.suggestion}</p>
                    </div>
                </div>
            </div>

            <style>{`
        .stat-box { padding: 1.25rem; border: 1px solid var(--border); border-radius: 8px; text-align: center; }
        .stat-box label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; }
        .stat-box strong { font-size: 1.1rem; }
      `}</style>
        </div>
    );
};

export default ContingencyOutput;
