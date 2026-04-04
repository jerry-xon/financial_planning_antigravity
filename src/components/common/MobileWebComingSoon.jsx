import { Smartphone } from 'lucide-react';

/**
 * Full-viewport notice for viewports below the tablet breakpoint (see App gate using useBreakpoints().lg).
 */
export default function MobileWebComingSoon() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'var(--bg-main)',
        color: 'var(--text-main)',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '28rem',
          margin: 0,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '1rem',
            color: 'var(--primary)',
          }}
        >
          <Smartphone size={40} strokeWidth={1.5} aria-hidden />
        </div>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Mobile web — launching soon</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Kindly use a desktop browser (or a tablet in a wide layout) for now. Plan your life and finances with us on
          the full FinPlan experience — we appreciate your patience.
        </p>
      </div>
    </div>
  );
}
