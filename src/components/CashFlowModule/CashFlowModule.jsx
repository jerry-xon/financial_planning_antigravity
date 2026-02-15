import React, { useState } from 'react';
import CashFlowInput from './CashFlowInput';
import CashFlowOutput from './CashFlowOutput';
import { calculateCashFlow } from './CashFlowLogic';

const CashFlowModule = ({ income, setIncome, expenseCategories, setExpenseCategories, onNext, onBack }) => {
    const [results, setResults] = useState(null);

    const handleCalculate = () => {
        const calculated = calculateCashFlow(income, expenseCategories);
        setResults(calculated);
    };

    return (
        <div className="fade-in" style={{ marginTop: '2rem' }}>
            <div className="card">
                <h1>Monthly Cash Flow Analysis (INR)</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    Evaluate your family's savings potential by comparing various income streams and categorized expenses.
                </p>

                <CashFlowInput
                    income={income}
                    setIncome={setIncome}
                    expenseCategories={expenseCategories}
                    setExpenseCategories={setExpenseCategories}
                    onCalculate={handleCalculate}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.8rem 2rem' }}>
                    Back to Profile
                </button>
            </div>

            {results && (
                <div className="fade-in">
                    <CashFlowOutput results={results} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '4rem' }}>
                        <button className="btn btn-primary" onClick={onNext} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                            Proceed to Assets
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashFlowModule;
