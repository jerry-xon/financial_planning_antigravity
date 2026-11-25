import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invokePartnerApi } from '../lib/partnerApi';
import { useAuth } from '../lib/AuthContext';
import { Loader, PageShell } from '../components/ui';
import { UpgradeSeatsModal } from '../components/UpgradeSeatsModal';
import { PartnerPlanProvider, useFinancialPlan } from '../lib/PartnerPlanContext';
import { emptyPlanPayload, planFromDb, WIZARD_STEPS } from '../lib/planDefaults';
import BreakdownFamily from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownFamily';
import BreakdownIncome from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownIncome';
import BreakdownExpenses from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownExpenses';
import BreakdownDebt from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownDebt';
import B2BBreakdownInsurance from '../components/wizard/B2BBreakdownInsurance';
import BreakdownSavings from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownSavings';
import BreakdownAssets from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownAssets';
import BreakdownLiabilities from '../../../apps/web/src/components/DetailedHub/Forms/BreakdownLiabilities';
import GoalsDashboard from '../../../apps/web/src/components/DetailedHub/GoalsDashboard';
import '../components/wizard/B2cFormStyles.css';

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

const DETAIL_TABS = [
  { id: 'family', title: 'Family Info', Comp: BreakdownFamily },
  { id: 'income', title: 'Income', Comp: BreakdownIncome },
  { id: 'household', title: 'Household & Lifestyle Expenses', Comp: BreakdownExpenses },
  { id: 'emis', title: 'EMIs & Debts', Comp: BreakdownDebt },
  { id: 'insurance', title: 'Insurance Premiums', Comp: B2BBreakdownInsurance },
  { id: 'savings', title: 'Savings & Investments', Comp: BreakdownSavings },
  { id: 'assets', title: 'Assets', Comp: BreakdownAssets },
  { id: 'liabilities', title: 'Liabilities', Comp: BreakdownLiabilities },
  { id: 'goals', title: 'Goals', Comp: GoalsDashboard },
];

