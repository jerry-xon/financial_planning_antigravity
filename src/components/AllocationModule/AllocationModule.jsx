import React, { useMemo, useState } from 'react';
import { PieChart, Plus, Trash2, ArrowRight, Wallet, Target, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const AllocationModule = ({ 
    netInvestibleSurplus, 
    allocations, 
    setAllocations, 
    projections = [],
    onNext, 
    onBack 
}) => {
    const currentYear = new Date().getFullYear();
    const [collapsedIds, setCollapsedIds] = useState(new Set());

    const toggleCollapse = (id) => {
        const newCollapsed = new Set(collapsedIds);
        if (newCollapsed.has(id)) {
            newCollapsed.delete(id);
        } else {
            newCollapsed.add(id);
        }
        setCollapsedIds(newCollapsed);
    };

    const addAllocation = () => {
        setAllocations([
            ...allocations,
            { 
                id: Date.now(), 
                type: 'SIP', 
                name: '', 
                amount: '', // This will be monthly for SIP, PPF, NPS and total for others
                startMonth: new Date().getMonth() + 1,
                startYear: currentYear,
                duration: 10,
                expectedReturn: 12
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

    // Derived data for the dynamic table
    const dynamicColumns = useMemo(() => {
        const types = new Set();
        allocations.forEach(a => types.add(a.type));
        return Array.from(types).sort();
    }, [allocations]);

    const isRecurring = (type) => ['SIP', 'PPF', 'NPS'].includes(type);

    return (
        <div className="allocation-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <PieChart size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 9: Investment Allocation</h2>
                </div>

                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Allocate your annual Net Investible Surplus into various investment avenues.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>Proposed Investments</h3>
                </div>

                {allocations.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '3rem' }}>
                        {allocations.map((item, index) => {
                            const recurring = isRecurring(item.type);
                            const isCollapsed = collapsedIds.has(item.id);
                            return (
                                <div key={item.id} style={{ 
                                    background: 'var(--bg-main)',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    marginBottom: '0.5rem'
                                }}>
                                    {/* Form Header */}
                                    <div style={{ 
                                        padding: '0.75rem 1.25rem',
                                        background: isCollapsed ? 'transparent' : 'rgba(37, 99, 235, 0.05)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                                        cursor: 'pointer'
                                    }} onClick={() => toggleCollapse(item.id)}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ 
                                                width: '24px', 
                                                height: '24px', 
                                                borderRadius: '50%', 
                                                background: 'var(--primary)', 
                                                color: 'white', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold'
                                            }}>
                                                {index + 1}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>
                                                {item.name || `Investment ${index + 1}`}
                                                {item.type && <span style={{ marginLeft: '8px', opacity: 0.6, fontWeight: 400, fontSize: '0.85rem' }}>({item.type})</span>}
                                            </span>
                                            {isCollapsed && item.amount > 0 && (
                                                <span style={{ marginLeft: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                                                    {formatCurrency(recurring ? item.amount / 12 : item.amount)}
                                                    {recurring ? ' /mo' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeAllocation(item.id); }}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: '#ef4444', 
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    opacity: 0.8
                                                }}
                                                title="Remove"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleCollapse(item.id); }}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    color: 'var(--text-muted)', 
                                                    cursor: 'pointer',
                                                    padding: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Form Body */}
                                    {!isCollapsed && (
                                        <div className="grid" style={{ 
                                            gridTemplateColumns: '1.5fr 1.5fr 1.5fr 1fr 1fr 1fr', 
                                            gap: '1rem', 
                                            alignItems: 'end',
                                            padding: '1.25rem'
                                        }}>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Label</label>
                                                <input 
                                                    type="text" 
                                                    value={item.name} 
                                                    onChange={(e) => updateAllocation(item.id, 'name', e.target.value)}
                                                    placeholder="e.g. Retirement SIP"
                                                />
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Type</label>
                                                <select 
                                                    value={item.type} 
                                                    onChange={(e) => updateAllocation(item.id, 'type', e.target.value)}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                                >
                                                    <option value="SIP">SIP</option>
                                                    <option value="Lumpsum">Lumpsum</option>
                                                    <option value="Gold">Gold</option>
                                                    <option value="PPF">PPF</option>
                                                    <option value="NPS">NPS</option>
                                                    <option value="Equity">Direct Equity</option>
                                                    <option value="ETF">ETF</option>
                                                    <option value="FD">Fixed Deposit</option>
                                                    <option value="Other Investment">Other Investment</option>
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>{recurring ? 'Monthly Amount' : 'Amount'}</label>
                                                <input 
                                                    type="number" 
                                                    value={recurring ? (item.amount / 12 || '') : item.amount} 
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        updateAllocation(item.id, 'amount', recurring ? val * 12 : val);
                                                    }}
                                                    placeholder="0"
                                                />
                                                {recurring && (
                                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                                        Yearly: {formatCurrency(item.amount)}
                                                    </small>
                                                )}
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Start Month</label>
                                                <select 
                                                    value={item.startMonth} 
                                                    onChange={(e) => updateAllocation(item.id, 'startMonth', parseInt(e.target.value))}
                                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => (
                                                        <option key={i + 1} value={i + 1}>
                                                            {new Date(0, i).toLocaleString('default', { month: 'short' })}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="input-group" style={{ marginBottom: 0 }}>
                                                <label>Start Year</label>
                                                <input 
                                                    type="number" 
                                                    value={item.startYear} 
                                                    onChange={(e) => updateAllocation(item.id, 'startYear', parseInt(e.target.value))}
                                                />
                                            </div>
                                            {recurring ? (
                                                <div className="input-group" style={{ marginBottom: 0 }}>
                                                    <label>Duration (Yrs)</label>
                                                    <input 
                                                        type="number" 
                                                        value={item.duration} 
                                                        onChange={(e) => updateAllocation(item.id, 'duration', parseInt(e.target.value))}
                                                    />
                                                </div>
                                            ) : (
                                                <div style={{ minWidth: '80px' }}></div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                            <button className="btn btn-secondary" onClick={addAllocation} style={{ width: '100%', borderStyle: 'dashed', background: 'transparent' }}>
                                <Plus size={16} style={{ marginRight: '6px' }} /> Add Another Investment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '3rem', 
                        border: '2px dashed var(--border)', 
                        borderRadius: '12px',
                        color: 'var(--text-muted)',
                        marginBottom: '3rem'
                    }}>
                        <Wallet size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No investments planned yet. Start allocating your {formatCurrency(netInvestibleSurplus)} annual surplus.</p>
                        <button className="btn btn-secondary" onClick={addAllocation} style={{ marginTop: '1rem' }}>
                            <Plus size={16} /> Add First Investment
                        </button>
                    </div>
                )}

                {/* Timeline Table */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Yearly Allocation Timeline</h3>
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '8px' }}>
                        <table className="summary-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead style={{ background: 'var(--bg-main)' }}>
                                <tr>
                                    <th rowSpan="2" style={{ border: '1px solid var(--border)', padding: '0.75rem' }}>Year</th>
                                    <th colSpan="2" style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'center' }}>Investible Surplus</th>
                                    {dynamicColumns.map(col => (
                                        <th key={col} rowSpan="2" style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'center' }}>{col}</th>
                                    ))}
                                    <th colSpan="2" style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'center' }}>Unallocated Surplus</th>
                                </tr>
                                <tr>
                                    <th style={{ border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>Yearly</th>
                                    <th style={{ border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>Monthly</th>
                                    <th style={{ border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>Yearly</th>
                                    <th style={{ border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'right' }}>Monthly</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projections.slice(0, 15).map((row) => {
                                    const allocationsByType = {};
                                    dynamicColumns.forEach(type => {
                                        allocationsByType[type] = row.activeAllocations
                                            ?.filter(a => a.type === type)
                                            .reduce((sum, a) => sum + (a.impactThisYear || 0), 0) || 0;
                                    });

                                    return (
                                        <tr key={row.year}>
                                            <td style={{ border: '1px solid var(--border)', padding: '0.75rem', fontWeight: 600 }}>{row.year}</td>
                                            <td style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'right' }}>{formatCurrency(row.netInvestibleSurplus)}</td>
                                            <td style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>{formatCurrency(row.netInvestibleSurplus / 12)}</td>
                                            {dynamicColumns.map(type => (
                                                <td key={type} style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'right', color: allocationsByType[type] > 0 ? 'var(--primary)' : 'inherit' }}>
                                                    {allocationsByType[type] > 0 ? formatCurrency(allocationsByType[type]) : '-'}
                                                </td>
                                            ))}
                                            <td style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: row.unallocatedSurplus < 0 ? '#ef4444' : 'var(--success)' }}>
                                                {formatCurrency(row.unallocatedSurplus)}
                                            </td>
                                            <td style={{ border: '1px solid var(--border)', padding: '0.75rem', textAlign: 'right', color: row.unallocatedSurplus < 0 ? '#ef4444' : 'var(--text-muted)' }}>
                                                {formatCurrency(row.unallocatedSurplus / 12)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>* Showing next 15 years of projection.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back to Journey
                </button>
                <button 
                    className="btn btn-primary" 
                    onClick={onNext} 
                >
                    Proceed to Portfolio Growth
                </button>
            </div>
        </div>
    );
};

export default AllocationModule;
