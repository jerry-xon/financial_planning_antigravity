import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';

const SummaryProfile = () => {
    const questions = [
        {
            id: 'q1',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What is your name?</h3>
                    <input type="text" className="form-input" placeholder="e.g. John Doe" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        },
        {
            id: 'q2',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>When do you plan to retire?</h3>
                    <input type="number" className="form-input" placeholder="Expected Retirement Age" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        }
    ];

    return <ProgressiveQuestionLayout currentStepId="profile" stepName="Profile" questions={questions} />;
};

export default SummaryProfile;
