import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';

const SummaryCashFlow = () => {
    const questions = [
        {
            id: 'q1',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What is your total monthly household income?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Including your spouse's income if applicable.</p>
                    <input type="number" className="form-input" placeholder="₹ Amount" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        },
        {
            id: 'q2',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What are your total monthly expenses?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>A rough ballpark figure is fine for now.</p>
                    <input type="number" className="form-input" placeholder="₹ Amount" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        }
    ];

    return <ProgressiveQuestionLayout currentStepId="cashflow" stepName="Cash Flow" questions={questions} />;
};

export default SummaryCashFlow;
