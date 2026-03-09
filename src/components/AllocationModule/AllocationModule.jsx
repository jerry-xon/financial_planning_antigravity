import React, { useMemo } from 'react';
import { PieChart, Plus, Trash2, ArrowRight, Wallet, Target, TrendingUp } from 'lucide-react';

const AllocationModule = ({ 
    netInvestibleSurplus, 
    allocations, 
    setAllocations, 
    onNext, 
    onBack 
}) => {
    
    const totalAllocated = useMemo(() => {
        return allocations.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    }, [allocations]);

    const remainingSurplus = netInvestibleSurplus - totalAllocated;

    const addAllocation = () => {
        setAllocations([
            ...allocations,
            { 
                id: Date.now(), 
                type: 'SIP', 
                name: '', 
                amount: '', 
                frequency: 'Monthly',
                expectedReturn: 12,
                startYear: new Date().getFullYear(),
                duration: 10
            }
        ]);
    };

    const updateAllocation = (id, field, value) => {
        setAllocations(allocations.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeAllocation = (id) => {
        setAllocations(allocations.filter(item => item.id !== id));
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    return (
        <div className="allocation-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <PieChart size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 9: Investment Allocation</h2>
                </div>
                
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Allocate your annual Net Investible Surplus into various investment avenues. This will help bridge the gap for your future goals.
                </p>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="stat-card" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Annual Surplus</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(netInvestibleSurplus)}</div>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Allocated</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalAllocated)}</div>
                    </div>
                    <div className="stat-card" style={{ 
                        background: remainingSurplus < 0 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-main)', 
                        padding: '1.5rem', 
                        borderRadius: '12px', 
                        border: remainingSurplus < 0 ? '1px solid #ef4444' : '1px solid var(--border)' 
                    }}>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Unallocated Surplus</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: remainingSurplus < 0 ? '#ef4444' : 'var(--text-main)' }}>
                            {formatCurrency(remainingSurplus)}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Proposed Investments</h3>
                    <button className="btn btn-secondary" onClick={addAllocation} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                        <Plus size={16} style={{ marginRight: '6px' }} /> Add Investment
                    </button>
                </div>

                {allocations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {allocations.map((item) => (
                            <div key={item.id} className="grid" style={{ 
                                gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1fr auto', 
                                gap: '1rem', 
                                alignItems: 'end',
                                background: 'var(--bg-main)',
                                padding: '1.25rem',
                                borderRadius: '12px',
                                border: '1px solid var(--border)'
                            }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Investment Name</label>
                                    <input 
                                        type="text" 
                                        value={item.name} 
                                        onChange={(e) => updateAllocation(item.id, 'name', e.target.value)}
                                        placeholder="e.g. Nifty Index Fund"
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Type</label>
                                    <select 
                                        value={item.type} 
                                        onChange={(e) => updateAllocation(item.id, 'type', e.target.value)}
                                    >
                                        <option value="SIP">SIP</option>
                                        <option value="Lumpsum">Lumpsum</option>
                                        <option value="Gold">Gold</option>
                                        <option value="PPF">PPF</option>
                                        <option value="Equity">Direct Equity</option>
                                        <option value="FD">Fixed Deposit</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Amount (Annual)</label>
                                    <input 
                                        type="number" 
                                        value={item.amount} 
                                        onChange={(e) => updateAllocation(item.id, 'amount', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>CAGR (%)</label>
                                    <input 
                                        type="number" 
                                        value={item.expectedReturn} 
                                        onChange={(e) => updateAllocation(item.id, 'expectedReturn', e.target.value)}
                                        placeholder="12"
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Start Year</label>
                                    <input 
                                        type="number" 
                                        value={item.startYear} 
                                        onChange={(e) => updateAllocation(item.id, 'startYear', e.target.value)}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Duration (Yrs)</label>
                                    <input 
                                        type="number" 
                                        value={item.duration} 
                                        onChange={(e) => updateAllocation(item.id, 'duration', e.target.value)}
                                    />
                                </div>
                                <button 
                                    onClick={() => removeAllocation(item.id)}
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
                        padding: '3rem', 
                        border: '2px dashed var(--border)', 
                        borderRadius: '12px',
                        color: 'var(--text-muted)'
                    }}>
                        <Wallet size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No investments planned yet. Start allocating your {formatCurrency(netInvestibleSurplus)} annual surplus.</p>
                        <button className="btn btn-secondary" onClick={addAllocation} style={{ marginTop: '1rem' }}>
                            <Plus size={16} /> Add First Investment
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back to Journey
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={onNext} 
                    disabled={remainingSurplus < -100} // Small tolerance for rounding
                    title={remainingSurplus < -100 ? "You have overallocated your surplus" : ""}
                >
                    Proceed to Portfolio Growth
                </button>
            </div>
        </div>
    );
};

export default AllocationModule;
