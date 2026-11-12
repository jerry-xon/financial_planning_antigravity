import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { invokePartnerApi } from '../lib/partnerApi';
import { useAuth } from '../lib/AuthContext';
import { Loader, PageShell } from '../components/ui';
import { UpgradeSeatsModal } from '../components/UpgradeSeatsModal';
import { formatDate } from '../lib/format';

export function ClientsPage() {
  const { seats, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const qParam = params.get('q') || '';

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState(qParam);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invokePartnerApi('list_clients');
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setFilter(qParam);
  }, [qParam]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        (c.full_name || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q),
    );
  }, [clients, filter]);

  const onAdd = async () => {
    const latest = await refreshMe().catch(() => null);
    const remaining = latest?.seats?.seats_remaining ?? seats?.seats_remaining ?? 0;
    if (remaining < 1) {
      setUpgradeOpen(true);
      return;
    }
    navigate('/clients/new');
  };

  const onDelete = async (clientId) => {
    if (!window.confirm('Remove this client? Seats are not refunded.')) return;
    setBusyId(clientId);
    try {
      await invokePartnerApi('delete_client', { client_id: clientId });
      await load();
      await refreshMe();
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading clients…" />;

  return (
    <PageShell
      title="Clients"
      subtitle={
        seats
          ? `${seats.seats_remaining} of ${seats.seats_earned} report seats remaining`
          : 'Clients linked to reports and policies'
      }
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => setUpgradeOpen(true)}>
            Buy seats
          </button>
          <button type="button" className="btn btn-primary" onClick={onAdd}>
            New report client
          </button>
        </>
      }
    >
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

      <div style={{ marginBottom: '1rem', maxWidth: 360 }}>
        <input
          className="input"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name, email, phone"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <h2>No clients yet</h2>
          <p className="muted">Start with the report wizard — it creates the client and uses one seat.</p>
          <button type="button" className="btn btn-primary" onClick={onAdd}>
            Fill new report
          </button>
        </div>
      ) : (
        <div className="panel" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Source</th>
                <th>Report</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700 }}>{c.full_name}</td>
                  <td>
                    <div>{c.email}</div>
                    <div className="muted" style={{ fontSize: '0.8rem' }}>{c.phone || '—'}</div>
                  </td>
                  <td>
                    <span className="badge badge-slate">{c.source || 'report'}</span>
                  </td>
                  <td>{c.report_sent_at ? `Sent ${formatDate(c.report_sent_at)}` : 'Not sent'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/clients/${c.id}/crm`)}>
                      CRM
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/clients/${c.id}`)}>
                      Detailed plan
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate(`/clients/${c.id}/report`)}>
                      Preview
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={busyId === c.id}
                      onClick={() => onDelete(c.id)}
                    >
                      {busyId === c.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UpgradeSeatsModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} onSuccess={load} />
    </PageShell>
  );
}
