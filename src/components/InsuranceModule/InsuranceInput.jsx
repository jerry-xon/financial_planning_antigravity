import React from 'react';
import { Trash2, Plus, User } from 'lucide-react';
import { calculatePolicyEndDate } from './InsuranceLogic';
import CurrencyInput from '../common/CurrencyInput';

const InsuranceInput = ({ familyMembers, policies, setPolicies, isProposed = false, investmentAllocations = [] }) => {

    const updatePolicy = (id, field, value) => {
        setPolicies(policies.map(p => {
            if (p.id === id) {
                const updated = { ...p, [field]: value };
                // Auto-calculate end date if start date or policy term changes
                if (field === 'startDate' || field === 'policyTerm') {
                    updated.endDate = calculatePolicyEndDate(updated.startDate, updated.policyTerm);
                }
                return updated;
            }
            return p;
        }));
    };



    return (
        <div className="insurance-input">
            {familyMembers.map((member, mIdx) => {
                const memberPolicies = policies.filter(p => p.insuredName === member.name && !!p.isProposed === isProposed);

                return (
                    <div key={mIdx} className="member-section" style={{
                        marginBottom: '2rem',
                        padding: '1.5rem',
                        background: 'var(--bg-main)',
                        borderRadius: '8px',
                        border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'var(--primary)' }}>
                                <User size={18} /> {member.name || 'Unnamed Member'} ({member.relation})
                            </h3>
                        </div>

                        {memberPolicies.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0' }}>
                                No policies added for this member.
                            </p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {memberPolicies.map((p) => (
                                    <div key={p.id} className="policy-form" style={{
                                        padding: '1rem',
                                        background: 'var(--bg-card)',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        position: 'relative'
                                    }}>
                                        <div className="input-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                            <div className="input-group">
                                                <label>Insured Name</label>
                                                <input type="text" value={p.insuredName} readOnly className="input-field read-only" />
                                            </div>
                                            <div className="input-group">
                                                <label>Insurance Company</label>
                                                <input type="text" placeholder="e.g. LIC, HDFC Ergo" value={p.company} onChange={e => updatePolicy(p.id, 'company', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Plan Name</label>
                                                <input type="text" placeholder="e.g. Jeevan Anand" value={p.planName} onChange={e => updatePolicy(p.id, 'planName', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Plan Type</label>
                                                <select value={p.planType} onChange={e => updatePolicy(p.id, 'planType', e.target.value)} className="input-field">
                                                    <option value="Saving Plan">Saving Plan</option>
                                                    <option value="Term Insurance">Term Insurance</option>
                                                    <option value="ULIP">ULIP</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>{isProposed ? 'Proposed Start Date' : 'Policy Start Date'}</label>
                                                {isProposed ? (
                                                    <input 
                                                        type="month" 
                                                        value={p.startDate ? p.startDate.substring(0, 7) : ''} 
                                                        readOnly 
                                                        className="input-field read-only" 
                                                    />
                                                ) : (
                                                    <input 
                                                        type="date" 
                                                        value={p.startDate} 
                                                        max={new Date().toISOString().split('T')[0]}
                                                        onChange={e => updatePolicy(p.id, 'startDate', e.target.value)} 
                                                        onBlur={e => {
                                                            const val = e.target.value;
                                                            if (!val) return;
                                                            const today = new Date().toISOString().split('T')[0];
                                                            if (val > today) {
                                                                updatePolicy(p.id, 'startDate', today);
                                                            }
                                                        }}
                                                        className="input-field" 
                                                    />
                                                )}
                                            </div>
                                            <div className="input-group">
                                                <label>Premium Amount</label>
                                                <CurrencyInput 
                                                    name="premium"
                                                    placeholder="0" 
                                                    value={p.premium} 
                                                    readOnly={isProposed}
                                                    className={isProposed ? "input-field read-only" : "input-field"}
                                                    onChange={e => updatePolicy(p.id, 'premium', e.target.value)} 
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Premium Frequency</label>
                                                <select 
                                                    value={p.frequency} 
                                                    disabled={isProposed}
                                                    onChange={e => updatePolicy(p.id, 'frequency', e.target.value)} 
                                                    className={isProposed ? "input-field read-only" : "input-field"}
                                                >
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Quarterly">Quarterly</option>
                                                    <option value="Half-Yearly">Half-Yearly</option>
                                                    <option value="Annually">Annually</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Premium Payment Term (Years)</label>
                                                <input 
                                                    type="number" 
                                                    placeholder="Years" 
                                                    value={p.paymentTerm} 
                                                    readOnly={isProposed}
                                                    className={isProposed ? "input-field read-only" : "input-field"}
                                                    onWheel={(e) => e.target.blur()} 
                                                    onChange={e => updatePolicy(p.id, 'paymentTerm', e.target.value)} 
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Policy Term (Years)</label>
                                                <input type="number" placeholder="Years" value={p.policyTerm} onWheel={(e) => e.target.blur()} onChange={e => updatePolicy(p.id, 'policyTerm', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Policy End Date</label>
                                                <input type="date" value={p.endDate} readOnly className="input-field read-only" />
                                            </div>
                                            <div className="input-group">
                                                <label>Sum Assured (Coverage)</label>
                                                <CurrencyInput name="sumAssured" placeholder="0" value={p.sumAssured} onChange={e => updatePolicy(p.id, 'sumAssured', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Maturity Amount</label>
                                                <CurrencyInput name="maturityAmount" placeholder="0" value={p.maturityAmount} onChange={e => updatePolicy(p.id, 'maturityAmount', e.target.value)} className="input-field" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            <style>{`
                .member-section h3 { font-size: 1.1rem; }
                .input-group { display: flex; flexDirection: column; gap: 4px; }
                .input-group label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; }
                .input-field {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--border);
                    border-radius: 6px;
                    background: var(--bg-main);
                    color: var(--text-main);
                    font-size: 0.9rem;
                    transition: border-color 0.2s;
                }
                .input-field:focus { border-color: var(--primary); outline: none; }
                .input-field.read-only { background: var(--bg-card); opacity: 0.8; cursor: not-allowed; border-style: dashed; }
                .btn-sm { padding: 0.4rem 0.8rem; fontSize: 0.8rem; }
            `}</style>
        </div>
    );
};

export default InsuranceInput;
