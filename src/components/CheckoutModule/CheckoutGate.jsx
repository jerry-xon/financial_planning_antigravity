import { useEffect, useMemo, useState } from 'react';
import { Copy, CreditCard, Tag, X } from 'lucide-react';
import ReportView from '../ReportModule/ReportView';
import { createCheckoutTransaction } from '../../services/checkoutService';
import { createRazorpayOrder, verifyRazorpaySignature } from '../../services/razorpayEdgeService';

const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-js';
const REPORT_PRICE_INR = 499;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const randomCodeSegment = (length = 5) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const CheckoutGate = ({ user, planId, reportProps }) => {
  const userId = user?.id || 'anonymous';
  const userEmail = user?.email || '';
  const userLabel = userEmail.split('@')[0] || 'Client';

  const couponStorageKey = useMemo(() => `finplan_coupon_${userId}`, [userId]);
  const accessStorageKey = useMemo(() => `finplan_report_access_${userId}`, [userId]);

  const [couponData, setCouponData] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isRecordingZeroTxn, setIsRecordingZeroTxn] = useState(false);
  const [couponValidated, setCouponValidated] = useState(false);
  const [toastOpen, setToastOpen] = useState(true);

  useEffect(() => {
    try {
      const access = localStorage.getItem(accessStorageKey) === 'true';
      if (access) {
        setIsUnlocked(true);
      }

      const raw = localStorage.getItem(couponStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.ownerUserId === userId && parsed?.code) {
          setCouponData(parsed);
          setToastOpen(!parsed.used);
          return;
        }
      }

      const newCoupon = {
        code: `FIN100-${randomCodeSegment(4)}-${randomCodeSegment(4)}`,
        ownerUserId: userId,
        used: false,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(couponStorageKey, JSON.stringify(newCoupon));
      setCouponData(newCoupon);
      setToastOpen(true);
    } catch (error) {
      console.error('Failed to initialize checkout gate', error);
    }
  }, [accessStorageKey, couponStorageKey, userId]);

  const persistCoupon = (nextCouponData) => {
    setCouponData(nextCouponData);
    localStorage.setItem(couponStorageKey, JSON.stringify(nextCouponData));
  };

  const unlockReport = () => {
    setIsUnlocked(true);
    localStorage.setItem(accessStorageKey, 'true');
  };

  const copyCoupon = async () => {
    if (!couponData?.code) return;
    try {
      await navigator.clipboard.writeText(couponData.code);
      setCouponMessage('Coupon copied. Paste it below and apply.');
    } catch (error) {
      setCouponMessage('Copy failed. Please copy manually.');
    }
  };

  const handleApplyCoupon = () => {
    if (!couponData) return;

    const typed = couponInput.trim().toUpperCase();
    if (!typed) {
      setCouponMessage('Please enter your coupon code first.');
      return;
    }
    if (couponData.ownerUserId !== userId) {
      setCouponMessage('This coupon belongs to a different user.');
      return;
    }
    if (couponData.used) {
      setCouponMessage('Coupon already used. It is valid only once.');
      return;
    }
    if (typed !== couponData.code) {
      setCouponMessage('Invalid coupon. Please use your generated code.');
      return;
    }

    setCouponValidated(true);
    setCouponMessage('Coupon validated. Complete INR 0 transaction to unlock report access.');
  };

  const handleCompleteZeroTransaction = async () => {
    if (!couponData || !couponValidated) {
      setCouponMessage('Validate coupon first to proceed with INR 0 transaction.');
      return;
    }
    if (couponData.used) {
      setCouponMessage('Coupon already used. It is valid only once.');
      return;
    }

    setCouponMessage('');
    setIsRecordingZeroTxn(true);

    const sdkReady = await loadRazorpayScript();
    if (!sdkReady || !window.Razorpay) {
      setCouponMessage('Unable to load Razorpay Checkout for coupon transaction.');
      setIsRecordingZeroTxn(false);
      return;
    }

    const { data: orderData, error: orderError } = await createRazorpayOrder({
      amountInr: 0,
      currency: 'INR',
      notes: {
        userId,
        planId: planId || '',
        couponCode: couponData.code,
        flow: 'coupon_zero_checkout',
      },
    });

    if (orderError || !orderData?.keyId) {
      setCouponMessage(orderError?.message || 'Unable to start Razorpay coupon checkout.');
      setIsRecordingZeroTxn(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: Number(orderData.amount ?? 0),
      currency: orderData.currency || 'INR',
      ...(orderData.orderId ? { order_id: orderData.orderId } : {}),
      name: 'FinPlan',
      description: 'Coupon Checkout (100% OFF)',
      handler: async (response) => {
        const { data: verifyData, error: verifyError } = await verifyRazorpaySignature({
          razorpay_payment_id: response?.razorpay_payment_id || '',
          razorpay_order_id: response?.razorpay_order_id || '',
          razorpay_signature: response?.razorpay_signature || '',
        });

        if (verifyError || !verifyData?.verified) {
          setCouponMessage('Coupon checkout completed, but signature verification failed.');
          setIsRecordingZeroTxn(false);
          return;
        }

        const { error } = await createCheckoutTransaction({
          planId,
          amountInr: 0,
          currency: 'INR',
          status: 'SUCCESS',
          paymentProvider: 'RAZORPAY',
          paymentMethod: 'COUPON_100_OFF',
          couponCode: couponData.code,
          providerPaymentId: response?.razorpay_payment_id || null,
          providerOrderId: response?.razorpay_order_id || null,
          metadata: {
            source: 'module_12_checkout',
            mode: 'coupon_100_off',
            discounted_from_inr: REPORT_PRICE_INR,
          },
        });

        if (error) {
          setCouponMessage('Razorpay callback received, but DB record failed.');
          setIsRecordingZeroTxn(false);
          return;
        }

        const next = { ...couponData, used: true, usedAt: new Date().toISOString() };
        persistCoupon(next);
        setIsRecordingZeroTxn(false);
        setCouponMessage('Coupon checkout completed via Razorpay. Report access granted.');
        unlockReport();
      },
      prefill: {
        name: userLabel,
        email: userEmail,
      },
      notes: {
        userId,
        planId: planId || '',
        couponCode: couponData.code,
        flow: 'coupon_zero_checkout',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          setIsRecordingZeroTxn(false);
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', () => {
      setCouponMessage('Coupon checkout failed on Razorpay. Please retry.');
      setIsRecordingZeroTxn(false);
    });
    paymentObject.open();
  };

  const handlePayWithRazorpay = async () => {
    setCouponMessage('');
    setIsPaying(true);

    const sdkReady = await loadRazorpayScript();
    if (!sdkReady || !window.Razorpay) {
      setCouponMessage('Unable to load Razorpay Checkout. Please try again.');
      setIsPaying(false);
      return;
    }

    const { data: orderData, error: orderError } = await createRazorpayOrder({
      amountInr: REPORT_PRICE_INR,
      currency: 'INR',
      notes: {
        userId,
        planId: planId || '',
        flow: 'paid_checkout',
      },
    });

    if (orderError || !orderData?.keyId || !orderData?.orderId) {
      setCouponMessage(orderError?.message || 'Unable to create Razorpay order.');
      setIsPaying(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency || 'INR',
      order_id: orderData.orderId,
      name: 'FinPlan',
      description: 'Complete Overview & Report Download Access',
      image: '',
      handler: async (response) => {
        const { data: verifyData, error: verifyError } = await verifyRazorpaySignature({
          razorpay_payment_id: response?.razorpay_payment_id || '',
          razorpay_order_id: response?.razorpay_order_id || '',
          razorpay_signature: response?.razorpay_signature || '',
        });

        if (verifyError || !verifyData?.verified) {
          setCouponMessage('Payment received, but signature verification failed.');
          setIsPaying(false);
          return;
        }

        const { error } = await createCheckoutTransaction({
          planId,
          amountInr: REPORT_PRICE_INR,
          currency: 'INR',
          status: 'SUCCESS',
          paymentProvider: 'RAZORPAY',
          paymentMethod: 'ONLINE',
          providerPaymentId: response?.razorpay_payment_id || null,
          providerOrderId: response?.razorpay_order_id || null,
          metadata: {
            source: 'module_12_checkout',
            mode: 'paid',
          },
        });

        if (error) {
          setCouponMessage('Payment succeeded, but DB record failed. Please contact support.');
          setIsPaying(false);
          return;
        }

        unlockReport();
        setIsPaying(false);
        setCouponMessage('Payment successful. Report access granted.');
      },
      prefill: {
        name: userLabel,
        email: userEmail,
      },
      notes: {
        userId,
        planId: planId || '',
      },
      theme: {
        color: '#2563eb',
      },
      modal: {
        ondismiss: () => {
          setIsPaying(false);
        },
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.on('payment.failed', () => {
      setCouponMessage('Payment failed. Please retry or use your coupon.');
      setIsPaying(false);
    });
    paymentObject.open();
  };

  if (isUnlocked) {
    return <ReportView {...reportProps} />;
  }

  return (
    <>
      <div className="card fade-in" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ margin: 0 }}>Complete Checkout to Unlock Overview</h2>
          <p className="text-muted" style={{ marginTop: '0.75rem' }}>
            Pay once to view the complete Module 12 Overview and download/print your report.
          </p>
        </div>

        <div style={{ padding: '2rem', display: 'grid', gap: '1.5rem' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', background: 'var(--bg-main)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} /> Razorpay Checkout
                </p>
                <p className="text-muted" style={{ margin: '0.5rem 0 0 0' }}>
                  Amount payable: <strong>INR {REPORT_PRICE_INR}</strong>
                </p>
              </div>
              <button className="btn btn-primary" onClick={handlePayWithRazorpay} disabled={isPaying}>
                {isPaying ? 'Opening Checkout...' : 'Pay with Razorpay'}
              </button>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
            <p style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={18} /> One-Time 100% Off Coupon (User Specific)
            </p>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>
              This coupon works only once and only for your account.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                style={{
                  flex: 1,
                  minWidth: '260px',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                }}
              />
              <button className="btn" onClick={copyCoupon}>Copy My Code</button>
              <button className="btn btn-primary" onClick={handleApplyCoupon}>Apply Coupon</button>
              <button
                className="btn btn-primary"
                onClick={handleCompleteZeroTransaction}
                disabled={!couponValidated || isRecordingZeroTxn || couponData?.used}
                style={{ opacity: !couponValidated || couponData?.used ? 0.65 : 1 }}
              >
                {isRecordingZeroTxn ? 'Recording INR 0 Transaction...' : 'Complete INR 0 Transaction'}
              </button>
            </div>
            {couponMessage && (
              <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                {couponMessage}
              </p>
            )}
          </div>

          <button className="btn btn-secondary" onClick={reportProps.onBack} style={{ justifySelf: 'start' }}>
            Back to Roadmap
          </button>
        </div>
      </div>

      {toastOpen && couponData?.code && !couponData.used && (
        <div
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '1rem',
            width: 'min(360px, calc(100vw - 2rem))',
            zIndex: 2000,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
            padding: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700 }}>Your one-time 100% off coupon</p>
              <p className="text-muted" style={{ margin: '0.35rem 0 0.6rem 0', fontSize: '0.85rem' }}>
                This code is tied to your account and can be used only once.
              </p>
              <code style={{ fontSize: '0.95rem', fontWeight: 700 }}>{couponData.code}</code>
            </div>
            <button
              className="btn"
              onClick={() => setToastOpen(false)}
              style={{ padding: '0.25rem', minWidth: 'auto', lineHeight: 1 }}
              aria-label="Close coupon notification"
            >
              <X size={16} />
            </button>
          </div>
          <button className="btn btn-primary" onClick={copyCoupon} style={{ marginTop: '0.8rem', width: '100%' }}>
            <Copy size={16} style={{ marginRight: '6px' }} /> Copy Code
          </button>
        </div>
      )}
    </>
  );
};

export default CheckoutGate;
