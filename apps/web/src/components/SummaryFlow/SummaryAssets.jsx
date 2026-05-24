import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';

const SummaryAssets = () => {
    const questions = [
        {
            id: 'q1',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What is the current value of your investments?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Current running balance of Mutual Funds, Equity, etc.</p>
                    <input type="number" className="form-input" placeholder="₹ Total Value" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        },
        {
            id: 'q2',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>How much liquid cash do you hold?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>In savings accounts or emergency stash.</p>
                    <input type="number" className="form-input" placeholder="₹ Cash Value" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        }
    ];

    return <ProgressiveQuestionLayout currentStepId="assets" stepName="Assets" questions={questions} />;
};

export default SummaryAssets;