function WizardBody({
  isEdit,
  clientId,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  step,
  setStep,
  saving,
  error,
  onSave,
  onCancel,
}) {
  const { getPlanPayload, setFamilyMembers } = useFinancialPlan();
  const ActiveDetail = DETAIL_TABS[Math.max(0, step - 1)]?.Comp;

  // Keep Self name/phone aligned with contact fields
  useEffect(() => {
    setFamilyMembers((prev) => {
      const members = [...(prev || [])];
      const idx = members.findIndex((m) => m.relation === 'Self');
      if (idx < 0) {
        return [
          {
            name: fullName,
            dob: '',
            occupation: 'Salaried',
            employmentType: 'Private Sector',
            retirementAge: 60,
            relation: 'Self',
            mobile: phone,
          },
          ...members,
        ];
      }
      const self = members[idx];
      if (self.name === fullName && self.mobile === phone) return prev;
      members[idx] = { ...self, name: fullName, mobile: phone };
      return members;
    });
  }, [fullName, phone, setFamilyMembers]);

  const progress = useMemo(() => ((step + 1) / WIZARD_STEPS.length) * 100, [step]);
  const stepMeta = WIZARD_STEPS[step];

  return (
    <PageShell
      title={isEdit ? 'Client detailed plan' : 'New report client'}
      subtitle={`${stepMeta.title} · Same fields as WealthMap B2C detailed hub`}
      actions={
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      }
    >
      <div
        style={{
          height: 4,
          background: 'rgba(0,0,0,0.06)',
          borderRadius: 999,
          marginBottom: '0.85rem',
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent)', transition: 'width 200ms ease' }} />
      </div>

      {isEdit || step > 0 ? (
        <div className="wizard-tabs" role="tablist" aria-label="Detailed information tabs">
          {DETAIL_TABS.map((tab, i) => {
            const tabStep = i + 1;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={step === tabStep}
                className={`wizard-tab${step === tabStep ? ' active' : ''}${step > tabStep ? ' done' : ''}`}
                onClick={() => {
                  if (step === 0 && !isEdit) return;
                  setStep(tabStep);
                }}
              >
                {i + 1}. {tab.title}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="card b2c-form-host" style={{ padding: '1.25rem' }}>
        {step === 0 ? (
          <>
            <p className="muted" style={{ marginTop: 0 }}>
              Create the client seat first, then fill the same detailed tabs as the WealthMap app.
            </p>
            <Field label="Full name">
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </Field>
            <Field label="Email">
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isEdit}
              />
            </Field>
            <Field label="Phone">
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
          </>
        ) : ActiveDetail ? (
          <ActiveDetail hideTitle />
        ) : null}

        {error ? <p style={{ color: 'var(--danger)' }}>{error}</p> : null}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={step === 0 || saving}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </button>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {clientId && step > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => onSave({ advance: false, plan: getPlanPayload() })}
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            )}
            {step < WIZARD_STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || (step === 0 && (!fullName || (!isEdit && !email)))}
                onClick={() => onSave({ advance: true, plan: getPlanPayload() })}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving || !fullName || (!isEdit && !email)}
                onClick={() => onSave({ advance: false, finish: true, plan: getPlanPayload() })}
              >
                {saving ? <span className="spinner" /> : 'Save & preview report'}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function ClientWizardPage() {
  const { clientId: routeClientId } = useParams();
  const isEditRoute = Boolean(routeClientId);
  const navigate = useNavigate();
  const { refreshMe, seats } = useAuth();

  const [step, setStep] = useState(isEditRoute ? 1 : 0);
  const [clientId, setClientId] = useState(routeClientId || null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState(() => emptyPlanPayload());
  const [planReady, setPlanReady] = useState(!isEditRoute);
  const [loading, setLoading] = useState(isEditRoute);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const createdRef = useRef(false);

  useEffect(() => {
    if (!isEditRoute) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await invokePartnerApi('get_client_plan', { client_id: routeClientId });
        if (cancelled) return;
        setFullName(data.client.full_name || '');
        setEmail(data.client.email || '');
        setPhone(data.client.phone || '');
        setPlan(planFromDb(data.plan));
        setClientId(routeClientId);
        setPlanReady(true);
        setStep(1);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load client');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [routeClientId, isEditRoute]);

  const persistPlan = async (planPayload) => {
    const id = clientId;
    if (!id) throw new Error('Client not created yet');
    await invokePartnerApi('update_client', {
      client_id: id,
      full_name: fullName,
      phone,
      plan: planPayload,
    });
  };

  const onSave = async ({ advance, finish, plan: planPayload }) => {
    setError('');
    setSaving(true);
    try {
      // Step 0 for new clients: create seat + client, then open detailed tabs
      if (step === 0 && !clientId) {
        if ((seats?.seats_remaining ?? 0) < 1) {
          setUpgradeOpen(true);
          return;
        }
        if (createdRef.current) return;
        createdRef.current = true;
        const data = await invokePartnerApi('create_client', {
          email,
          full_name: fullName,
          phone,
          plan: {
            ...emptyPlanPayload({ fullName, phone }),
            ...planPayload,
            familyMembers: [
              {
                ...(planPayload.familyMembers?.[0] || {}),
                name: fullName,
                mobile: phone,
                relation: 'Self',
              },
              ...(planPayload.familyMembers || []).slice(1),
            ],
          },
        });
        await refreshMe();
        setClientId(data.client.id);
        setPlan(planPayload);
        navigate(`/clients/${data.client.id}`, { replace: true });
        setStep(1);
        return;
      }

      if (clientId) {
        await persistPlan(planPayload);
      }

      if (finish) {
        navigate(`/clients/${clientId}/report`);
        return;
      }
      if (advance) setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1));
    } catch (err) {
      createdRef.current = false;
      if (err.code === 'SEATS_EXHAUSTED') {
        setUpgradeOpen(true);
      } else {
        setError(err.message || 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading || !planReady) return <Loader label="Loading client…" />;

  return (
    <>
      <PartnerPlanProvider plan={plan} key={clientId || 'new'}>
        <WizardBody
          isEdit={Boolean(clientId)}
          clientId={clientId}
          fullName={fullName}
          setFullName={setFullName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          step={step}
          setStep={setStep}
          saving={saving}
          error={error}
          onSave={onSave}
          onCancel={() => navigate(clientId ? `/clients/${clientId}/crm` : '/clients')}
        />
      </PartnerPlanProvider>
      <UpgradeSeatsModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
