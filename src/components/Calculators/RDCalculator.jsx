import React, { useMemo } from 'react';
import { Calculator, TrendingUp, RefreshCcw, ShieldCheck } from 'lucide-react';

export const computeRDData = (proposedRDs, expectedReturns, defaultRD = 0, defaultCorpus = 0) => {
    // Standard Indian RDs compound quarterly mathematically
    const freqMonths = 3;

    const today = new Date();
    let baseStartYear = today.getFullYear();
    let baseStartMonth = today.getMonth() + 1;
    let startAbsolute = baseStartYear * 12 + baseStartMonth;
    let latestEndAbsolute = startAbsolute + 12; // default 1 year projection if nothing else is planned

    if (proposedRDs.length > 0) {
        let earliestProposedYear = Math.min(...proposedRDs.map(p => p.startYear));
        if (earliestProposedYear < baseStartYear) {
            baseStartYear = earliestProposedYear;
            let earliestRDs = proposedRDs.filter(p => p.startYear === baseStartYear);
            baseStartMonth = Math.min(...earliestRDs.map(p => p.startMonth));
            startAbsolute = baseStartYear * 12 + baseStartMonth;
        }
        latestEndAbsolute = Math.max(...proposedRDs.map(p => (p.startYear * 12 + p.startMonth) + (parseInt(p.duration) * 12) - 1));
    }

    let rds = proposedRDs.map(p => ({
        id: p.id,
        startAbsolute: p.startYear * 12 + p.startMonth,
        endAbsolute: (p.startYear * 12 + p.startMonth) + (parseInt(p.duration) * 12) - 1,
        annualAmount: parseFloat(p.amount) || 0, // In AllocationModule, item.amount is the ANNUAL sum
        compoundingBase: 0,
        uncompoundedInterest: 0,
        active: false,
        matured: false
    }));

    const periodicRate = ((parseFloat(expectedReturns) || 0) / 100) / 12;

    let schedule = [];
    let currentAbsolute = startAbsolute;
    let currentYearVal = baseStartYear;
    let currentMonthVal = baseStartMonth;

    let yearlyOpening = parseFloat(defaultCorpus) || 0;
    
    // Baseline RD simulation if cashflow exists
    const monthlyBaselineP = parseFloat(defaultRD) || 0;
    let baselineCompoundingBase = parseFloat(defaultCorpus) || 0;
    let baselineUncompoundedInterest = 0;

    let yearlyDeposit = 0;
    let yearlyInterest = 0;
    let yearlyMaturity = 0;

    let globalInterest = 0;
    let globalDeposit = 0;

    while (currentAbsolute <= latestEndAbsolute) {
        let monthInterest = 0;
        
        rds.forEach(rd => {
            if (currentAbsolute === rd.startAbsolute) {
                rd.active = true;
            }

            if (rd.active && !rd.matured) {
                // Start of month: Add monthly P if still within paying duration
                let monthlyP = 0;
                if (currentAbsolute <= rd.endAbsolute) {
                    monthlyP = rd.annualAmount / 12;
                    rd.compoundingBase += monthlyP;
                    yearlyDeposit += monthlyP;
                    globalDeposit += monthlyP;
                }

                // Earn interest on the entire compounded base for this single month
                const interest = rd.compoundingBase * periodicRate;
                rd.uncompoundedInterest += interest;
                monthInterest += interest;
                globalInterest += interest;

                // End of compounding cycle (Quarterly): flush uncompounded interest into the main base
                const monthsActive = currentAbsolute - rd.startAbsolute + 1;
                if (monthsActive > 0 && monthsActive % freqMonths === 0) {
                    rd.compoundingBase += rd.uncompoundedInterest;
                    rd.uncompoundedInterest = 0;
                }
            }

            if (currentAbsolute === rd.endAbsolute && rd.active) {
                rd.active = false;
                rd.matured = true;
                // Final compound push on maturity date regardless of quarter alignments
                rd.compoundingBase += rd.uncompoundedInterest;
                rd.uncompoundedInterest = 0;
                yearlyMaturity += rd.compoundingBase;
            }
        });
        
        // Handle baseline RD if it exists
        if (monthlyBaselineP > 0 || baselineCompoundingBase > 0) {
            baselineCompoundingBase += monthlyBaselineP;
            yearlyDeposit += monthlyBaselineP;
            globalDeposit += monthlyBaselineP;
            
            const interest = baselineCompoundingBase * periodicRate;
            baselineUncompoundedInterest += interest;
            monthInterest += interest;
            globalInterest += interest;
            
            const monthsActive = currentAbsolute - startAbsolute + 1;
            if (monthsActive > 0 && monthsActive % freqMonths === 0) {
                baselineCompoundingBase += baselineUncompoundedInterest;
                baselineUncompoundedInterest = 0;
            }
        }

        yearlyInterest += monthInterest;

        if (currentMonthVal === 12 || currentAbsolute === latestEndAbsolute) {
            // Calculate closing balance as sum of all active RDs + baseline
            let closingBalance = rds.filter(rd => rd.active && !rd.matured)
                                    .reduce((sum, rd) => sum + rd.compoundingBase + rd.uncompoundedInterest, 0);
            closingBalance += baselineCompoundingBase + baselineUncompoundedInterest;

            schedule.push({
                year: currentYearVal,
                openingValue: yearlyOpening,
                deposit: yearlyDeposit,
                interest: yearlyInterest,
                maturityValue: yearlyMaturity,
                endValue: closingBalance
            });

            yearlyOpening = closingBalance;
            yearlyDeposit = 0;
            yearlyInterest = 0;
            yearlyMaturity = 0;

            if (currentAbsolute < latestEndAbsolute) {
                currentYearVal++;
            }
        }

        currentAbsolute++;
        currentMonthVal = (currentMonthVal % 12) + 1;
    }

    const totals = {
        globalDeposit,
        globalInterest,
        finalMaturity: rds.filter(rd => rd.matured).reduce((sum, rd) => sum + rd.compoundingBase, 0) + baselineCompoundingBase + baselineUncompoundedInterest
    };

    return { schedule, totals };
};

