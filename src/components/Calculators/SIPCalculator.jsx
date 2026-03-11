import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, Wallet, Calendar, Calculator, Clock } from 'lucide-react';

const SIPCalculator = ({ expenseCategories, assetCategories, familyMembers = [], proposedSIPs = [] }) => {
    const currentYear = new Date().getFullYear();
    
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

    // Initial values from props
    const defaultSIP = parseFloat(expenseCategories?.savings?.mfSip) || 0;
    const defaultCorpus = parseFloat(assetCategories?.equity?.mfEquity) || parseFloat(assetCategories?.equity?.stocks) || 0;
    const defaultTenure = getYearsToRetire() || 10;

    // State for inputs
    const [monthlySIP, setMonthlySIP] = useState(defaultSIP);
    const [expectedReturns, setExpectedReturns] = useState(12);
    const [tenureYears, setTenureYears] = useState(defaultTenure);
    const [currentValue, setCurrentValue] = useState(defaultCorpus);
    
    // State for dynamic events (increments and withdrawals)
    const [events, setEvents] = useState([]);

    // Month Names Helper
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Year Options (Current Year to + 50)
    const yearOptions = Array.from({ length: 51 }, (_, i) => currentYear + i);

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
        setEvents(events.map(e => e.id === id ? { ...e, [field]: parseFloat(value) || 0 } : e));
    };

    // Calculation Logic
    const calculationData = useMemo(() => {
        let results = [];
        let runningBalance = currentValue;
        let runningSIP = monthlySIP;

        for (let relativeYear = 1; relativeYear <= tenureYears; relativeYear++) {
            let yearlyInvestment = 0;
            let yearlyWithdrawal = 0;
            const actualYear = currentYear + relativeYear - 1;

            for (let month = 1; month <= 12; month++) {
                // 1. Manual Increments
                const increments = events.filter(e => e.type === 'increment' && parseInt(e.month) === month && parseInt(e.year) === actualYear);
                increments.forEach(inc => {
                    runningSIP += inc.amount;
                });

                // 2. Proposed SIPs from Allocation Module
                const autoSIPs = proposedSIPs.filter(s => parseInt(s.startYear) === actualYear && parseInt(s.startMonth) === month);
                autoSIPs.forEach(s => {
                    // a.amount is the ANNUAL amount, so we divide by 12 for monthly increment
                    runningSIP += (parseFloat(s.amount) / 12) || 0;
                });

                const withdrawals = events.filter(e => e.type === 'withdrawal' && parseInt(e.month) === month && parseInt(e.year) === actualYear);
                let currentMonthWithdrawal = withdrawals.reduce((sum, w) => sum + w.amount, 0);

                const monthlyInvestment = runningSIP;
                yearlyInvestment += monthlyInvestment;
                
                const monthlyRate = expectedReturns / 1200;
                const valueBeforeGrowth = runningBalance + monthlyInvestment;
                const growth = valueBeforeGrowth * monthlyRate;
                const valueBeforeWithdrawal = valueBeforeGrowth + growth;
                
                runningBalance = valueBeforeWithdrawal - currentMonthWithdrawal;
                yearlyWithdrawal += currentMonthWithdrawal;
            }

            results.push({
                year: actualYear,
                monthlyInvestment: runningSIP,
                annualInvestment: yearlyInvestment,
                endValueBeforeWithdrawal: runningBalance + yearlyWithdrawal,
                withdrawal: yearlyWithdrawal,
                valueAfterWithdrawal: runningBalance
            });
        }
        return results;
    }, [monthlySIP, expectedReturns, tenureYears, currentValue, events, currentYear, proposedSIPs]);

    return (
        <div className="fade-in" style={{ padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <Calculator size={32} color="var(--primary)" />
                    <div>
                        <h1 style={{ margin: 0 }}>SIP Calculator</h1>
                        <p className="text-muted" style={{ margin: 0 }}>Plan your wealth creation until your retirement year ({currentYear + defaultTenure}).</p>
                    </div>
                </div>

                {/* Main Grid: Inputs on left (Narrow), Results on right (Wide) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '2.5rem' }}>
                    
                    {/* Left Column: Input Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="form-group">
                            <label><Wallet size={16} /> Monthly Amount of SIP (₹)</label>
                            <input 
                                type="number" 
                                value={monthlySIP} 
                                onChange={(e) => setMonthlySIP(parseFloat(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        <div className="form-group">
                            <label><TrendingUp size={16} /> Expected Returns (%)</label>
                            <input 
                                type="number" 
                                value={expectedReturns} 
                                onChange={(e) => setExpectedReturns(parseFloat(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        <div className="form-group">
                            <label><Clock size={16} /> Tenure in Years</label>
                            <input 
                                type="number" 
                                value={tenureYears} 
                                onChange={(e) => setTenureYears(parseInt(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label>Current Portfolio Value (₹)</label>
                            <input 
                                type="number" 
                                value={currentValue} 
                                onChange={(e) => setCurrentValue(parseFloat(e.target.value) || 0)} 
                                className="form-input" 
                            />
                        </div>

                        {/* Incremental Adjustments - 2x2 Grid Layout */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>Incremental Adjustments</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn" onClick={() => addEvent('increment')} title="Add Increment" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }}>
                                        <Plus size={18} />
                                    </button>
                                    <button className="btn" onClick={() => addEvent('withdrawal')} title="Add Withdrawal" style={{ width: '32px', height: '32px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff1f2', color: '#e11d48', border: '1px solid #f43f5e' }}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Proposed SIPs from Allocation */}
                                {proposedSIPs.map((s) => (
                                    <div key={`proposed-${s.id}`} className="card" style={{ padding: '1rem', border: '1px solid var(--primary)', background: '#f0f9ff', position: 'relative' }}>
                                        <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                                            ALLOCATION MODULE: {s.type}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Amount (₹)</label>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>₹{(parseFloat(s.amount) / 12).toLocaleString('en-IN')} / mo</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Starts</label>
                                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{monthNames[s.startMonth - 1]} {s.startYear}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {events.map((event) => (
                                    <div key={event.id} className="card" style={{ padding: '1rem', border: `1px solid ${event.type === 'increment' ? '#10b981' : '#f43f5e'}`, background: 'var(--bg-main)', position: 'relative' }}>
                                        <button 
                                            onClick={() => removeEvent(event.id)} 
                                            style={{ position: 'absolute', top: '4px', right: '4px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        
                                        {/* 2x2 Table Layout for Event Form */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                            {/* Row 1: Type and Amount */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', color: event.type === 'increment' ? '#059669' : '#e11d48' }}>Type</label>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{event.type === 'increment' ? 'INCREMENT' : 'WITHDRAWAL'}</div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Amount (₹)</label>
                                                <input 
                                                    type="number" 
                                                    value={event.amount} 
                                                    onChange={(e) => updateEvent(event.id, 'amount', e.target.value)}
                                                    style={{ padding: '0.4rem', fontSize: '0.85rem', width: '100%', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                    placeholder="Enter amount"
                                                />
                                            </div>

                                            {/* Row 2: Month and Year */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Month</label>
                                                <select 
                                                    value={event.month} 
                                                    onChange={(e) => updateEvent(event.id, 'month', e.target.value)}
                                                    style={{ padding: '0.4rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                >
                                                    {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <label style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Year</label>
                                                <select 
                                                    value={event.year} 
                                                    onChange={(e) => updateEvent(event.id, 'year', e.target.value)}
                                                    style={{ padding: '0.4rem', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                                                >
                                                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {events.length === 0 && proposedSIPs.length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem', textAlign: 'center', border: '1px dashed var(--border)', padding: '1rem', borderRadius: '8px' }}>No incremental adjustments added.</p>}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Output Section (Wide) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        
                        {/* Summary Header */}
                        <div style={{ 
                            padding: '2rem', 
                            background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)', 
                            borderRadius: '16px', 
                            color: 'white',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '1rem' }}>Total Invested Capital</p>
                                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>
                                        ₹{Math.round(calculationData.reduce((sum, r) => sum + r.annualInvestment, 0)).toLocaleString('en-IN')}
                                    </h2>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '1rem' }}>Final Corpus Value ({currentYear + tenureYears - 1})</p>
                                    <h2 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>
                                        ₹{Math.round(calculationData[calculationData.length - 1]?.valueAfterWithdrawal || 0).toLocaleString('en-IN')}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Table (Large Width) */}
                        <div style={{ 
                            background: 'var(--bg-card)', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border)', 
                            overflow: 'hidden',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ overflowX: 'auto', maxHeight: '700px', overflowY: 'auto' }}>
                                <table className="summary-table" style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '2px solid var(--border)', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ padding: '1.25rem', textAlign: 'left', fontWeight: 700 }}>Year</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700 }}>Monthly SIP (Final)</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700 }}>Annual Investment</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700 }}>Val. Pre-Withdrawal</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700 }}>Withdrawal</th>
                                            <th style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 700 }}>Closing Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {calculationData.map((row, idx) => (
                                            <tr key={row.year} style={{ 
                                                borderBottom: '1px solid var(--border)',
                                                background: idx % 2 === 0 ? 'transparent' : '#fcfcfc'
                                            }}>
                                                <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{row.year}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>₹{row.monthlyInvestment.toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>₹{row.annualInvestment.toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', fontWeight: 600 }}>₹{Math.round(row.endValueBeforeWithdrawal).toLocaleString('en-IN')}</td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#e11d48', fontWeight: 500 }}>
                                                    {row.withdrawal > 0 ? `₹${row.withdrawal.toLocaleString('en-IN')}` : '-'}
                                                </td>
                                                <td style={{ padding: '1rem 1.25rem', textAlign: 'right', color: '#059669', fontWeight: 800, fontSize: '1.05rem' }}>
                                                    ₹{Math.round(row.valueAfterWithdrawal).toLocaleString('en-IN')}
                                                </td>
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

export default SIPCalculator;
