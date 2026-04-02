import React, { useState, useEffect } from 'react';
import ProtectionGapOutput from './ProtectionGapOutput';
import FinancialPyramid from './FinancialPyramid';
import { calculateProtectionGap } from './ProtectionGapLogic';

const ProtectionGapModule = ({ 
    familyMembers, 
    expenseCategories, 
    policies, 
    assetCategories,
    calculatorInputs,
    proposedSIPs,
    proposedEquities,
    goals,
    goalMappings,
    onNext, 
    onBack 
}) => {
    const [results, setResults] = useState(null);

    useEffect(() => {
        const calculated = calculateProtectionGap(expenseCategories, policies, familyMembers);
        setResults(calculated);
    }, [expenseCategories, policies, familyMembers]);

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h1>Protection Gap Analysis (Module 6)</h1>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                    We analyze the gap between your Human Life Value (HLV) and your existing life insurance coverage.
                </p>

                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                    <strong>Note:</strong> Multiplier of 200x monthly expenses is used to estimate the capital required to sustain your family's lifestyle in your absence.
                </div>
            </div>

            <FinancialPyramid 
                expenseCategories={expenseCategories}
                policies={policies}
                assetCategories={assetCategories}
                calculatorInputs={calculatorInputs}
                proposedSIPs={proposedSIPs}
                proposedEquities={proposedEquities}
                goals={goals}
                goalMappings={goalMappings}
                protectionGapResults={results}
            />

            <ProtectionGapOutput results={results} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '3rem', marginBottom: '5rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '1rem 3rem' }}>
                    Back to Insurance
                </button>
                <button className="btn btn-primary" onClick={onNext} style={{ padding: '1rem 3rem' }}>
                    Proceed to Contingency Planning
                </button>
            </div>
        </div>
    );
};

export default ProtectionGapModule;
