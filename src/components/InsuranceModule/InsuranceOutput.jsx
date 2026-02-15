import React from 'react';
import { formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { Shield, Clock, Landmark } from 'lucide-react';
import { getPolicyColumns } from './InsuranceLogic';

const InsuranceOutput = ({ summary, policies }) => {
    if (!summary || summary.length === 0) return null;

    const policyColumns = getPolicyColumns(policies);

    return (
        <div className="insurance-output fade-in" style={{ marginTop: '2.5rem' }}>

            {/* 1. Yearly Premium Summary */}
            <section className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <Clock size={20} /> Year-wise Premium Outflow
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem' }}>Year</th>
                                {policyColumns.map(pc => (
                                    <th key={pc.id} style={{ padding: '0.75rem' }}>{pc.label} (Premium ₹)</th>
                                ))}
                                <th style={{ padding: '0.75rem' }}>Total Yearly Premium (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.filter(s => s.totalPremium > 0).map((s, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem' }}>{s.year}</td>
                                    {policyColumns.map(pc => (
                                        <td key={pc.id} style={{ padding: '0.75rem' }}>
                                            {s.policyPremiums[pc.id] ? formatCurrency(s.policyPremiums[pc.id]) : '-'}
                                        </td>
                                    ))}
                                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                        {formatCurrency(s.totalPremium)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 2. Coverage Summary per Insured */}
            <section className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <Shield size={20} /> Year-wise Coverage Summary
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem' }}>Year</th>
                                {getInsuredNamesList(policies).map(name => (
                                    <th key={name} style={{ padding: '0.75rem' }}>{name} (Coverage ₹)</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {summary.filter(s => Object.keys(s.coverage).length > 0).map((s, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem' }}>{s.year}</td>
                                    {getInsuredNamesList(policies).map(name => (
                                        <td key={name} style={{ padding: '0.75rem' }}>
                                            {s.coverage[name] ? formatCurrency(s.coverage[name]) : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 3. Maturity Summary */}
            <section className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <Landmark size={20} /> Maturity Schedule
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table className="report-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                <th style={{ padding: '0.75rem' }}>Maturity Year</th>
                                <th style={{ padding: '0.75rem' }}>Insured Name</th>
                                <th style={{ padding: '0.75rem' }}>Plan Name</th>
                                <th style={{ padding: '0.75rem' }}>Lumpsum Maturity (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {summary.filter(s => s.maturities.length > 0).map((s) => (
                                s.maturities.map((m, idx) => (
                                    <tr key={`${s.year}-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '0.75rem' }}>{s.year}</td>
                                        <td style={{ padding: '0.75rem' }}>{m.insuredName}</td>
                                        <td style={{ padding: '0.75rem' }}>{m.planName || 'Saving Plan'}</td>
                                        <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>{formatCurrency(m.amount)}</td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <style jsx>{`
        .report-table th { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; }
        .report-table td { font-size: 0.9rem; }
      `}</style>
        </div>
    );
};

export default InsuranceOutput;
