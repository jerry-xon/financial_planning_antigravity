import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, HelpCircle, Phone, Mail, ExternalLink, Send, Check } from 'lucide-react';
import {
    submitSupportRequestViaWeb3forms,
    getSupportWeb3StorageKey,
    isSupportWeb3CooldownActive,
    markSupportWeb3Sent,
} from '../../services/supportRequestEmailService';

const ERROR_COOLDOWN_SEC = 60;

const ContextualHelpPopup = ({ isOpen, onClose, title, message, supportContacts, imageSrc, logoSrc, supportEmailContext, children }) => {
    const [sendState, setSendState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [retrySeconds, setRetrySeconds] = useState(null);

    const userEmail = supportEmailContext?.userEmail;
    const moduleName = supportEmailContext?.moduleName;
    const storageKey =
        supportEmailContext && userEmail != null && moduleName != null
            ? getSupportWeb3StorageKey(userEmail, moduleName)
            : null;

    useEffect(() => {
        if (!isOpen || !supportEmailContext || !storageKey) return;
        if (isSupportWeb3CooldownActive(storageKey)) {
            setSendState('success');
        } else {
            setSendState('idle');
        }
        setRetrySeconds(null);
    }, [isOpen, storageKey]);

    useEffect(() => {
        if (retrySeconds === null || retrySeconds <= 0) return undefined;
        const t = setTimeout(() => {
            setRetrySeconds((prev) => {
                if (prev === null || prev <= 1) {
                    setSendState('idle');
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearTimeout(t);
    }, [retrySeconds]);

    const handleSendSupportEmail = async () => {
        if (!supportEmailContext || !storageKey || sendState === 'loading' || sendState === 'success') return;
        if (isSupportWeb3CooldownActive(storageKey)) {
            setSendState('success');
            return;
        }

        setSendState('loading');
        console.log('[Help & Support] Send email button: submitting', {
            moduleName: supportEmailContext?.moduleName,
        });

        try {
            const { ok, message } = await submitSupportRequestViaWeb3forms(supportEmailContext);

            if (ok) {
                console.log('[Help & Support] Send email button: success');
                markSupportWeb3Sent(storageKey);
                setSendState('success');
                setRetrySeconds(null);
            } else {
                console.error('[Help & Support] Send email button: failed', {
                    message,
                    moduleName: supportEmailContext?.moduleName,
                });
                setSendState('error');
                setRetrySeconds(ERROR_COOLDOWN_SEC);
            }
        } catch (err) {
            console.error('[Help & Support] Send email button: unexpected error', {
                moduleName: supportEmailContext?.moduleName,
                error: err,
            });
            setSendState('error');
            setRetrySeconds(ERROR_COOLDOWN_SEC);
        }
    };

    if (!isOpen) return null;

    const supportButtonDisabled =
        sendState === 'loading' ||
        sendState === 'success' ||
        (sendState === 'error' && retrySeconds !== null && retrySeconds > 0);

    const supportButtonStyle = {
        marginTop: '1rem',
        width: '100%',
        padding: '0.85rem 1.25rem',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        borderRadius: '12px',
        border: 'none',
        cursor: supportButtonDisabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s, color 0.2s',
        flexWrap: 'wrap',
        textAlign: 'center',
        lineHeight: 1.35,
    };

    let supportButtonColors = {
        background: 'var(--primary)',
        color: '#fff',
    };
    if (sendState === 'success') {
        supportButtonColors = { background: '#16a34a', color: '#fff' };
    } else if (sendState === 'error') {
        supportButtonColors = { background: '#dc2626', color: '#fff' };
    } else if (sendState === 'loading') {
        supportButtonColors = { background: 'var(--primary)', color: '#fff', opacity: 0.85 };
    }

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
                    {logoSrc && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <img src={logoSrc} alt="Logo" style={{ height: '60px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                    )}
                    {message && (
                        <p style={{ 
                            margin: '0 0 1.5rem', 
                            lineHeight: '1.6', 
                            fontSize: '1.05rem', 
                            color: 'var(--text-main)' 
                        }}>
                            {message}
                        </p>
                    )}
                    {children && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            {children}
                        </div>
                    )}

                    {imageSrc && (
                        <div style={{ margin: '0 0 1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                <a 
                                    href={imageSrc} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.85rem',
                                        color: 'var(--primary)',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        padding: '4px 8px',
                                        background: 'rgba(37, 99, 235, 0.05)',
                                        borderRadius: '6px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(37, 99, 235, 0.05)'}
                                >
                                    <ExternalLink size={14} />
                                    Enlarge Image
                                </a>
                            </div>
                            <div 
                                style={{ 
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-card)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => window.open(imageSrc, '_blank')}
                                title="Click to enlarge"
                            >
                                <img 
                                    src={imageSrc} 
                                    alt="Support Visual" 
                                    style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.3s ease' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            </div>
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
                    {supportContacts && supportEmailContext && (
                        <button
                            type="button"
                            onClick={handleSendSupportEmail}
                            disabled={supportButtonDisabled}
                            style={{ ...supportButtonStyle, ...supportButtonColors }}
                        >
                            {sendState === 'loading' && (
                                <>
                                    <Send size={18} />
                                    Sending…
                                </>
                            )}
                            {sendState === 'success' && (
                                <>
                                    <Check size={18} strokeWidth={2.5} />
                                    Email sent
                                </>
                            )}
                            {sendState === 'error' && (
                                <span style={{ fontSize: '0.92rem' }}>
                                    Issue sending email. Please try refreshing your browser or try again in{' '}
                                    <strong>{retrySeconds ?? 0}s</strong>.
                                </span>
                            )}
                            {sendState === 'idle' && (
                                <>
                                    <Send size={18} />
                                    Email support with my details
                                </>
                            )}
                        </button>
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
