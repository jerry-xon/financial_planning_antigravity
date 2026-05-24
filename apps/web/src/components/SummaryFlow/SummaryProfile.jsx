import React from 'react';
import { useNavigate } from 'react-router-dom';

const SummaryProfile = () => {
    const navigate = useNavigate();
    return (
        <div className="card fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
            <h2>Summary Flow: Profile</h2>
            <p className="text-muted">Placeholder for Profile data collection.</p>
            <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={() => navigate('/summary-flow/cashflow')}>Next: Cash Flow</button>
            </div>
        </div>
    );
};

export default SummaryProfile;
