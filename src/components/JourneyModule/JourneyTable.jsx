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
                        <th>Income Tax (Approx)</th>
                        <th>Net Inflow after Tax</th>
                        <th>Annual Outflow</th>
                        <th>Insurance Premium</th>
                        <th>Education Expenses</th>
                        <th>Total Outflow</th>
                        <th>Surplus before saving</th>
                        <th>Savings & Investments</th>
                        <th>Net Investible Surplus</th>
                    </tr>
                </thead>
                <tbody>
                    {projections.map((row, idx) => (
                        <tr key={idx}>
                            <td>{row.year}</td>
                            <td>{formatCurrency(row.annualInflow)}</td>
                            <td style={{ color: '#ef4444' }}>{formatCurrency(row.approxTax)}</td>
                            <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{formatCurrency(row.netInflowAfterTax)}</td>
                            <td>{formatCurrency(row.annualOutflow)}</td>
                            <td>{formatCurrency(row.insurancePremium)}</td>
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default JourneyTable;
