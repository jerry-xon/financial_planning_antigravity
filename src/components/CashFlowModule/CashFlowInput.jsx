import React from 'react';

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
                            <div className="input-group" style={{ maxWidth: '300px' }}>
                                <label>Monthly Salary / Earnings</label>
                                <input type="number" name="self" value={income.self} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                            </div>
                        </div>

                        {/* Member 2: Spouse (Conditional) */}
                        {!isSpouseHousewife && spouseMember && (
                            <div className="income-form-member" style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent)' }}>{spouseMember.name || 'Spouse'}'s Income</h4>
                                <div className="input-group" style={{ maxWidth: '300px' }}>
                                    <label>Monthly Salary / Earnings</label>
                                    <input type="number" name="spouse" value={income.spouse} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                            </div>
                        )}

                        {/* Total & Others */}
                        <div className="income-summary-section" style={{ padding: '1rem', borderRadius: '8px', border: '1px dotted var(--border)' }}>
                            <div className="input-grid-mini">
                                <div className="input-group">
                                    <label style={{ fontWeight: 600 }}>Total Household Income (Self + Spouse)</label>
                                    <input 
                                        type="number" 
                                        value={totalHouseholdIncome} 
                                        readOnly 
                                        className="read-only-field" 
                                        style={{ background: 'var(--bg-main)', cursor: 'not-allowed', fontStyle: 'italic', fontWeight: 'bold' }} 
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Bonuses, Incentives, Irregular</label>
                                    <input type="number" name="bonus" value={income.bonus} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                                <div className="input-group">
                                    <label>Rental, Dividends, Passive</label>
                                    <input type="number" name="passive" value={income.passive} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                                <div className="input-group">
                                    <label>Other Sources</label>
                                    <input type="number" name="other" value={income.other} onChange={handleIncomeChange} onWheel={(e) => e.target.blur()} placeholder="0" />
                                </div>
                            </div>
                        </div>
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
                            <input type="number" value={expenseCategories.household.education} onChange={(e) => handleExpenseChange('household', 'education', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
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

                {/* Category B: EMIs & Insurance */}
                <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--bg-main)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '1.25rem', fontSize: '1.1rem' }}>B. EMIs & Insurance</h4>
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
                        <div className="input-group">
                            <label>Health Insurance</label>
                            <input type="number" value={expenseCategories.emi.healthInsurance} onChange={(e) => handleExpenseChange('emi', 'healthInsurance', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Car Insurance</label>
                            <input type="number" value={expenseCategories.emi.carInsurance} onChange={(e) => handleExpenseChange('emi', 'carInsurance', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Two-wheeler Insurance</label>
                            <input type="number" value={expenseCategories.emi.bikeInsurance} onChange={(e) => handleExpenseChange('emi', 'bikeInsurance', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
                        <div className="input-group">
                            <label>Others (Insurance)</label>
                            <input type="number" value={expenseCategories.emi.otherInsurance} onChange={(e) => handleExpenseChange('emi', 'otherInsurance', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
                        </div>
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
                            <label>Life Insurance</label>
                            <input type="number" value={expenseCategories.savings.lifeInsurance} onChange={(e) => handleExpenseChange('savings', 'lifeInsurance', e.target.value)} onWheel={(e) => e.target.blur()} placeholder="0" />
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
