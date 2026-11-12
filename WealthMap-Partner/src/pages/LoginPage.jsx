import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';

export function LoginPage() {
  const { signIn, refreshMe, signOut } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialMode = params.get('mode') === 'client' ? 'client' : 'partner';
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const subtitle = useMemo(
    () =>
      mode === 'partner'
        ? 'Manage clients, seats, and reports.'
        : 'View the financial report shared with you.',
    [mode],
  );

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      const me = await refreshMe();
      if (mode === 'partner' && me?.kind !== 'partner') {
        await signOut();
        setError('This account is not a partner. Switch to Client and try again.');
        return;
      }
      if (mode === 'client' && me?.kind !== 'client') {
        await signOut();
        setError('This account is not a client. Switch to Partner and try again.');
        return;
      }
      navigate(mode === 'client' ? '/report' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.45 }}
        style={{ width: 'min(440px, 100%)', padding: '1.75rem' }}
      >
        <p style={{ margin: 0, fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.03em' }}>
          Finbrella Partner
        </p>
        <p className="muted" style={{ marginTop: '0.35rem' }}>
          {subtitle}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            padding: '0.35rem',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 980,
            margin: '1.25rem 0 1.5rem',
          }}
        >
          {['partner', 'client'].map((m) => (
            <button
              key={m}
              type="button"
              className="btn"
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? '#fff' : 'transparent',
                boxShadow: mode === m ? 'var(--shadow)' : 'none',
                color: 'var(--text)',
                textTransform: 'capitalize',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
            {busy ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
