import React from 'react';
import { calculateFamilyProfile } from '../ProfileModule/ProfileLogic';
import { calculateCashFlow, formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { calculateNetWorth } from '../AssetModule/AssetLogic';
import { categorizeGoals } from '../GoalModule/GoalLogic';
import { Download, Printer, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

const ReportView = ({ familyMembers, income, expenseCategories, assetCategories, liabilityCategories, goals }) => {
    const profileResults = calculateFamilyProfile(familyMembers);
    const cashFlowResults = calculateCashFlow(income, expenseCategories);
    const assetResults = calculateNetWorth(assetCategories, liabilityCategories);

    const validGoals = goals.filter(g => g.yearsToGoal && g.presentValue);
    const goalResults = categorizeGoals(validGoals);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="report-view fade-in">
            <div className="report-header card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-main)', borderBottom: '4px solid var(--primary)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Financial Overview</h1>
                <p className="text-muted">Generated for {familyMembers[0]?.name || 'Valued Client'} • {new Date().toLocaleDateString('en-IN')}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={18} /> Print Plan / Save as PDF
                    </button>
                </div>
            </div>

            <div className="report-dashboard grid" style={{ marginTop: '2rem' }}>
                <div className="card">
                    <h4><TrendingUp size={18} inline="true" /> Financial Standing</h4>
                    <div className="stat-row">
                        <span>Net Worth:</span>
                        <strong>{formatCurrency(assetResults.netWorth)}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Monthly Surplus Rate:</span>
                        <strong style={{ color: cashFlowResults.isHealthy ? 'var(--accent)' : 'var(--primary)' }}>
                            {cashFlowResults.surplusRate.toFixed(1)}%
                        </strong>
                    </div>
                    <div className="stat-row">
                        <span>Disp. Income Rate:</span>
                        <strong style={{ color: cashFlowResults.disposableIncomeRate >= 0 ? 'var(--accent)' : '#ef4444' }}>
                            {cashFlowResults.disposableIncomeRate.toFixed(1)}%
                        </strong>
                    </div>
                    <div className="stat-row">
                        <span>Disposable Income:</span>
                        <strong style={{ color: cashFlowResults.disposableIncome >= 0 ? 'var(--accent)' : '#ef4444' }}>
                            {formatCurrency(cashFlowResults.disposableIncome)}
                        </strong>
                    </div>
                </div>

                <div className="card">
                    <h4><CheckCircle size={18} inline="true" /> Goals Tracked</h4>
                    <div className="stat-row">
                        <span>Total Life Goals:</span>
                        <strong>{validGoals.length}</strong>
                    </div>
                    <div className="stat-row">
                        <span>Total Future Cost:</span>
                        <strong>{formatCurrency(validGoals.reduce((sum, g) => sum + (parseFloat(g.futureCost) || 0), 0))}</strong>
                    </div>
                </div>
            </div>

            <div className="report-sections" style={{ marginTop: '2rem' }}>
                {/* Profile Summary */}
                <section className="report-section card">
                    <h3>1. Family Profile</h3>
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Age</th>
                                <th>Life Stage</th>
                                <th>Education / Retirement</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profileResults.map((m, i) => (
                                <tr key={i}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.relation}</div>
                                    </td>
                                    <td>{m.age} Years</td>
                                    <td>{m.lifeStage}</td>
                                    <td>
                                        {m.relation === 'Child' ? (
                                            <div>
                                                <div>Std: {m.standard || 'N/A'}</div>
                                                {m.annualSchoolFee && <div style={{ fontSize: '0.85rem' }}>Fee: {formatCurrency(m.annualSchoolFee)}/yr</div>}
                                            </div>
                                        ) : (
                                            <div>Retires: {m.retirementYear}</div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* Cash Flow Summary */}
                <section className="report-section card" style={{ marginTop: '1.5rem' }}>
                    <h3>2. Monthly Cash Flow & Ratios</h3>
                    <div className="grid">
                        <div className="summary-box">
                            <label>Total Monthly Income</label>
                            <strong>{formatCurrency(cashFlowResults.totalIncome)}</strong>
                        </div>
                        <div className="summary-box">
                            <label>Total Expenses (A+B)</label>
                            <strong style={{ color: '#ef4444' }}>{formatCurrency(cashFlowResults.totalExpenses)}</strong>
                        </div>
                        <div className="summary-box">
                            <label>Monthly Surplus (A)</label>
                            <strong style={{ color: 'var(--accent)' }}>{formatCurrency(cashFlowResults.surplus)}</strong>
                        </div>
                        <div className="summary-box" style={{ background: 'var(--bg-main)' }}>
                            <label>Disposable Income (A-C)</label>
                            <strong style={{ color: cashFlowResults.disposableIncome >= 0 ? 'var(--accent)' : '#ef4444' }}>
                                {formatCurrency(cashFlowResults.disposableIncome)}
                            </strong>
                        </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <p style={{ fontSize: '0.9rem', margin: 0 }}>
                            <strong>Note:</strong> {cashFlowResults.disposableIncome > 0
                                ? "We suggest allocating these surplus funds in diversified investment avenues to build wealth."
                                : "Your savings exceed your surplus. We suggest controlling lifestyle expenses and saving more to maintain a positive cash flow."}
                        </p>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                        <div className="ratio-item">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Household & Lifestyle Ratio</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{cashFlowResults.householdRatio.toFixed(1)}%</div>
                        </div>
                        <div className="ratio-item">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>EMIs & Insurance Ratio</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{cashFlowResults.emiRatio.toFixed(1)}%</div>
                        </div>
                        <div className="ratio-item">
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Savings & Investments Ratio</span>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{cashFlowResults.savingsRatio.toFixed(1)}%</div>
                        </div>
                    </div>
                </section>

                {/* Assets & Liabilities */}
                <section className="report-section card" style={{ marginTop: '1.5rem' }}>
                    <h3>3. Net Worth Statement</h3>
                    <div className="grid">
                        <div>
                            <h4>Assets</h4>
                            {assetResults.assetBreakdown.map((a, i) => (
                                <div key={i} className="stat-row-mini">
                                    <span>{a.name}</span>
                                    <span>{formatCurrency(a.value)}</span>
                                </div>
                            ))}
                            <div className="stat-row" style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                                <span>Total Assets</span>
                                <strong>{formatCurrency(assetResults.totalAssets)}</strong>
                            </div>
                        </div>
                        <div>
                            <h4>Liabilities</h4>
                            <div className="stat-row-mini">
                                <span>Personal/Home Loans</span>
                                <span>{formatCurrency(assetResults.totalLiabilities)}</span>
                            </div>
                            <div className="stat-row" style={{ borderTop: '1px solid var(--border)', marginTop: '0.5rem' }}>
                                <span>Total Liabilities</span>
                                <strong>{formatCurrency(assetResults.totalLiabilities)}</strong>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Life Goals */}
                <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                    <h3>4. Life Goals Projections</h3>
                    {['short', 'medium', 'long'].map(key => (
                        <div key={key} style={{ marginBottom: '1.5rem' }}>
                            <h4 style={{ textTransform: 'capitalize' }}>{key} Term Goals</h4>
                            {goalResults[key].length === 0 ? <p className="text-muted">None</p> : (
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Goal</th>
                                            <th>Target Year</th>
                                            <th>Present Value</th>
                                            <th>Future Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {goalResults[key].map((g, i) => (
                                            <tr key={i}>
                                                <td>{g.name}</td>
                                                <td>{g.targetYear}</td>
                                                <td>{formatCurrency(g.presentValue)}</td>
                                                <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatCurrency(g.futureCost)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    ))}
                </section>
            </div>

            <style>{`
        .report-view {
          max-width: 1000px;
          margin: 0 auto;
          color: var(--text-main);
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          font-size: 1.1rem;
        }
        .stat-row-mini {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }
        .report-table th {
          text-align: left;
          padding: 12px;
          background: var(--bg-main);
          color: var(--text-muted);
          font-size: 0.8rem;
          text-transform: uppercase;
        }
        .report-table td {
          padding: 12px;
          border-bottom: 1px solid var(--border);
          font-size: 0.95rem;
        }
        .summary-box {
          padding: 1.5rem;
          border: 1px solid var(--border);
          border-radius: 12px;
          text-align: center;
        }
        .summary-box label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }
        .summary-box strong {
          font-size: 1.4rem;
        }
        .ratio-item {
            padding: 1rem;
            background: var(--bg-main);
            border-radius: 8px;
            border-left: 3px solid var(--primary);
        }

        @media print {
          .btn, header, nav, .app-container > header {
            display: none !important;
          }
          .card {
            border: 1px solid #eee !important;
            box-shadow: none !important;
            break-inside: avoid;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .report-view {
            max-width: 100%;
          }
        }
      `}</style>
        </div>
    );
};

export default ReportView;
