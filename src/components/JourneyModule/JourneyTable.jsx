import React from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

const JourneyTable = ({ projections }) => {
    if (!projections || projections.length === 0) return null;

    return (
        <div className="journey-table-container" style={{ marginTop: '2rem', overflowX: 'auto' }}>
            <table className="report-table" style={{ width: '100%', minWidth: '1000px' }}>
                <thead>
                    <tr>
                        <th>Year</th>
                        <th>Annual Inflows</th>
                        <th>Annual Outflow</th>
                        <th>Education Expenses</th>
                        <th>Total Outflow</th>
                        <th>Surplus before saving</th>
                        <th>Savings & Investments</th>
                        <th>Net Investible Surplus</th>
                        <th>Goals in Year</th>
                    </tr>
                </thead>
                <tbody>
                    {projections.map((row, idx) => (
                        <tr key={idx}>
                            <td>{row.year}</td>
                            <td>{formatCurrency(row.annualInflow)}</td>
                            <td>{formatCurrency(row.annualOutflow)}</td>
                            <td>{formatCurrency(row.educationExpenses)}</td>
                            <td>{formatCurrency(row.totalOutflow)}</td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(row.surplusBeforeSaving)}</td>
                            <td>{formatCurrency(row.savingsAndInvestments)}</td>
                            <td style={{ 
                                fontWeight: 700, 
                                color: row.netInvestibleSurplus >= 0 ? 'var(--accent)' : '#ef4444' 
                            }}>
                                {formatCurrency(row.netInvestibleSurplus)}
                            </td>
                            <td>
                                {row.goalsInYear.length > 0 ? (
                                    <div className="goals-cell">
                                        {row.goalsInYear.map((g, i) => (
                                            <span key={i} className="goal-badge">{g}</span>
                                        ))}
                                    </div>
                                ) : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <style>{`
                .goal-badge {
                    display: inline-block;
                    background: var(--primary);
                    color: white;
                    font-size: 0.75rem;
                    padding: 2px 8px;
                    border-radius: 12px;
                    margin: 2px;
                }
                .goals-cell {
                    max-width: 200px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }
            `}</style>
        </div>
    );
};

export default JourneyTable;
