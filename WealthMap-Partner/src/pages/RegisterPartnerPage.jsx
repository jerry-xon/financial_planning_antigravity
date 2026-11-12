import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { invokePartnerApi } from '../lib/partnerApi';

export function RegisterPartnerPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [registerSecret, setRegisterSecret] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const data = await invokePartnerApi('register_partner', {
        email,
        full_name: fullName,
        phone,
        company_name: companyName,
        registerSecret,
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <motion.form
        onSubmit={onSubmit}
        className="card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
        style={{ width: 'min(480px, 100%)', padding: '1.5rem' }}
      >
        <h1 style={{ margin: '0 0 0.35rem', fontSize: '1.5rem' }}>Register partner</h1>
        <p className="muted" style={{ marginTop: 0 }}>
          Invite-only. Requires admin secret. Not linked from public login.
        </p>

        <div className="field">
          <label className="label">Invite / admin secret</label>
          <input
            className="input"
            type="password"
            value={registerSecret}
            onChange={(e) => setRegisterSecret(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">Email</label>
          <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Company</label>
          <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>

        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
        {result ? (
          <p style={{ color: 'var(--success)' }}>
            Partner created ({result.email}). {result.seats_granted} seats granted.
            {result.email_sent ? ' Invite email sent.' : ` Email not sent: ${result.email_error || 'check config'}.`}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary" disabled={busy} style={{ width: '100%' }}>
          {busy ? <span className="spinner" /> : 'Create partner'}
        </button>
        <p style={{ textAlign: 'center', marginBottom: 0 }}>
          <Link to="/login">Back to login</Link>
        </p>
      </motion.form>
    </div>
  );
}
