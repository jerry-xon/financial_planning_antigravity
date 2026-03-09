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
    
    const handleRateChange = (name, value) => {
        setInflationRates({
            ...inflationRates,
            [name]: parseFloat(value) || 0
        });
    };

    const addAdjustment = () => {
        setJourneyAdjustments([
            ...journeyAdjustments,
            { id: Date.now(), name: '', startYear: new Date().getFullYear(), duration: 1, amount: '' }
        ]);
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
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Label / Name</label>
                                        <input 
                                            type="text" 
                                            value={adj.name} 
                                            onChange={(e) => updateAdjustment(adj.id, 'name', e.target.value)}
                                            placeholder="e.g. Home Loan EMI"
                                        />
                                    </div>
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Starts Year</label>
                                        <input 
                                            type="number" 
                                            value={adj.startYear} 
                                            onChange={(e) => updateAdjustment(adj.id, 'startYear', e.target.value)}
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
                                    <div className="input-group" style={{ marginBottom: 0 }}>
                                        <label>Annual Amount (₹)</label>
                                        <input 
                                            type="number" 
                                            value={adj.amount} 
                                            onChange={(e) => updateAdjustment(adj.id, 'amount', e.target.value)}
                                            placeholder="e.g. 180000"
                                        />
                                    </div>
                                    <button 
                                        onClick={() => removeAdjustment(adj.id)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: '#ef4444', 
                                            cursor: 'pointer',
                                            padding: '0.75rem',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
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
