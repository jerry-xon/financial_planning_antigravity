import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const LoanDetailsModal = ({ isOpen, onClose, onSave, initialData, loanTypeTitle }) => {
    const [formData, setFormData] = useState({
        principal: '',
        rate: '',
        tenure: '',
        startMonth: new Date().getMonth() + 1,
        startYear: new Date().getFullYear(),
        emi: ''
    });

    useEffect(() => {
        if (initialData && typeof initialData === 'object' && initialData.principal) {
            setFormData(initialData);
        } else {
            setFormData({
                principal: '',
                rate: '',
                tenure: '',
                startMonth: new Date().getMonth() + 1,
                startYear: new Date().getFullYear(),
                emi: initialData || ''
            });
        }
    }, [initialData, isOpen]);

    // Calculate EMI dynamically
    useEffect(() => {
        const p = parseFloat(formData.principal) || 0;
        const r = parseFloat(formData.rate) || 0;
        const n = parseFloat(formData.tenure) || 0;

        if (p > 0 && r > 0 && n > 0) {
            const monthlyRate = r / 12 / 100;
            const calculatedEmi = Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
            setFormData(prev => ({ ...prev, emi: calculatedEmi }));
        }
    }, [formData.principal, formData.rate, formData.tenure]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const handleClear = () => {
        onSave(''); // Clear back to empty string primitive
        onClose();
    };

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card fade-in" style={{
                background: 'var(--bg-main)', width: '90%', maxWidth: '500px',
                padding: '2rem', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                border: '1px solid var(--border)'
            }}>
                <h3 style={{ marginTop: 0, color: 'var(--primary)', borderBottom: '2px solid var(--border)', paddingBottom: '0.75rem' }}>
                    Configure {loanTypeTitle} Details
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    Entering these details allows the Timeline Engine to mathematically map exact loan closures and dynamic surplus spikes in your lifelong roadmap.
                </p>

                <div className="input-grid-mini" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Original Loan Amount (₹)</label>
                        <input type="number" 
                            value={formData.principal} 
                            onChange={(e) => setFormData({...formData, principal: e.target.value})} 
                            placeholder="e.g. 5000000" />
                    </div>

                    <div className="input-group">
                        <label>Interest Rate (%)</label>
                        <input type="number" 
                            value={formData.rate} 
                            onChange={(e) => setFormData({...formData, rate: e.target.value})} 
                            placeholder="e.g. 8.5" />
                    </div>

                    <div className="input-group">
                        <label>Total Tenure (Months)</label>
                        <input type="number" 
                            value={formData.tenure} 
                            onChange={(e) => setFormData({...formData, tenure: e.target.value})} 
                            placeholder="e.g. 240 for 20 Yrs" />
                    </div>

                    <div className="input-group">
                        <label>Start Month</label>
                        <select value={formData.startMonth} onChange={(e) => setFormData({...formData, startMonth: e.target.value})}>
                            {[...Array(12)].map((_, i) => (
                                <option key={i+1} value={i+1}>{new Date(2000, i, 1).toLocaleString('default', { month: 'short' })}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label>Start Year</label>
                        <select 
                            value={formData.startYear} 
                            onChange={(e) => setFormData({...formData, startYear: parseInt(e.target.value, 10)})}
                        >
                            {[...Array(31)].map((_, i) => {
                                const y = new Date().getFullYear() - 30 + i;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Calculated Monthly EMI:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>₹{Number(formData.emi).toLocaleString('en-IN') || '0'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button className="btn btn-danger" onClick={handleClear} style={{ padding: '0.6rem 1rem' }}>Clear Loan</button>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1rem' }}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave} style={{ padding: '0.6rem 1.5rem' }} disabled={!formData.emi}>Save Configuration</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LoanDetailsModal;
