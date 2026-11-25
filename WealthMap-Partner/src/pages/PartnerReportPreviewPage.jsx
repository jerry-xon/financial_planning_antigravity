import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invokePartnerApi } from '../lib/partnerApi';
import { Loader, PageShell } from '../components/ui';
import { WealthMapReportView } from '../components/WealthMapReportView';

export function PartnerReportPreviewPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [reports, setReports] = useState(null);
  const [plan, setPlan] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentMsg, setSentMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [repData, planData] = await Promise.all([
          invokePartnerApi('get_client_report', { client_id: clientId }),
          invokePartnerApi('get_client_plan', { clientId }),
        ]);
        if (!cancelled) {
          setReports(repData?.reports || null);
          setPlan(repData?.plan || planData?.plan || null);
          setClient(planData?.client || null);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to generate report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const send = async () => {
    setSending(true);
    setSentMsg('');
    setError('');
    try {
      const data = await invokePartnerApi('send_client_report', { client_id: clientId });
      setSentMsg(data.email_sent ? 'Report email sent with login credentials.' : `Saved, but email failed: ${data.email_error || 'unknown'}`);
    } catch (err) {
      setError(err.message || 'Send failed');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader label="Generating report…" />;

  return (
    <PageShell
      title="WealthMap report"
      subtitle="Same engine as the B2C summary report — preview before sending credentials"
      actions={
        <>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(`/clients/${clientId}`)}>
            Edit detailed plan
          </button>
          <button type="button" className="btn btn-primary" disabled={sending} onClick={send}>
            {sending ? <span className="spinner" /> : 'Send report email'}
          </button>
        </>
      }
    >
      {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}
      {sentMsg ? <p style={{ color: 'var(--success)' }}>{sentMsg}</p> : null}
      <WealthMapReportView plan={plan} reports={reports} client={client} />
    </PageShell>
  );
}
