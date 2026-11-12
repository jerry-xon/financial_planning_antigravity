import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { invokePartnerApi } from '../lib/partnerApi';
import { useAuth } from '../lib/AuthContext';
import { Loader, PageShell } from '../components/ui';
import { UpgradeSeatsModal } from '../components/UpgradeSeatsModal';
import { CATEGORY_LABELS, daysBadge, formatDate, formatMoney } from '../lib/format';

export function DashboardPage() {
  const { seats, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await invokePartnerApi('crm_dashboard');
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onNewReport = async () => {
    const latest = await refreshMe().catch(() => null);
    const remaining = latest?.seats?.seats_remaining ?? seats?.seats_remaining ?? 0;
    if (remaining < 1) {
      setUpgradeOpen(true);
      return;
    }
    navigate('/clients/new');
  };

  if (loading) return <Loader label="Loading your book…" />;

  const kpis = data?.kpis || {};
  const byCategory = data?.by_category || {};
  const catTotal = Object.values(byCategory).reduce((a, b) => a + Number(b || 0), 0) || 1;

  return (
    <PageShell
      title="Book of business"
      subtitle="Renewals, policies, report seats — one command view for your clients."
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => setUpgradeOpen(true)}>
            Buy seats
          </button>
          <button type="button" className="btn btn-primary" onClick={onNewReport}>
            Fill new report
          </button>
        </>
      }
    >
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

      <div className="kpi-grid">
        {[
          { label: 'Clients', value: kpis.clients ?? 0, hint: `${kpis.reports_sent ?? 0} reports sent` },
          { label: 'Active policies', value: kpis.active_policies ?? 0, hint: 'Across all lines' },
          {
            label: 'Premium book',
            value: formatMoney(kpis.premium_book, true),
            hint: 'Active / grace policies',
          },
          {
            label: 'Renewals (45d)',
            value: kpis.renewals_45d ?? 0,
            hint: `${formatMoney(kpis.mf_aum, true)} MF AUM`,
          },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            className="kpi-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, type: 'spring', bounce: 0, duration: 0.45 }}
          >
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            <div className="kpi-hint">{kpi.hint}</div>
          </motion.div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Upcoming renewals</h2>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/renewals')}>
              View all
            </button>
          </div>
          {(data?.renewals || []).length === 0 ? (
            <div className="empty-state">
              <p className="muted" style={{ margin: 0 }}>
                No renewals in the next 45 days. Add policies to track due dates.
              </p>
              <button type="button" className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => navigate('/policies')}>
                Manage policies
              </button>
            </div>
          ) : (
            <div className="panel-body" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Policy</th>
                    <th>Due</th>
                    <th>Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {data.renewals.map((r) => {
                    const badge = daysBadge(r.days_until_due);
                    return (
                      <tr key={r.policy_id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/clients/${r.client_id}/crm`)}>
                        <td style={{ fontWeight: 700 }}>{r.client_name}</td>
                        <td>
                          <div>{r.insurer_name}</div>
                          <div className="muted" style={{ fontSize: '0.78rem' }}>
                            {CATEGORY_LABELS[r.category] || r.category} · {r.policy_no}
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
                          <div className="muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                            {formatDate(r.next_premium_due_date)}
                          </div>
                        </td>
                        <td>{formatMoney(r.total_premium)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel">
            <div className="panel-head">
              <h2>Line mix</h2>
            </div>
            <div className="category-bars">
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
                const count = Number(byCategory[key] || 0);
                const pct = Math.round((count / catTotal) * 100);
                return (
                  <div className="category-row" key={key}>
                    <span>{label}</span>
                    <div className="category-track">
                      <div className="category-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <h2>Recent clients</h2>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate('/clients')}>
                All
              </button>
            </div>
            {(data?.recent_clients || []).length === 0 ? (
              <div className="empty-state" style={{ padding: '1.5rem' }}>
                <p className="muted" style={{ margin: 0 }}>Add a client via the report wizard to get started.</p>
                <button type="button" className="btn btn-primary" style={{ marginTop: '0.85rem' }} onClick={onNewReport}>
                  Fill new report
                </button>
              </div>
            ) : (
              <div className="panel-body">
                <table className="data-table">
                  <tbody>
                    {data.recent_clients.map((c) => (
                      <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/clients/${c.id}/crm`)}>
                        <td style={{ fontWeight: 700 }}>{c.full_name}</td>
                        <td className="muted">{c.report_sent_at ? `Report ${formatDate(c.report_sent_at)}` : 'Report draft'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {(data?.followups || []).length > 0 ? (
            <div className="panel">
              <div className="panel-head">
                <h2>Open follow-ups</h2>
              </div>
              <div className="panel-body">
                <table className="data-table">
                  <tbody>
                    {data.followups.map((a) => (
                      <tr key={a.id}>
                        <td style={{ fontWeight: 600 }}>{a.subject || a.activity_type}</td>
                        <td className="muted">{a.due_at ? formatDate(a.due_at) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <UpgradeSeatsModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} onSuccess={load} />
    </PageShell>
  );
}
