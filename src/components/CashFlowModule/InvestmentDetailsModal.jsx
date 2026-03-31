import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Target, X, Calendar, DollarSign, Clock } from 'lucide-react';

const InvestmentDetailsModal = ({ isOpen, onClose, onSave, initialData, investmentTypeTitle }) => {
    const currentYearVal = new Date().getFullYear();
    const currentMonthVal = new Date().getMonth() + 1;

    const [formData, setFormData] = useState({
        amount: '',
        startMonth: currentMonthVal,
        startYear: currentYearVal,
        duration: investmentTypeTitle === 'PPF' ? 15 : 10
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData && typeof initialData === 'object') {
                setFormData({
                    amount: initialData.amount || '',
                    startMonth: initialData.startMonth || currentMonthVal,
                    startYear: initialData.startYear || currentYearVal,
                    duration: initialData.duration || (investmentTypeTitle === 'PPF' ? 15 : 10)
                });
            } else {
                setFormData({
                    amount: initialData || '',
                    startMonth: currentMonthVal,
                    startYear: currentYearVal,
                    duration: investmentTypeTitle === 'PPF' ? 15 : 10
                });
            }
        }
    }, [isOpen, initialData, currentMonthVal, currentYearVal, investmentTypeTitle]);

    if (!isOpen) return null;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const handleSave = () => {
        const val = parseFloat(formData.amount);
        if (isNaN(val) || val <= 0) {
            onSave(''); // Revert to pure unconfigured mode
        } else {
            onSave({
                amount: val,
                startMonth: parseInt(formData.startMonth, 10),
                startYear: parseInt(formData.startYear, 10),
                duration: investmentTypeTitle === 'PPF' ? 15 : (parseInt(formData.duration, 10) || 10)
            });
        }
        onClose();
    };

    const isPPF = investmentTypeTitle === 'PPF';

    return createPortal(
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={24} className="text-primary" />
                        <h2>Configure {investmentTypeTitle} Details</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                        Configure the exact parameters of your active {investmentTypeTitle} investment to ensure accurate compounding baseline synchronization.
                    </p>

                    <div className="input-group">
                        <label>Monthly Investment / Contribution Amount (₹)</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 'bold' }}>₹</span>
                            <input 
                                type="number" 
                                value={formData.amount} 
                                onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                                placeholder="0" 
                                style={{ paddingLeft: '32px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="input-group">
                            <label>Start Month</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Calendar size={16} /></span>
                                <select 
                                    value={formData.startMonth} 
                                    onChange={(e) => setFormData({...formData, startMonth: parseInt(e.target.value, 10)})}
                                    style={{ paddingLeft: '32px' }}
                                >
                                    {monthNames.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Start Year</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Clock size={16} /></span>
                                <select 
                                    value={formData.startYear} 
                                    onChange={(e) => setFormData({...formData, startYear: parseInt(e.target.value, 10)})}
                                    style={{ paddingLeft: '32px' }}
                                >
                                    {[...Array(41)].map((_, i) => {
                                        const y = currentYearVal - 40 + i;
                                        return <option key={y} value={y}>{y}</option>;
                                    })}
                                </select>
                            </div>
                        </div>

                        {/* Extended Properties: Tenure Binding */}
                        {isPPF ? (
                            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-card)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>Mandatory Tenure: 15 Years</span>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Maturity Date: {monthNames[parseInt(formData.startMonth, 10) - 1]} {parseInt(formData.startYear, 10) + 15}</span>
                                </div>
                                <span style={{ padding: '0.25rem 0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>AUTO-LOCKED</span>
                            </div>
                        ) : (
                            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Tenure / Duration (Years)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Clock size={16} /></span>
                                    <input 
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                        style={{ paddingLeft: '32px' }}
                                        placeholder="Enter duration in years"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleSave}>Verify & Save Configuration</button>
                </div>
            </div>
            
            <style jsx>{`
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-content {
                    background: var(--bg-main); width: 90%; max-height: 90vh;
                    border-radius: 16px; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    border: 1px solid var(--border); animation: modalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .modal-header {
                    padding: 1.5rem 2rem; border-bottom: 1px solid var(--border);
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-header h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
                .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: all 0.2s; }
                .close-btn:hover { background: var(--bg-card); color: var(--danger); }
                .modal-body { padding: 2rem; }
                .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--border); background: var(--bg-card); display: flex; justify-content: flex-end; gap: 1rem; border-radius: 0 0 16px 16px; }
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>,
        document.body
    );
};

export default InvestmentDetailsModal;
