import React from 'react';
import { useNavigate } from 'react-router-dom';

const SummaryLiabilities = () => {
    const navigate = useNavigate();
    return (
        <div className="card fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
            <h2>Summary Flow: Liabilities</h2>
            <p className="text-muted">Placeholder for Liabilities data collection.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/summary-flow/assets')}>Back</button>
                <button className="btn btn-primary" onClick={() => navigate('/summary-flow/goals')}>Next: Goals</button>
            </div>
        </div>
    );
};

export default SummaryLiabilities;
