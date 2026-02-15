import React, { useState, useEffect } from 'react';
import ContingencyOutput from './ContingencyOutput';
import { calculateContingencyFund } from './ContingencyLogic';

const ContingencyModule = ({ expenseCategories, contingencyFund, setContingencyFund, onNext, onBack }) => {
    const [results, setResults] = useState(null);

    useEffect(() => {
        const calculated = calculateContingencyFund(expenseCategories, contingencyFund);
        setResults(calculated);
    }, [expenseCategories, contingencyFund]);

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card">
                <h1>Contingency Fund Planning (Module 7)</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    A financial cushion to protect your family from unforeseen circumstances. We recommend maintaining at least 6 months of expenses + EMIs.
                </p>

                <div className="input-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Total Funds Currently Available for Emergency (₹)
                    </label>
                    <input
                        type="number"
                        placeholder="e.g. 5,00,000"
                        value={contingencyFund}
                        onChange={(e) => setContingencyFund(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '2px solid var(--border)',
                            background: 'transparent',
                            fontSize: '1.1rem',
                            color: 'var(--text-main)'
                        }}
                    />
                </div>
            </div>

            <ContingencyOutput results={results} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', marginBottom: '5rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '1rem 3rem' }}>
                    Back to Gap Analysis
                </button>
                <button className="btn btn-primary" onClick={onNext} style={{ padding: '1rem 3rem' }}>
                    Generate Financial Overview
                </button>
            </div>
        </div>
    );
};

export default ContingencyModule;
