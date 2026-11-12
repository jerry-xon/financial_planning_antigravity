import { motion } from 'framer-motion';

export function Loader({ label = 'Loading…' }) {
  return (
    <div
      style={{
        minHeight: '40vh',
        display: 'grid',
        placeItems: 'center',
        gap: '0.75rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div className="spinner" />
      <span style={{ fontSize: '0.9rem' }}>{label}</span>
    </div>
  );
}

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <motion.div
      className="page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
    >
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          {title ? <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 4vw, 2rem)' }}>{title}</h1> : null}
          {subtitle ? (
            <p className="muted" style={{ margin: '0.35rem 0 0' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{actions}</div> : null}
      </header>
      {children}
    </motion.div>
  );
}
