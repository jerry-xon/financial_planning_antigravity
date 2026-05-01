import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Landmark, TrendingUp, HeartHandshake, Info } from 'lucide-react';
import { computeSIPData } from '../Calculators/SIPCalculator';
import { computeEquityData } from '../Calculators/EquityCalculator';

const FinancialPyramid = ({
    expenseCategories,
    policies,
    assetCategories,
    calculatorInputs = {},
    proposedSIPs = [],
    proposedEquities = [],
    goals = [],
    goalMappings = {},
    protectionGapResults,
    isReadOnlyMode = false
}) => {
    const [activeLayer, setActiveLayer] = useState(null);

    // --- 1. Foundation Layer (Protection) ---
    const hasHealthInsurance = parseFloat(expenseCategories?.insurance?.health?.value || 0) > 0;
    const selfGap = protectionGapResults?.self?.isGap;
    const spouseGap = protectionGapResults?.spouse?.isGap;
    const hasLifeInsuranceGap = selfGap || spouseGap;

    // --- 2. Second Layer (Low-Risk Investments) ---
    const lowRiskPolicies = policies.filter(p => !p.isProposed && p.planType === 'Saving Plan');
    const lowRiskMembers = [...new Set(lowRiskPolicies.map(p => p.insuredName))];

    // --- 3. Third Layer (Growth Investments) ---
    const currentYear = new Date().getFullYear();
    const startMonth = new Date().getMonth() + 1;
    
    // SIP Calculation for Year 1
    const defaultSIP = parseFloat(expenseCategories?.savings?.sip?.amount !== undefined ? expenseCategories.savings.sip.amount : expenseCategories?.savings?.sip) || 0;
    const defaultCorpusSIP = parseFloat(assetCategories?.investments?.mutualFunds) || parseFloat(assetCategories?.equity?.mfEquity) || 0;
    const sipInputs = calculatorInputs.sip || {};
    const sipDataArr = computeSIPData(
        currentYear, 
        sipInputs.amount ?? defaultSIP, 
        sipInputs.rate ?? 12, 
        1, // 1 year tenure
        sipInputs.currentValue ?? defaultCorpusSIP, 
        sipInputs.increments || [], 
        proposedSIPs, 
        goalMappings, 
        goals
    );
    const sipClosingBalance = sipDataArr[0]?.valueAfterWithdrawal || 0;

    // Equity Calculation for Year 1
    const defaultCorpusEq = parseFloat(assetCategories?.investments?.equity) || parseFloat(assetCategories?.equity?.stocks) || 0;
    const eqInputs = calculatorInputs.equity || {};
    const eqDataArr = computeEquityData(
        eqInputs.currentValue ?? defaultCorpusEq,
        eqInputs.rate ?? 12,
        1, // 1 year tenure
        startMonth,
        currentYear,
        eqInputs.events || [],
        proposedEquities,
        goalMappings,
        goals
    );
    const eqClosingBalance = eqDataArr[0]?.valueAfterWithdrawal || 0;
    
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    const pyramidLayers = [
        {
            id: 4,
            title: "Succession Planning",
            subtitle: "Top Layer",
            icon: <HeartHandshake size={20} />,
            color: 'var(--accent)',
            bgGradient: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)',
            width: '40%',
            content: (
                <div className="layer-details fade-in">
                    <h4 style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>Importance of Wealth Transfer</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                        The apex of the pyramid ensures smooth succession for the next generation. Consider creating a clear will, forming trusts, and maintaining proper nominations stringently to secure your family's legacy.
                    </p>
                </div>
            )
        },
        {
            id: 3,
            title: "Growth Investments",
            subtitle: "Third Layer",
            icon: <TrendingUp size={20} />,
            color: '#f59e0b',
            bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            width: '60%',
            content: (
                <div className="layer-details fade-in">
                    <h4 style={{ color: '#d97706', marginBottom: '1rem' }}>Wealth Creation Projects (Current Year)</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SIP & Mutual Funds</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d97706' }}>{formatCurrency(sipClosingBalance)}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Projected Closing Balance</div>
                        </div>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Direct Equity & ETFs</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#d97706' }}>{formatCurrency(eqClosingBalance)}</div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '4px' }}>Projected Closing Balance</div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 2,
            title: "Low-Risk Investments",
            subtitle: "Second Layer",
            icon: <Landmark size={20} />,
            color: '#06b6d4',
            bgGradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            width: '80%',
            content: (
                <div className="layer-details fade-in">
                    <h4 style={{ color: '#0891b2', marginBottom: '0.5rem' }}>Stable & Predictable</h4>
                    <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
                        Tools like Fixed Deposits, Bonds, and Traditional Life Insurance Saving Plans help in capital preservation and offer steady returns.
                    </p>
                    {lowRiskMembers.length > 0 ? (
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', border: '1px solid #06b6d4' }}>
                            <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#0891b2' }}>Members with Traditional Insurance Policies:</strong>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {lowRiskMembers.map((m, idx) => (
                                    <span key={idx} style={{ background: '#cffafe', color: '#0891b2', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>{m}</span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{ background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            No traditional saving plans recorded.
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 1,
            title: "Protection",
            subtitle: "Foundation Layer",
            icon: <ShieldCheck size={20} />,
            color: 'var(--primary)',
            bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            width: '100%',
            content: (
                <div className="layer-details fade-in">
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Risk Management & Security</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${hasHealthInsurance ? '#10b981' : '#ef4444'}` }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Health Insurance</div>
                            {hasHealthInsurance ? (
                                <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} /> Active Policy</div>
                            ) : (
                                <div style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={16} /> No Active Policy</div>
                            )}
                        </div>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', borderLeft: `4px solid ${!hasLifeInsuranceGap ? '#10b981' : '#f59e0b'}` }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Life Insurance</div>
                             {hasLifeInsuranceGap ? (
                                <div style={{ color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldAlert size={16} /> Coverage Gap Exists</div>
                            ) : (
                                <div style={{ color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}><ShieldCheck size={16} /> Fully Covered</div>
                            )}
                        </div>
                        <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid var(--primary)' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Emergency Fund</div>
                            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>Addressed in Contingency Module</div>
                        </div>
                    </div>
                </div>
            )
        }
    ];

    // Default to the first layer if none active
    const activeData = activeLayer ? pyramidLayers.find(l => l.id === activeLayer) : pyramidLayers[3];

    return (
        <div className="card" style={{ marginBottom: '3rem', borderTop: '4px solid var(--primary)', ...(isReadOnlyMode && { padding: '2rem', boxShadow: 'none', border: 'none' }) }}>
            {!isReadOnlyMode && (
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: 'var(--primary)', margin: '0 0 0.5rem 0' }}>The Financial Pyramid</h2>
                    <p className="text-muted" style={{ margin: 0 }}>A sturdy financial plan consists of four distinct stages. Click each layer to view your status.</p>
                </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', justifyContent: isReadOnlyMode ? 'center' : 'flex-start' }}>
                {/* Visual Pyramid */}
                <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', maxWidth: isReadOnlyMode ? '500px' : 'none' }}>
                    {pyramidLayers.map((layer) => (
                        <div 
                            key={layer.id}
                            onClick={() => !isReadOnlyMode && setActiveLayer(layer.id)}
                            style={{
                                width: layer.width,
                                background: layer.bgGradient,
                                height: '70px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: isReadOnlyMode ? 'default' : 'pointer',
                                transition: 'all 0.3s ease',
                                transform: !isReadOnlyMode && (activeLayer || pyramidLayers[3].id) === layer.id ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: !isReadOnlyMode && (activeLayer || pyramidLayers[3].id) === layer.id ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                zIndex: !isReadOnlyMode && (activeLayer || pyramidLayers[3].id) === layer.id ? 10 : 1,
                                border: !isReadOnlyMode && (activeLayer || pyramidLayers[3].id) === layer.id ? '2px solid rgba(255,255,255,0.8)' : '1px solid transparent',
                                opacity: !isReadOnlyMode && activeLayer && activeLayer !== layer.id ? 0.7 : 1
                            }}
                            title={isReadOnlyMode ? layer.title : `Click to view ${layer.title} details`}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <div style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}>{layer.title}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase' }}>{layer.subtitle}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Details Card */}
                {!isReadOnlyMode && (
                    <div style={{ flex: '1 1 400px' }}>
                        <div style={{ 
                            background: 'var(--bg-card)', 
                            padding: '2rem', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                            minHeight: '260px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px dashed var(--border)' }}>
                                <div style={{ background: activeData.color, color: 'white', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {activeData.icon}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, color: activeData.color }}>{activeData.title}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{activeData.subtitle}</span>
                                </div>
                            </div>

                            {activeData.content}

                        </div>
                    </div>
                )}
            </div>
            
            {!isReadOnlyMode && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: '2.5rem', background: 'rgba(37, 99, 235, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                    <Info color="var(--primary)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        <strong>Note:</strong> Build your financial pyramid from the ground up. Ensure your <em>Protection</em> foundation is rock solid before moving substantial capital towards <em>Growth Investments</em> to safeguard against unforeseen setbacks.
                    </p>
                </div>
            )}
        </div>
    );
};

export default FinancialPyramid;
