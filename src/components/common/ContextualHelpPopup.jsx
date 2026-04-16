import React from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle, Phone, Mail } from 'lucide-react';

const ContextualHelpPopup = ({ isOpen, onClose, title, message, supportContacts, imageSrc }) => {
    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '1rem',
            backdropFilter: 'blur(8px)'
        }} onClick={onClose}>
            <div 
                className="fade-in"
                style={{
                    background: 'var(--bg-main)',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '600px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column'
                }} 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-card)',
                    borderTopLeftRadius: '20px',
                    borderTopRightRadius: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                            background: 'rgba(0, 169, 242, 0.1)', 
                            color: 'var(--color-2)',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <HelpCircle size={24} />
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 600 }}>
                            {title || "Need Assistance?"}
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'color 0.2s',
                            borderRadius: '50%'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--destructive)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem', flex: 1 }}>
                    <p style={{ 
                        margin: '0 0 1.5rem', 
                        lineHeight: '1.6', 
                        fontSize: '1.05rem', 
                        color: 'var(--text-main)' 
                    }}>
                        {message}
                    </p>

                    {imageSrc && (
                        <div style={{ 
                            margin: '0 0 1.5rem', 
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                            background: 'var(--bg-card)',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <img 
                                src={imageSrc} 
                                alt="Support Visual" 
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    )}

                    {supportContacts && (
                        <div style={{ 
                            background: 'rgba(37, 99, 235, 0.05)',
                            border: '1px solid var(--border)',
                            borderLeft: '4px solid var(--primary)',
                            borderRadius: '12px',
                            padding: '1.25rem'
                        }}>
                            <h4 style={{ margin: '0 0 1rem', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                                Contact Finbrella Support:
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {supportContacts.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                                        <Mail size={18} color="var(--primary)" />
                                        <a href={`mailto:${supportContacts.email}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                                            {supportContacts.email}
                                        </a>
                                    </div>
                                )}
                                {supportContacts.phone && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-main)' }}>
                                        <Phone size={18} color="var(--primary)" style={{ marginTop: '2px' }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {Array.isArray(supportContacts.phone) ? (
                                                supportContacts.phone.map((num, idx) => (
                                                    <a key={idx} href={`tel:${num.replace(/\s+/g, '')}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                                                        {num}
                                                    </a>
                                                ))
                                            ) : (
                                                <a href={`tel:${supportContacts.phone.replace(/\s+/g, '')}`} style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500 }}>
                                                    {supportContacts.phone}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    background: 'var(--bg-card)',
                    borderTop: '1px solid var(--border)',
                    borderBottomLeftRadius: '20px',
                    borderBottomRightRadius: '20px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <button 
                        className="btn btn-primary" 
                        onClick={onClose}
                        style={{ padding: '0.6rem 1.5rem', fontWeight: 600 }}
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ContextualHelpPopup;
