import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';

const SummarySavings = () => {
    const questions = [
        {
            id: 'q1',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>How much do you invest monthly?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>SIPs, Mutual Funds, Stocks.</p>
                    <input type="number" className="form-input" placeholder="₹ Amount" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        },
        {
            id: 'q2',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Any other monthly savings?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>FDs, RDs, PPF, etc.</p>
                    <input type="number" className="form-input" placeholder="₹ Amount" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        }
    ];

    return <ProgressiveQuestionLayout currentStepId="savings" stepName="Savings" questions={questions} />;
};

export default SummarySavings;
