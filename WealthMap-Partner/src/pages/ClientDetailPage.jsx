import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invokePartnerApi } from '../lib/partnerApi';
import { Loader, PageShell } from '../components/ui';
import { PolicyFormModal } from '../components/PolicyFormModal';
import { CATEGORY_LABELS, formatDate, formatMoney } from '../lib/format';

export function ClientDetailPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [mfForm, setMfForm] = useState({ folio_number: '', amc_name: '', scheme_name: '', amount_invested: '', current_value: '', sip_amount: '' });
  const [savingMf, setSavingMf] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await invokePartnerApi('crm_get_client', { client_id: clientId });
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load client');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const addActivity = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    try {
      await invokePartnerApi('crm_add_activity', {
        client_id: clientId,
        activity_type: 'note',
        subject: 'CRM note',
        body: note.trim(),
      });
      setNote('');
      await load();
    } catch (err) {
      alert(err.message || 'Failed to add note');
    } finally {
      setSavingNote(false);
    }
  };

  const addMf = async (e) => {
    e.preventDefault();
    setSavingMf(true);
    try {
      await invokePartnerApi('crm_upsert_mf_folio', {
        client_id: clientId,
        folio_number: mfForm.folio_number || null,
        amc_name: mfForm.amc_name || null,
        investor_name: data?.client?.full_name,
        holdings: [
          {
            scheme_name: mfForm.scheme_name,
            amount_invested: mfForm.amount_invested,
            current_value: mfForm.current_value || mfForm.amount_invested,
            sip_amount: mfForm.sip_amount,
          },
        ],
      });
      setMfForm({ folio_number: '', amc_name: '', scheme_name: '', amount_invested: '', current_value: '', sip_amount: '' });
      await load();
    } catch (err) {
      alert(err.message || 'Failed to save MF');
    } finally {
      setSavingMf(false);
    }
  };

  if (loading) return <Loader label="Loading client…" />;
  if (error) {
    return (
      <PageShell title="Client">
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      </PageShell>
    );
  }

  const client = data.client;
  const policies = data.policies || [];
  const folios = data.folios || [];
  const activities = data.activities || [];

  return (
    <PageShell
      title={client.full_name}
      subtitle={`${client.email}${client.phone ? ` · ${client.phone}` : ''}`}
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/clients/${clientId}`)}>
            Edit report data
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/clients/${clientId}/report`)}>
            Preview report
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setPolicyOpen(true)}>
            Add policy
          </button>
        </>
      }
    >
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-label">Policies</div>
          <div className="kpi-value">{policies.length}</div>
          <div className="kpi-hint">{client.report_sent_at ? `Report sent ${formatDate(client.report_sent_at)}` : 'Report not sent'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Premium on book</div>
          <div className="kpi-value">
            {formatMoney(policies.filter((p) => p.status === 'Active' || p.status === 'Grace Period').reduce((s, p) => s + Number(p.total_premium || 0), 0), true)}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">MF value</div>
          <div className="kpi-value">
            {formatMoney(
              folios.flatMap((f) => f.crm_mf_holdings || []).reduce((s, h) => s + Number(h.current_value || 0), 0),
              true,
            )}
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Policies</h2>
          </div>
          {policies.length === 0 ? (
            <div className="empty-state">
              <p className="muted" style={{ margin: 0 }}>No policies yet for this client.</p>
            </div>
          ) : (
            <div className="panel-body" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Insurer / No</th>
                    <th>Due</th>
                    <th>Premium</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((p) => (
                    <tr key={p.id}>
                      <td>{CATEGORY_LABELS[p.category] || p.category}</td>
                      <td>
                        <div style={{ fontWeight: 650 }}>{p.insurer_name}</div>
                        <div className="muted" style={{ fontSize: '0.78rem' }}>{p.policy_no}</div>
                      </td>
                      <td>{formatDate(p.next_premium_due_date)}</td>
                      <td>{formatMoney(p.total_premium)}</td>
                      <td><span className="badge badge-teal">{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <div className="panel-head">
              <h2>Activity</h2>
            </div>
            <div style={{ padding: '0.85rem 1.1rem' }}>
              <textarea
                className="input"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a call, WhatsApp, or follow-up…"
              />
              <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: '0.55rem' }} disabled={savingNote} onClick={addActivity}>
                {savingNote ? 'Saving…' : 'Add note'}
              </button>
            </div>
            <div className="panel-body">
              {activities.length === 0 ? (
                <p className="muted" style={{ padding: '0.5rem 1.1rem 1rem' }}>No activity yet.</p>
              ) : (
                <table className="data-table">
                  <tbody>
                    {activities.slice(0, 8).map((a) => (
                      <tr key={a.id}>
                        <td>
                          <div style={{ fontWeight: 650 }}>{a.subject || a.activity_type}</div>
                          <div className="muted" style={{ fontSize: '0.8rem' }}>{a.body}</div>
                        </td>
                        <td className="muted">{formatDate(a.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Mutual funds</h2>
            </div>
            <form onSubmit={addMf} style={{ padding: '0.85rem 1.1rem', borderBottom: '1px solid var(--border)' }}>
              <div className="form-grid">
                <div className="field">
                  <label className="label">Folio</label>
                  <input className="input" value={mfForm.folio_number} onChange={(e) => setMfForm((f) => ({ ...f, folio_number: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="label">AMC</label>
                  <input className="input" value={mfForm.amc_name} onChange={(e) => setMfForm((f) => ({ ...f, amc_name: e.target.value }))} />
                </div>
                <div className="field span-2">
                  <label className="label">Scheme</label>
                  <input className="input" required value={mfForm.scheme_name} onChange={(e) => setMfForm((f) => ({ ...f, scheme_name: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="label">Invested</label>
                  <input className="input" inputMode="decimal" value={mfForm.amount_invested} onChange={(e) => setMfForm((f) => ({ ...f, amount_invested: e.target.value }))} />
                </div>
                <div className="field">
                  <label className="label">Current</label>
                  <input className="input" inputMode="decimal" value={mfForm.current_value} onChange={(e) => setMfForm((f) => ({ ...f, current_value: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" disabled={savingMf}>
                {savingMf ? 'Saving…' : 'Add holding'}
              </button>
            </form>
            {folios.length === 0 ? (
              <p className="muted" style={{ padding: '0.85rem 1.1rem' }}>No MF holdings yet.</p>
            ) : (
              <div className="panel-body">
                <table className="data-table">
                  <tbody>
                    {folios.flatMap((f) =>
                      (f.crm_mf_holdings || []).map((h) => (
                        <tr key={h.id}>
                          <td>
                            <div style={{ fontWeight: 650 }}>{h.scheme_name}</div>
                            <div className="muted" style={{ fontSize: '0.78rem' }}>{f.folio_number || '—'} · {f.amc_name || '—'}</div>
                          </td>
                          <td>{formatMoney(h.current_value)}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <PolicyFormModal
        open={policyOpen}
        onClose={() => setPolicyOpen(false)}
        clients={[client]}
        defaultClientId={clientId}
        onSaved={load}
      />
    </PageShell>
  );
}
