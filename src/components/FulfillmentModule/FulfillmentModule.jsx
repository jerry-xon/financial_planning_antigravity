import React, { useMemo } from 'react';
import { Target, Link, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, Info, Calculator, Landmark, ShieldCheck } from 'lucide-react';
import { computeSIPData } from '../Calculators/SIPCalculator';
import { computeLumpsumData } from '../Calculators/LumpsumCalculator';
import { computeEquityData } from '../Calculators/EquityCalculator';
import { computeFDData } from '../Calculators/FDCalculator';
import { computeRDData } from '../Calculators/RDCalculator';

const FulfillmentModule = ({ 
    familyMembers = [],
    calculatorInputs = {},
    expenseCategories = {},
    assetCategories = {},
    goals, 
    allocations, 
    goalMappings, 
    setGoalMappings, 
    onNext, 
    onBack 
}) => {
    
    // 1. Filter and sort goals to only those with assigned values, arranged chronologically
    const activeGoals = useMemo(() => {
        return goals
            .filter(g => parseFloat(g.futureValue || g.presentValue || 0) > 0)
            .sort((a, b) => {
                const yearsA = parseFloat(a.yearsToGoal) || 0;
                const yearsB = parseFloat(b.yearsToGoal) || 0;
                return yearsA - yearsB;
            });
    }, [goals]);

    // 2. Compute calculator data once
    const currentYear = new Date().getFullYear();
    const sipExpectedReturns = calculatorInputs.sip?.rate ?? 12;
    const sipTenureYears = calculatorInputs.sip?.tenure ?? 10;
    const sipEvents = calculatorInputs.sip?.events || calculatorInputs.sip?.increments || [];
    const sipProposed = allocations.filter(a => a.type === 'SIP');
    
    const lumpsumDataInput = calculatorInputs.lumpsum ?? {};
    const lsProposed = allocations.filter(a => a.type === 'Lumpsum' || a.type === 'Lump Sum');

    const fdDataInput = calculatorInputs.fd ?? {};
    const fdProposed = allocations.filter(a => a.type === 'Fixed Deposit');

    const rdDataInput = calculatorInputs.rd ?? {};
    const rdProposed = allocations.filter(a => a.type === 'Recurring Deposit');

    const equityDataInput = calculatorInputs.equity ?? {};
    const eqProposed = allocations.filter(a => a.type === 'Direct Equity & ETFs');

    // Natively compute without the goalMappings loop-back (to get "Baseline Available")
    // Note: To avoid circular dependency during assignment, we pass empty mappings or exclude them here 
    // to strictly fetch what the balance WOULD BE before these specific assignments.
    const defaultSIP = parseFloat(expenseCategories?.savings?.sip?.amount !== undefined ? expenseCategories.savings.sip.amount : expenseCategories?.savings?.sip) || 0;
    const defaultCorpus = parseFloat(assetCategories?.investments?.mutualFunds) || parseFloat(assetCategories?.equity?.mfEquity) || parseFloat(assetCategories?.equity?.stocks) || 0;

    const baseSIPAmount = defaultSIP; // Strictly lock to live CashFlow baseline
    const baseCurrentVal = defaultCorpus; // Strictly lock to live Assets baseline

    const baselineSipData = useMemo(() => computeSIPData(
        currentYear, 
        baseSIPAmount, 
        sipExpectedReturns, 
        50, 
        baseCurrentVal, 
        sipEvents, 
        sipProposed, 
        goalMappings, 
        goals
    ), [currentYear, baseSIPAmount, sipExpectedReturns, baseCurrentVal, sipEvents, sipProposed, goalMappings, goals]);

    const baselineLumpsumData = useMemo(() => computeLumpsumData(
        parseFloat(lumpsumDataInput.amount) || 0,
        parseFloat(lumpsumDataInput.rate) || 12,
        50,
        new Date().getMonth() + 1,
        currentYear,
        lumpsumDataInput.events || [],
        lsProposed,
        goalMappings, 
        goals
    ), [currentYear, lumpsumDataInput, lsProposed, goalMappings, goals]);

    const baselineFdData = useMemo(() => computeFDData(
        fdProposed, parseFloat(fdDataInput.rate) || 7, fdDataInput.frequency || 'Quarterly'
    ).schedule || [], [fdDataInput, fdProposed]);

    const baselineRdData = useMemo(() => computeRDData(
        rdProposed, parseFloat(rdDataInput.rate) || 7
    ).schedule || [], [rdDataInput, rdProposed]);

    // 3. Compute Dynamic Equity timeline natively
    const baseEquityVal = parseFloat(assetCategories?.investments?.equity) || parseFloat(assetCategories?.equity?.stocks) || 0;
    const baselineEquityData = useMemo(() => computeEquityData(
        baseEquityVal,
        parseFloat(equityDataInput.rate) || 15,
        50,
        new Date().getMonth() + 1,
        currentYear,
        equityDataInput.events || [],
        eqProposed,
        goalMappings,
        goals
    ), [currentYear, baseEquityVal, equityDataInput, eqProposed, goalMappings, goals]);

    const availableSources = useMemo(() => {
        return [
            { id: 'sip', name: 'SIP', type: 'SIP' },
            { id: 'lumpsum', name: 'Lumpsum', type: 'Lumpsum' },
            { id: 'equity', name: 'Direct Equity & ETFs', type: 'Equity' },
            { id: 'fd', name: 'Fixed Deposit (FD)', type: 'FD' },
            { id: 'rd', name: 'Recurring Deposit (RD)', type: 'RD' },
            { id: 'realEstate', name: 'Real Estate Investment', type: 'Real Estate' },
            { id: 'loan', name: 'Loan', type: 'Loan' }
        ];
    }, []);

    // 4. Handle amount updates for mappings (Structure: { goalId: { sourceId: amount } })
    const handleAmountChange = (goalId, sourceId, amount, maxAllowed) => {
        const currentGoalMap = goalMappings[goalId] || {};
        let val = parseFloat(amount);
        
        if (!isNaN(val) && maxAllowed !== null && val > maxAllowed) {
            val = maxAllowed;
        }
        
        let newGoalMap = { ...currentGoalMap };
        
        if (isNaN(val) || val <= 0) {
            delete newGoalMap[sourceId];
        } else {
            newGoalMap[sourceId] = val;
        }

        setGoalMappings({
            ...goalMappings,
            [goalId]: newGoalMap
        });
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="fulfillment-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Target size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 11: Goal Fulfillment Roadmap</h2>
                </div>
                
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Assign values from your projected investment portfolios to guarantee your life goals are fully funded.
                </p>

                {activeGoals.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {activeGoals.map((goal) => {
                            const goalYear = currentYear + Math.round(parseFloat(goal.yearsToGoal) || 0);
                            const futureValue = goal.futureValue || (parseFloat(goal.presentValue) * Math.pow(1 + (parseFloat(goal.inflationRate) || 6) / 100, parseFloat(goal.yearsToGoal) || 0));
                            
                            const currentGoalMap = goalMappings[goal.id] || {};
                            const totalAssigned = Object.values(currentGoalMap).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                            const shortfall = futureValue - totalAssigned;
                            
                            const isFullyFunded = Math.round(shortfall) <= 0;
                            const hasAssignments = totalAssigned > 0;

                            const eRow = baselineEquityData.find(r => r.year === goalYear);
                            const remainingEquity = eRow ? eRow.valueAfterWithdrawal : 0;

                            // Helpers for Available Values for this specific year
                            const sRow = baselineSipData.find(r => r.year === goalYear);
                            const lRow = baselineLumpsumData.find(r => r.year === goalYear);
                            const fRow = baselineFdData.find(r => r.year === goalYear);
                            const rRow = baselineRdData.find(r => r.year === goalYear);

                            const availableData = {
                                'sip': sRow ? sRow.valueAfterWithdrawal : 0,
                                'lumpsum': lRow ? lRow.valueAfterWithdrawal : 0,
                                'equity': remainingEquity,
                                'fd': fRow ? (fRow.maturityValue || 0) : 0,
                                'rd': rRow ? (rRow.maturityValue || 0) : 0,
                                'realEstate': parseFloat(assetCategories?.realEstate?.landPlot) || 0,
                                'loan': null // infinite
                            };

                            return (
                                <div key={goal.id} className="goal-fulfillment-card" style={{ 
                                    background: 'var(--bg-main)', 
                                    borderRadius: '16px', 
                                    border: `2px solid ${isFullyFunded ? 'var(--success)' : 'var(--border)'}`,
                                    overflow: 'hidden'
                                }}>
                                    {/* Header Row */}
                                    <div style={{ 
                                        padding: '1.5rem', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--border)',
                                        background: isFullyFunded ? 'rgba(52, 211, 153, 0.05)' : 'transparent'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                {isFullyFunded ? <CheckCircle2 size={18} className="text-success" /> : <AlertCircle size={18} style={{ color: '#ef4444' }} />}
                                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{goal.name || goal.placeholder}</h3>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                Target Year: <strong style={{ color: 'var(--text-main)' }}>{goalYear}</strong> | 
                                                Target Cost: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(futureValue)}</strong>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', gap: '1.5rem', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                    Assigned
                                                </div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                                    {formatCurrency(totalAssigned)}
                                                </div>
                                            </div>
                                            <div style={{ width: '1px', background: 'var(--border)' }}></div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                    Pending Needed
                                                </div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isFullyFunded ? 'var(--success)' : '#ef4444' }}>
                                                    {isFullyFunded ? 'Fully Funded' : formatCurrency(shortfall)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sources Assignments */}
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                            {availableSources.map((source) => {
                                                const assignedAmt = currentGoalMap[source.id] || '';
                                                const assignedVal = parseFloat(assignedAmt) || 0;
                                                const isAssigned = assignedVal > 0;
                                                
                                                // Rules: FD and RD only visible if year matches maturity year natively (i.e. availableData > 0)
                                                if ((source.id === 'fd' || source.id === 'rd') && (availableData[source.id] <= 0 && !isAssigned)) {
                                                    return null;
                                                }

                                                // Calculate remaining natively available balance after roadmap execution
                                                const ceiling = availableData[source.id] !== null ? availableData[source.id] : null;
                                                
                                                // Calculate the mathematical Upper Bound the user can assign right now
                                                const maxNeeded = shortfall > 0 ? shortfall + assignedVal : assignedVal;
                                                const absoluteMax = ceiling !== null ? Math.min(maxNeeded, ceiling) : maxNeeded;
                                                const roundedMax = Math.round(absoluteMax);

                                                return (
                                                    <div
                                                        key={source.id}
                                                        style={{
                                                            padding: '1rem',
                                                            borderRadius: '8px',
                                                            background: isAssigned ? 'rgba(37, 99, 235, 0.05)' : 'var(--bg-card)',
                                                            border: isAssigned ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '0.75rem'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{source.name}</div>
                                                            {ceiling !== null && (
                                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                    Avail: <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.05rem', marginLeft: '4px' }}>{formatCurrency(ceiling)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="input-group" style={{ marginBottom: 0 }}>
                                                            <div style={{ position: 'relative' }}>
                                                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                                                                <input 
                                                                    type="number" 
                                                                    value={assignedAmt} 
                                                                    onChange={(e) => handleAmountChange(goal.id, source.id, e.target.value, Math.max(0, roundedMax))}
                                                                    placeholder="0"
                                                                    style={{ 
                                                                        paddingLeft: '28px', 
                                                                        borderColor: isAssigned ? 'var(--primary)' : 'var(--border)' 
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem', 
                        border: '2px dashed var(--border)', 
                        borderRadius: '12px',
                        color: 'var(--text-muted)'
                    }}>
                        <Target size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No actionable goals found. Please ensure your goals in the Goals Module have a valid Target Cost assigned.</p>
                    </div>
                )}
            </div>

            <div className="sticky-action-bar">
                <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ChevronLeft size={20} />
                    Back to Growth Tracker
                </button>
                <button className="btn btn-primary" onClick={onNext} style={{ padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-md)' }}>
                    Proceed to Final Overview
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default FulfillmentModule;
