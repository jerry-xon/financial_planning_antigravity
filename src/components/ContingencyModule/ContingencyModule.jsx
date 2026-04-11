import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, ShieldAlert, HelpCircle } from 'lucide-react';
import ContingencyOutput from './ContingencyOutput';
import { calculateContingencyFund } from './ContingencyLogic';
import CurrencyInput from '../common/CurrencyInput';

const ContingencyModule = ({ expenseCategories, contingencyFund, setContingencyFund, onNext, onBack }) => {
    const [results, setResults] = useState(null);

    useEffect(() => {
        const calculated = calculateContingencyFund(expenseCategories, contingencyFund);
        setResults(calculated);
    }, [expenseCategories, contingencyFund]);

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #38bdf8' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '10px', borderRadius: '12px', color: '#38bdf8', display: 'flex' }}>
                        <ShieldAlert size={28} />
                    </div>
                    Contingency Fund Planning (Module 7)
                </h1>
                <p className="text-muted" style={{ marginBottom: '2rem', fontSize: '1.05rem' }}>
                    A financial cushion to protect your family from unforeseen circumstances. We recommend maintaining at least 6 months of expenses + EMIs.
                </p>

                <div className="input-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem', fontWeight: 500 }}>
                        Total Funds Currently Available for Emergency (₹)
                        <span className="tooltip-wrapper" data-tooltip="Highly liquid cash available precisely for sudden emergencies (e.g., Savings, short FDs).">
                            <HelpCircle size={16} color="var(--text-muted)" />
                        </span>
                    </label>
                    <CurrencyInput
                        name="contingencyFund"
                        placeholder="e.g. 5,00,000"
                        value={contingencyFund}
                        onChange={(e) => setContingencyFund(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 2.8rem', // Top Right Bottom Left (left leaves room for ₹ icon)
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

            <div className="sticky-action-bar">
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChevronLeft size={20} />
                    Back to Gap Analysis
                </button>
                <button className="btn btn-primary" onClick={onNext} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                    Generate Financial Overview
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default ContingencyModule;
