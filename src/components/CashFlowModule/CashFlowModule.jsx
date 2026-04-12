import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import CashFlowInput from './CashFlowInput';
import CashFlowOutput from './CashFlowOutput';
import { calculateCashFlow } from './CashFlowLogic';

const CashFlowModule = ({ familyMembers, income, setIncome, expenseCategories, setExpenseCategories, currentYearLedger, setCurrentYearLedger, cashFlowSubStep, setCashFlowSubStep, planStartMonth, onNext, onBack, setCurrentStep }) => {
    const [results, setResults] = useState(null);

    const handleCalculate = () => {
        const calculated = calculateCashFlow(income, expenseCategories);
        setResults(calculated);
    };

    const handleNextSubStep = () => {
        window.scrollTo(0, 0);
        setCashFlowSubStep(2);
    };

    const handleBackSubStep = () => {
        setResults(null);
        window.scrollTo(0, 0);
        setCashFlowSubStep(1);
    };

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card">
                <h1>Monthly Cash Flow Analysis (INR)</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Evaluate your family's savings potential by comparing various income streams and categorized expenses.
                </p>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
                    <button 
                        onClick={() => { setCashFlowSubStep(1); setResults(null); window.scrollTo(0, 0); }}
                        style={{ 
                            padding: '0.75rem 1.5rem', 
                            background: 'transparent',
                            border: 'none',
                            borderBottom: cashFlowSubStep === 1 ? '3px solid var(--primary)' : '3px solid transparent',
                            color: cashFlowSubStep === 1 ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Income & Lifestyle
                    </button>
                    <button 
                        onClick={() => { setCashFlowSubStep(2); window.scrollTo(0, 0); }}
                        style={{ 
                            padding: '0.75rem 1.5rem', 
                            background: 'transparent',
                            border: 'none',
                            borderBottom: cashFlowSubStep === 2 ? '3px solid var(--primary)' : '3px solid transparent',
                            color: cashFlowSubStep === 2 ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        Commitments & Savings
                    </button>
                </div>

                <CashFlowInput
                    familyMembers={familyMembers}
                    income={income}
                    setIncome={setIncome}
                    expenseCategories={expenseCategories}
                    setExpenseCategories={setExpenseCategories}
                    currentYearLedger={currentYearLedger}
                    setCurrentYearLedger={setCurrentYearLedger}
                    subStep={cashFlowSubStep}
                    planStartMonth={planStartMonth}
                />
            </div>

            {cashFlowSubStep === 1 && (
                <div className="sticky-action-bar">
                    <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ChevronLeft size={20} />
                        Back to Profile
                    </button>
                    <button className="btn btn-primary" onClick={handleNextSubStep} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                        Next: Review Commitments & Savings
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {cashFlowSubStep === 2 && !results && (
                <div className="sticky-action-bar">
                    <button className="btn btn-secondary" onClick={handleBackSubStep} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <ChevronLeft size={20} />
                        Back to Income & Lifestyle
                    </button>
                    <button className="btn btn-primary" onClick={handleCalculate} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                        Calculate Cash Flow & Proceed
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {cashFlowSubStep === 2 && results && (
                <div className="fade-in">
                    <CashFlowOutput results={results} />
                    <div className="sticky-action-bar">
                        <button className="btn btn-secondary" onClick={handleBackSubStep} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <ChevronLeft size={20} />
                            Back to Edits
                        </button>
                        <button className="btn btn-primary" onClick={onNext} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                            Proceed to Assets
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashFlowModule;
