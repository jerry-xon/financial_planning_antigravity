import React from 'react';
import { convertToMonthly } from './CashFlowLogic';

const CashFlowInput = ({ familyMembers, income, setIncome, expenseCategories, setExpenseCategories, onCalculate }) => {
    const handleIncomeChange = (e) => {
        const { name, value } = e.target;
        setIncome(prev => ({ ...prev, [name]: value }));
    };

    const handleExpenseChange = (category, item, value) => {
        setExpenseCategories(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [item]: value
            }
        }));
    };

    const handleInsuranceChange = (item, field, value) => {
        setExpenseCategories(prev => ({
            ...prev,
            insurance: {
                ...prev.insurance,
                [item]: {
                    ...prev.insurance[item],
                    [field]: value
                }
            }
        }));
    };

    // Auto-fill Children Education Expense
    React.useEffect(() => {
        let totalEducationMonthly = 0;
        familyMembers.forEach(member => {
            if (member.relation === 'Child') {
                if (member.occupation === 'School' && member.annualSchoolFee) {
                    totalEducationMonthly += (parseFloat(member.annualSchoolFee) || 0) / 12;
                } else if (member.occupation === 'College' && member.costOfCompleteCourse && member.courseDuration) {
                    const totalCost = parseFloat(member.costOfCompleteCourse) || 0;
                    const durationYears = parseFloat(member.courseDuration) || 1;
                    totalEducationMonthly += totalCost / (durationYears * 12);
                }
            }
        });

        if (totalEducationMonthly > 0) {
            handleExpenseChange('household', 'education', Math.round(totalEducationMonthly).toString());
        }
    }, [familyMembers]);

    const selfMember = familyMembers.find(m => m.relation?.toLowerCase() === 'self') || { name: 'Self' };
    const spouseMember = familyMembers.find(m => m.relation?.toLowerCase() === 'spouse');
    
    // Determine if spouse is a housewife (case-insensitive check)
    const isSpouseHousewife = spouseMember?.occupation?.toLowerCase() === 'housewife';

    const totalHouseholdIncome = (parseFloat(income.self) || 0) + (parseFloat(income.spouse) || 0);

    return (
        <div className="cash-flow-input">
            <div className="grid" style={{ marginBottom: '2.5rem' }}>
                <div className="cash-flow-section card" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                    <h3 style={{ borderBottom: 'none', marginBottom: '1rem' }}>Monthly Income (₹)</h3>
                    
                    <div className="income-sections-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Member 1: Self */}
                        <div className="income-form-member" style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)' }}>{selfMember.name || 'Self'}'s Income</h4>
                            <div className="input-grid-mini">
                                <div className="input-group">
                                    <label>Monthly Salary / Earnings</label>
                                    <input type="number" name="self" value={income.self} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                                <div className="input-group">
                                    <label>Bonuses, Incentives, Irregular</label>
                                    <input type="number" name="selfBonus" value={income.selfBonus} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                                <div className="input-group">
                                    <label>Rental, Dividends, Passive</label>
                                    <input type="number" name="selfPassive" value={income.selfPassive} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                                <div className="input-group">
                                    <label>Other Sources</label>
                                    <input type="number" name="selfOther" value={income.selfOther} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                            </div>
                        </div>

                        {/* Member 2: Spouse (Conditional) */}
                        {!isSpouseHousewife && spouseMember && (
                            <div className="income-form-member" style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent)' }}>{spouseMember.name || 'Spouse'}'s Income</h4>
                                <div className="input-grid-mini">
                                    <div className="input-group">
                                        <label>Monthly Salary / Earnings</label>
                                        <input type="number" name="spouse" value={income.spouse} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>Bonuses, Incentives, Irregular</label>
                                        <input type="number" name="spouseBonus" value={income.spouseBonus} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>Rental, Dividends, Passive</label>
                                        <input type="number" name="spousePassive" value={income.spousePassive} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                    </div>
                                    <div className="input-group">
                                        <label>Other Sources</label>
                                        <input type="number" name="spouseOther" value={income.spouseOther} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total Household Income Calculation */}
                        {(() => {
                            const totalSelf = (parseFloat(income.self) || 0) + (parseFloat(income.selfBonus) || 0) + (parseFloat(income.selfPassive) || 0) + (parseFloat(income.selfOther) || 0);
                            const totalSpouse = (parseFloat(income.spouse) || 0) + (parseFloat(income.spouseBonus) || 0) + (parseFloat(income.spousePassive) || 0) + (parseFloat(income.spouseOther) || 0);
                            const grandTotal = totalSelf + totalSpouse;

                            return (
                                <div className="income-summary-section" style={{ padding: '1.5rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--bg-main)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <label style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>
                                                Total Household Income (Self + Spouse)
                                            </label>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Sum total of all income sources for your family.
                                            </p>
                                        </div>
                                        <div style={{ 
                                            padding: '1rem 2rem', 
                                            background: 'var(--bg-card)', 
                                            borderRadius: '8px', 
                                            border: '1px solid var(--primary)',
                                            fontSize: '1.5rem',
                                            fontWeight: 'bold',
                                            color: 'var(--primary)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            ₹{grandTotal.toLocaleString('en-IN')}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>

            <div className="expense-categories">
                {/* Category A: Household & Lifestyle */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>A. Household & Lifestyle</h4>
                    <div className="input-grid-mini">
                        <div className="input-group">
                            <label>Household (Grocery, LPG, Fuel etc.)</label>
                            <input type="number" value={expenseCategories.household.grocery} onChange={(e) => handleExpenseChange('household', 'grocery', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>House Rent</label>
                            <input type="number" value={expenseCategories.household.rent} onChange={(e) => handleExpenseChange('household', 'rent', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Children Education</label>
                            <input 
                                type="number" 
                                value={expenseCategories.household.education} 
                                onChange={(e) => handleExpenseChange('household', 'education', e.target.value)} 
                                onWheel={(e) => e.target.blur()} 
                                placeholder="Auto-calculated from Profile"
                                style={{ background: 'var(--bg-card)', fontWeight: 600, color: 'var(--primary)' }}
                            />
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                (Auto-filled from Profile Module)
                            </div>
                        </div>
                        <div className="input-group">
                            <label>Lifestyle (Shopping, Movies, Dinner etc.)</label>
                            <input type="number" value={expenseCategories.household.lifestyle} onChange={(e) => handleExpenseChange('household', 'lifestyle', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Medical Expenses</label>
                            <input type="number" value={expenseCategories.household.medical} onChange={(e) => handleExpenseChange('household', 'medical', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Travel</label>
                            <input type="number" value={expenseCategories.household.travel} onChange={(e) => handleExpenseChange('household', 'travel', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* Category B1: EMIs */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>B1. EMIs (Monthly)</h4>
                    <div className="input-grid-mini">
                        <div className="input-group">
                            <label>Personal Loan</label>
                            <input type="number" value={expenseCategories.emi.personalLoan} onChange={(e) => handleExpenseChange('emi', 'personalLoan', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Home Loan</label>
                            <input type="number" value={expenseCategories.emi.homeLoan} onChange={(e) => handleExpenseChange('emi', 'homeLoan', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Education Loan</label>
                            <input type="number" value={expenseCategories.emi.educationLoan} onChange={(e) => handleExpenseChange('emi', 'educationLoan', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Any other EMIs</label>
                            <input type="number" value={expenseCategories.emi.otherEmi} onChange={(e) => handleExpenseChange('emi', 'otherEmi', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                    </div>
                </div>

                {/* Category B2: Insurance Premiums */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>B2. Insurance Premiums</h4>
                    <div className="insurance-grid">
                        {[
                            { key: 'health', label: 'Health Insurance' },
                            { key: 'car', label: 'Car Insurance' },
                            { key: 'bike', label: 'Two-wheeler Insurance' },
                            { key: 'life', label: 'Life Insurance Premium' },
                            { key: 'others', label: 'Others (Insurance)' }
                        ].map((ins) => (
                            <div key={ins.key} className="insurance-input-row" style={{ display: 'grid', gridTemplateColumns: '1.2fr 140px 140px', gap: '1rem', marginBottom: '1rem', alignItems: 'end' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>{ins.label}</label>
                                    <input 
                                        type="number" 
                                        value={expenseCategories.insurance[ins.key].value} 
                                        onChange={(e) => handleInsuranceChange(ins.key, 'value', e.target.value)} 
                                        onWheel={(e) => e.target.blur()} 
                                        placeholder="0" 
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Frequency</label>
                                    <select 
                                        value={expenseCategories.insurance[ins.key].frequency} 
                                        onChange={(e) => handleInsuranceChange(ins.key, 'frequency', e.target.value)}
                                        style={{ height: '42px' }}
                                    >
                                        <option value="Annual">Annual</option>
                                        <option value="Half Yearly">Half Yearly</option>
                                        <option value="Quarterly">Quarterly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label>Monthly Premium (₹)</label>
                                    <div style={{ 
                                        height: '42px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        padding: '0 1rem', 
                                        background: 'var(--bg-card)', 
                                        border: '1px solid var(--border)', 
                                        borderRadius: '6px',
                                        color: 'var(--primary)',
                                        fontWeight: 600,
                                        fontSize: '0.9rem'
                                    }}>
                                        {Math.round(convertToMonthly(expenseCategories.insurance[ins.key].value, expenseCategories.insurance[ins.key].frequency)).toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category C: Savings & Investments */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>C. Savings & Investments</h4>
                    <div className="input-grid-mini">
                        <div className="input-group">
                            <label>RD</label>
                            <input type="number" value={expenseCategories.savings.rd} onChange={(e) => handleExpenseChange('savings', 'rd', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>FD</label>
                            <input type="number" value={expenseCategories.savings.fd} onChange={(e) => handleExpenseChange('savings', 'fd', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>PPF</label>
                            <input type="number" value={expenseCategories.savings.ppf} onChange={(e) => handleExpenseChange('savings', 'ppf', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Saving Schemes</label>
                            <input type="number" value={expenseCategories.savings.savingSchemes} onChange={(e) => handleExpenseChange('savings', 'savingSchemes', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>MFs – SIP</label>
                            <input type="number" value={expenseCategories.savings.mfSip} onChange={(e) => handleExpenseChange('savings', 'mfSip', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Other Saving</label>
                            <input type="number" value={expenseCategories.savings.otherSaving} onChange={(e) => handleExpenseChange('savings', 'otherSaving', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={onCalculate} style={{ padding: '0.8rem 2.5rem' }}>
                    Generate Comprehensive Cash Flow Report
                </button>
            </div>

            <style jsx>{`
        .input-grid-mini {
          display: grid;
          gap: 1.25rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .cash-flow-input h3 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--border);
          padding-bottom: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default CashFlowInput;
