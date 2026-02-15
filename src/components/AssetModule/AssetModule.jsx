import React, { useState } from 'react';
import AssetInput from './AssetInput';
import AssetOutput from './AssetOutput';
import { calculateNetWorth } from './AssetLogic';

const AssetModule = ({ assetCategories, setAssetCategories, liabilityCategories, setLiabilityCategories, onNext, onBack }) => {
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

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.8rem 2rem' }}>
                    Back to Cash Flow
                </button>
            </div>

            {results && (
                <div className="fade-in">
                    <AssetOutput results={results} />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', marginBottom: '4rem' }}>
                        <button className="btn btn-primary" onClick={onNext} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                            Proceed to Life Goals
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetModule;
