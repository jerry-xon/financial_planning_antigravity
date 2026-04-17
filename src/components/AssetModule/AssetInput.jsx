import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Settings } from 'lucide-react';
import InvestmentDetailsModal from '../CashFlowModule/InvestmentDetailsModal';
import CurrencyInput from '../common/CurrencyInput';
const AssetInput = ({ assetCategories, setAssetCategories, liabilityCategories, setLiabilityCategories, onCalculate }) => {
    const [openAccordions, setOpenAccordions] = useState({
        insurance: false,
        retirement: false
    });

    const [activeModal, setActiveModal] = useState(null);

    const toggleAccordion = (name) => {
        setOpenAccordions(prev => ({ ...prev, [name]: !prev[name] }));
    };

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

    const handleModalSave = (configObj) => {
        if (!activeModal) return;
        
        if (activeModal.index !== undefined) {
             const rawArray = assetCategories?.[activeModal.category]?.[activeModal.item];
             const arr = Array.isArray(rawArray) ? [...rawArray] : (rawArray ? [rawArray] : []);
             arr[activeModal.index] = configObj || '';
             handleAssetChange(activeModal.category, activeModal.item, arr);
        } else {
             handleAssetChange(activeModal.category, activeModal.item, configObj || '');
        }
        setActiveModal(null);
    };

    const addCustomField = (type) => {
        const field = { label: '', value: '' };
        if (type === 'asset') {
            setAssetCategories(prev => ({
                ...prev,
                custom: [...(prev.custom || []), field]
            }));
        } else {
            setLiabilityCategories(prev => ({
                ...prev,
                custom: [...(prev.custom || []), field]
            }));
        }
    };

    const handleCustomChange = (type, index, field, value) => {
        if (type === 'asset') {
            const newCustom = [...(assetCategories.custom || [])];
            newCustom[index] = { ...newCustom[index], [field]: value };
            setAssetCategories(prev => ({ ...prev, custom: newCustom }));
        } else {
            const newCustom = [...(liabilityCategories.custom || [])];
            newCustom[index] = { ...newCustom[index], [field]: value };
            setLiabilityCategories(prev => ({ ...prev, custom: newCustom }));
        }
    };

    const removeCustomField = (type, index) => {
        if (type === 'asset') {
            const newCustom = assetCategories.custom.filter((_, i) => i !== index);
            setAssetCategories(prev => ({ ...prev, custom: newCustom }));
        } else {
            const newCustom = liabilityCategories.custom.filter((_, i) => i !== index);
            setLiabilityCategories(prev => ({ ...prev, custom: newCustom }));
        }
    };

    return (
        <div className="asset-input">
            <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: 'var(--primary)' }}>Balance Sheet</h2>
                <p className="text-muted">Analyze your net worth by listing your liabilities and assets side-by-side.</p>
            </div>

            <div className="balance-sheet-grid">
                {/* LEFT SIDE: LIABILITIES */}
                <div className="liability-section">
                    <div className="side-header liability-bg">
                        <h3>LIABILITIES</h3>
                        <span>Outstanding Principal (₹)</span>
                    </div>
                    
                    <div className="card-column">
                        <div className="input-group">
                            <label>Home Loan</label>
                            <CurrencyInput value={safeLiabilityValue('loans', 'home')} onChange={(e) => handleLiabilityChange('loans', 'home', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Personal Loan</label>
                            <CurrencyInput value={safeLiabilityValue('loans', 'personal')} onChange={(e) => handleLiabilityChange('loans', 'personal', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Car Loan</label>
                            <CurrencyInput value={safeLiabilityValue('loans', 'car')} onChange={(e) => handleLiabilityChange('loans', 'car', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Education Loan</label>
                            <CurrencyInput value={safeLiabilityValue('loans', 'education')} onChange={(e) => handleLiabilityChange('loans', 'education', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Other EMIs</label>
                            <CurrencyInput value={safeLiabilityValue('loans', 'otherEmis')} onChange={(e) => handleLiabilityChange('loans', 'otherEmis', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Credit Card / Other</label>
                            <CurrencyInput value={safeLiabilityValue('loans', 'creditCard')} onChange={(e) => handleLiabilityChange('loans', 'creditCard', e.target.value)} placeholder="0" />
                        </div>

                        {/* Custom Liabilities */}
                        {liabilityCategories?.custom?.map((field, index) => (
                            <div key={`liab-custom-${index}`} className="custom-field-row">
                                <input 
                                    className="custom-label-input"
                                    type="text" 
                                    value={field.label} 
                                    onChange={(e) => handleCustomChange('liability', index, 'label', e.target.value)} 
                                    placeholder="Enter Liability Name" 
                                />
                                <div className="custom-value-wrapper">
                                    <CurrencyInput 
                                        value={field.value} 
                                        onChange={(e) => handleCustomChange('liability', index, 'value', e.target.value)} 
                                        placeholder="0" 
                                    />
                                    <button className="btn-icon-danger" onClick={() => removeCustomField('liability', index)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button className="btn-add-field" onClick={() => addCustomField('liability')}>
                            <Plus size={16} /> Add Other Liability
                        </button>
                    </div>
                </div>

                {/* RIGHT SIDE: ASSETS */}
                <div className="asset-section">
                    <div className="side-header asset-bg">
                        <h3>ASSETS</h3>
                        <span>Current Value (₹)</span>
                    </div>

                    <div className="card-column">
                        <div className="input-group">
                            <label>Residential House</label>
                            <CurrencyInput value={safeAssetValue('realEstate', 'residential')} onChange={(e) => handleAssetChange('realEstate', 'residential', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Second Property</label>
                            <CurrencyInput value={safeAssetValue('realEstate', 'secondProperty')} onChange={(e) => handleAssetChange('realEstate', 'secondProperty', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Land / Plot (Investment Purpose)</label>
                            <CurrencyInput value={safeAssetValue('realEstate', 'landPlot')} onChange={(e) => handleAssetChange('realEstate', 'landPlot', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Vehicles (IDV)</label>
                            <CurrencyInput value={safeAssetValue('vehicles', 'idv')} onChange={(e) => handleAssetChange('vehicles', 'idv', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Gold Jewellery</label>
                            <CurrencyInput value={safeAssetValue('valuables', 'gold')} onChange={(e) => handleAssetChange('valuables', 'gold', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Art / Collectibles</label>
                            <CurrencyInput value={safeAssetValue('valuables', 'art')} onChange={(e) => handleAssetChange('valuables', 'art', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Bank Savings</label>
                            <CurrencyInput value={safeAssetValue('cash', 'savings')} onChange={(e) => handleAssetChange('cash', 'savings', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Equity Investments (Stocks, ETFs)</label>
                            <CurrencyInput value={safeAssetValue('investments', 'equity')} onChange={(e) => handleAssetChange('investments', 'equity', e.target.value)} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Mutual Funds Portfolio</label>
                            <CurrencyInput value={safeAssetValue('investments', 'mutualFunds')} onChange={(e) => handleAssetChange('investments', 'mutualFunds', e.target.value)} placeholder="0" />
                        </div>
                        {(() => {
                            const rawFD = assetCategories?.investments?.fixedDeposit;
                            const fdArray = Array.isArray(rawFD) ? rawFD : (rawFD ? [rawFD] : []);
                            
                            return (
                                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: 0, fontWeight: 600 }}>Fixed Deposits (FD)</label>
                                        <button 
                                            onClick={() => {
                                                const newFds = [...fdArray, ''];
                                                handleAssetChange('investments', 'fixedDeposit', newFds);
                                            }}
                                            style={{ 
                                                background: 'transparent', border: '1px dashed var(--primary)', 
                                                color: 'var(--primary)', padding: '0.2rem 0.5rem', 
                                                fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px', cursor: 'pointer' 
                                            }}
                                        >
                                            <Plus size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Add FD
                                        </button>
                                    </div>

                                    {fdArray.map((fdItem, fdIndex) => {
                                        const isConfigured = fdItem !== null && typeof fdItem === 'object' && fdItem.amount > 0;
                                        const displayValue = isConfigured ? fdItem.amount : fdItem;

                                        return (
                                            <div className="input-group relative-group" key={`fd-${fdIndex}`} style={{ marginBottom: fdIndex < fdArray.length - 1 ? '1rem' : '0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <label style={{ marginBottom: 0, fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>FD #{fdIndex + 1}</label>
                                                    <div style={{ display: 'flex', gap: '12px' }}>
                                                        <button 
                                                            onClick={() => setActiveModal({ category: 'investments', item: 'fixedDeposit', title: 'Fixed Deposit (FD)', index: fdIndex })}
                                                            style={{ 
                                                                background: 'transparent', border: 'none', 
                                                                color: isConfigured ? 'var(--success)' : 'var(--primary)', 
                                                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0
                                                            }}
                                                        >
                                                            {isConfigured ? '✓ Configured' : '⚙️ Configure'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const newFds = fdArray.filter((_, i) => i !== fdIndex);
                                                                handleAssetChange('investments', 'fixedDeposit', newFds.length > 0 ? newFds : '');
                                                            }}
                                                            style={{ 
                                                                background: 'transparent', border: 'none', 
                                                                color: 'var(--danger)', 
                                                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0
                                                            }}
                                                        >
                                                            <Trash2 size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Remove
                                                        </button>
                                                    </div>
                                                </div>
                                                <CurrencyInput 
                                                    readOnly={true}
                                                    value={displayValue || ''} 
                                                    onChange={(e) => {
                                                        const newFds = [...fdArray];
                                                        newFds[fdIndex] = e.target.value;
                                                        handleAssetChange('investments', 'fixedDeposit', newFds);
                                                    }} 
                                                    onClick={() => setActiveModal({ category: 'investments', item: 'fixedDeposit', title: 'Fixed Deposit (FD)', index: fdIndex })}
                                                    placeholder="0" 
                                                    style={{ background: isConfigured ? 'var(--bg-main)' : 'var(--bg-card)', color: isConfigured ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}
                                                />
                                            </div>
                                        );
                                    })}
                                    {fdArray.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>No Fixed Deposits added.</p>}
                                </div>
                            );
                        })()}
                        <div className="input-group">
                            <label>Recurring Deposit</label>
                            <CurrencyInput value={safeAssetValue('investments', 'recurringDeposit')} onChange={(e) => handleAssetChange('investments', 'recurringDeposit', e.target.value)} placeholder="0" />
                        </div>

                        {/* Accordion: Insurance */}
                        <div className="accordion-item">
                            <div className="accordion-trigger" onClick={() => toggleAccordion('insurance')}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {openAccordions.insurance ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>Insurance Policies Cash Value</span>
                                </div>
                            </div>
                            {openAccordions.insurance && (
                                <div className="accordion-content">
                                    <div className="input-group">
                                        <label>Saving Plans</label>
                                        <CurrencyInput value={safeAssetValue('insurance', 'savingPlans')} onChange={(e) => handleAssetChange('insurance', 'savingPlans', e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>ULIP</label>
                                        <CurrencyInput value={safeAssetValue('insurance', 'ulip')} onChange={(e) => handleAssetChange('insurance', 'ulip', e.target.value)} placeholder="0" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Accordion: Retirement */}
                        <div className="accordion-item">
                            <div className="accordion-trigger" onClick={() => toggleAccordion('retirement')}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {openAccordions.retirement ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    <span style={{ fontWeight: 600, marginLeft: '0.5rem' }}>Retirement Accounts</span>
                                </div>
                            </div>
                            {openAccordions.retirement && (
                                <div className="accordion-content">
                                    <div className="input-group">
                                        <label>EPF</label>
                                        <CurrencyInput value={safeAssetValue('retirement', 'epf')} onChange={(e) => handleAssetChange('retirement', 'epf', e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>PPF</label>
                                        <CurrencyInput value={safeAssetValue('retirement', 'ppf')} onChange={(e) => handleAssetChange('retirement', 'ppf', e.target.value)} placeholder="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>NPS</label>
                                        <CurrencyInput value={safeAssetValue('retirement', 'nps')} onChange={(e) => handleAssetChange('retirement', 'nps', e.target.value)} placeholder="0" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="input-group">
                            <label>Other</label>
                            <CurrencyInput value={safeAssetValue('others', 'other')} onChange={(e) => handleAssetChange('others', 'other', e.target.value)} placeholder="0" />
                        </div>

                        {/* Custom Assets */}
                        {assetCategories?.custom?.map((field, index) => (
                            <div key={`asset-custom-${index}`} className="custom-field-row">
                                <input 
                                    className="custom-label-input"
                                    type="text" 
                                    value={field.label} 
                                    onChange={(e) => handleCustomChange('asset', index, 'label', e.target.value)} 
                                    placeholder="Enter Asset Name" 
                                />
                                <div className="custom-value-wrapper">
                                    <CurrencyInput 
                                        value={field.value} 
                                        onChange={(e) => handleCustomChange('asset', index, 'value', e.target.value)} 
                                        placeholder="0" 
                                    />
                                    <button className="btn-icon-danger" onClick={() => removeCustomField('asset', index)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button className="btn-add-field" onClick={() => addCustomField('asset')}>
                            <Plus size={16} /> Add Other Asset
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
                <button className="btn btn-primary btn-lg" onClick={onCalculate}>
                    Analyze Net Worth
                </button>
            </div>

            <style jsx>{`
                .balance-sheet-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 2rem;
                    margin-top: 1rem;
                }
                
                .side-header {
                    padding: 1rem;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .liability-bg {
                    background: #fef2f2;
                    border-left: 4px solid #ef4444;
                    color: #991b1b;
                }
                
                .asset-bg {
                    background: #f0fdf4;
                    border-left: 4px solid #22c55e;
                    color: #166534;
                }
                
                .side-header h3 {
                    margin: 0;
                    font-size: 1.125rem;
                    font-weight: 700;
                }
                
                .side-header span {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    opacity: 0.8;
                }
                
                .card-column {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding: 1.5rem;
                    background: var(--bg-card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }
                
                .input-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--text-main);
                }
                
                .custom-field-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    align-items: end;
                    padding-top: 1rem;
                    border-top: 1px dashed var(--border);
                }
                
                .custom-label-input {
                    background: var(--bg-main) !important;
                    font-weight: 500;
                }
                
                .custom-value-wrapper {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                }
                
                .btn-icon-danger {
                    background: transparent;
                    color: #ef4444;
                    border: 1px solid #fee2e2;
                    padding: 0.5rem;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .btn-icon-danger:hover {
                    background: #fef2f2;
                    border-color: #ef4444;
                }
                
                .btn-add-field {
                    background: var(--bg-main);
                    border: 1px dashed var(--primary);
                    color: var(--primary);
                    padding: 0.75rem;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                
                .btn-add-field:hover {
                    background: var(--primary-light);
                    border-style: solid;
                }
                
                .accordion-item {
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .accordion-trigger {
                    padding: 0.75rem 1rem;
                    background: var(--bg-main);
                    cursor: pointer;
                    user-select: none;
                    transition: background 0.2s;
                }
                
                .accordion-trigger:hover {
                    background: var(--bg-hover);
                }
                
                .accordion-content {
                    padding: 1rem;
                    background: var(--bg-card);
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    border-top: 1px solid var(--border);
                }
                
                @media (max-width: 992px) {
                    .balance-sheet-grid {
                        grid-template-columns: 1fr;
                    }
                }

                .btn-lg {
                    padding: 1rem 3rem;
                    font-size: 1.125rem;
                    font-weight: 700;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2);
                }
            `}</style>

            <InvestmentDetailsModal 
                isOpen={!!activeModal}
                onClose={() => setActiveModal(null)}
                onSave={handleModalSave}
                initialData={
                    activeModal 
                        ? (activeModal.index !== undefined 
                            ? (Array.isArray(assetCategories?.[activeModal.category]?.[activeModal.item]) 
                                ? assetCategories[activeModal.category][activeModal.item][activeModal.index] 
                                : assetCategories?.[activeModal.category]?.[activeModal.item])
                            : safeAssetValue(activeModal.category, activeModal.item)) 
                        : null
                }
                investmentTypeTitle={activeModal?.title || 'Investment'}
            />
        </div>
    );
};

export default AssetInput;
