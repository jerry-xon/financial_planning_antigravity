import { useEffect, useState } from 'react';
import { invokePartnerApi } from '../lib/partnerApi';
import { Loader, PageShell } from '../components/ui';
import { WealthMapReportView } from '../components/WealthMapReportView';

export function ClientReportPage() {
  const [reports, setReports] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await invokePartnerApi('get_my_report');
        if (!cancelled) {
          setReports(data?.reports || null);
          setPlan(data?.plan || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Report unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Loader label="Loading your report…" />;

  return (
    <PageShell title="Your financial report" subtitle="Read-only view prepared by your advisor">
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
      <WealthMapReportView plan={plan} reports={reports} />
    </PageShell>
  );
}
