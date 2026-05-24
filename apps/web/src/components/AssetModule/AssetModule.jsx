import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import AssetInput from './AssetInput';
import AssetOutput from './AssetOutput';
import { calculateNetWorth } from './AssetLogic';
import { useFinancialPlan } from '../../contexts/FinancialPlanContext';

const AssetModule = ({ onNext, onBack }) => {
    const { assetCategories, setAssetCategories, liabilityCategories, setLiabilityCategories } = useFinancialPlan();
    const [results, setResults] = useState(null);

    const handleCalculate = () => {
        const calculated = calculateNetWorth(assetCategories, liabilityCategories);
        setResults(calculated);
    };

    return (
        <div className="fade-in">
            <div className="card">
                <h1>Asset & Net Worth Analysis</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Track your current financial standing by listing your investments and outstanding liabilities.
                </p>

                <AssetInput
                    assetCategories={assetCategories}
                    setAssetCategories={setAssetCategories}
                    liabilityCategories={liabilityCategories}
                    setLiabilityCategories={setLiabilityCategories}
                    onCalculate={handleCalculate}
                />
            </div>

            {results && (
                <div className="fade-in">
                    <AssetOutput results={results} />
                </div>
            )}

            <div className="sticky-action-bar">
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChevronLeft size={20} />
                    Back to Cash Flow
                </button>
                {results && (
                    <button className="btn btn-primary" onClick={onNext} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                        Proceed to Life Goals
                        <ChevronRight size={20} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default AssetModule;
