import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

const JourneyTable = ({ projections }) => {
    const [selectedRow, setSelectedRow] = useState(null);
    const popoverRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setSelectedRow(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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
                            <td style={{ position: 'relative' }}>
                                <button 
                                    className="outflow-btn"
                                    onClick={() => setSelectedRow(selectedRow === `outflow-${idx}` ? null : `outflow-${idx}`)}
                                >
                                    {formatCurrency(row.totalOutflow)}
                                </button>
                                
                                {selectedRow === `outflow-${idx}` && (
                                    <div className="breakdown-popover fade-in" ref={popoverRef}>
                                        <div className="breakdown-item">
                                            <span>Household expenses (Inflation adjusted)</span>
                                            <strong>{formatCurrency(row.householdOutflow)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>EMIs</span>
                                            <strong>{formatCurrency(row.emiOutflow)}</strong>
                                        </div>

                                        <div className="breakdown-item">
                                            <span>Education expenses</span>
                                            <strong>{formatCurrency(row.educationExpenses)}</strong>
                                        </div>

                                        {row.journeyAdjustments && row.journeyAdjustments.length > 0 && (
                                            <>
                                                <div className="breakdown-divider"></div>
                                                <div style={{ marginBottom: '0.75rem', fontSize: '0.750rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                    Future Adjustments
                                                </div>
                                                {row.journeyAdjustments.map((adj, i) => (
                                                    <div className="breakdown-item" key={i}>
                                                        <span>{adj.name}</span>
                                                        <strong>{formatCurrency(adj.amount)}</strong>
                                                    </div>
                                                ))}
                                            </>
                                        )}

                                        <div className="breakdown-divider"></div>
                                        <div className="breakdown-total">
                                            <span>Total outflow</span>
                                            <strong>{formatCurrency(row.totalOutflow)}</strong>
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td style={{ fontWeight: 600 }}>{formatCurrency(row.surplusBeforeSaving)}</td>
                            <td style={{ position: 'relative' }}>
                                <button 
                                    className="outflow-btn"
                                    onClick={() => setSelectedRow(selectedRow === `savings-${idx}` ? null : `savings-${idx}`)}
                                >
                                    {formatCurrency(row.savingsAndInvestments)}
                                </button>

                                {selectedRow === `savings-${idx}` && (
                                    <div className="breakdown-popover fade-in" ref={popoverRef}>
                                        <div style={{ marginBottom: '0.75rem', fontSize: '0.750rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            Savings & Investments Breakdown
                                        </div>
                                        <div className="breakdown-item">
                                            <span>Insurance Premiums</span>
                                            <strong>{formatCurrency(row.insurancePremium)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>RD</span>
                                            <strong>{formatCurrency(row.savingsBreakdown.rd)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>FD</span>
                                            <strong>{formatCurrency(row.savingsBreakdown.fd)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>PPF</span>
                                            <strong>{formatCurrency(row.savingsBreakdown.ppf)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>Saving Schemes</span>
                                            <strong>{formatCurrency(row.savingsBreakdown.savingSchemes)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>MFs – SIP</span>
                                            <strong>{formatCurrency(row.savingsBreakdown.mfSip)}</strong>
                                        </div>
                                        <div className="breakdown-item">
                                            <span>Other Saving</span>
                                            <strong>{formatCurrency(row.savingsBreakdown.otherSaving)}</strong>
                                        </div>

                                        <div className="breakdown-divider"></div>
                                        <div className="breakdown-total">
                                            <span>Total Savings</span>
                                            <strong>{formatCurrency(row.savingsAndInvestments)}</strong>
                                        </div>
                                    </div>
                                )}
                            </td>
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

            <style>{`
                .outflow-btn {
                    background: none;
                    border: 1px solid transparent;
                    color: inherit;
                    font: inherit;
                    cursor: pointer;
                    padding: 4px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                    text-decoration: underline dotted var(--primary);
                    text-underline-offset: 4px;
                }

                .outflow-btn:hover {
                    background: rgba(37, 99, 235, 0.1);
                    border-color: var(--primary);
                }

                .breakdown-popover {
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 1000;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    width: 400px;
                    margin-top: 8px;
                    pointer-events: auto;
                }

                .breakdown-item {
                    display: flex;
                    justify-content: space-between;
                    gap: 2rem;
                    margin-bottom: 0.75rem;
                    font-size: 0.875rem;
                    color: var(--text-main);
                    text-align: left;
                }

                .breakdown-item span {
                    color: var(--text-muted);
                    flex: 1;
                }

                .breakdown-divider {
                    height: 1px;
                    background: var(--border);
                    margin: 1rem 0;
                }

                .breakdown-total {
                    display: flex;
                    justify-content: space-between;
                    font-weight: 700;
                    color: var(--primary);
                    font-size: 1rem;
                }

                @media (prefers-color-scheme: dark) {
                    .breakdown-popover {
                        box-shadow: 0 10px 25px rgba(0,0,0,0.4);
                    }
                }
            `}</style>
        </div>
    );
};

export default JourneyTable;
