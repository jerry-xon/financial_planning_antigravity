import React, { useState } from 'react';
import InsuranceInput from './InsuranceInput';
import InsuranceOutput from './InsuranceOutput';
import { calculateYearlyInsuranceSummary, getInsuredNamesList } from './InsuranceLogic';

const InsuranceModule = ({ familyMembers, policies, setPolicies, expenseCategories, setExpenseCategories, onNext, onBack }) => {
    const [results, setResults] = useState(null);
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [pendingMonthlyPremium, setPendingMonthlyPremium] = useState(0);

    const handleCalculate = () => {
        const calculated = calculateYearlyInsuranceSummary(policies);
        setResults(calculated);
    };

    const handleProceed = () => {
        // Source of Truth calculation from policies
        const totalAnnualPremium = policies.reduce((sum, p) => sum + (parseFloat(p.premium) || 0), 0);
        const insuranceMonthly = Math.round(totalAnnualPremium / 12);
        
        // Current figure in Cash Flow
        const insuranceData = expenseCategories.insurance?.life || { value: '0', frequency: 'Monthly' };
        let cashFlowMonthly = 0;
        
        const val = parseFloat(insuranceData.value) || 0;
        switch (insuranceData.frequency) {
            case 'Annual': cashFlowMonthly = val / 12; break;
            case 'Half Yearly': cashFlowMonthly = val / 6; break;
            case 'Quarterly': cashFlowMonthly = val / 3; break;
            case 'Monthly': cashFlowMonthly = val; break;
            default: cashFlowMonthly = val;
        }
        
        cashFlowMonthly = Math.round(cashFlowMonthly);

        if (insuranceMonthly !== cashFlowMonthly) {
            setPendingMonthlyPremium(insuranceMonthly);
            setShowSyncModal(true);
        } else {
            onNext();
        }
    };

    const handleSyncAgree = () => {
        setExpenseCategories(prev => ({
            ...prev,
            insurance: {
                ...prev.insurance,
                life: {
                    value: pendingMonthlyPremium.toString(),
                    frequency: 'Monthly'
                }
            }
        }));
        setShowSyncModal(false);
        onNext();
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="fade-in">
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
                            <button className="btn btn-primary" onClick={handleProceed} style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', fontWeight: 600 }}>
                                Proceed to Protection Gap Analysis
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sync Verification Modal - Now correctly fixed to viewport because root parent has no transform */}
            {showSyncModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    backdropFilter: 'blur(10px)'
                }}>
                    <div className="card fade-in" style={{
                        width: '90%',
                        maxWidth: '500px',
                        padding: '2.5rem',
                        textAlign: 'center',
                        background: 'var(--bg-main)',
                        border: '2px solid var(--primary)',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                        margin: 'auto'
                    }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1.5rem', fontSize: '1.6rem' }}>Premium Sync Required</h3>
                        <p style={{ marginBottom: '2.5rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
                            Your Life Insurance premium in **Cash Flow** does not match your current policies. 
                            Based on your latest details, the correct Monthly Premium is:
                            <strong style={{ 
                                color: 'var(--accent)', 
                                fontSize: '2rem', 
                                display: 'block', 
                                margin: '1.5rem 0',
                                padding: '1.2rem',
                                background: 'var(--bg-card)',
                                borderRadius: '12px',
                                border: '1px solid var(--primary)',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                ₹{pendingMonthlyPremium.toLocaleString('en-IN')}
                            </strong>
                            Click below to synchronize and maintain an accurate financial plan.
                        </p>
                        <button className="btn btn-primary" onClick={handleSyncAgree} style={{ padding: '1.2rem 3rem', width: '100%', fontSize: '1.2rem', fontWeight: 700 }}>
                            I Agree & Synchronize
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsuranceModule;
