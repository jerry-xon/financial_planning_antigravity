import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { formatCurrency } from './CashFlowLogic';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CashFlowOutput = ({ results }) => {
    return (
        <div className="card fade-in" style={{ marginTop: '2rem' }}>
            <h2>Cash Flow Summary</h2>

            <div className="grid">
                <div className="stat-card">
                    <label>Monthly Surplus (A)</label>
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: results.surplus > 0 ? 'var(--accent)' : '#ef4444'
                    }}>
                        {results.surplus > 0 ? '+' : ''}{formatCurrency(results.surplus)}
                    </p>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <label>Monthly Savings (B)</label>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                        {formatCurrency(results.totalSavings)}
                    </p>
                </div>

                <div className="stat-card" style={{ background: 'var(--bg-main)', border: '2px solid var(--border)' }}>
                    <label>Disposable Income (A - B)</label>
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: results.disposableIncome >= 0 ? 'var(--accent)' : '#ef4444'
                    }}>
                        {formatCurrency(results.disposableIncome)}
                    </p>
                </div>

                <div className="stat-card">
                    <label>Surplus Rate</label>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {results.surplusRate.toFixed(1)}%
                    </p>
                </div>

                <div className="stat-card">
                    <label>Disp. Income Rate</label>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: results.disposableIncomeRate >= 0 ? 'var(--accent)' : '#ef4444' }}>
                        {results.disposableIncomeRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            <div className="calculation-breakdown card" style={{ background: 'var(--bg-main)', marginTop: '2rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Complete Calculation Breakdown</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>(+) Total Monthly Income</span>
                        <strong>{formatCurrency(results.totalIncome)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>(-) Household & Lifestyle Expenses (A)</span>
                        <strong style={{ color: '#ef4444' }}>{formatCurrency(results.categorySums.household)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>(-) EMIs & Insurance (B)</span>
                        <strong style={{ color: '#ef4444' }}>{formatCurrency(results.categorySums.emi)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>(=) Monthly Surplus</span>
                        <strong style={{ fontSize: '1.25rem', color: results.surplus >= 0 ? 'var(--accent)' : '#ef4444' }}>
                            {formatCurrency(results.surplus)}
                        </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span>(-) Savings & Investments (C)</span>
                        <strong style={{ color: 'var(--primary)' }}>{formatCurrency(results.totalSavings)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px dashed var(--border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>(=) Monthly Disposable Income Available</span>
                        <strong style={{ fontSize: '1.25rem', color: results.disposableIncome >= 0 ? 'var(--accent)' : '#ef4444' }}>
                            {formatCurrency(results.disposableIncome)}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ height: '350px' }}>
                    <h4>Expense & Savings Distribution</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={results.expenseBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {results.expenseBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="insights-section">
                    <h4>Key Insights & Ratios</h4>
                    <div style={{ marginTop: '1rem' }}>
                        <div className="stat-mini">
                            <span>Household & Lifestyle Ratio:</span>
                            <strong>{results.householdRatio.toFixed(1)}%</strong>
                        </div>
                        <div className="stat-mini">
                            <span>EMIs & Insurance Ratio:</span>
                            <strong>{results.emiRatio.toFixed(1)}%</strong>
                        </div>
                        <div className="stat-mini">
                            <span>Savings & Investments Ratio:</span>
                            <strong>{results.savingsRatio.toFixed(1)}%</strong>
                        </div>

                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

                        {results.disposableIncome > 0 ? (
                            <div className="insight-card healthy">
                                <TrendingUp size={20} color="#10b981" />
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Investment Opportunity!</p>
                                    <p>You have a surplus of <strong>{formatCurrency(results.disposableIncome)}</strong>. We suggest allocating these funds into diversified investment avenues to build wealth and reach your goals faster.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="insight-card critical">
                                <TrendingDown size={20} color="#ef4444" />
                                <div>
                                    <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Action Required!</p>
                                    <p>Your current savings exceed your monthly surplus. We suggest reviewing and controlling your lifestyle expenses or consolidating high-interest loans to increase your investable cash flow.</p>
                                </div>
                            </div>
                        )}

                        <hr style={{ margin: '1rem 0', borderColor: 'var(--border)' }} />

                        {results.isHealthy && (
                            <div className="insight-card healthy" style={{ opacity: 0.8 }}>
                                <Info size={20} color="#10b981" />
                                <p>Your surplus rate is healthy ({results.surplusRate.toFixed(1)}%). You have sufficient room for growth.</p>
                            </div>
                        )}
                        {!results.isHealthy && !results.isCritical && (
                            <div className="insight-card warn">
                                <Info size={20} color="#f59e0b" />
                                <p>A surplus rate below 20% indicates tight cash flow. Review discretionary spending.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
        .stat-mini {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-size: 0.9375rem;
        }
        .insight-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          align-items: flex-start;
          font-size: 0.875rem;
        }
        .healthy { background: #ecfdf5; border: 1px solid #10b981; color: #065f46; }
        .warn { background: #fffbeb; border: 1px solid #f59e0b; color: #92400e; }
        .critical { background: #fef2f2; border: 1px solid #ef4444; color: #991b1b; }
      `}</style>
        </div>
    );
};

export default CashFlowOutput;
