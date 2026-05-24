import React from 'react';
import { useNavigate } from 'react-router-dom';

const SummaryGoals = () => {
    const navigate = useNavigate();
    return (
        <div className="card fade-in" style={{ padding: '2rem', maxWidth: '800px', margin: '4rem auto', textAlign: 'center' }}>
            <h2>Summary Flow: Goals</h2>
            <p className="text-muted">Placeholder for Goals data collection.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => navigate('/summary-flow/liabilities')}>Back</button>
                <button className="btn btn-primary" onClick={() => navigate('/summary-report')}>Generate Summary Report</button>
            </div>
        </div>
    );
};

export default SummaryGoals;