const RDCalculator = ({ allocations = [], expenseCategories = {}, assetCategories = {}, data, setData }) => {
    const expectedReturns = data?.rate ?? 7.00;

    const defaultRD = parseFloat(expenseCategories?.savings?.rd?.amount !== undefined ? expenseCategories.savings.rd.amount : expenseCategories?.savings?.rd) || 0;
    const defaultCorpus = parseFloat(assetCategories?.investments?.recurringDeposit) || 0;

    const setExpectedReturns = (val) => setData({ ...data, rate: val });

    const proposedRDs = useMemo(() => allocations.filter(a => a.type === 'Recurring Deposit'), [allocations]);

    const calculationData = useMemo(() => {
        return computeRDData(proposedRDs, expectedReturns, defaultRD, defaultCorpus);
    }, [proposedRDs, expectedReturns, defaultRD, defaultCorpus]);

    const { schedule, totals } = calculationData;

    return (
        <div className="fade-in" style={{ padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <RefreshCcw size={32} color="var(--primary)" />
                    <div>
                        <h1 style={{ margin: 0 }}>Recurring Deposit (RD) Calculator</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Project guaranteed returns with strict Indian Quarterly Compounding rules.</p>
                    </div>
                </div>

                {proposedRDs.length === 0 && defaultRD === 0 && defaultCorpus === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                        <p>No active RD found in the global Cash Flow Baseline nor proposed natively.</p>
                        <p style={{ fontSize: '0.9rem' }}>Go back to Step 4 or Step 9 to inject your baseline or allocate future installments.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '2.5rem' }}>
                        {/* Left Column: Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label><TrendingUp size={16} /> Expected Interest Rate (% p.a)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="5"
                                    max="9"
                                    value={expectedReturns} 
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value);
                                        setExpectedReturns(isNaN(val) ? '' : val);
                                    }} 
                                    onBlur={(e) => {
                                        let val = parseFloat(e.target.value);
                                        if (isNaN(val)) val = 7.00;
                                        if (val < 5) val = 5;
                                        if (val > 9) val = 9;
                                        setExpectedReturns(val.toFixed(2));
                                    }}
                                    className="form-input" 
                                />
                                <small className="text-muted">Prevailing RD rates range from 5% to 9%.</small>
                            </div>

                            <div className="form-group">
                                <label><Calculator size={16} /> Compounding Frequency</label>
                                <div style={{ 
                                    padding: '0.75rem', 
                                    background: 'var(--bg-main)', 
                                    border: '1px solid var(--border)', 
                                    borderRadius: '8px',
                                    color: 'var(--text-muted)'
                                }}>
                                    Quarterly (Fixed)
                                </div>
                                <small className="text-muted">Indian RD banking regulations strictly default to quarterly interest accrual.</small>
                            </div>
                        </div>

                        {/* Right Column: Visualization */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Summary Cards */}
                            <div style={{ 
                                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
                                color: 'white'
                            }}>
                                <div style={{ background: '#3b82f6', padding: '1.25rem', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Total Principal Invested</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.globalDeposit).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ background: '#059669', padding: '1.25rem', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Total Interest Earned</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.globalInterest).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ background: '#6366f1', padding: '1.25rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.4)' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Total Matured Value</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.finalMaturity).toLocaleString('en-IN')}</h3>
                                </div>
                            </div>

                            {/* Amortization Table */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                                    <table className="summary-table" style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '2px solid var(--border)', zIndex: 10 }}>
                                            <tr>
                                                <th style={{ padding: '1.25rem', textAlign: 'left' }}>Year</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Opening Balance</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Annual Deposits</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Interest Earned</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right', color: '#ef4444' }}>Maturity Payouts</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Closing Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.map((row, idx) => (
                                                <tr key={row.year} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{row.year}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>₹{Math.round(row.openingValue).toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', opacity: row.deposit > 0 ? 1 : 0.3 }}>+ ₹{Math.round(row.deposit).toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#059669' }}>+ ₹{Math.round(row.interest).toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', color: row.maturityValue > 0 ? '#ef4444' : 'inherit', opacity: row.maturityValue > 0 ? 1 : 0.3 }}>
                                                        {row.maturityValue > 0 ? `- ₹${Math.round(row.maturityValue).toLocaleString('en-IN')}` : '₹0'}
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: 'var(--text-main)' }}>₹{Math.round(row.endValue).toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default RDCalculator;
