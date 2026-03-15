import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PieChart, Plus, Target, Info, TrendingUp } from 'lucide-react';
import InsuranceInput from './InsuranceInput';
import InsuranceOutput from './InsuranceOutput';
import { calculateYearlyInsuranceSummary, getInsuredNamesList } from './InsuranceLogic';
import { convertToAnnual } from '../CashFlowModule/CashFlowLogic';

const InsuranceModule = ({ familyMembers, policies, setPolicies, expenseCategories, setExpenseCategories, investmentAllocations = [], onNext, onBack, setCurrentStep }) => {
    const [results, setResults] = useState(null);
    const [showMismatchModal, setShowMismatchModal] = useState(false);
    const [amounts, setAmounts] = useState({ here: 0, cashFlow: 0 });
    const [showDetailedPolicies, setShowDetailedPolicies] = useState(false);
    const [showProposedPolicies, setShowProposedPolicies] = useState(false);

    const currentYear = new Date().getFullYear();
    const allocationPremiums = (investmentAllocations || []).filter(a => a.type === 'Life Insurance' && parseInt(a.startYear) === currentYear);

    const allocationAnnual = allocationPremiums.reduce((sum, item) => {
        const freq = item.frequency || 'Monthly';
        const interval = freq === 'Monthly' ? 1 : freq === 'Quarterly' ? 3 : freq === 'Half-Yearly' ? 6 : 12;
        const allocStartMonth = parseInt(item.startMonth) || 1;
        let installmentsThisYear = 0;
        for (let m = allocStartMonth; m <= 12; m += interval) {
            installmentsThisYear++;
        }
        return sum + ((parseFloat(item.amount) || 0) * installmentsThisYear);
    }, 0);

    const cashFlowAnnual = Object.values(expenseCategories.insurance?.life || {}).reduce((sum, item) => {
        return sum + convertToAnnual(item.value, item.frequency);
    }, 0);

    const totalExpectedPremium = cashFlowAnnual + allocationAnnual;

    const handleCalculate = () => {
        const calculated = calculateYearlyInsuranceSummary(policies);
        setResults(calculated);
    };

    const allowedMembersExisting = familyMembers.filter(member => {
        const data = expenseCategories.insurance?.life?.[member.name || member.relation];
        return data && data.value > 0;
    });

    const allowedMembersProposed = familyMembers.filter(member => {
        return (investmentAllocations || []).some(a => a.type === 'Life Insurance' && a.insuredMember === (member.name || member.relation));
    });

    const handleProceed = () => {
        // A. Total premium from this module (converted to Annual)
        const totalAnnualHere = policies.reduce((sum, p) => {
            const premium = parseFloat(p.premium) || 0;
            const freq = p.frequency || 'Annually';
            const multiplier = freq === 'Monthly' ? 12 : freq === 'Quarterly' ? 4 : freq === 'Half-Yearly' ? 2 : 1;
            return sum + (premium * multiplier);
        }, 0);

        if (Math.round(totalAnnualHere) !== Math.round(totalExpectedPremium)) {
            setAmounts({ here: Math.round(totalAnnualHere), cashFlow: Math.round(totalExpectedPremium) });
            setShowMismatchModal(true);
        } else {
            onNext();
        }
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className="fade-in">
                <div className="card">
                    <h1>Life Insurance Policies (Module 5)</h1>
                    <p className="text-muted" style={{ marginBottom: '2rem' }}>
                        Record existing life insurance plans for each family member to analyze premium outflows and total coverage.
                    </p>

                    <div className="premium-summary" style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Life Insurance Premium Summary (from Cash Flow)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                            {familyMembers.map(member => {
                                const data = expenseCategories.insurance?.life?.[member.name || member.relation] || { value: 0, frequency: 'Annual' };
                                if (!data || data.value === 0) return null;
                                return (
                                    <div key={member.name || member.relation} className="input-group">
                                        <label>Premium ({member.name || member.relation})</label>
                                        <div style={{ 
                                            padding: '0.75rem 1rem', 
                                            background: 'var(--bg-card)', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '8px',
                                            color: 'var(--primary)',
                                            fontWeight: 600,
                                            fontSize: '1rem'
                                        }}>
                                            ₹{parseFloat(data.value || 0).toLocaleString('en-IN')} ({data.frequency})
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {allocationPremiums.length > 0 && (
                            <>
                                <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>Life Insurance Premium Summary (from Allocation - Current Year)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                    {allocationPremiums.map((item, idx) => (
                                        <div key={idx} className="input-group">
                                            <label>{item.name || `Investment ${idx + 1}`} ({item.insuredMember || 'Unspecified'})</label>
                                            <div style={{ 
                                                padding: '0.75rem 1rem', 
                                                background: 'var(--bg-card)', 
                                                border: '1px solid var(--border)', 
                                                borderRadius: '8px',
                                                color: 'var(--primary)',
                                                fontWeight: 600,
                                                fontSize: '1rem'
                                            }}>
                                                ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN')} ({item.frequency || 'Monthly'})
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total Life Insurance Premium:</span>
                            <span style={{ 
                                fontSize: '1.5rem', 
                                fontWeight: 800, 
                                color: 'var(--primary)',
                                background: 'rgba(37, 99, 235, 0.1)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '8px'
                            }}>
                                ₹{totalExpectedPremium.toLocaleString('en-IN')}/year
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowDetailedPolicies(!showDetailedPolicies)}
                            style={{ 
                                flex: 1, 
                                borderStyle: 'dashed', 
                                background: 'transparent',
                                padding: '1.5rem',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: 'var(--primary)',
                                borderColor: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{showDetailedPolicies ? '-' : '+'}</span>
                            For accurate financial planning provide complete details of each policy
                        </button>

                        <button 
                            className="btn btn-secondary" 
                            onClick={() => setShowProposedPolicies(!showProposedPolicies)}
                            style={{ 
                                flex: 1, 
                                borderStyle: 'dashed', 
                                background: 'transparent',
                                padding: '1.5rem',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                color: 'var(--secondary-dark, var(--accent))',
                                borderColor: 'var(--secondary-dark, var(--accent))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px'
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{showProposedPolicies ? '-' : '+'}</span>
                            Enter complete details of Proposed Policies
                        </button>
                    </div>

                    {/* Future Proposed Policies from Allocation Module */}
                    {investmentAllocations && investmentAllocations.filter(a => a.type === 'Life Insurance').length > 0 && (
                        <div style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
                            <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                <TrendingUp size={18} />
                                Future Proposed Policies (from Allocation Module)
                            </h4>
                            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {investmentAllocations.filter(a => a.type === 'Life Insurance').map((item, idx) => (
                                    <div key={idx} style={{ 
                                        padding: '1rem', 
                                        background: 'rgba(37, 99, 235, 0.05)', 
                                        borderRadius: '8px', 
                                        border: '1px solid var(--border)',
                                        borderLeft: '4px solid var(--primary)'
                                    }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name || `Future Policy ${idx + 1}`}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Insured: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{item.insuredMember || 'Not Specified'}</span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            Starts: <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{new Date(0, item.startMonth - 1).toLocaleString('default', { month: 'short' })} {item.startYear}</span>
                                        </div>
                                        <div style={{ marginTop: '8px', fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                                            ₹{(parseFloat(item.amount) || 0).toLocaleString('en-IN')} ({item.frequency || 'Monthly'})
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {showDetailedPolicies && (
                        <div className="fade-in">
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Existing Policies</h3>
                            {allowedMembersExisting.length > 0 ? (
                                <InsuranceInput
                                    familyMembers={allowedMembersExisting}
                                    policies={policies}
                                    setPolicies={setPolicies}
                                    isProposed={false}
                                />
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No existing life insurance premiums recorded in Cash Flow.</p>
                            )}
                        </div>
                    )}

                    {showProposedPolicies && (
                        <div className="fade-in" style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Proposed Policies</h3>
                            {allowedMembersProposed.length > 0 ? (
                                <InsuranceInput
                                    familyMembers={allowedMembersProposed}
                                    policies={policies}
                                    setPolicies={setPolicies}
                                    isProposed={true}
                                    investmentAllocations={investmentAllocations}
                                />
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No proposed life insurance allocations recorded in Step 9.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Unified Generate Report Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                    <button className="btn btn-primary" onClick={handleCalculate} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                        Generate Insurance Report
                    </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.8rem 2rem' }}>
                        Back to Life Goals
                    </button>
                </div>

                {results && (
                    <div className="fade-in">
                        <InsuranceOutput summary={results} policies={policies} />
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', marginBottom: '5rem' }}>
                            <button className="btn btn-primary" onClick={handleProceed} style={{ padding: '1.25rem 4rem', fontSize: '1.2rem', fontWeight: 600 }}>
                                Proceed to Protection Gap Analysis
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Mismatch Modal */}
            {showMismatchModal && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999,
                    backdropFilter: 'blur(10px)'
                }} onClick={(e) => e.stopPropagation()}>
                    <div className="card fade-in" style={{
                        width: '90%',
                        maxWidth: '550px',
                        padding: '2.5rem',
                        textAlign: 'center',
                        background: 'var(--bg-main)',
                        border: '2px solid #ef4444',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                        margin: 'auto',
                        borderRadius: '16px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <h3 style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Premium Mismatch Detected</h3>
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
                            The Premium you entered here is <strong>₹{amounts.here.toLocaleString('en-IN')}</strong> and total expected premium (Cash Flow + Current Year Allocation) is <strong>₹{amounts.cashFlow.toLocaleString('en-IN')}</strong>.
                        </p>
                        <p style={{ marginBottom: '2.5rem', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-main)' }}>
                            For accurate Financial Plan fill complete details of all insurance policies
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); setShowMismatchModal(false); }} style={{ padding: '1rem', background: 'var(--primary)', border: 'none', color: 'white', fontWeight: 600, width: '100%' }}>
                                Fill all details or Let me match the premium
                            </button>
                            <button className="btn btn-secondary" onClick={(e) => { e.stopPropagation(); setShowMismatchModal(false); onNext(); }} style={{ padding: '1rem', fontWeight: 600, width: '100%' }}>
                                Continue Anyway
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default InsuranceModule;
