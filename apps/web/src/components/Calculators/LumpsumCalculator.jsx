import React, { useState, useMemo } from 'react';
import { Calculator, Calendar, DollarSign, TrendingUp, Clock, Plus, Trash2, Info } from 'lucide-react';

export const computeLumpsumData = (investmentAmount, expectedReturns, tenureYears, startMonth, startYear, events, proposedLumpsums, goalMappings = {}, goals = []) => {
    let results = [];
    let runningBalance = investmentAmount;
    const monthlyMultiplier = Math.pow(1 + expectedReturns / 100, 1/12);
    
    let currentMonthVal = startMonth;
    let currentYearVal = startYear;
    const totalMonths = tenureYears * 12;

    let yearlyRecord = {
        year: currentYearVal,
        investmentAndAddition: 0,
        withdrawal: 0,
        endValueBeforeWithdrawal: 0,
        valueAfterWithdrawal: 0
    };

    for (let m = 0; m < totalMonths; m++) {
        // Initial investment at start of first loop
        if (m === 0) {
            yearlyRecord.investmentAndAddition += investmentAmount;
        }

        // Auto Roadmap Goal Withdrawals (Triggered in December to preserve annual compounding)
        let totalRoadmapWithdrawalThisMonth = 0;
        if (currentMonthVal === 12 || m === totalMonths - 1) {
            goals.forEach(g => {
                const actualGoalYear = new Date().getFullYear() + Math.round(parseFloat(g.yearsToGoal) || 0);
                if (actualGoalYear === currentYearVal) {
                    const mappedAmount = (goalMappings[g.id] || {})['lumpsum'] || 0;
                    if (mappedAmount > 0) {
                        totalRoadmapWithdrawalThisMonth += parseFloat(mappedAmount);
                    }
                }
            });
        }

        // Check for mid-tenure additions or withdrawals (Manual)
        const monthlyEvents = events.filter(e => parseInt(e.month) === currentMonthVal && parseInt(e.year) === currentYearVal);
        
        let monthManualWithdrawal = 0;
        monthlyEvents.forEach(e => {
            if (e.type === 'addition') {
                runningBalance += parseFloat(e.amount) || 0;
                yearlyRecord.investmentAndAddition += parseFloat(e.amount) || 0;
            } else if (e.type === 'withdrawal') {
                monthManualWithdrawal += parseFloat(e.amount) || 0;
            }
        });

        // Combine Auto and Manual Withdrawals
        const totalWithdrawal = monthManualWithdrawal + totalRoadmapWithdrawalThisMonth;
        yearlyRecord.withdrawal += totalWithdrawal;
        runningBalance -= totalWithdrawal;

        // Check for Proposed Lumpsums from Allocation Module
        const autoLumpsums = proposedLumpsums.filter(l => parseInt(l.startYear) === currentYearVal && parseInt(l.startMonth) === currentMonthVal);
        autoLumpsums.forEach(l => {
            const amount = parseFloat(l.amount) || 0;
            runningBalance += amount;
            yearlyRecord.investmentAndAddition += amount;
        });

        // Apply Monthly Growth
        runningBalance *= monthlyMultiplier;

        // Rollup to Yearly Results (Calendar Year)
        // Push if it's December or the absolute last month of the tenure
        if (currentMonthVal === 12 || m === totalMonths - 1) {
            yearlyRecord.endValueBeforeWithdrawal = runningBalance + yearlyRecord.withdrawal;
            yearlyRecord.valueAfterWithdrawal = runningBalance;
            results.push({ ...yearlyRecord });

            // Prepare for next year if tenure continues
            if (m < totalMonths - 1) {
                currentYearVal++;
                yearlyRecord = {
                    year: currentYearVal,
                    investmentAndAddition: 0,
                    withdrawal: 0,
                    endValueBeforeWithdrawal: 0,
                    valueAfterWithdrawal: 0
                };
            }
        }

        // Increment Month
        currentMonthVal = (currentMonthVal % 12) + 1;
    }

    return results;
};

import { useFinancialPlan } from '../../contexts/FinancialPlanContext';

