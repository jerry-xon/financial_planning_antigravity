import React from 'react';
import ProgressiveQuestionLayout from './ProgressiveQuestionLayout';
import { useFinancialPlan } from '../../contexts/FinancialPlanContext';

const SummarySavings = () => {
    const { expenseCategories, setExpenseCategories } = useFinancialPlan();

    const handleSavingsChange = (field, value) => {
        setExpenseCategories(prev => ({
            ...prev,
            savings: {
                ...prev.savings,
                [field]: value
            }
        }));
    };

    const formatInr = (val) => {
        if (!val || isNaN(val)) return '₹0';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    const narrative = "Good financial health is not just about earning — it's also about what you consistently retain and grow. Now let's map the assets you've already built.";

    const questions = [
        // Q1: Monthly Investments
        {
            id: 'monthly-investments',
            content: (
                <div className="question-container">
                    <p className="question-narrative">
                        Wealth is built through consistent habits.
                    </p>
                    <h2 className="question-title">
                        How much are you currently investing every month towards your future?
                    </h2>
                    <p className="question-helper">
                        SIPs, Mutual Funds, Stocks, Retirement Investments, etc.
                    </p>

                    <div className="question-fields" style={{ maxWidth: '420px', margin: '0 auto' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem', display: 'block' }}>
                            Monthly Investments / SIPs
                        </label>
                        <div className="currency-input-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input
                                type="number"
                                className="conversational-input"
                                placeholder="e.g. 15000"
                                value={expenseCategories.savings.sip || ''}
                                onChange={(e) => handleSavingsChange('sip', e.target.value)}
                            />
                        </div>
                        {expenseCategories.savings.sip && (
                            <div className="currency-display">
                                {formatInr(expenseCategories.savings.sip)} / month
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        // Q2: Other Monthly Savings
        {
            id: 'other-savings',
            content: (
                <div className="question-container">
                    <h2 className="question-title">
                        Apart from investments, do you also keep money aside in safer savings instruments?
                    </h2>
                    <p className="question-helper">
                        FDs, RDs, recurring savings, deposits, etc.
                    </p>

                    <div className="question-fields" style={{ maxWidth: '420px', margin: '0 auto' }}>
                        <label style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.2rem', display: 'block' }}>
                            Other Monthly Savings
                        </label>
                        <div className="currency-input-wrapper">
                            <span className="currency-symbol">₹</span>
                            <input
                                type="number"
                                className="conversational-input"
                                placeholder="e.g. 10000"
                                value={expenseCategories.savings.otherSaving || ''}
                                onChange={(e) => handleSavingsChange('otherSaving', e.target.value)}
                            />
                        </div>
                        {expenseCategories.savings.otherSaving && (
                            <div className="currency-display">
                                {formatInr(expenseCategories.savings.otherSaving)} / month
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    ];

    return (
        <ProgressiveQuestionLayout
            currentStepId="savings"
            questions={questions}
            narrative={narrative}
        />
    );
};

export default SummarySavings;
