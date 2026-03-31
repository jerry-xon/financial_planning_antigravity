import React, { useMemo } from 'react';
import { TrendingUp, PieChart, GraduationCap, Map, Plus, Trash2, Calendar, Banknote } from 'lucide-react';
import { generateProjections } from './ProjectionLogic';
import JourneyTable from './JourneyTable';

const JourneyModule = ({ 
    familyMembers, 
    income, 
    expenseCategories, 
    goals, 
    inflationRates, 
    setInflationRates,
    journeyAdjustments = [],
    setJourneyAdjustments,
    policies = [],
    onNext,
    onBack,
    projections: passedProjections
}) => {
    
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const handleRateChange = (name, value) => {
        setInflationRates({
            ...inflationRates,
            [name]: parseFloat(value) || 0
        });
    };

    const addAdjustment = () => {
        setJourneyAdjustments([
            ...journeyAdjustments,
            { 
                id: Date.now(), 
                type: 'expense', 
                name: '', 
                startMonth: new Date().getMonth() + 1, 
                startYear: new Date().getFullYear(), 
                duration: 1, 
                amount: '',
                principal: '',
                rate: '',
                tenure: '',
                loanCategory: 'personalLoan',
                emi: 0 
            }
        ]);
    };

    const calculateEmi = (p, r, n) => {
        p = parseFloat(p) || 0;
        r = parseFloat(r) || 0;
        n = parseFloat(n) || 0;
        if (p > 0 && r > 0 && n > 0) {
            const monthlyRate = r / 12 / 100;
            return Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
        }
        return 0;
    };

    const updateAdjustment = (id, field, value) => {
        setJourneyAdjustments(journeyAdjustments.map(adj => 
            adj.id === id ? { ...adj, [field]: value } : adj
        ));
    };

    const removeAdjustment = (id) => {
        setJourneyAdjustments(journeyAdjustments.filter(adj => adj.id !== id));
    };

    const projections = useMemo(() => {
        return passedProjections || generateProjections({
            familyMembers,
            income,
            expenseCategories,
            goals,
            inflationRates,
            journeyAdjustments,
            policies
        });
    }, [passedProjections, familyMembers, income, expenseCategories, goals, inflationRates, journeyAdjustments, policies]);

    const onNextHandled = () => {
        onNext();
    };

    return (
        <div className="journey-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <Map size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 8: Journey & Projections</h2>
                </div>
                
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Map out your financial journey until retirement. Adjust inflation and growth rates to see how your surplus evolves.
                </p>

                <div className="grid" style={{ gap: '1.5rem' }}>
                    <div className="input-group">
                        <label>
                            <TrendingUp size={14} /> Annual Income Increment (%)
                        </label>
                        <input
                            type="number"
                            value={inflationRates.incomeIncrement}
                            onChange={(e) => handleRateChange('incomeIncrement', e.target.value)}
                            placeholder="e.g. 10"
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            <TrendingUp size={14} /> Household Inflation (%)
                        </label>
                        <input
                            type="number"
                            value={inflationRates.householdInflation}
                            onChange={(e) => handleRateChange('householdInflation', e.target.value)}
                            placeholder="e.g. 6"
                        />
                    </div>

                    <div className="input-group">
                        <label>
                            <GraduationCap size={14} /> Education Inflation (%)
                        </label>
                        <input
                            type="number"
                            value={inflationRates.educationInflation}
                            onChange={(e) => handleRateChange('educationInflation', e.target.value)}
                            placeholder="e.g. 8"
                        />
                    </div>
                </div>

                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <div>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Banknote size={20} className="text-primary" /> Future Financial Adjustments
                            </h3>
                            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                                Add future events like new loans, EMIs, or additional lifestyle expenses.
                            </p>
                        </div>
                        <button className="btn btn-secondary" onClick={addAdjustment} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                            <Plus size={16} style={{ marginRight: '6px' }} /> Add Adjustment
                        </button>
                    </div>

                    {journeyAdjustments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {journeyAdjustments.map((adj) => (
                                <div key={adj.id} className="grid" style={{ 
                                    gridTemplateColumns: '2fr 1fr 1fr 1.5fr auto', 
                                    gap: '1rem', 
                                    alignItems: 'end',
                                    background: 'var(--bg-main)',
                                    padding: '1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)'
                                }}>
                                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <div className="input-group" style={{ marginBottom: 0, width: '200px' }}>
                                            <label>Adjustment Type</label>
                                            <select 
                                                value={adj.type || 'expense'} 
                                                onChange={(e) => updateAdjustment(adj.id, 'type', e.target.value)}
                                            >
                                                <option value="expense">Standard Expense</option>
                                                <option value="loan">Future Loan</option>
                                            </select>
                                        </div>
                                        <button 
                                            onClick={() => removeAdjustment(adj.id)}
                                            style={{ 
                                                background: 'none', border: 'none', color: '#ef4444', 
                                                cursor: 'pointer', padding: '0.75rem', marginLeft: 'auto',
                                                display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            <Trash2 size={20} /> Remove
                                        </button>
                                    </div>

                                    {(adj.type || 'expense') === 'expense' ? (
                                        <>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Expense Name</label>
                                                <input 
                                                    type="text" 
                                                    value={adj.name} 
                                                    onChange={(e) => updateAdjustment(adj.id, 'name', e.target.value)}
                                                    placeholder="e.g. World Tour"
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Start Year</label>
                                                <input 
                                                    type="number" 
                                                    value={adj.startYear} 
                                                    onChange={(e) => {
                                                        let val = parseInt(e.target.value) || currentYear;
                                                        if (val < currentYear) val = currentYear;
                                                        updateAdjustment(adj.id, 'startYear', val);
                                                    }}
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Duration (Yrs)</label>
                                                <input 
                                                    type="number" 
                                                    value={adj.duration} 
                                                    onChange={(e) => updateAdjustment(adj.id, 'duration', e.target.value)}
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
                                                <label>Annual Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    value={adj.amount} 
                                                    onChange={(e) => updateAdjustment(adj.id, 'amount', e.target.value)}
                                                    placeholder="e.g. 500000"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Loan Category</label>
                                                <select 
                                                    value={adj.loanCategory || 'personalLoan'} 
                                                    onChange={(e) => {
                                                        const catName = e.target.options[e.target.selectedIndex].text;
                                                        setJourneyAdjustments(journeyAdjustments.map(a => 
                                                            a.id === adj.id ? { ...a, loanCategory: e.target.value, name: catName } : a
                                                        ));
                                                    }}
                                                >
                                                    <option value="personalLoan">Personal Loan</option>
                                                    <option value="homeLoan">Home Loan</option>
                                                    <option value="educationLoan">Education Loan</option>
                                                    <option value="carLoan">Car Loan</option>
                                                    <option value="twoWheelerLoan">Two-Wheeler Loan</option>
                                                    <option value="otherEmi">Other Loan</option>
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Principal (₹)</label>
                                                <input 
                                                    type="number" 
                                                    value={adj.principal || ''} 
                                                    onChange={(e) => {
                                                        const p = e.target.value;
                                                        const emi = calculateEmi(p, adj.rate, adj.tenure);
                                                        setJourneyAdjustments(journeyAdjustments.map(a => 
                                                            a.id === adj.id ? { ...a, principal: p, emi: emi, amount: emi * 12 } : a
                                                        ));
                                                    }}
                                                    placeholder="e.g. 1000000"
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Rate (%)</label>
                                                <input 
                                                    type="number" 
                                                    value={adj.rate || ''} 
                                                    onChange={(e) => {
                                                        const r = e.target.value;
                                                        const emi = calculateEmi(adj.principal, r, adj.tenure);
                                                        setJourneyAdjustments(journeyAdjustments.map(a => 
                                                            a.id === adj.id ? { ...a, rate: r, emi: emi, amount: emi * 12 } : a
                                                        ));
                                                    }}
                                                    placeholder="e.g. 8.5"
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Tenure (Months)</label>
                                                <input 
                                                    type="number" 
                                                    value={adj.tenure || ''} 
                                                    onChange={(e) => {
                                                        const t = e.target.value;
                                                        const emi = calculateEmi(adj.principal, adj.rate, t);
                                                        setJourneyAdjustments(journeyAdjustments.map(a => 
                                                            a.id === adj.id ? { ...a, tenure: t, duration: Math.ceil(t / 12), emi: emi, amount: emi * 12 } : a
                                                        ));
                                                    }}
                                                    placeholder="e.g. 60"
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Start Month/Year</label>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <select value={adj.startMonth || 1} onChange={(e) => {
                                                        let val = parseInt(e.target.value);
                                                        if (adj.startYear <= currentYear && val < currentMonth) {
                                                            val = currentMonth;
                                                        }
                                                        updateAdjustment(adj.id, 'startMonth', val);
                                                    }}>
                                                        {[...Array(12)].map((_, i) => (
                                                            <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'short' })}</option>
                                                        ))}
                                                    </select>
                                                    <input type="number" value={adj.startYear} onChange={(e) => {
                                                        let val = parseInt(e.target.value) || currentYear;
                                                        if (val <= currentYear) {
                                                            val = currentYear;
                                                            if ((adj.startMonth || 1) < currentMonth) {
                                                                updateAdjustment(adj.id, 'startMonth', currentMonth);
                                                            }
                                                        }
                                                        updateAdjustment(adj.id, 'startYear', val);
                                                    }} style={{ width: '80px' }} />
                                                </div>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 5', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Auto-calculated Monthly EMI:</span>
                                                    <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>₹{Number(adj.emi || 0).toLocaleString('en-IN')}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '2rem', 
                            border: '2px dashed var(--border)', 
                            borderRadius: '12px',
                            color: 'var(--text-muted)'
                        }}>
                            No future adjustments added. Use the button above to add loans or upcoming expenses.
                        </div>
                    )}
                </div>
            </div>

            {projections.length > 0 ? (
                <div className="card fade-in">
                    <h3>Yearly Inflow-Outflow Timeline</h3>
                    <JourneyTable projections={projections} />
                </div>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Please ensure you have entered details for "Self" in the Profile module to generate the retirement timeline.</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back to Contingency Fund
                </button>
                <button className="btn btn-primary" onClick={onNextHandled}>
                    Proceed to Investment Allocation
                </button>
            </div>
        </div>
    );
};

export default JourneyModule;
