import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';

const SummaryGoals = () => {
    const questions = [
        {
            id: 'q1',
            content: (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-card)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>What is your single most important financial goal?</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>E.g. Child's Education, Home Purchase.</p>
                    <input type="text" className="form-input" placeholder="Goal Name" style={{ maxWidth: '300px', margin: '0 auto 1rem auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                    <input type="number" className="form-input" placeholder="Target Amount" style={{ maxWidth: '300px', margin: '0 auto', fontSize: '1.2rem', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
            )
        }
    ];

    return <ProgressiveQuestionLayout currentStepId="goals" stepName="Goals" questions={questions} />;
};

export default SummaryGoals;