const LumpsumCalculator = ({ calculatorKey = "lumpsum" }) => {
    const { familyMembers = [], investmentAllocations = [], goalMappings = {}, goals = [], calculatorInputs, setCalculatorInputs } = useFinancialPlan();
    const data = calculatorInputs[calculatorKey] || {};
    const setData = (newData) => setCalculatorInputs(prev => ({ ...prev, [calculatorKey]: typeof newData === 'function' ? newData(prev[calculatorKey] || {}) : newData }));
    const proposedLumpsums = investmentAllocations.filter(a => a.type === 'Lumpsum' || a.type === 'Lump Sum');
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // ... logic to get years to retire ...
    const getYearsToRetire = () => {
        const self = familyMembers.find(m => m.relation?.toLowerCase() === 'self');
        if (!self || !self.dob) return 10; 
        
        const birthDate = new Date(self.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        const retirementAge = parseInt(self.retirementAge) || 60;
        const yearsRemaining = retirementAge - age;
        return yearsRemaining > 0 ? yearsRemaining : 0;
    };

    const defaultTenure = getYearsToRetire() || 10;

    // Use props if available, otherwise defaults
    const investmentAmount = data?.amount ?? 0;
    const expectedReturns = data?.rate ?? 12;
    const tenureYears = data?.tenure ?? defaultTenure; // Use defaultTenure here
    const events = data?.events ?? [];

    const setInvestmentAmount = (val) => setData({ ...data, amount: val });
    const setExpectedReturns = (val) => setData({ ...data, rate: val });
    const setTenureYears = (val) => setData({ ...data, tenure: val });
    const setEvents = (val) => setData({ ...data, events: typeof val === 'function' ? val(events) : val });

    // State for inputs
    const [startMonth, setStartMonth] = useState(currentMonth);
    const [startYear, setStartYear] = useState(currentYear);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear - 5 + i);

    const addEvent = (type) => {
        setEvents([...events, {
            id: Date.now(),
            type,
            amount: 0,
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

    // Calculation Logic: CAGR (Monthly logic for accuracy over full tenure)
    const calculationData = useMemo(() => {
        return computeLumpsumData(investmentAmount, expectedReturns, tenureYears, startMonth, startYear, events, proposedLumpsums, goalMappings, goals);
    }, [investmentAmount, expectedReturns, tenureYears, startMonth, startYear, events, proposedLumpsums, goalMappings, goals]);

    const finalValue = calculationData[calculationData.length - 1]?.valueAfterWithdrawal || 0;
    const totalInvested = investmentAmount + events.filter(e => e.type === 'addition').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalWithdrawals = events.filter(e => e.type === 'withdrawal').reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    return (
        <div className="fade-in" style={{ padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <Calculator size={32} color="var(--primary)" />
                    <div>
                        <h1 style={{ margin: 0 }}>Lumpsum Calculator</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Measure one-time investment growth using CAGR until retirement ({currentYear + defaultTenure}).</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* SECTION 1: PRIMARY INPUTS */}
                    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>Primary Parameters</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label><DollarSign size={16} /> Initial Investment Amount (₹)</label>
                                <input 
                                    type="number" 
                                    value={investmentAmount} 
                                    onChange={(e) => setInvestmentAmount(parseFloat(e.target.value) || 0)} 
                                    className="form-input" 
                                />
                            </div>

                            <div className="form-group">
                                <label><TrendingUp size={16} /> Expected Returns (CAGR %)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={expectedReturns} 
                                    onChange={(e) => setExpectedReturns(parseFloat(e.target.value) || 0)} 
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
                                <small className="text-muted">Tenure in Months: {tenureYears * 12}</small>
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
                        </div>
                    </div>

                    {/* SECTION 2: INCREMENTAL ADJUSTMENTS */}
                    <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-main)' }}>Future Additions & Withdrawals</h3>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn" onClick={() => addEvent('addition')} style={{ padding: '0.4rem 0.8rem', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981', fontSize: '0.85rem' }}>+ Add</button>
                                <button className="btn" onClick={() => addEvent('withdrawal')} style={{ padding: '0.4rem 0.8rem', background: '#fff1f2', color: '#e11d48', border: '1px solid #f43f5e', fontSize: '0.85rem' }}>- Withdraw</button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {/* Proposed Lumpsums from Allocation */}
                            {proposedLumpsums.map((l) => (
                                <div key={`proposed-${l.id}`} className="card" style={{ padding: '1rem', border: '1px solid #6366f1', background: '#f5f3ff', position: 'relative', flex: '1 1 auto', minWidth: '260px', maxWidth: '350px' }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#6366f1', marginBottom: '0.75rem' }}>
                                        ALLOCATION MODULE: {l.type}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Amount</span>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{parseFloat(l.amount).toLocaleString('en-IN')}</div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</span>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{monthNames[l.startMonth - 1]} {l.startYear}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Roadmap Module Auto-Withdrawals */}
                            {goals.flatMap(g => {
                                const mappedAmt = (goalMappings[g.id] || {})['lumpsum'] || 0;
                                const gYear = new Date().getFullYear() + Math.round(parseFloat(g.yearsToGoal) || 0);
                                if (mappedAmt > 0 && gYear >= startYear && gYear <= startYear + tenureYears) {
                                    return [(
                                        <div key={`roadmap-lumpsum-${g.id}`} className="card" style={{ padding: '1rem', border: '1px solid #f59e0b', background: '#fffbeb', position: 'relative', flex: '1 1 auto', minWidth: '260px', maxWidth: '350px' }}>
                                            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#d97706', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Calculator size={12} /> FULFILLMENT ROADMAP
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Auto Withdrawal</span>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{parseFloat(mappedAmt).toLocaleString('en-IN')}</div>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Goal Year</span>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{gYear} ({g.name || 'Goal'})</div>
                                            </div>
                                        </div>
                                    )];
                                }
                                return [];
                            })}

                            {/* Manual Events */}
                            {events.map(event => (
                                <div key={event.id} className="card" style={{ padding: '1rem', position: 'relative', border: `1px solid ${event.type === 'addition' ? '#10b981' : '#f43f5e'}`, flex: '1 1 auto', minWidth: '260px', maxWidth: '350px' }}>
                                    <button onClick={() => removeEvent(event.id)} style={{ position: 'absolute', top: '8px', right: '8px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginRight: '1.5rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: event.type === 'addition' ? '#10b981' : '#f43f5e', width: '80px' }}>
                                                {event.type}
                                            </span>
                                            <select value={event.month} onChange={(e) => updateEvent(event.id, 'month', e.target.value)} className="form-input" style={{ fontSize: '0.8rem', padding: '0.3rem', width: 'auto' }}>
                                                {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                                            </select>
                                            <select value={event.year} onChange={(e) => updateEvent(event.id, 'year', e.target.value)} className="form-input" style={{ fontSize: '0.8rem', padding: '0.3rem', width: 'auto' }}>
                                                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                        <input 
                                            type="number" 
                                            placeholder="Amount (₹)" 
                                            value={event.amount} 
                                            onChange={(e) => updateEvent(event.id, 'amount', e.target.value)} 
                                            className="form-input"
                                            style={{ width: '100%', padding: '0.4rem', fontSize: '0.85rem' }} 
                                        />
                                    </div>
                                </div>
                            ))}
                            {events.length === 0 && proposedLumpsums.length === 0 && goals.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', width: '100%', border: '1px dashed var(--border)', padding: '1.5rem', borderRadius: '8px' }}>No adjustments added.</p>}
                        </div>
                    </div>

                    {/* SECTION 3: VISUALIZATION */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        {/* Summary Header */}
                        <div style={{ 
                            padding: '2rem', 
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                            borderRadius: '16px', 
                            color: 'white',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Projected Value</p>
                                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>₹{Math.round(finalValue).toLocaleString('en-IN')}</h2>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Total Invested</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{totalInvested.toLocaleString('en-IN')}</h3>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.8, fontSize: '0.9rem' }}>Wealth Created</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(finalValue - totalInvested + totalWithdrawals).toLocaleString('en-IN')}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Amortization Table */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                                <table className="summary-table" style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '1.25rem', textAlign: 'left' }}>Year</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>Investment & Addition</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>End Value (Pre-With)</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>Withdrawal</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right' }}>Final Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculationData.map((row, idx) => (
                                            <tr key={row.year} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                                                <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{row.year}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right' }}>₹{row.investmentAndAddition.toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>₹{Math.round(row.endValueBeforeWithdrawal).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', color: '#e11d48' }}>{row.withdrawal > 0 ? `₹${row.withdrawal.toLocaleString('en-IN')}` : '-'}</td>
                                                <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>₹{Math.round(row.valueAfterWithdrawal).toLocaleString('en-IN')}</td>
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

export default LumpsumCalculator;
