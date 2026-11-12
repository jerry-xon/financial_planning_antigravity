import { motion } from 'framer-motion';

function inr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${n.toFixed(1)}%`;
}

function Section({ title, subtitle, children }) {
  return (
    <motion.section
      className="card report-section"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      style={{ padding: '1.35rem', marginBottom: '1rem' }}
    >
      <header style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
        {subtitle ? (
          <p className="muted" style={{ margin: '0.35rem 0 0', fontSize: '0.9rem' }}>
            {subtitle}
          </p>
        ) : null}
      </header>
      {children}
    </motion.section>
  );
}

function KpiGrid({ items }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
        gap: '0.75rem',
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            background: 'rgba(0,0,0,0.03)',
            borderRadius: 14,
            padding: '0.9rem 1rem',
          }}
        >
          <div className="muted" style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            {item.label}
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: item.tone || 'inherit' }}>
            {item.value}
          </div>
          {item.hint ? (
            <div className="muted" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
              {item.hint}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function BarRow({ label, value, max, color = 'var(--accent)' }) {
  const n = Math.max(0, Number(value) || 0);
  const m = Math.max(n, Number(max) || 0, 1);
  const width = Math.min(100, (n / m) * 100);
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.9rem' }}>{label}</span>
        <strong style={{ fontSize: '0.9rem' }}>{inr(n)}</strong>
      </div>
      <div style={{ height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${width}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <p className="muted" style={{ margin: '0.5rem 0 0' }}>
      Numbers look empty — edit the client plan and add income, expenses, and covers, then regenerate.
    </p>
  );
}

function ErrorBox({ error }) {
  return <p style={{ color: 'var(--danger)', margin: 0 }}>{String(error)}</p>;
}

function MoneyStoryView({ data }) {
  if (!data) return <p className="muted">No data</p>;
  if (data.error) return <ErrorBox error={data.error} />;

  const cf = data.cashFlow || {};
  const nw = data.netWorth || {};
  const assets = data.assets || {};
  const unallocated = data.unallocated || {};
  const sip = data.sipProjection || {};

  const hasSignal =
    Number(cf.totalIncome) > 0 ||
    Number(nw.netWorth) > 0 ||
    Number(assets.total || assets.liquid || 0) > 0;

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <KpiGrid
        items={[
          { label: 'Monthly income', value: inr(cf.totalIncome) },
          { label: 'Monthly expenses', value: inr(cf.totalExpenses) },
          {
            label: 'Monthly surplus',
            value: inr(cf.surplus),
            tone: Number(cf.surplus) >= 0 ? 'var(--success)' : 'var(--danger)',
          },
          { label: 'Surplus rate', value: pct(cf.surplusRate) },
          { label: 'Net worth', value: inr(nw.netWorth ?? nw.totalNetWorth) },
          { label: 'Unallocated surplus', value: inr(unallocated.amount ?? unallocated.monthly ?? unallocated) },
        ]}
      />
      <div>
        <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Where money goes</h3>
        <BarRow label="Household" value={cf.categorySums?.household} max={cf.totalIncome} />
        <BarRow label="EMIs" value={cf.categorySums?.emi} max={cf.totalIncome} color="#d97706" />
        <BarRow label="Insurance" value={cf.categorySums?.insurance} max={cf.totalIncome} color="#7c3aed" />
        <BarRow label="Savings" value={cf.categorySums?.savings || cf.totalSavings} max={cf.totalIncome} color="#059669" />
      </div>
      {sip?.futureValue != null || sip?.maturityValue != null ? (
        <KpiGrid
          items={[
            { label: 'SIP projection', value: inr(sip.futureValue ?? sip.maturityValue), hint: sip.years ? `${sip.years} years` : undefined },
          ]}
        />
      ) : null}
      {!hasSignal ? <EmptyHint /> : null}
    </div>
  );
}

function SafetyNetView({ data }) {
  if (!data) return <p className="muted">No data</p>;
  if (data.error) return <ErrorBox error={data.error} />;

  const protection = data.protection || {};
  const contingency = data.contingency || {};
  const health = data.health || {};
  const self = protection.self || protection.members?.self || {};
  const spouse = protection.spouse || protection.members?.spouse || {};

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <KpiGrid
        items={[
          { label: 'Monthly need', value: inr(protection.monthlyNeed || contingency.monthlyNeed) },
          {
            label: 'Life cover have',
            value: inr(protection.totalCoverHave ?? protection.coverageHave ?? self.coverageHave),
          },
          {
            label: 'Life cover needed',
            value: inr(protection.totalCoverRequired ?? protection.coverageRequired ?? self.coverageRequired),
          },
          {
            label: 'Emergency fund',
            value: inr(contingency.emergencyFundHave ?? contingency.have),
            hint: contingency.monthsCoveredByFund != null
              ? `${Number(contingency.monthsCoveredByFund).toFixed(1)} months covered`
              : contingency.contingencyPeriod
                ? `Target ${contingency.contingencyPeriod} months`
                : undefined,
          },
          {
            label: 'Health cover',
            value: inr(health.coverHave ?? health.totalCover ?? health.coverage),
            hint: health.status ? String(health.status) : undefined,
          },
          {
            label: 'Health needed',
            value: inr(health.coverNeeded ?? health.recommended),
          },
        ]}
      />
      {(self.name || spouse.name) && (
        <div>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Life cover by member</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {[self, spouse].filter((m) => m && (m.name || m.coverageRequired || m.coverageHave)).map((m, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 14, padding: '0.9rem 1rem' }}>
                <strong>{m.name || (i === 0 ? 'Self' : 'Spouse')}</strong>
                <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Have {inr(m.coverageHave)} · Need {inr(m.coverageRequired)} · Gap {inr(m.gap ?? (Number(m.coverageRequired || 0) - Number(m.coverageHave || 0)))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MoneyFlowView({ data }) {
  if (!data) return <p className="muted">No data</p>;
  if (data.error) return <ErrorBox error={data.error} />;

  const baseline = data.baseline || {};
  const totals = data.totals || {};
  const meta = data.meta || {};
  const months = data.ledger?.months || [];
  const surplus = data.ledger?.monthlySurplus || [];
  const maxSurplus = Math.max(1, ...surplus.map((v) => Math.abs(Number(v) || 0)));

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
        {meta.planStartMonthLabel || 'Plan start'} · {meta.calendarYear || new Date().getFullYear()}
        {meta.salaryYearLabel ? ` · Salary year ${meta.salaryYearLabel}` : ''}
      </p>
      <KpiGrid
        items={[
          { label: 'Monthly net income', value: inr(baseline.monthlyNetIncome) },
          { label: 'Household', value: inr(baseline.monthlyHousehold) },
          { label: 'EMIs', value: inr(baseline.monthlyEmi) },
          { label: 'Insurance', value: inr(baseline.monthlyInsurance) },
          { label: 'Savings', value: inr(baseline.monthlySavings) },
          { label: 'YTD surplus', value: inr(totals.ytdSurplus) },
          { label: 'Full-year surplus', value: inr(totals.fullYearSurplus) },
          { label: 'Unallocated (year)', value: inr(totals.fullYearUnallocated) },
        ]}
      />
      {months.length > 0 && surplus.length > 0 ? (
        <div>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Monthly surplus</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.4rem' }}>
            {months.map((label, i) => {
              const v = Number(surplus[i]) || 0;
              const h = Math.max(8, (Math.abs(v) / maxSurplus) * 56);
              return (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      height: 56,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                    }}
                  >
                    <div
                      title={inr(v)}
                      style={{
                        width: '70%',
                        height: h,
                        borderRadius: 6,
                        background: v >= 0 ? 'var(--success)' : 'var(--danger)',
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div className="muted" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MoneyMagicView({ data }) {
  if (!data) return <p className="muted">No data</p>;
  if (data.error) return <ErrorBox error={data.error} />;

  const totals = data.totals || {};
  const meta = data.meta || {};
  const goals = Array.isArray(data.goalCards) ? data.goalCards : [];
  const status = totals.solvencyStatus || {};

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <KpiGrid
        items={[
          {
            label: 'Plan health',
            value: status.label || '—',
            hint: status.description,
            tone: status.color,
          },
          { label: 'Solvency ratio', value: totals.solvencyRatio != null ? pct(Number(totals.solvencyRatio) * (Number(totals.solvencyRatio) <= 2 ? 100 : 1)) : '—' },
          { label: 'Projected wealth', value: inr(totals.totalProjectedWealth) },
          { label: 'Goal liability', value: inr(totals.totalGoalLiability) },
          { label: 'Remaining gap', value: inr(totals.totalRemainingGap) },
          { label: 'As-of corpus', value: inr(data.asOfCorpus?.total ?? data.asOfCorpus) },
          {
            label: 'Horizon',
            value: meta.horizonYear ? String(meta.horizonYear) : '—',
            hint: meta.asOfLabel,
          },
        ]}
      />
      {goals.length > 0 ? (
        <div>
          <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Goals</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {goals.map((g) => (
              <div
                key={g.id || g.name}
                style={{
                  background: 'rgba(0,0,0,0.03)',
                  borderRadius: 14,
                  padding: '0.9rem 1rem',
                  display: 'grid',
                  gap: '0.35rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <strong>{g.name || g.title || 'Goal'}</strong>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>
                    {g.targetYear || g.year || ''}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem' }}>
                  Target {inr(g.targetAmount ?? g.futureCost ?? g.amount)} · Funded{' '}
                  {inr(g.fundedAmount ?? g.covered ?? g.allocated)} · Gap{' '}
                  {inr(g.gap ?? g.remainingGap ?? g.shortfall)}
                </div>
                {g.coveragePct != null || g.fundedPct != null ? (
                  <div className="muted" style={{ fontSize: '0.8rem' }}>
                    Coverage {pct(g.coveragePct ?? g.fundedPct)}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="muted" style={{ margin: 0 }}>
          No goals on this plan yet. Add dreams & goals in the client wizard to see funding magic here.
        </p>
      )}
    </div>
  );
}

export function ReportSections({ reports }) {
  const r = reports || {};
  return (
    <div>
      <Section title="Your Money Story" subtitle="Income, spending, surplus, and net worth">
        <MoneyStoryView data={r.money_story} />
      </Section>
      <Section title="The Safety Net" subtitle="Life cover, emergency fund, and health protection">
        <SafetyNetView data={r.safety_net} />
      </Section>
      <Section title="Your Money Flow" subtitle="Month-by-month cash movement for this plan year">
        <MoneyFlowView data={r.money_flow || r.your_money_flow} />
      </Section>
      <Section title="Your Money's Magic" subtitle="How surplus and investments fund your goals">
        <MoneyMagicView data={r.your_moneys_magic} />
      </Section>
    </div>
  );
}
