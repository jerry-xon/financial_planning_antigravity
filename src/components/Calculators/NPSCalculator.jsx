import React, { useMemo } from 'react';
import { Calculator, TrendingUp, HeartHandshake, Briefcase } from 'lucide-react';

export const computeNPSData = (proposedNPS, expectedReturns, annuityPercent, annuityRate, selfMember, defaultNPS = 0, defaultCorpus = 0) => {
    // Determine user demographics relative to absolute dates
    const today = new Date();
    let birthYear = today.getFullYear() - 30; // default age 30
    let birthMonth = today.getMonth() + 1;

    if (selfMember?.dob) {
        const d = new Date(selfMember.dob);
        if (!isNaN(d.getTime())) {
            birthYear = d.getFullYear();
            birthMonth = d.getMonth() + 1;
        }
    }
    
    const retirementAge = parseInt(selfMember?.retirementAge) || 60;
    const maturityAbsolute = (birthYear + retirementAge) * 12 + birthMonth;
    
    let baseStartYear = today.getFullYear();
    let baseStartMonth = today.getMonth() + 1;
    
    if (proposedNPS.length > 0) {
        const earliestProposedYear = Math.min(...proposedNPS.map(p => p.startYear));
        if (earliestProposedYear < baseStartYear) {
            baseStartYear = earliestProposedYear;
            const earliestNPS = proposedNPS.find(p => p.startYear === baseStartYear);
            baseStartMonth = earliestNPS ? earliestNPS.startMonth : 1;
        }
    }
    
    const startAbsolute = baseStartYear * 12 + baseStartMonth;

    let schedule = [];
    let currentAbsolute = startAbsolute;

    let currentYearVal = baseStartYear;
    let currentMonthVal = baseStartMonth;

    let openingBalance = parseFloat(defaultCorpus) || 0;
    let yearlyInvestment = 0;
    let yearlyInterest = 0;
    let globalInvestment = 0;

    const monthlyRate = ((parseFloat(expectedReturns) || 0) / 100) / 12;

    while (currentAbsolute <= maturityAbsolute) {
        let monthlyInvestment = parseFloat(defaultNPS) || 0;
        proposedNPS.forEach(p => {
            const pStartAbsolute = p.startYear * 12 + p.startMonth;
            const pEndAbsolute = pStartAbsolute + (parseInt(p.duration) * 12) - 1;
            if (currentAbsolute >= pStartAbsolute && currentAbsolute <= pEndAbsolute) {
                monthlyInvestment += (parseFloat(p.amount) / 12) || 0;
            }
        });

        // Compound interest on opening + current month investment (start-of-month logic)
        const interest = (openingBalance + monthlyInvestment) * monthlyRate;
        
        yearlyInvestment += monthlyInvestment;
        globalInvestment += monthlyInvestment;
        yearlyInterest += interest;
        openingBalance = openingBalance + monthlyInvestment + interest;

        // Trigger log on calendar year end or absolute plan maturity
        if (currentMonthVal === 12 || currentAbsolute === maturityAbsolute) {
            let ageAtYearEnd = currentYearVal - birthYear;
            if (currentMonthVal < birthMonth) {
                ageAtYearEnd--;
            }

            schedule.push({
                year: currentYearVal,
                age: ageAtYearEnd,
                investment: yearlyInvestment,
                interest: yearlyInterest,
                endValue: openingBalance
            });

            yearlyInvestment = 0;
            yearlyInterest = 0;
            if (currentAbsolute < maturityAbsolute) {
                currentYearVal++;
            }
        }

        currentAbsolute++;
        currentMonthVal = (currentMonthVal % 12) + 1;
    }

    const maturityCorpus = schedule.length > 0 ? schedule[schedule.length - 1].endValue : 0;
    const validAnnuityPercent = parseFloat(annuityPercent) || 40;
    const validAnnuityRate = parseFloat(annuityRate) || 6;

    const annuityAmount = maturityCorpus * (validAnnuityPercent / 100);
    const lumpSumAmount = maturityCorpus - annuityAmount;
    const monthlyPension = (annuityAmount * (validAnnuityRate / 100)) / 12;

    return {
        schedule,
        totals: {
            maturityCorpus,
            globalInvestment,
            annuityAmount,
            lumpSumAmount,
            monthlyPension,
            retirementAge
        }
    };
};

