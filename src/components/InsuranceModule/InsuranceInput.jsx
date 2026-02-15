import React from 'react';
import { Trash2, Plus, User } from 'lucide-react';
import { calculatePolicyEndDate } from './InsuranceLogic';

const InsuranceInput = ({ familyMembers, policies, setPolicies, onCalculate }) => {

    const addPolicy = (memberName) => {
        setPolicies([
            ...policies,
            {
                id: Date.now(),
                insuredName: memberName,
                company: '',
                planName: '',
                planType: 'Term Insurance',
                startDate: '',
                endDate: '',
                sumAssured: '',
                paymentTerm: '',
                policyTerm: '',
                premium: '',
                frequency: 'Annually',
                maturityAmount: ''
            }
        ]);
    };

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

    const removePolicy = (id) => {
        setPolicies(policies.filter(p => p.id !== id));
    };

    return (
        <div className="insurance-input">
            {familyMembers.map((member, mIdx) => {
                const memberPolicies = policies.filter(p => p.insuredName === member.name);

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
                            <button className="btn btn-secondary btn-sm" onClick={() => addPolicy(member.name)}>
                                <Plus size={16} /> Add Policy
                            </button>
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
                                        <button onClick={() => removePolicy(p.id)} style={{
                                            position: 'absolute',
                                            top: '0.5rem',
                                            right: '0.5rem',
                                            color: '#ef4444',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer'
                                        }}>
                                            <Trash2 size={16} />
                                        </button>

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
                                                <label>Policy Start Date</label>
                                                <input type="date" value={p.startDate} onChange={e => updatePolicy(p.id, 'startDate', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Premium Amount</label>
                                                <input type="number" placeholder="₹" value={p.premium} onWheel={(e) => e.target.blur()} onChange={e => updatePolicy(p.id, 'premium', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Premium Frequency</label>
                                                <select value={p.frequency} onChange={e => updatePolicy(p.id, 'frequency', e.target.value)} className="input-field">
                                                    <option value="Monthly">Monthly</option>
                                                    <option value="Quarterly">Quarterly</option>
                                                    <option value="Half-Yearly">Half-Yearly</option>
                                                    <option value="Annually">Annually</option>
                                                </select>
                                            </div>
                                            <div className="input-group">
                                                <label>Premium Payment Term (Years)</label>
                                                <input type="number" placeholder="Years" value={p.paymentTerm} onWheel={(e) => e.target.blur()} onChange={e => updatePolicy(p.id, 'paymentTerm', e.target.value)} className="input-field" />
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
                                                <input type="number" placeholder="₹" value={p.sumAssured} onWheel={(e) => e.target.blur()} onChange={e => updatePolicy(p.id, 'sumAssured', e.target.value)} className="input-field" />
                                            </div>
                                            <div className="input-group">
                                                <label>Maturity Amount</label>
                                                <input type="number" placeholder="₹" value={p.maturityAmount} onWheel={(e) => e.target.blur()} onChange={e => updatePolicy(p.id, 'maturityAmount', e.target.value)} className="input-field" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                <button className="btn btn-primary" onClick={onCalculate} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                    Generate Insurance Report
                </button>
            </div>

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
