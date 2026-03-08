import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import InsuranceInput from './InsuranceInput';
import InsuranceOutput from './InsuranceOutput';
import { calculateYearlyInsuranceSummary, getInsuredNamesList } from './InsuranceLogic';

const InsuranceModule = ({ familyMembers, policies, setPolicies, expenseCategories, setExpenseCategories, onNext, onBack, insuranceMode, setInsuranceMode, setCurrentStep }) => {
    const [results, setResults] = useState(null);
    const [showMismatchModal, setShowMismatchModal] = useState(false);
    const [amounts, setAmounts] = useState({ here: 0, cashFlow: 0 });

    const handleCalculate = () => {
        const calculated = calculateYearlyInsuranceSummary(policies);
        setResults(calculated);
    };

    const handleProceed = () => {
        // A. Total premium from this module (converted to Annual)
        const totalAnnualHere = policies.reduce((sum, p) => {
            const premium = parseFloat(p.premium) || 0;
            const freq = p.frequency || 'Annually';
            const multiplier = freq === 'Monthly' ? 12 : freq === 'Quarterly' ? 4 : freq === 'Half-Yearly' ? 2 : 1;
            return sum + (premium * multiplier);
        }, 0);

        // B. Premium from Cash Flow module (converted to Annual)
        const lifeInsData = expenseCategories.insurance?.life || { value: '0', frequency: 'Annual' };
        const val = parseFloat(lifeInsData.value) || 0;
        const freq = lifeInsData.frequency || 'Annual';
        let totalAnnualCashFlow = 0;
        switch (freq) {
            case 'Annual': totalAnnualCashFlow = val; break;
            case 'Half Yearly': totalAnnualCashFlow = val * 2; break;
            case 'Quarterly': totalAnnualCashFlow = val * 4; break;
            case 'Monthly': totalAnnualCashFlow = val * 12; break;
            default: totalAnnualCashFlow = val;
        }

        if (Math.round(totalAnnualHere) !== Math.round(totalAnnualCashFlow)) {
            setAmounts({ here: Math.round(totalAnnualHere), cashFlow: Math.round(totalAnnualCashFlow) });
            setShowMismatchModal(true);
        } else {
            onNext();
        }
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

            {/* Premium Mismatch Modal */}
            {showMismatchModal && createPortal(
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
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="card fade-in" style={{
                        width: '90%',
                        maxWidth: '550px',
                        padding: '2.5rem',
                        textAlign: 'center',
                        background: 'var(--bg-main)',
                        border: '2px solid #ef4444',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                        margin: 'auto',
                        borderRadius: '16px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Premium Mismatch Detected</h3>
                        <p style={{ marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
                            The Premium you entered here is <strong>₹{amounts.here.toLocaleString('en-IN')}</strong> amount and premium in cash flow is <strong>₹{amounts.cashFlow.toLocaleString('en-IN')}</strong> amount. (Annual Figures)
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setCurrentStep(2); window.scrollTo(0, 0); }} style={{ padding: '1rem', background: '#3b82f6', border: 'none', color: 'white', fontWeight: 600, width: '100%' }}>
                                Make correction in Cash flow premium
                            </button>
                            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setShowMismatchModal(false); }} style={{ padding: '1rem', fontWeight: 600, width: '100%' }}>
                                Make correction in this form
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default InsuranceModule;
