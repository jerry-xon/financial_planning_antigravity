import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { Shield, TrendingUp, AlertCircle } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

const AssetOutput = ({ results }) => {
    return (
        <div className="asset-output card fade-in" style={{ marginTop: '2rem' }}>
            <h2>Net Worth Statement</h2>

            <div className="grid" style={{ marginBottom: '2rem' }}>
                <div className="stat-card" style={{ borderBottom: '4px solid var(--accent)' }}>
                    <label>Total Assets</label>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                        {formatCurrency(results.totalAssets)}
                    </p>
                </div>

                <div className="stat-card" style={{ borderBottom: '4px solid #ef4444' }}>
                    <label>Total Liabilities</label>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444' }}>
                        {formatCurrency(results.totalLiabilities)}
                    </p>
                </div>

                <div className="stat-card" style={{ borderBottom: '4px solid var(--primary)', background: 'var(--bg-main)' }}>
                    <label>Current Net Worth</label>
                    <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                        {formatCurrency(results.netWorth)}
                    </p>
                </div>
            </div>

            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div style={{ height: '350px' }}>
                    <h4>Asset Allocation</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={results.allocation}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {results.allocation.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="allocation-details">
                    <h4>Allocation Breakdown</h4>
                    <div style={{ marginTop: '1rem' }}>
                        {results.allocation.map((item, index) => (
                            <div key={index} className="allocation-row">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: COLORS[index % COLORS.length] }}></div>
                                    <span>{item.name}</span>
                                </div>
                                <strong>{item.percentage.toFixed(1)}%</strong>
                            </div>
                        ))}
                    </div>

                    <div className="net-worth-insight" style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'var(--bg-main)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            < Shield size={20} color="var(--primary)" />
                            <div>
                                <strong style={{ fontSize: '0.875rem' }}>Financial Health Check:</strong>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {results.totalLiabilities > results.totalAssets * 0.5
                                        ? "Warning: Your debt is more than 50% of your assets. Focus on debt reduction."
                                        : "Your debt-to-asset ratio is healthy. You have a strong foundation for wealth growth."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .allocation-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.9375rem;
        }
      `}</style>
        </div>
    );
};

export default AssetOutput;
