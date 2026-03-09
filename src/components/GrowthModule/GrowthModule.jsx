import React, { useMemo } from 'react';
import { TrendingUp, BarChart3, ArrowDownCircle, ArrowUpCircle, Info } from 'lucide-react';
import { calculateGrowthProjections } from './GrowthLogic';

const GrowthModule = ({ 
    familyMembers, 
    assetCategories, 
    expenseCategories, 
    allocations, 
    goals, 
    onNext, 
    onBack 
}) => {
    
    const projections = useMemo(() => {
        return calculateGrowthProjections({
            familyMembers,
            assetCategories,
            expenseCategories,
            allocations,
            goals
        });
    }, [familyMembers, assetCategories, expenseCategories, allocations, goals]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    if (!projections || projections.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Please ensure you have profile details and assets entered to see growth projections.</p>
                <button className="btn btn-secondary" onClick={onBack}>Back</button>
            </div>
        );
    }

    const currentYearData = projections[0];
    const finalYearData = projections[projections.length - 1];

    return (
        <div className="growth-module fade-in">
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                    <BarChart3 size={24} className="text-primary" />
                    <h2 style={{ margin: 0 }}>Step 10: Portfolio Growth Tracker</h2>
                </div>
                
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Track how your entire portfolio grows over time, including current assets, ongoing savings, and new surplus allocations.
                </p>

                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                    <div className="stat-card" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Current Portfolio Value</span>
                            <ArrowUpCircle size={20} className="text-success" />
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)' }}>{formatCurrency(currentYearData.openingBalance)}</div>
                    </div>
                    
                    <div className="stat-card" style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Projected Retirement Corpus</span>
                            <TrendingUp size={20} className="text-primary" />
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(finalYearData.closingBalance)}</div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="journey-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-main)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid var(--border)' }}>Year</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Opening Balance</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>New Investments</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Appreciation</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)' }}>Withdrawals</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid var(--border)', background: 'rgba(52, 211, 153, 0.05)' }}>Closing Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projections.map((row) => (
                                <tr key={row.year} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem', fontWeight: 600 }}>{row.year}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatCurrency(row.openingBalance)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>+ {formatCurrency(row.newInvestments)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--primary)' }}>+ {formatCurrency(row.growth)}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#ef4444' }}>
                                        {row.withdrawals > 0 ? `- ${formatCurrency(row.withdrawals)}` : '—'}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, background: 'rgba(52, 211, 153, 0.05)' }}>
                                        {formatCurrency(row.closingBalance)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '8px', color: 'var(--text-muted)', fontSize: '0.875rem', alignItems: 'flex-start' }}>
                    <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ margin: 0 }}>
                        Growth is calculated based on current asset allocations and specified CAGR. Withdrawals are deducted to fund the goals defined in the Goals module.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button className="btn btn-secondary" onClick={onBack}>
                    Back to Allocation
                </button>
                <button className="btn btn-primary" onClick={onNext}>
                    Proceed to Goal Roadmap
                </button>
            </div>
        </div>
    );
};

export default GrowthModule;
