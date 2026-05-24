import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';

const SummaryLiabilities = () => {
    const questions = [
        {
            id: 'q1',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What are your total outstanding loans?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Home loans, personal loans, etc.</p>
                    <input type="number" className="form-input" placeholder="₹ Total Outstanding" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        },
        {
            id: 'q2',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What is your total monthly EMI burden?</h3>
                    <input type="number" className="form-input" placeholder="₹ Total EMI" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        }
    ];

    return <ProgressiveQuestionLayout currentStepId="liabilities" stepName="Liabilities" questions={questions} />;
};

export default SummaryLiabilities;
