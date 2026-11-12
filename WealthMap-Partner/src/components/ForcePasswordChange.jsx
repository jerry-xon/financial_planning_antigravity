import { useState } from 'react';
import { motion } from 'framer-motion';
import { invokePartnerApi } from '../lib/partnerApi';
import { useAuth } from '../lib/AuthContext';

export function ForcePasswordChange() {
  const { refreshMe } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Use at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setBusy(true);
    try {
      await invokePartnerApi('complete_password_change', { new_password: password });
      await refreshMe();
    } catch (err) {
      setError(err.message || 'Could not update password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.35)',
        display: 'grid',
        placeItems: 'center',
        padding: '1rem',
      }}
    >
      <motion.form
        onSubmit={onSubmit}
        className="card"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
        style={{ width: 'min(420px, 100%)', padding: '1.5rem' }}
      >
        <h2 style={{ margin: '0 0 0.35rem' }}>Choose a new password</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          For security, you must set a new password before continuing.
        </p>
        <div className="field">
          <label className="label">New password</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="field">
          <label className="label">Confirm password</label>
          <input
            className="input"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error ? (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>{error}</p>
        ) : null}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? <span className="spinner" /> : 'Save password'}
        </button>
      </motion.form>
    </div>
  );
}
