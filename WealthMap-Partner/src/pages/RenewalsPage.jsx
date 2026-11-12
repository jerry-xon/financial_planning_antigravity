import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invokePartnerApi } from '../lib/partnerApi';
import { Loader, PageShell } from '../components/ui';
import { CATEGORY_LABELS, daysBadge, formatDate, formatMoney } from '../lib/format';

export function RenewalsPage() {
  const navigate = useNavigate();
  const [renewals, setRenewals] = useState([]);
  const [within, setWithin] = useState(45);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await invokePartnerApi('crm_list_renewals', { within_days: within });
      setRenewals(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to load renewals');
    } finally {
      setLoading(false);
    }
  }, [within]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading renewals…" />;

  const overdue = renewals.filter((r) => Number(r.days_until_due) < 0);
  const upcoming = renewals.filter((r) => Number(r.days_until_due) >= 0);
  const premiumAtRisk = renewals.reduce((s, r) => s + Number(r.total_premium || 0), 0);

  return (
    <PageShell
      title="Renewals"
      subtitle="Prioritize by due date — overdue first, then the next 45 days."
      actions={
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[30, 45, 90].map((d) => (
            <button
              key={d}
              type="button"
              className={`btn btn-sm ${within === d ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setWithin(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      }
    >
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
        <div className="kpi-card">
          <div className="kpi-label">In window</div>
          <div className="kpi-value">{renewals.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Overdue</div>
          <div className="kpi-value">{overdue.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Premium in pipeline</div>
          <div className="kpi-value">{formatMoney(premiumAtRisk, true)}</div>
        </div>
      </div>

      {renewals.length === 0 ? (
        <div className="card empty-state">
          <h2>Nothing due</h2>
          <p className="muted">When policies have next premium due dates, they appear here.</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/policies')}>
            Go to policies
          </button>
        </div>
      ) : (
        <div className="panel" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Urgency</th>
                <th>Client</th>
                <th>Policy</th>
                <th>Due date</th>
                <th>Premium</th>
              </tr>
            </thead>
            <tbody>
              {[...overdue, ...upcoming].map((r) => {
                const badge = daysBadge(r.days_until_due);
                return (
                  <tr
                    key={r.policy_id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/clients/${r.client_id}/crm`)}
                  >
                    <td>
                      <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      <div>{r.client_name}</div>
                      <div className="muted" style={{ fontSize: '0.78rem' }}>{r.client_phone || r.client_email}</div>
                    </td>
                    <td>
                      <div>{r.insurer_name} · {r.policy_no}</div>
                      <div className="muted" style={{ fontSize: '0.78rem' }}>
                        {CATEGORY_LABELS[r.category] || r.category}
                        {r.plan_name ? ` · ${r.plan_name}` : ''}
                      </div>
                    </td>
                    <td>{formatDate(r.next_premium_due_date)}</td>
                    <td>{formatMoney(r.total_premium)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
