
const AssetInput = ({ assetCategories, setAssetCategories, liabilityCategories, setLiabilityCategories, onCalculate }) => {
    // Safely access nested properties with defaults
    const safeAssetValue = (category, item) => {
        return assetCategories?.[category]?.[item] ?? '';
    };

    const safeLiabilityValue = (category, item) => {
        return liabilityCategories?.[category]?.[item] ?? '';
    };

    const handleAssetChange = (category, item, value) => {
        setAssetCategories(prev => ({
            ...prev,
            [category]: { ...prev[category], [item]: value }
        }));
    };

    const handleLiabilityChange = (category, item, value) => {
        setLiabilityCategories(prev => ({
            ...prev,
            [category]: { ...prev[category], [item]: value }
        }));
    };

    return (
        <div className="asset-input">
            <div className="section-header">
                <h2 style={{ color: 'var(--accent)' }}>Assets (Current Value ₹)</h2>
                <p className="text-muted">Enter the current market value of all your holdings.</p>
            </div>

            <div className="grid">
                <div className="card" style={{ background: 'var(--bg-main)' }}>
                    <h4>Equity & Mutual Funds</h4>
                    <div className="input-group">
                        <label>Direct Stocks</label>
                        <input type="number" value={safeAssetValue('equity', 'stocks')} onChange={(e) => handleAssetChange('equity', 'stocks', e.target.value)} placeholder="0" />
                    </div>
                    <div className="input-group">
                        <label>Equity Mutual Funds</label>
                        <input type="number" value={safeAssetValue('equity', 'mfEquity')} onChange={(e) => handleAssetChange('equity', 'mfEquity', e.target.value)} placeholder="0" />
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--bg-main)' }}>
                    <h4>Fixed Income / Debt</h4>
                    <div className="input-group">
                        <label>PPF / EPF</label>
                        <input type="number" value={safeAssetValue('debt', 'ppf')} onChange={(e) => handleAssetChange('debt', 'ppf', e.target.value)} placeholder="0" />
                    </div>
                    <div className="input-group">
                        <label>Fixed Deposits / Bonds</label>
                        <input type="number" value={safeAssetValue('debt', 'fd')} onChange={(e) => handleAssetChange('debt', 'fd', e.target.value)} placeholder="0" />
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--bg-main)' }}>
                    <h4>Real Estate & Others</h4>
                    <div className="input-group">
                        <label>Properties (Market Value)</label>
                        <input type="number" value={safeAssetValue('realEstate', 'residence')} onChange={(e) => handleAssetChange('realEstate', 'residence', e.target.value)} placeholder="0" />
                    </div>
                    <div className="input-group">
                        <label>Gold / Cash / Others</label>
                        <input type="number" value={safeAssetValue('others', 'gold')} onChange={(e) => handleAssetChange('others', 'gold', e.target.value)} placeholder="0" />
                    </div>
                </div>
            </div>

            <div className="section-header" style={{ marginTop: '3rem' }}>
                <h2 style={{ color: '#ef4444' }}>Liabilities (Outstanding Principal ₹)</h2>
                <p className="text-muted">Enter the current remaining amount of all your loans.</p>
            </div>

            <div className="grid">
                <div className="card" style={{ background: 'var(--bg-main)' }}>
                    <h4>Major Loans</h4>
                    <div className="input-group">
                        <label>Home Loan</label>
                        <input type="number" value={safeLiabilityValue('loans', 'home')} onChange={(e) => handleLiabilityChange('loans', 'home', e.target.value)} placeholder="0" />
                    </div>
                    <div className="input-group">
                        <label>Car / Personal Loan</label>
                        <input type="number" value={safeLiabilityValue('loans', 'car')} onChange={(e) => handleLiabilityChange('loans', 'car', e.target.value)} placeholder="0" />
                    </div>
                </div>

                <div className="card" style={{ background: 'var(--bg-main)' }}>
                    <h4>Short Term / Others</h4>
                    <div className="input-group">
                        <label>Credit Card / Other Loans</label>
                        <input type="number" value={safeLiabilityValue('loans', 'other')} onChange={(e) => handleLiabilityChange('loans', 'other', e.target.value)} placeholder="0" />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                <button className="btn btn-primary" onClick={onCalculate} style={{ padding: '1rem 4rem' }}>
                    Analyze Net Worth
                </button>
            </div>
        </div>
    );
};

export default AssetInput;