const NPSCalculator = ({ allocations = [], familyMembers = [], expenseCategories = {}, assetCategories = {}, data, setData }) => {
    const expectedReturns = data?.rate ?? 10.00;
    const annuityPercent = data?.annuity ?? 40;
    const annuityRate = data?.annuityRate ?? 6.00;

    const defaultNPS = parseFloat(expenseCategories?.savings?.nps?.amount !== undefined ? expenseCategories.savings.nps.amount : expenseCategories?.savings?.nps) || 0;
    const defaultCorpus = parseFloat(assetCategories?.retirement?.nps) || 0;

    const setExpectedReturns = (val) => setData({ ...data, rate: val });
    const setAnnuityPercent = (val) => setData({ ...data, annuity: val });
    const setAnnuityRate = (val) => setData({ ...data, annuityRate: val });

    const proposedNPS = useMemo(() => allocations.filter(a => a.type === 'NPS'), [allocations]);
    const selfMember = useMemo(() => familyMembers.find(m => m.relation === 'Self') || familyMembers[0], [familyMembers]);

    const calculationData = useMemo(() => {
        return computeNPSData(proposedNPS, expectedReturns, annuityPercent, annuityRate, selfMember, defaultNPS, defaultCorpus);
    }, [proposedNPS, expectedReturns, annuityPercent, annuityRate, selfMember, defaultNPS, defaultCorpus]);

    const { schedule, totals } = calculationData;

    return (
        <div className="fade-in" style={{ padding: '1rem' }}>
            <div className="card" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <Briefcase size={32} color="var(--primary)" />
                    <div>
                        <h1 style={{ margin: 0 }}>NPS Calculator</h1>
                        <p className="text-muted" style={{ margin: 0 }}>National Pension System compound growth tied organically to your defined Retirement Age.</p>
                    </div>
                </div>

                {proposedNPS.length === 0 && defaultNPS === 0 && defaultCorpus === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border)', borderRadius: '12px', color: 'var(--text-muted)' }}>
                        <p>No active NPS found in the Cash Flow Baseline nor proposed in the Allocation Module.</p>
                        <p style={{ fontSize: '0.9rem' }}>Go back to Step 4 or Step 9 to map your retirement benefits.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 400px) 1fr', gap: '2.5rem' }}>
                        {/* Left Column: Inputs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="form-group">
                                <label><TrendingUp size={16} /> Expected Returns (CAGR %)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="8"
                                    max="12"
                                    value={expectedReturns} 
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value);
                                        setExpectedReturns(isNaN(val) ? '' : val);
                                    }} 
                                    onBlur={(e) => {
                                        let val = parseFloat(e.target.value);
                                        if (isNaN(val)) val = 10.00;
                                        if (val < 8) val = 8;
                                        if (val > 12) val = 12;
                                        setExpectedReturns(val.toFixed(2));
                                    }}
                                    className="form-input" 
                                />
                                <small className="text-muted">Market tracking rate: 8% to 12%. Default: 10%.</small>
                            </div>

                            <div className="form-group">
                                <label><HeartHandshake size={16} /> Required Annuity (%)</label>
                                <input 
                                    type="number" 
                                    step="1"
                                    min="40"
                                    max="100"
                                    value={annuityPercent} 
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value);
                                        setAnnuityPercent(isNaN(val) ? '' : val);
                                    }} 
                                    onBlur={(e) => {
                                        let val = parseFloat(e.target.value);
                                        if (isNaN(val)) val = 40;
                                        if (val < 40) val = 40; // Mandatory 40%
                                        if (val > 100) val = 100;
                                        setAnnuityPercent(Math.round(val));
                                    }}
                                    className="form-input" 
                                />
                                <small className="text-muted">Min 40% mandatory to claim pension post-maturity.</small>
                            </div>

                            <div className="form-group">
                                <label><Calculator size={16} /> Expected Annuity Rate (%)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    min="5"
                                    max="8"
                                    value={annuityRate} 
                                    onChange={(e) => {
                                        let val = parseFloat(e.target.value);
                                        setAnnuityRate(isNaN(val) ? '' : val);
                                    }} 
                                    onBlur={(e) => {
                                        let val = parseFloat(e.target.value);
                                        if (isNaN(val)) val = 6.00;
                                        if (val < 5) val = 5;
                                        if (val > 8) val = 8;
                                        setAnnuityRate(val.toFixed(2));
                                    }}
                                    className="form-input" 
                                />
                                <small className="text-muted">Pension yield parameter: 5% to 8%. Default: 6%.</small>
                            </div>
                        </div>

                        {/* Right Column: Visualization */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* Summary Cards */}
                            <div style={{ 
                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
                                color: 'white'
                            }}>
                                <div style={{ background: '#10b981', padding: '1.25rem', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Maturity Corpus (Age {totals.retirementAge})</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.maturityCorpus).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ background: '#6366f1', padding: '1.25rem', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Tax-Free Lump Sum</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.lumpSumAmount).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ background: '#3b82f6', padding: '1.25rem', borderRadius: '12px' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Annuity Reinvested</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.annuityAmount).toLocaleString('en-IN')}</h3>
                                </div>
                                <div style={{ background: '#8b5cf6', padding: '1.25rem', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.4)' }}>
                                    <p style={{ margin: '0 0 0.5rem 0', opacity: 0.9, fontSize: '0.85rem' }}>Expected Pension</p>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>₹{Math.round(totals.monthlyPension).toLocaleString('en-IN')}<span style={{fontSize:'0.8rem', fontWeight: 500}}>/mo</span></h3>
                                </div>
                            </div>

                            {/* Amortization Table */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                                <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
                                    <table className="summary-table" style={{ width: '100%', fontSize: '0.95rem', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', borderBottom: '2px solid var(--border)', zIndex: 10 }}>
                                            <tr>
                                                <th style={{ padding: '1.25rem', textAlign: 'left' }}>Year</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'center' }}>Age</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Investment Amount</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>Interest Earned</th>
                                                <th style={{ padding: '1.25rem', textAlign: 'right' }}>End Year Corpus</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {schedule.map((row, idx) => (
                                                <tr key={row.year} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : '#f8fafc' }}>
                                                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{row.year}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'center', opacity: 0.8 }}>{row.age}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>₹{Math.round(row.investment).toLocaleString('en-IN')}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', color: '#059669' }}>₹{Math.round(row.interest).toLocaleString('en-IN')}</td>
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
export default NPSCalculator;
