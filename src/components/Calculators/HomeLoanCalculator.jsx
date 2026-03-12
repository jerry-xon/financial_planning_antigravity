import React, { useState, useMemo } from 'react';
import { Calculator, Calendar, DollarSign, TrendingDown, Clock, Plus, Trash2, Info } from 'lucide-react';

const HomeLoanCalculator = ({ data, setData }) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Use props if available, otherwise defaults
    const loanAmount = data?.amount ?? 0;
    const interestRate = data?.rate ?? 8.5;
    const tenureYears = data?.tenure ?? 20;
    const startMonth = data?.startMonth ?? currentMonth;
    const startYear = data?.startYear ?? currentYear;
    const events = data?.events ?? [];

    const setLoanAmount = (val) => setData({ ...data, amount: val });
    const setInterestRate = (val) => setData({ ...data, rate: val });
    const setTenureYears = (val) => setData({ ...data, tenure: val });
    const setStartMonth = (val) => setData({ ...data, startMonth: val });
    const setStartYear = (val) => setData({ ...data, startYear: val });
    const setEvents = (val) => setData({ ...data, events: typeof val === 'function' ? val(events) : val });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - 5 + i);

    const addEvent = (type) => {
        setEvents([...events, {
            id: Date.now(),
            type,
            value: 0, // Amount for prepayment, New Rate for rate change
            month: 1,
            year: currentYear
        }]);
    };

    const removeEvent = (id) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const updateEvent = (id, field, value) => {
        setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    // Helper to get days in month
    const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();
    const isLeapYear = (year) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

    // Main Calculation Logic: Daily Rest
    const calculationData = useMemo(() => {
        let runningPrincipal = loanAmount;
        let currentRate = interestRate;
        let results = [];
        
        const startD = new Date(startYear, startMonth - 1, 1);
        let currentD = new Date(startD);

        // Calculate base EMI (Standard formula for initial reference)
        const P = loanAmount;
        const r_initial = interestRate / 12 / 100;
        const n = tenureYears * 12;
        const baseEMI = (P * r_initial * Math.pow(1 + r_initial, n)) / (Math.pow(1 + r_initial, n) - 1);

        let yearlySummary = {
            year: startYear,
            openingBalance: loanAmount,
            principalPaid: 0,
            interestPaid: 0,
            prepayments: 0,
            closingBalance: 0
        };

        // We run the loop month by month, but calculate interest daily within each month
        // to handle "Daily Rest" logic.
        // We limit to 50 years max or until principal is 0
        const maxMonths = 600; 
        let monthCount = 0;

        while (runningPrincipal > 0 && monthCount < maxMonths) {
            const m = currentD.getMonth() + 1;
            const y = currentD.getFullYear();
            const daysInMonth = getDaysInMonth(m, y);
            const daysInYear = isLeapYear(y) ? 366 : 365;

            // 1. Check for Rate Change events at the start of this month
            const rateChange = events.find(e => e.type === 'rate_change' && parseInt(e.month) === m && parseInt(e.year) === y);
            if (rateChange) {
                currentRate = parseFloat(rateChange.value) || currentRate;
            }

            // 2. Daily rest interest calculation for the month
            // Interest = Principal * (Rate/DaysInYear) * DaysInMonth
            // In a true daily rest, principal could change mid-month due to prepayment
            // But usually banks apply prepayments on a specific day or EOM.
            // We'll calculate interest on the daily principal.
            
            // Check for prepayments in this month
            const monthlyPrepayments = events.filter(e => e.type === 'prepayment' && parseInt(e.month) === m && parseInt(e.year) === y);
            const totalPrepaymentThisMonth = monthlyPrepayments.reduce((sum, p) => sum + (parseFloat(p.value) || 0), 0);

            let monthlyInterestAccumulated = 0;
            // Simplification: Interest calculate on monthly opening principal * days
            // If prepayment happens, we'll assume it happens on the 1st for the calculation logic 
            // OR reflect it in next month. Banks vary. We'll do daily on end-of-day balance.
            
            // For this UI, calculating daily within loop:
            const dailyRate = (currentRate / 100) / daysInYear;
            
            // Apply prepayment first (assuming 1st of month for simplicity of math vs complexity of UI)
            runningPrincipal -= totalPrepaymentThisMonth;
            yearlySummary.prepayments += totalPrepaymentThisMonth;

            // Calculate monthly interest based on principal
            monthlyInterestAccumulated = runningPrincipal * dailyRate * daysInMonth;

            // 3. EMI Payment
            // EMI is applied at the end of month
            let principalRepayment = baseEMI - monthlyInterestAccumulated;
            
            // If principal is less than principal repayment, pay only remaining principal
            if (runningPrincipal < principalRepayment) {
                principalRepayment = runningPrincipal;
            }

            yearlySummary.interestPaid += monthlyInterestAccumulated;
            yearlySummary.principalPaid += principalRepayment;
            runningPrincipal -= principalRepayment;

            // 4. Yearly Rollup
            if (m === 12 || runningPrincipal <= 0) {
                yearlySummary.closingBalance = Math.max(0, runningPrincipal);
                results.push({ ...yearlySummary });
                
                if (runningPrincipal > 0) {
                    yearlySummary = {
                        year: y + 1,
                        openingBalance: runningPrincipal,
                        principalPaid: 0,
                        interestPaid: 0,
                        prepayments: 0,
                        closingBalance: 0
                    };
                }
            }

            // Move to next month
            currentD.setMonth(currentD.getMonth() + 1);
            monthCount++;
        }

        return { schedule: results, baseEMI, totalPrincipal: loanAmount };
    }, [loanAmount, interestRate, tenureYears, startMonth, startYear, events]);

    const totalInterest = useMemo(() => {
        return calculationData.schedule.reduce((sum, y) => sum + y.interestPaid, 0);
    }, [calculationData]);

    const totalPaid = calculationData.totalPrincipal + totalInterest;

    return (
        <div className="fade-in" style={{ padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <Calculator size={32} color="var(--primary)" />
                    <div>
                        <h1 style={{ margin: 0 }}>Home Loan Calculator</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Advanced Daily Rest calculation with prepayment & rate change support.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '2.5rem' }}>
                    {/* Left Column: Inputs & Events */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label><DollarSign size={16} /> Loan Amount (₹)</label>
                            <input 
                                type="number" 
                                value={loanAmount} 
                                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        <div className="form-group">
                            <label><TrendingDown size={16} /> Annual Interest Rate (%)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={interestRate} 
                                onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        <div className="form-group">
                            <label><Clock size={16} /> Tenure (Years)</label>
                            <input 
                                type="number" 
                                value={tenureYears} 
                                onChange={(e) => setTenureYears(parseInt(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="form-group">
                                <label>Start Month</label>
                                <select value={startMonth} onChange={(e) => setStartMonth(parseInt(e.target.value))} className="form-input">
                                    {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Year</label>
                                <select value={startYear} onChange={(e) => setStartYear(parseInt(e.target.value))} className="form-input">
                                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Event System */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Adjustments & Events</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" onClick={() => addEvent('prepayment')} title="Add Prepayment" style={{ padding: '4px 8px', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', fontSize: '0.75rem' }}>+ Prepay</button>
                                    <button className="btn" onClick={() => addEvent('rate_change')} title="Add Rate Change" style={{ padding: '4px 8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #3b82f6', fontSize: '0.75rem' }}>+ Rate %</button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {events.map(event => (
                                    <div key={event.id} className="card" style={{ padding: '0.75rem', position: 'relative', border: `1px solid ${event.type === 'prepayment' ? '#10b981' : '#3b82f6'}` }}>
                                        <button onClick={() => removeEvent(event.id)} style={{ position: 'absolute', top: '4px', right: '4px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{event.type.replace('_', ' ')}</div>
                                            <select value={event.month} onChange={(e) => updateEvent(event.id, 'month', e.target.value)} style={{ fontSize: '0.8rem', padding: '2px' }}>
                                                {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                                            </select>
                                            <select value={event.year} onChange={(e) => updateEvent(event.id, 'year', e.target.value)} style={{ fontSize: '0.8rem', padding: '2px' }}>
                                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <input 
                                                type="number" 
                                                placeholder={event.type === 'prepayment' ? 'Amount' : 'New Rate %'} 
                                                value={event.value} 
                                                onChange={(e) => updateEvent(event.id, 'value', e.target.value)} 
                                                style={{ width: '100%', padding: '4px', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Summaries & Table */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Summary Header */}
                        <div style={{ 
                            padding: '2rem', 
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                            borderRadius: '16px', 
                            color: 'white',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem', color: 'white' }}>Monthly EMI</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>₹{Math.round(calculationData.baseEMI).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '1.5rem' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem', color: 'white' }}>Total Principal</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>₹{loanAmount.toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '1.5rem' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem', color: 'white' }}>Total Interest</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>₹{Math.round(totalInterest).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.3)', paddingLeft: '1.5rem' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem', color: 'white' }}>Total Payable</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>₹{Math.round(totalPaid).toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Amortization Table */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="summary-table" style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '2px solid var(--border)', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Year</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Opening Balance</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Principal Paid</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Interest Paid</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Prepayments</th>
                                            <th style={{ padding: '1rem', textAlign: 'right' }}>Closing Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculationData.schedule.map((row, idx) => (
                                            <tr key={row.year} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : '#f8fbfc' }}>
                                                <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{row.year}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹{Math.round(row.openingBalance).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹{Math.round(row.principalPaid).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>₹{Math.round(row.interestPaid).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#059669' }}>{row.prepayments > 0 ? `₹${row.prepayments.toLocaleString('en-IN')}` : '-'}</td>
                                                <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 700, color: '#1e40af' }}>₹{Math.round(row.closingBalance).toLocaleString('en-IN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeLoanCalculator;
