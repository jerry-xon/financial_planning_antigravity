import React, { useMemo } from 'react';
import { Target, Link, ChevronRight, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const FulfillmentModule = ({ 
    goals, 
    allocations, 
    goalMappings, 
    setGoalMappings, 
    onNext, 
    onBack 
}) => {

    const availableSources = useMemo(() => {
        const types = ['SIP', 'Lumpsum', 'Gold', 'PPF', 'Equity', 'FD'];
        const existingSources = [
            { id: 'stocks', name: 'Existing Stocks', type: 'Equity' },
            { id: 'mfEquity', name: 'Existing Equity MF', type: 'Equity' },
            { id: 'assetPPF', name: 'Existing PPF', type: 'PPF' },
            { id: 'assetFD', name: 'Existing FD', type: 'FD' },
            { id: 'assetGold', name: 'Existing Gold', type: 'Gold' }
        ];

        const newAllocations = allocations.map(a => ({
            id: a.id,
            name: a.name || a.type,
            type: a.type
        }));

        return [...existingSources, ...newAllocations];
    }, [allocations]);

    const handleMappingChange = (goalId, sourceId) => {
        const currentMappings = goalMappings[goalId] || [];
        const isSelected = currentMappings.includes(sourceId);

        let newMappings;
        if (isSelected) {
            newMappings = currentMappings.filter(id => id !== sourceId);
        } else {
            newMappings = [...currentMappings, sourceId];
        }

        setGoalMappings({
            ...goalMappings,
            [goalId]: newMappings
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
                    Map your life goals to specific investment sources. This ensures that every milestone has a dedicated funding plan.
                </p>

                {goals.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {goals.map((goal) => {
                            const selectedSources = goalMappings[goal.id] || [];
                            const isMapped = selectedSources.length > 0;
                            const futureValue = goal.futureValue || (parseFloat(goal.presentValue) * Math.pow(1 + (parseFloat(goal.inflationRate) || 6) / 100, parseFloat(goal.yearsToGoal) || 0));

                            return (
                                <div key={goal.id} className="goal-fulfillment-card" style={{ 
                                    background: 'var(--bg-main)', 
                                    borderRadius: '16px', 
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ 
                                        padding: '1.5rem', 
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        borderBottom: '1px solid var(--border)',
                                        background: isMapped ? 'rgba(52, 211, 153, 0.05)' : 'transparent'
                                    }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                {isMapped ? <CheckCircle2 size={18} className="text-success" /> : <AlertCircle size={18} style={{ color: '#f59e0b' }} />}
                                                <h3 style={{ margin: 0 }}>{goal.name || goal.placeholder}</h3>
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                Target Year: {new Date().getFullYear() + Math.round(parseFloat(goal.yearsToGoal) || 0)} | 
                                                Future Value: <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(futureValue)}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: isMapped ? 'var(--success)' : '#f59e0b' }}>
                                                {isMapped ? 'Funding Source Assigned' : 'Awaiting Assignment'}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'block' }}>
                                            Select Source(s) of Investment:
                                        </label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            {availableSources.map((source) => {
                                                const isSelected = selectedSources.includes(source.id);
                                                return (
                                                    <button
                                                        key={source.id}
                                                        onClick={() => handleMappingChange(goal.id, source.id)}
                                                        className={`btn`}
                                                        style={{
                                                            fontSize: '0.8rem',
                                                            padding: '0.6rem 1rem',
                                                            borderRadius: '50px',
                                                            background: isSelected ? 'var(--primary)' : 'transparent',
                                                            color: isSelected ? 'white' : 'var(--text-main)',
                                                            border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        {isSelected && <Link size={14} />}
                                                        {source.name}
                                                    </button>
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
                        <p>No goals found. Please define your goals in the Goals module first.</p>
                    </div>
                )}

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', alignItems: 'flex-start' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0 }}>
                        Mapping goals to sources helps you visualize which assets will be liquidated to meet specific needs. This will be reflected in your final financial roadmap.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back to Growth Tracker
                </button>
                <button className="btn btn-primary" onClick={onNext}>
                    Proceed to Final Overview
                </button>
            </div>
        </div>
    );
};

export default FulfillmentModule;
