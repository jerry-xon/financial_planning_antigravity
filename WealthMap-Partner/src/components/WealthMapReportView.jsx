import React, { useState } from 'react';
import MoneyStorySection from '../../../apps/web/src/components/SummaryReport/MoneyStorySection';
import SafetyNetSection from '../../../apps/web/src/components/SummaryReport/SafetyNetSection';
import FutureSelfSection from '../../../apps/web/src/components/SummaryReport/FutureSelfSection';
import ExecutiveSummarySection from '../../../apps/web/src/components/SummaryReport/ExecutiveSummarySection';
import YourMoneyFlowSection from '../../../apps/web/src/components/DetailedReport/YourMoneyFlowSection';
import TrackSurplusAllocationSection from '../../../apps/web/src/components/DetailedReport/TrackSurplusAllocationSection';
import { ReportSections as OldReportSections } from './ReportSections';
import { PartnerPlanProvider } from '../lib/PartnerPlanContext';
import { planFromDb } from '../lib/planDefaults';
import '../styles/report.css';

const REPORT_TABS = [
  { id: 'money_story', label: 'Your Money Story', category: 'Summary' },
  { id: 'safety_net', label: 'The Safety Net', category: 'Summary' },
  { id: 'future_self', label: 'Your Future Self', category: 'Summary' },
  { id: 'useful_insights', label: 'Useful Insights', category: 'Summary' },
  { id: 'money_flow', label: '1 Understand - Your Money Flow', category: 'Detailed' },
  { id: 'money_magic', label: "4 Grow - Your Money's Magic", category: 'Detailed' },
  { id: 'old_report', label: 'Old report view', category: 'Preserved' },
];

export function WealthMapReportView({ plan, reports, client }) {
  const [activeTab, setActiveTab] = useState('money_story');

  const parsedPlan = planFromDb(plan);

  return (
    <PartnerPlanProvider plan={parsedPlan}>
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="report-tabs-container">
          {REPORT_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`report-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.label}</span>
                {tab.pendingPhase ? (
                  <span className="badge-pill">{tab.pendingPhase}</span>
                ) : tab.id === 'old_report' ? (
                  <span className="badge-pill" style={{ opacity: 0.8 }}>Legacy</span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="report-content-panel">
          {activeTab === 'money_story' && (
            <div className="summary-report-view">
              <MoneyStorySection />
            </div>
          )}

          {activeTab === 'safety_net' && (
            <div className="summary-report-view">
              <SafetyNetSection />
            </div>
          )}

          {activeTab === 'future_self' && (
            <div className="summary-report-view">
              <FutureSelfSection />
            </div>
          )}

          {activeTab === 'useful_insights' && (
            <div className="summary-report-view">
              <ExecutiveSummarySection />
            </div>
          )}

          {activeTab === 'money_flow' && (
            <div className="detailed-report-view">
              <YourMoneyFlowSection />
            </div>
          )}

          {activeTab === 'money_magic' && (
            <div className="detailed-report-view">
              <TrackSurplusAllocationSection />
            </div>
          )}

          {activeTab === 'old_report' && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(0,0,0,0.03)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <strong>Preserved Old Report View:</strong> This view is retained during the migration of B2C reports into B2B.
              </div>
              <OldReportSections reports={reports} />
            </div>
          )}

          {REPORT_TABS.find((t) => t.id === activeTab)?.pendingPhase && (
            <div className="report-placeholder-card">
              <h3>{REPORT_TABS.find((t) => t.id === activeTab)?.label}</h3>
              <p>
                This report module is scheduled for migration in{' '}
                <strong>{REPORT_TABS.find((t) => t.id === activeTab)?.pendingPhase}</strong>.
              </p>
            </div>
          )}
        </div>
      </div>
    </PartnerPlanProvider>
  );
}

export default WealthMapReportView;

