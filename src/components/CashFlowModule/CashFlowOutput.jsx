import React from 'react';
import { Wallet, CreditCard, PiggyBank } from 'lucide-react';
import { formatCurrency } from './CashFlowLogic';

const CashFlowOutput = ({ results }) => {
    // We categorize the granular expenseBreakdown into 3 buckets: 
    // Needs (EMIs, Insurance, Rent, Grocery, Medical)
    // Wants (Lifestyle, Travel)
    // Savings (Savings + Disposable)
    
    let needsSum = 0;
    let wantsSum = 0;
    const needsItems = [];
    const wantsItems = [];

    results.expenseBreakdown.forEach(item => {
        if (item.name.includes('Lifestyle') || item.name.includes('Travel')) {
            wantsSum += item.value;
            wantsItems.push(item);
        } else if (item.category !== 'Savings & Investments') {
            needsSum += item.value;
            needsItems.push(item);
        }
    });

    const savingsSum = results.totalSavings + results.disposableIncome; // total surplus essentially
    
    // Percentages
    const income = results.totalIncome || 1;
    const needsPct = (needsSum / income) * 100;
    const wantsPct = (wantsSum / income) * 100;
    const savingsPct = (savingsSum / income) * 100;

    return (
        <div className="cash-flow-output fade-in" style={{ marginTop: '2rem' }}>
            
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--color-1)', marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
                Cash Flow <span style={{ fontWeight: 400, color: 'var(--text-main)', marginLeft: '0.5rem' }}>Summary</span>
            </h1>

            {/* Top Metrics Row */}
            <div className="metrics-row">
                <div className="metric-card card-income">
                    <div className="metric-icon-box">
                        <Wallet size={24} />
                    </div>
                    <div className="metric-data">
                        <h3>Total Inflow</h3>
                        <div className="amount">{formatCurrency(results.totalIncome)}</div>
                    </div>
                </div>

                <div className="metric-card card-expense">
                    <div className="metric-icon-box">
                        <CreditCard size={24} />
                    </div>
                    <div className="metric-data">
                        <h3>Total Outflow</h3>
                        <div className="amount">{formatCurrency(results.totalExpenses)}</div>
                    </div>
                </div>

                <div className="metric-card card-surplus">
                    <div className="metric-icon-box">
                        <PiggyBank size={24} />
                    </div>
                    <div className="metric-data">
                        <h3 style={{ color: 'var(--color-1)' }}>Net Surplus</h3>
                        <div className="amount">{formatCurrency(results.surplus)}</div>
                    </div>
                </div>
            </div>

            {/* Expense Breakdown */}
            <div className="breakdown-card">
                <div className="breakdown-header">
                    <h2>Allocation Breakdown</h2>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Target: 50/30/20 Rule
                    </div>
                </div>

                {/* Horizontal Stacked Bar */}
                <div className="master-bar">
                    <div className="segment-essential" style={{ width: `${needsPct}%` }}></div>
                    <div className="segment-lifestyle" style={{ width: `${wantsPct}%` }}></div>
                    <div className="segment-surplus" style={{ width: `${savingsPct}%` }}></div>
                </div>

                <div className="segment-grid">
                    
                    {/* Needs */}
                    <div className="segment-detail detail-essential">
                        <div className="segment-top">
                            <span className="segment-title" style={{ color: 'var(--color-2)' }}>Needs / Essential</span>
                            <span className="segment-percent" style={{ color: 'var(--color-2)' }}>{needsPct.toFixed(1)}%</span>
                        </div>
                        <div className="segment-amount">{formatCurrency(needsSum)}</div>
                        <div className="item-list">
                            <div className="item-row"><span>Household & Living</span> <span>{formatCurrency(results.categorySums.household - wantsSum)}</span></div>
                            <div className="item-row"><span>EMIs</span> <span>{formatCurrency(results.categorySums.emi)}</span></div>
                            <div className="item-row"><span>Insurance</span> <span>{formatCurrency(results.categorySums.insurance)}</span></div>
                        </div>
                    </div>

                    {/* Wants */}
                    <div className="segment-detail detail-lifestyle">
                        <div className="segment-top">
                            <span className="segment-title" style={{ color: 'var(--color-3)' }}>Wants / Lifestyle</span>
                            <span className="segment-percent" style={{ color: 'var(--color-3)' }}>{wantsPct.toFixed(1)}%</span>
                        </div>
                        <div className="segment-amount">{formatCurrency(wantsSum)}</div>
                        <div className="item-list">
                            {wantsItems.length > 0 ? wantsItems.map((item, idx) => (
                                <div className="item-row" key={idx}>
                                    <span title={item.name} style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.name.split('(')[0]}</span> 
                                    <span>{formatCurrency(item.value)}</span>
                                </div>
                            )) : (
                                <div className="item-row"><span>No lifestyle expenses logged.</span></div>
                            )}
                        </div>
                    </div>

                    {/* Savings */}
                    <div className="segment-detail detail-surplus">
                        <div className="segment-top">
                            <span className="segment-title" style={{ color: 'var(--color-5)' }}>Savings / Surplus</span>
                            <span className="segment-percent" style={{ color: 'var(--color-5)' }}>{Math.max(0, savingsPct).toFixed(1)}%</span>
                        </div>
                        <div className="segment-amount">{formatCurrency(Math.max(0, savingsSum))}</div>
                        <div className="item-list">
                            <div className="item-row"><span>Active Investments</span> <span>{formatCurrency(results.totalSavings)}</span></div>
                            <div className="item-row">
                                <span style={{ color: results.disposableIncome < 0 ? '#ef4444' : 'inherit' }}>Unallocated Surplus</span> 
                                <span style={{ color: results.disposableIncome < 0 ? '#ef4444' : 'var(--text-main)' }}>{formatCurrency(results.disposableIncome)}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                .metrics-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .metric-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    position: relative;
                    overflow: hidden;
                }

                .metric-icon-box {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .card-income .metric-icon-box { background: rgba(0, 169, 242, 0.1); color: var(--color-2); }
                .card-expense .metric-icon-box { background: rgba(23, 45, 157, 0.1); color: var(--color-1); }
                .card-surplus .metric-icon-box { background: rgba(120, 124, 254, 0.1); color: var(--color-3); }
                
                .card-surplus {
                    background: linear-gradient(135deg, white 0%, #eef2ff 100%);
                    border: 1px solid #c7d2fe;
                }

                .metric-data h3 {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    font-weight: 500;
                    margin-bottom: 0.25rem;
                }

                .metric-data .amount {
                    font-size: 1.75rem;
                    font-weight: 700;
                    color: var(--text-main);
                }

                .breakdown-card {
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                    border: 1px solid var(--border);
                }

                .breakdown-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .breakdown-header h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                }

                .master-bar {
                    height: 24px;
                    width: 100%;
                    border-radius: 12px;
                    background: var(--border);
                    display: flex;
                    overflow: hidden;
                    margin-bottom: 2rem;
                }

                .segment-essential { background: var(--color-2); transition: width 0.5s ease-out; }
                .segment-lifestyle { background: var(--color-3); transition: width 0.5s ease-out; }
                .segment-surplus { background: var(--color-5); transition: width 0.5s ease-out; }

                .segment-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                }

                .segment-detail {
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border);
                    position: relative;
                }

                .segment-detail::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 4px;
                    border-radius: 12px 12px 0 0;
                }

                .detail-essential::before { background: var(--color-2); }
                .detail-lifestyle::before { background: var(--color-3); }
                .detail-surplus::before { background: var(--color-5); }
                
                .detail-essential { background: rgba(0, 169, 242, 0.03); }
                .detail-lifestyle { background: rgba(120, 124, 254, 0.03); }
                .detail-surplus { background: rgba(0, 226, 224, 0.03); }

                .segment-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .segment-title {
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                .segment-percent {
                    font-size: 0.9rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 12px;
                    background: white;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }

                .segment-amount {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 1rem;
                }

                .item-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .item-row {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    border-bottom: 1px dashed var(--border);
                    padding-bottom: 0.5rem;
                    gap: 1rem;
                }
                
                .item-row span:last-child {
                    font-weight: 600;
                    color: var(--text-main);
                    flex-shrink: 0;
                }
            `}</style>
        </div>
    );
};

export default CashFlowOutput;
