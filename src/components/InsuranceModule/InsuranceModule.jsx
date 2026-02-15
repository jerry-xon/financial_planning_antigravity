import React, { useState } from 'react';
import InsuranceInput from './InsuranceInput';
import InsuranceOutput from './InsuranceOutput';
import { calculateYearlyInsuranceSummary, getInsuredNamesList } from './InsuranceLogic';

const InsuranceModule = ({ familyMembers, policies, setPolicies, onNext, onBack }) => {
    const [results, setResults] = useState(null);

    const handleCalculate = () => {
        const calculated = calculateYearlyInsuranceSummary(policies);
        setResults(calculated);
    };

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card">
                <h1>Life Insurance Policies (Module 5)</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Record existing life insurance plans for each family member to analyze premium outflows and total coverage.
                </p>

                <InsuranceInput
                    familyMembers={familyMembers}
                    policies={policies}
                    setPolicies={setPolicies}
                    onCalculate={handleCalculate}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.8rem 2rem' }}>
                    Back to Life Goals
                </button>
            </div>

            {results && (
                <div className="fade-in">
                    <InsuranceOutput summary={results} policies={policies} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '5rem' }}>
                        <button className="btn btn-primary" onClick={onNext} style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', fontWeight: 600 }}>
                            Proceed to Protection Gap Analysis
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceModule;
