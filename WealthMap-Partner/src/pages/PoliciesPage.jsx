import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invokePartnerApi } from '../lib/partnerApi';
import { Loader, PageShell } from '../components/ui';
import { PolicyFormModal } from '../components/PolicyFormModal';
import { CATEGORY_LABELS, formatDate, formatMoney } from '../lib/format';

export function PoliciesPage() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pols, clis] = await Promise.all([
        invokePartnerApi('crm_list_policies', category ? { category } : {}),
        invokePartnerApi('list_clients'),
      ]);
      setPolicies(Array.isArray(pols) ? pols : []);
      setClients(Array.isArray(clis) ? clis : []);
    } catch (err) {
      setError(err.message || 'Failed to load policies');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    load();
  }, [load]);

  const onDelete = async (policyId) => {
    if (!window.confirm('Delete this policy?')) return;
    setBusyId(policyId);
    try {
      await invokePartnerApi('crm_delete_policy', { policy_id: policyId });
      await load();
    } catch (err) {
      alert(err.message || 'Delete failed');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading policies…" />;

  return (
    <PageShell
      title="Policies"
      subtitle="Life, health, motor, and non-motor — one book for renewals and premium."
      actions={
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          disabled={clients.length === 0}
        >
          Add policy
        </button>
      }
    >
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['', 'life', 'health', 'motor', 'non_motor'].map((c) => (
          <button
            key={c || 'all'}
            type="button"
            className={`btn btn-sm ${category === c ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategory(c)}
          >
            {c ? CATEGORY_LABELS[c] : 'All'}
          </button>
        ))}
      </div>

      {clients.length === 0 ? (
        <div className="card empty-state">
          <h2>Add a client first</h2>
          <p className="muted">Create a report client, then attach policies to their CRM profile.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/clients/new')}>
            New report client
          </button>
        </div>
      ) : policies.length === 0 ? (
        <div className="card empty-state">
          <h2>No policies yet</h2>
          <p className="muted">Track premiums and renewal dates for your book of business.</p>
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
            Add policy
          </button>
        </div>
      ) : (
        <div className="panel" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Line</th>
                <th>Insurer / Policy</th>
                <th>Due</th>
                <th>Premium</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 0, fontWeight: 700 }}
                      onClick={() => navigate(`/clients/${p.client_id}/crm`)}
                    >
                      {p.partner_clients?.full_name || 'Client'}
                    </button>
                  </td>
                  <td>{CATEGORY_LABELS[p.category] || p.category}</td>
                  <td>
                    <div>{p.insurer_name}</div>
                    <div className="muted" style={{ fontSize: '0.78rem' }}>{p.policy_no}</div>
                  </td>
                  <td>{formatDate(p.next_premium_due_date)}</td>
                  <td>{formatMoney(p.total_premium)}</td>
                  <td><span className="badge badge-teal">{p.status}</span></td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setEditing(p);
                        setModalOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={busyId === p.id}
                      onClick={() => onDelete(p.id)}
                    >
                      {busyId === p.id ? '…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PolicyFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        clients={clients}
        initial={editing}
        onSaved={load}
      />
    </PageShell>
  );
}
