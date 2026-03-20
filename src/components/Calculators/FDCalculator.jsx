import React, { useMemo } from 'react';
import { Calculator, TrendingUp, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';

export const computeFDData = (proposedFDs, expectedReturns, frequency) => {
    if (proposedFDs.length === 0) return { schedule: [], totals: null };

    let freqMonths = 3;
    if (frequency === 'Monthly') freqMonths = 1;
    if (frequency === 'Half-Yearly') freqMonths = 6;
    if (frequency === 'Annually') freqMonths = 12;

    let baseStartYear = Math.min(...proposedFDs.map(p => p.startYear));
    let earliestFDs = proposedFDs.filter(p => p.startYear === baseStartYear);
    let baseStartMonth = Math.min(...earliestFDs.map(p => p.startMonth));
    const startAbsolute = baseStartYear * 12 + baseStartMonth;

    let latestEndAbsolute = Math.max(...proposedFDs.map(p => (p.startYear * 12 + p.startMonth) + (parseInt(p.duration) * 12) - 1));

    let fds = proposedFDs.map(p => ({
        id: p.id,
        startAbsolute: p.startYear * 12 + p.startMonth,
        endAbsolute: (p.startYear * 12 + p.startMonth) + (parseInt(p.duration) * 12) - 1,
        principal: parseFloat(p.amount) || 0,
        compoundingBase: parseFloat(p.amount) || 0,
        uncompoundedInterest: 0,
        totalInterest: 0,
        active: false,
        matured: false
    }));

    const periodicRate = ((parseFloat(expectedReturns) || 0) / 100) / 12;

    let schedule = [];
    let currentAbsolute = startAbsolute;
    let currentYearVal = baseStartYear;
    let currentMonthVal = baseStartMonth;

    let yearlyOpening = 0;
    let yearlyDeposit = 0;
    let yearlyInterest = 0;
    let yearlyMaturity = 0;

    let globalInterest = 0;
    let globalDeposit = 0;

    // Calculate initial opening sum for the very first year
    yearlyOpening = fds.filter(f => f.startAbsolute === currentAbsolute).reduce((sum, f) => sum + f.principal, 0);

    while (currentAbsolute <= latestEndAbsolute) {
        let monthInterest = 0;
        
        fds.forEach(fd => {
            if (currentAbsolute === fd.startAbsolute) {
                fd.active = true;
                // Dont add to yearlyOpening here except if we re-evaluate opening strictly at Jan 1st.
                // We handle deposits explicitly.
                if (currentAbsolute !== startAbsolute) {
                    yearlyDeposit += fd.principal;
                }
                globalDeposit += fd.principal;
            }

            if (fd.active && !fd.matured) {
                // Earn interest on the compounded base
                const interest = fd.compoundingBase * periodicRate;
                fd.uncompoundedInterest += interest;
                fd.totalInterest += interest;
                monthInterest += interest;
                globalInterest += interest;

                // Compounding event
                const monthsActive = currentAbsolute - fd.startAbsolute + 1;
                if (monthsActive % freqMonths === 0) {
                    fd.compoundingBase += fd.uncompoundedInterest;
                    fd.uncompoundedInterest = 0;
                }
            }

            if (currentAbsolute === fd.endAbsolute && fd.active) {
                fd.active = false;
                fd.matured = true;
                // Final compound push
                fd.compoundingBase += fd.uncompoundedInterest;
                fd.uncompoundedInterest = 0;
                yearlyMaturity += fd.compoundingBase;
            }
        });

        yearlyInterest += monthInterest;

        if (currentMonthVal === 12 || currentAbsolute === latestEndAbsolute) {
            // Calculate closing balance as sum of all active FDs (compoundingBase + uncompounded)
            let closingBalance = fds.filter(f => f.active && !f.matured)
                                    .reduce((sum, f) => sum + f.compoundingBase + f.uncompoundedInterest, 0);

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
        finalMaturity: fds.filter(f => f.matured).reduce((sum, f) => sum + f.compoundingBase, 0)
    };

    return { schedule, totals };
};

const FDCalculator = ({ allocations = [], data, setData }) => {
    const expectedReturns = data?.rate ?? 7.00;
    const frequency = data?.frequency ?? 'Quarterly';

    const setExpectedReturns = (val) => setData({ ...data, rate: val });
    const setFrequency = (val) => setData({ ...data, frequency: val });

    const proposedFDs = useMemo(() => allocations.filter(a => a.type === 'Fixed Deposit'), [allocations]);

    const calculationData = useMemo(() => {
        return computeFDData(proposedFDs, expectedReturns, frequency);
    }, [proposedFDs, expectedReturns, frequency]);

    const { schedule, totals } = calculationData;

    return (
        <div className="fade-in" style={{ padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <ShieldCheck size={32} color="var(--primary)" />
                    <div>
                        <h1 style={{ margin: 0 }}>Fixed Deposit (FD) Calculator</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Project guaranteed returns with adjustable compounding frequencies.</p>
                    </div>
                </div>

                {proposedFDs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                        <p>No Fixed Deposits proposed in the Allocation Module.</p>
                        <p style={{ fontSize: '0.9rem' }}>Go back to Step 9 and add an FD allocation to project guaranteed returns.</p>
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
                                <small className="text-muted">Prevailing FD rates range from 5% to 9%.</small>
                            </div>

                            <div className="form-group">
                                <label><Calculator size={16} /> Compounding Frequency</label>
                                <select 
                                    value={frequency} 
                                    onChange={(e) => setFrequency(e.target.value)}
                                    className="form-input"
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Half-Yearly">Half-Yearly</option>
                                    <option value="Annually">Annually</option>
                                </select>
                                <small className="text-muted">Indian banks strictly default to Quarterly compounding.</small>
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
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>New Deposits</th>
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
                                                    <td style={{ padding: '1rem', textAlign: 'right', opacity: row.deposit > 0 ? 1 : 0.3 }}>₹{Math.round(row.deposit).toLocaleString('en-IN')}</td>
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
export default FDCalculator;
