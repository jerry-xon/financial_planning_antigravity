import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invokePartnerApi } from '../lib/partnerApi';
import { useAuth } from '../lib/AuthContext';

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-js';

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const existing = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay));
      existing.addEventListener('error', () => reject(new Error('Razorpay failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Razorpay failed to load'));
    document.body.appendChild(script);
  });
}

export function UpgradeSeatsModal({ open, onClose, onSuccess }) {
  const { me, refreshMe } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const buy = async (pack) => {
    setError('');
    setBusy(true);
    try {
      const order = await invokePartnerApi('create_seat_order', { pack });
      const Razorpay = await loadRazorpay();
      await new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Finbrella Partner Seats',
          description: pack === 'pack' ? 'Pack of 5 seats' : '1 client seat',
          order_id: order.order_id,
          prefill: {
            email: me?.partner?.email || '',
            name: me?.partner?.full_name || '',
            contact: me?.partner?.phone || '',
          },
          handler: async (response) => {
            try {
              await invokePartnerApi('confirm_seat_payment', {
                pack,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              await refreshMe();
              onSuccess?.();
              onClose?.();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => resolve(),
          },
        });
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp?.error?.description || 'Payment failed'));
        });
        rzp.open();
      });
    } catch (err) {
      setError(err.message || 'Purchase failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'rgba(0,0,0,0.35)',
            display: 'grid',
            placeItems: 'center',
            padding: '1rem',
          }}
          onClick={() => !busy && onClose?.()}
        >
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(440px, 100%)', padding: '1.5rem' }}
          >
            <h2 style={{ margin: '0 0 0.35rem' }}>Add client seats</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              You&apos;ve used your free seats. Choose a pack to keep adding clients.
            </p>
            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busy}
                onClick={() => buy('single')}
                style={{ justifyContent: 'space-between', borderRadius: 14, padding: '1rem 1.1rem' }}
              >
                <span>1 seat</span>
                <strong>₹250</strong>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => buy('pack')}
                style={{ justifyContent: 'space-between', borderRadius: 14, padding: '1rem 1.1rem' }}
              >
                <span>Pack of 5</span>
                <strong>₹2,000</strong>
              </button>
            </div>
            {error ? <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p> : null}
            <button type="button" className="btn btn-ghost" disabled={busy} onClick={onClose} style={{ marginTop: '0.75rem', width: '100%' }}>
              Not now
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
