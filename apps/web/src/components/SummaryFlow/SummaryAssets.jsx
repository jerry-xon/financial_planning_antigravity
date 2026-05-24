import React from 'react';
import { useNavigate } from 'react-router-dom';

const SummaryAssets = () => {
    const navigate = useNavigate();
    return (
        <div className="card fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
            <h2>Summary Flow: Assets</h2>
            <p className="text-muted">Placeholder for Assets data collection.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/summary-flow/savings')}>Back</button>
                <button className="btn btn-primary" onClick={() => navigate('/summary-flow/liabilities')}>Next: Liabilities</button>
            </div>
        </div>
    );
};

export default SummaryAssets;
