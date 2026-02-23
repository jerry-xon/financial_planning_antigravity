import React from 'react';

const CalculatorPlaceholder = ({ name }) => {
    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-card)' }}>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{name} Calculator</h2>
                <div style={{ 
                    display: 'inline-block', 
                    padding: '0.5rem 1.5rem', 
                    background: 'var(--bg-main)', 
                    borderRadius: '20px', 
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem'
                }}>
                    Coming Soon
                </div>
                <p style={{ marginTop: '1.5rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '1.5rem auto 0' }}>
                    We are currently building the logic for this tool. Stay tuned for advanced {name} projections and planning capabilities.
                </p>
            </div>
        </div>
    );
};

export default CalculatorPlaceholder;
