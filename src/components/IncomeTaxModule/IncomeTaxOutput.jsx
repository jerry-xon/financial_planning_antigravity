import React from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';

const IncomeTaxOutput = ({ results }) => {
    if (!results) return null;

    return (
        <div className="income-tax-output" style={{ marginTop: '1rem' }}>
            <div className="summary-card" style={{ 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-main) 100%)', 
                borderRadius: '12px', 
                border: '1px solid var(--border)',
                marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Net Annual Tax Payable</label>
                    <strong style={{ fontSize: '1.75rem', color: results.finalTax > 0 ? '#ef4444' : 'var(--accent)' }}>
                        {formatCurrency(results.finalTax)}
                    </strong>
                </div>
            </div>

            <table className="tax-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <tbody>
                    <tr>
                        <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>Gross Annual Income</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(results.grossTotalIncome)}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.75rem 0', color: 'var(--text-muted)' }}>(-) Standard Deduction</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', color: '#ef4444' }}>{formatCurrency(results.standardDeduction)}</td>
                    </tr>
                    <tr style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 700 }}>Taxable Income</td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(results.taxableIncome)}</td>
                    </tr>
                    
                    {/* Slab Details (Optional expansion or just total) */}
                    <tr>
                        <td colSpan="2" style={{ padding: '1rem 0 0.5rem 0', fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.5px' }}>
                            Slab-wise Breakdown
                        </td>
                    </tr>
                    <tr className="slab-row">
                        <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>0 - 4L (0%)</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>₹0</td>
                    </tr>
                    <tr className="slab-row">
                        <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>4L - 8L (5%)</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{formatCurrency(results.slabs.t2)}</td>
                    </tr>
                    <tr className="slab-row">
                        <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>8L - 12L (10%)</td>
                        <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{formatCurrency(results.slabs.t3)}</td>
                    </tr>
                    {results.taxableIncome > 1200000 && (
                        <>
                            <tr className="slab-row">
                                <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>12L - 16L (15%)</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{formatCurrency(results.slabs.t4)}</td>
                            </tr>
                            <tr className="slab-row">
                                <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>16L - 20L (20%)</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{formatCurrency(results.slabs.t5)}</td>
                            </tr>
                            <tr className="slab-row">
                                <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>20L - 24L (25%)</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{formatCurrency(results.slabs.t6)}</td>
                            </tr>
                            <tr className="slab-row">
                                <td style={{ padding: '0.5rem 0', fontSize: '0.85rem' }}>Above 24L (30%)</td>
                                <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>{formatCurrency(results.slabs.t7)}</td>
                            </tr>
                        </>
                    )}

                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                        <td style={{ padding: '1rem 0' }}>Total Tax (Before Rebate)</td>
                        <td style={{ padding: '1rem 0', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(results.totalTaxBeforeRebate)}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.75rem 0' }}>(-) Section 87A Rebate</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right', color: 'var(--accent)' }}>{formatCurrency(results.rebate87A)}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: '0.75rem 0' }}>(+) 4% Health & Cess</td>
                        <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>{formatCurrency(results.cess)}</td>
                    </tr>
                </tbody>
            </table>

            <style jsx>{`
                .slab-row td {
                    color: var(--text-muted);
                    font-style: italic;
                }
            `}</style>
        </div>
    );
};

export default IncomeTaxOutput;
