import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { Shield, TrendingUp, AlertCircle, Briefcase, Home, Activity } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b', '#0ea5e9', '#f97316'];

const AssetOutput = ({ results }) => {
    // Calculate additional insights
    const debtToAssetRatio = (results.totalLiabilities / (results.totalAssets || 1)) * 100;
    
    // Liquid assets: Cash + Equities + MFs + FDs (roughly)
    const liquidAssets = results.assetBreakdown
        .filter(item => ['Liquid Assets', 'Investments'].includes(item.category))
        .reduce((sum, item) => sum + item.value, 0);
    
    const liquidityRatio = (liquidAssets / (results.totalAssets || 1)) * 100;

    return (
        <div className="asset-output card fade-in" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>Net Worth Statement</h2>
                <div style={{ fontSize: '0.875rem', padding: '0.4rem 1rem', background: 'var(--bg-main)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    As of March 2026
                </div>
            </div>

            <div className="summary-grid">
                <div className="stat-card" style={{ borderLeft: '4px solid var(--accent)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Briefcase size={16} color="var(--accent)" />
                        <label>Total Assets</label>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {formatCurrency(results.totalAssets)}
                    </p>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <AlertCircle size={16} color="#ef4444" />
                        <label>Total Liabilities</label>
                    </div>
                    <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ef4444' }}>
                        {formatCurrency(results.totalLiabilities)}
                    </p>
                </div>

                <div className="stat-card nw-highlight">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <TrendingUp size={16} color="white" />
                        <label style={{ color: 'rgba(255,255,255,0.8)' }}>Current Net Worth</label>
                    </div>
                    <p style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>
                        {formatCurrency(results.netWorth)}
                    </p>
                </div>
            </div>

            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2.5rem', marginTop: '2rem' }}>
                <div className="analysis-section">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} color="var(--primary)" />
                        Asset Composition
                    </h4>
                    <div style={{ height: '350px', background: 'var(--bg-main)', borderRadius: '12px', padding: '1rem', marginTop: '1rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={results.allocation}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {results.allocation.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="insights-section">
                    <h4>Financial Health Indicators</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                        {/* Debt-to-Asset Ratio */}
                        <div className="health-stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Debt-to-Asset Ratio</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: debtToAssetRatio > 40 ? '#ef4444' : '#10b981' }}>
                                    {debtToAssetRatio.toFixed(1)}%
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ 
                                    width: `${Math.min(debtToAssetRatio, 100)}%`,
                                    backgroundColor: debtToAssetRatio > 40 ? '#ef4444' : '#10b981'
                                }}></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                {debtToAssetRatio > 40 
                                    ? "High leverage. Aim to reduce debt below 40% of total assets." 
                                    : "Healthy debt levels. Your assets significantly outweigh your liabilities."}
                            </p>
                        </div>

                        {/* Liquidity Check */}
                        <div className="health-stat-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Liquidity Ratio</span>
                                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: liquidityRatio < 20 ? '#f59e0b' : '#3b82f6' }}>
                                    {liquidityRatio.toFixed(1)}%
                                </span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ 
                                    width: `${Math.min(liquidityRatio, 100)}%`,
                                    backgroundColor: liquidityRatio < 20 ? '#f59e0b' : '#3b82f6'
                                }}></div>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                {liquidityRatio < 20 
                                    ? "Low liquidity. Ensure you have enough accessible funds for emergencies." 
                                    : "Good liquidity mix. You have a balanced blend of liquid and fixed assets."}
                            </p>
                        </div>

                        {/* Pro-tip/Actionable Insight */}
                        <div className="pro-tip-card">
                            <Shield size={20} color="var(--primary)" />
                            <div>
                                <strong style={{ fontSize: '0.875rem' }}>Expert Strategy:</strong>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    {results.netWorth > 0 
                                        ? `Your net worth is positive. Diversify into ${results.allocation.find(a => a.name === 'Investments')?.percentage < 20 ? 'Equity' : 'Fixed Income'} to further optimize long-term growth.`
                                        : "Focus on consolidating high-interest debt and building a small emergency fund first."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .summary-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                
                .stat-card {
                    padding: 1.5rem;
                    background: var(--bg-card);
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-sm);
                }
                
                .nw-highlight {
                    background: linear-gradient(135deg, var(--primary) 0%, #1e40af 100%);
                    border: none;
                }
                
                .health-stat-card {
                    padding: 1rem;
                    background: var(--bg-main);
                    border-radius: 10px;
                    border: 1px solid var(--border);
                }
                
                .progress-bar {
                    height: 8px;
                    background: var(--border);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    transition: width 0.5s ease-out;
                }
                
                .pro-tip-card {
                    display: flex;
                    gap: 1rem;
                    padding: 1.25rem;
                    background: #eff6ff;
                    border: 1px solid #bfdbfe;
                    border-radius: 12px;
                    margin-top: 1rem;
                }
                
                @media (max-width: 850px) {
                    .content-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default AssetOutput;
