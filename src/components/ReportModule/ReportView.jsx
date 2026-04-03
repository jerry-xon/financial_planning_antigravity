import React from 'react';
import { calculateFamilyProfile } from '../ProfileModule/ProfileLogic';
import { calculateCashFlow, formatCurrency } from '../CashFlowModule/CashFlowLogic';
import { calculateNetWorth } from '../AssetModule/AssetLogic';
import { categorizeGoals } from '../GoalModule/GoalLogic';
import { Download, Printer, CheckCircle, TrendingUp, AlertTriangle, Clock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { calculateYearlyInsuranceSummary, getInsuredNamesList, getPolicyColumns } from '../InsuranceModule/InsuranceLogic';

import FinancialPyramid from '../ProtectionGapModule/FinancialPyramid';
import ProtectionGapOutput from '../ProtectionGapModule/ProtectionGapOutput';
import { calculateProtectionGap } from '../ProtectionGapModule/ProtectionGapLogic';
import IncomeTaxModule from '../IncomeTaxModule/IncomeTaxModule';
import JourneyTable from '../JourneyModule/JourneyTable';
import GrowthModule from '../GrowthModule/GrowthModule';

const ReportView = ({ 
    familyMembers, 
    income, 
    expenseCategories, 
    assetCategories, 
    liabilityCategories, 
    goals, 
    policies,
    allocations = [],
    goalMappings = {},
    contingencyFund,
    journeyAdjustments = [],
    projections = [],
    calculatorInputs = {},
    onBack
}) => {
    const profileResults = calculateFamilyProfile(familyMembers);
    const cashFlowResults = calculateCashFlow(income, expenseCategories);
    const assetResults = calculateNetWorth(assetCategories, liabilityCategories);

    const validGoals = goals.filter(g => g.yearsToGoal && g.presentValue);
    const goalResults = categorizeGoals(validGoals);
    const insuranceSummary = calculateYearlyInsuranceSummary(policies);
    const policyColumns = getPolicyColumns(policies);
    const insuredNames = getInsuredNamesList(policies);

    const protectionGapResults = calculateProtectionGap(expenseCategories, policies, familyMembers);
    const proposedSIPs = allocations.filter(a => a.type === 'SIP');
    const proposedEquities = allocations.filter(a => a.type === 'Direct Equity & ETFs');

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="report-view fade-in">
            <div className="report-header card" style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-main)', borderBottom: '4px solid var(--primary)' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Financial Overview</h1>
                <p className="text-muted">Generated for {familyMembers[0]?.name || 'Valued Client'} • {new Date().toLocaleDateString('en-IN')}</p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary" onClick={onBack}>
                        Back to Roadmap
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Printer size={18} /> Print Plan / Save as PDF
                    </button>
                </div>
            </div>

            <div className="report-sections" style={{ marginTop: '2rem' }}>
                {/* 1. Profile Summary */}
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
                                            <div>
                                                <div>Retires: {m.retirementYear}</div>
                                                {m.educationalQualification && <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Qual: {m.educationalQualification}</div>}
                                                {m.occupation && <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{m.occupation}</div>}
                                                {m.natureOfBusiness && <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{m.natureOfBusiness} @ {m.organizationName}</div>}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* 2. Cash Flow Summary */}
                <section className="report-section card" style={{ marginTop: '1.5rem' }}>
                    <h3>2. Income - Expenses - Surplus Analysis</h3>
                    <div className="grid">
                        <div className="summary-box">
                            <label>Total Monthly Income</label>
                            <strong>{formatCurrency(cashFlowResults.totalIncome)}</strong>
                        </div>
                        <div className="summary-box">
                            <label>Household expenses + EMIs + Insurance</label>
                            <strong style={{ color: '#ef4444' }}>{formatCurrency(cashFlowResults.totalExpenses)}</strong>
                        </div>
                        <div className="summary-box">
                            <label>Monthly Surplus</label>
                            <strong style={{ color: cashFlowResults.surplus >= 0 ? 'var(--accent)' : '#ef4444' }}>{formatCurrency(cashFlowResults.surplus)}</strong>
                        </div>
                        <div className="summary-box">
                            <label>Savings and Investments</label>
                            <strong style={{ color: 'var(--primary)' }}>{formatCurrency(cashFlowResults.totalInvestments || Object.values(expenseCategories?.savings || {}).reduce((sum, v) => sum + (v ? (parseFloat(typeof v === 'object' ? v.amount : v) || 0) : 0), 0))}</strong>
                        </div>
                        <div className="summary-box" style={{ background: 'var(--bg-main)' }}>
                            <label>Disposable Income</label>
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

                {/* 3. Protection Gap Analysis */}
                <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                    <h3>3. Protection Gap Analysis</h3>
                    <FinancialPyramid 
                        isReadOnlyMode={true}
                        expenseCategories={expenseCategories}
                        policies={policies}
                        assetCategories={assetCategories}
                        calculatorInputs={calculatorInputs}
                        proposedSIPs={proposedSIPs}
                        proposedEquities={proposedEquities}
                        goals={validGoals}
                        goalMappings={goalMappings}
                        protectionGapResults={protectionGapResults}
                    />
                    <div style={{ marginTop: '2rem' }}>
                        <ProtectionGapOutput results={protectionGapResults} />
                    </div>
                </section>

                {/* 4. Contingency Fund Planning */}
                <section className="report-section card" style={{ marginTop: '1.5rem' }}>
                    <h3>4. Contingency Fund Planning</h3>
                    <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Allocated Contingency Fund</div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {formatCurrency(contingencyFund || 0)}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Recommended Basis</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                Min 3 to 6 months of expenses
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Net Worth Statement */}
                <section className="report-section card" style={{ marginTop: '1.5rem' }}>
                    <h3>5. Net Worth Statement</h3>
                    <div className="grid">
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
                    </div>
                    <div className="stat-row" style={{ borderTop: '2px solid var(--primary)', marginTop: '1.5rem', paddingTop: '1rem', background: 'var(--bg-main)', padding: '1rem', borderRadius: '8px' }}>
                        <span>Net Worth</span>
                        <strong style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{formatCurrency(assetResults.netWorth)}</strong>
                    </div>
                </section>

                {/* 6. Life Goals */}
                <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                    <h3>6. Life Goals Projections</h3>
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
                
                {/* 7. Insurance & Protection Summary */}
                {policies.length > 0 && (
                    <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                        <h3>7. Insurance & Protection Summary</h3>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Clock size={18} /> Yearly Premium Outflow
                            </h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            {policyColumns.map(pc => (
                                                <th key={pc.id}>{pc.label} (Premium ₹)</th>
                                            ))}
                                            <th>Total Premium</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insuranceSummary.filter(s => s.totalPremium > 0).map((s, i) => (
                                            <tr key={i}>
                                                <td>{s.year}</td>
                                                {policyColumns.map(pc => (
                                                    <td key={pc.id}>
                                                        {s.policyPremiums[pc.id] ? formatCurrency(s.policyPremiums[pc.id]) : '-'}
                                                    </td>
                                                ))}
                                                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(s.totalPremium)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Shield size={18} /> Yearly Coverage per Insured
                            </h4>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="report-table">
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            {insuredNames.map(name => (
                                                <th key={name}>{name} (Coverage ₹)</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {insuranceSummary.filter(s => Object.keys(s.coverage).length > 0).map((s, i) => (
                                            <tr key={i}>
                                                <td>{s.year}</td>
                                                {insuredNames.map(name => (
                                                    <td key={name}>
                                                        {s.coverage[name] ? formatCurrency(s.coverage[name]) : '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* 8. Planned Future Financial Adjustments */}
                {journeyAdjustments && journeyAdjustments.length > 0 && (
                    <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                        <h3>8. Planned Future Financial Adjustments</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="report-table">
                                <thead>
                                    <tr>
                                        <th>Name / Category</th>
                                        <th>Type</th>
                                        <th>Start Date</th>
                                        <th>Duration</th>
                                        <th>Annual Impact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {journeyAdjustments.map((adj, i) => {
                                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                                        const monthName = adj.startMonth ? monthNames[adj.startMonth - 1] : "Jan";
                                        return (
                                            <tr key={i}>
                                                <td>{adj.name || adj.loanCategory || 'Adjustment'}</td>
                                                <td style={{ textTransform: 'capitalize' }}>{adj.type || 'Expense'}</td>
                                                <td>{monthName} {adj.startYear}</td>
                                                <td>{adj.duration || 1} {adj.duration === 1 ? 'Year' : 'Years'}</td>
                                                <td style={{ color: '#ef4444', fontWeight: 600 }}>{formatCurrency(adj.amount || 0)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}

                {/* 9. Investment Strategy */}
                {allocations.length > 0 && (
                    <section className="report-section card" style={{ marginTop: '1.5rem' }}>
                        <h3>9. Planned Investment Strategy</h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                            Based on your investible surplus, the following investments are planned to achieve your financial objectives.
                        </p>
                        <table className="report-table">
                            <thead>
                                <tr>
                                    <th>Investment</th>
                                    <th>Type</th>
                                    <th>Annual Amount</th>
                                    <th>Expected CAGR</th>
                                    <th>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {allocations.map((a, i) => (
                                    <tr key={i}>
                                        <td>{a.name || a.type}</td>
                                        <td>{a.type}</td>
                                        <td>{formatCurrency(a.amount)}</td>
                                        <td>{a.expectedReturn}%</td>
                                        <td>{a.duration} Years (from {a.startYear})</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* 10. Goal Fulfillment Roadmap */}
                {validGoals.length > 0 && (
                    <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                        <h3>10. Goal Fulfillment Roadmap</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {validGoals.map((g, i) => {
                                const mappingDict = goalMappings[g.id] || {};
                                const selectedSources = Object.keys(mappingDict);
                                const totalAssigned = Object.values(mappingDict).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
                                const shortfall = g.futureCost - totalAssigned;
                                const isFullyFunded = Math.round(shortfall) <= 0;
                                const hasAssignments = totalAssigned > 0;
                                
                                const hasLoan = selectedSources.includes('loan');
                                const hasRealEstate = selectedSources.includes('realEstate');

                                return (
                                    <div key={i} className="goal-fulfillment-card" style={{ 
                                        background: 'var(--bg-main)', 
                                        borderRadius: '16px', 
                                        border: `2px solid ${isFullyFunded ? 'var(--success)' : 'var(--border)'}`,
                                        overflow: 'hidden'
                                    }}>
                                        {/* Header Row */}
                                        <div style={{ 
                                            padding: '1.5rem', 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            borderBottom: hasAssignments ? '1px solid var(--border)' : 'none',
                                            background: isFullyFunded ? 'rgba(52, 211, 153, 0.05)' : 'transparent',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    {isFullyFunded ? <CheckCircle2 size={18} className="text-success" /> : <AlertCircle size={18} style={{ color: '#ef4444' }} />}
                                                    <h3 style={{ margin: 0, fontSize: '1.25rem', borderBottom: 'none' }}>{g.name || g.placeholder}</h3>
                                                </div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                                    Target Year: <strong style={{ color: 'var(--text-main)' }}>{g.targetYear}</strong> | 
                                                    Target Cost: <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(g.futureCost)}</strong>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', display: 'flex', gap: '1.5rem', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                        Assigned
                                                    </div>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                                        {formatCurrency(totalAssigned)}
                                                    </div>
                                                </div>
                                                <div style={{ width: '1px', background: 'var(--border)' }}></div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                                                        Pending Needed
                                                    </div>
                                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: isFullyFunded ? 'var(--success)' : '#ef4444' }}>
                                                        {isFullyFunded ? 'Fully Funded' : formatCurrency(shortfall)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {hasAssignments && (
                                            <div style={{ padding: '1.5rem' }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>
                                                    Maturity Value Allocated from Funding Sources
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                                    {selectedSources.map(sid => {
                                                        const hardcodedSources = [
                                                            { id: 'sip', name: 'SIP' },
                                                            { id: 'lumpsum', name: 'Lumpsum' },
                                                            { id: 'equity', name: 'Direct Equity & ETFs' },
                                                            { id: 'fd', name: 'Fixed Deposit (FD)' },
                                                            { id: 'rd', name: 'Recurring Deposit (RD)' },
                                                            { id: 'realEstate', name: 'Real Estate Investment' },
                                                            { id: 'loan', name: 'Loan' }
                                                        ];
                                                        const source = allocations.find(a => a.id === sid) || hardcodedSources.find(s => s.id === sid);
                                                        const amount = parseFloat(mappingDict[sid]) || 0;
                                                        
                                                        return (
                                                            <div key={sid} style={{
                                                                padding: '1rem',
                                                                borderRadius: '8px',
                                                                background: 'rgba(37, 99, 235, 0.05)',
                                                                border: '1px solid var(--primary)',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center'
                                                            }}>
                                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>{source?.name || sid}</div>
                                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(amount)}</div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                
                                                {/* Explicit Roadmap Action Notes */}
                                                {(hasLoan || hasRealEstate) && (
                                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '8px' }}>
                                                        <strong style={{ color: '#d97706', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}><AlertTriangle size={14} inline="true" /> ACTIONABLE NOTES:</strong>
                                                        <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#b45309', fontSize: '0.8rem' }}>
                                                            {hasLoan && <li>This goal relies on a Loan. Please navigate to the <strong>Standalone Loan Calculators</strong> to verify EMIs fits within your projected Unallocated Surplus for the year {g.targetYear || (new Date().getFullYear() + Math.round(parseFloat(g.yearsToGoal) || 0))}.</li>}
                                                            {hasRealEstate && <li>This goal assumes liquidating Real Estate assets. Ensure the physical property is sold prior to {g.targetYear || (new Date().getFullYear() + Math.round(parseFloat(g.yearsToGoal) || 0))} to meet the funding schedule.</li>}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 11. Income tax */}
                <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                    <IncomeTaxModule 
                        familyMembers={familyMembers}
                        income={income}
                        isCalculatorMode={true}
                    />
                </section>

                {/* 12. Inflow - Outflow till Retirement */}
                {projections && projections.length > 0 && (
                    <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                        <h3>12. Inflow - Outflow till Retirement</h3>
                        <JourneyTable projections={projections} />
                    </section>
                )}

                {/* 13. Net Worth till Retirement */}
                <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page' }}>
                    <h3>13. Net Worth till Retirement</h3>
                    <GrowthModule 
                        isReadOnlyMode={true}
                        familyMembers={familyMembers}
                        assetCategories={assetCategories}
                        expenseCategories={expenseCategories}
                        allocations={allocations}
                        goals={validGoals}
                        calculatorInputs={calculatorInputs}
                        journeyProjections={projections}
                        policies={policies}
                        goalMappings={goalMappings}
                    />
                </section>

                {/* 14. Disclaimer */}
                <section className="report-section card" style={{ marginTop: '1.5rem', breakBefore: 'page', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <h3 style={{ borderBottom: 'none', marginBottom: '1rem', color: 'var(--text-main)' }}>Disclaimer</h3>
                    <p style={{ marginBottom: '0.5rem' }}>This financial plan has been prepared by Finbrella based on the information provided by you. The projections, assumptions, and recommendations are based on current data, historical trends, and standard financial models.</p>
                    <p style={{ marginBottom: '0.5rem' }}>All future projections (including returns, inflation, and goal outcomes) are estimates only and may vary due to market movements, economic changes, policy changes, or other unforeseen factors.</p>
                    <p style={{ marginBottom: '0.5rem' }}>This report should be treated as a guidance document (roadmap) and not as a guarantee of results. It is recommended that the plan be reviewed periodically and updated as circumstances change.</p>
                    <p style={{ marginBottom: '0.5rem' }}>The accuracy of this report is dependent on the completeness and correctness of the information provided by you. Any inaccuracies or changes in inputs may significantly impact the outcomes.</p>
                    <p style={{ marginBottom: '0.5rem' }}>While due care has been taken in preparing this report using automated tools and algorithms, it may be subject to system limitations or errors.</p>
                    <p style={{ marginBottom: '0.5rem' }}>This report does not constitute legal, tax, or investment advice. You are advised to consult relevant professionals before making financial decisions.</p>
                    <p style={{ marginBottom: '0' }}>Finbrella shall not be held liable for any decisions taken based on this report.</p>
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
