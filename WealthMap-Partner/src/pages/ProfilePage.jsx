import { useState } from 'react';
import { invokePartnerApi } from '../lib/partnerApi';
import { useAuth } from '../lib/AuthContext';
import { PageShell } from '../components/ui';
import { UpgradeSeatsModal } from '../components/UpgradeSeatsModal';

export function ProfilePage() {
  const { me, seats, refreshMe } = useAuth();
  const partner = me?.partner || {};
  const [fullName, setFullName] = useState(partner.full_name || '');
  const [phone, setPhone] = useState(partner.phone || '');
  const [companyName, setCompanyName] = useState(partner.company_name || '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      await invokePartnerApi('update_profile', {
        full_name: fullName,
        phone,
        company_name: companyName,
      });
      await refreshMe();
      setMsg('Profile saved');
    } catch (err) {
      setMsg(err.message || 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageShell title="Profile" subtitle={partner.email}>
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.1rem' }}>Seats</h2>
        <p style={{ margin: '0 0 1rem' }}>
          <strong>{seats?.seats_remaining ?? 0}</strong> remaining · {seats?.seats_used ?? 0} used ·{' '}
          {seats?.seats_earned ?? 0} earned
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setUpgradeOpen(true)}>
          Buy more seats
        </button>
      </div>

      <form className="card" style={{ padding: '1.25rem' }} onSubmit={save}>
        <div className="field">
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Phone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="field">
          <label className="label">Company</label>
          <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        {msg ? <p className="muted">{msg}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? <span className="spinner" /> : 'Save'}
        </button>
      </form>

      <UpgradeSeatsModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </PageShell>
  );
}
