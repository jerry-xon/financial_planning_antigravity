import React, { useState, useMemo } from 'react';
import { ChevronLeft, User, DollarSign, FileText } from 'lucide-react';
import ReportView from '../ReportModule/ReportView';
import { generateProjections } from '../JourneyModule/ProjectionLogic';

const ClientFinancialDossier = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile');

  const projections = useMemo(() => {
     if (!report || !report.family_members || !report.family_members.find(m => m.relation?.toLowerCase() === 'self')) return [];
     return generateProjections({
       familyMembers: report.family_members || [],
       income: report.income || {},
       expenseCategories: report.expense_categories || {},
       goals: report.goals || [],
       inflationRates: report.inflation_rates || { incomeIncrement: 10, householdInflation: 6, educationInflation: 8 },
       journeyAdjustments: report.journey_adjustments || [],
       investmentAllocations: report.investment_allocations || [],
       loanProposals: report.loan_proposals || [],
       policies: report.policies || [],
       planStartMonth: report.plan_start_month ?? new Date().getMonth(),
       currentYearLedger: report.current_year_ledger || { income: Array(12).fill(0), household: Array(12).fill(0) }
     });
  }, [report]);

  if (!report) return null;

  const renderRawData = (data) => {
    if (!data) return null;

    const DataViewer = ({ value, depth = 0 }) => {
      if (value === null || value === undefined) return <span className="val-primitive text-muted">-</span>;
      if (typeof value === 'boolean') return <span className="val-primitive text-accent">{value ? 'Yes' : 'No'}</span>;
      if (typeof value === 'string' || typeof value === 'number') return <span className="val-primitive">{value}</span>;

      if (Array.isArray(value)) {
        if (value.length === 0) return <span className="val-empty text-muted">Empty list</span>;
        return (
          <div className="data-list" style={{ marginLeft: depth > 0 ? '0.5rem' : '0' }}>
            {value.map((item, idx) => (
              <div key={idx} className="data-list-item">
                <DataViewer value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        );
      }

      if (typeof value === 'object') {
        const keys = Object.keys(value);
        if (keys.length === 0) return <span className="val-empty text-muted">Empty</span>;

        return (
          <div className={`data-grid ${depth === 0 ? 'root-grid' : ''}`}>
            {keys.map(key => (
              <div key={key} className="data-row">
                <div className="data-label">{key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                <div className="data-content">
                  <DataViewer value={value[key]} depth={depth + 1} />
                </div>
              </div>
            ))}
          </div>
        );
      }

      return null;
    };

    return (
      <div className="structured-data-viewer">
        <DataViewer value={data} />
      </div>
    );
  };

  const tabs = [
    { id: 'profile', label: 'Profile Matrix', icon: <User size={18} /> },
    { id: 'cashflow', label: 'Cash Flow Input', icon: <DollarSign size={18} /> },
    { id: 'full_report', label: 'Comprehensive Report', icon: <FileText size={18} /> },
  ];

  return (
    <div className="dossier-container">
      <button onClick={onBack} className="back-btn">
        <ChevronLeft size={20} /> Back to Reports
      </button>

      <div className="dossier-header">
        <h2>Client Dossier: {report.plan_name || 'Unnamed Plan'}</h2>
        <p className="dossier-meta">
          ID: {report.id} | Last Updated: {new Date(report.updated_at || report.created_at).toLocaleString()}
        </p>
      </div>

      <div className="dossier-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`d-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="dossier-content">
        {activeTab === 'profile' && (
          <div className="dossier-section">
            <h3>Profile Matrix <span>(Raw Inputs)</span></h3>
            {renderRawData(report.family_members || {})}
          </div>
        )}
        
        {activeTab === 'cashflow' && (
          <div className="dossier-section">
            <h3>Cash Flow <span>(Inflows & Outflows)</span></h3>
            <p className="dossier-desc">Includes strict categorical breakdowns: EMIs, health policies, life insurance, lifestyle, and basic living.</p>
            {renderRawData({
              income: report.income || {},
              expense_categories: report.expense_categories || {}
            })}
          </div>
        )}

        {activeTab === 'full_report' && (
          <div className="dossier-section report-view-container" style={{ padding: 0, background: 'transparent', border: 'none' }}>
            <ReportView 
              familyMembers={report.family_members || []}
              income={report.income || {}}
              expenseCategories={report.expense_categories || {}}
              assetCategories={report.asset_categories || {}}
              liabilityCategories={report.liability_categories || {}}
              goals={report.goals || []}
              policies={report.policies || []}
              contingencyFund={report.contingency_fund || ''}
              allocations={report.investment_allocations || []}
              goalMappings={report.goal_mappings || {}}
              journeyAdjustments={report.journey_adjustments || []}
              projections={projections}
              calculatorInputs={report.calculator_inputs || {}}
              onBack={() => {}} 
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .dossier-container {
          background: var(--bg-card);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          animation: fadeIn 0.3s ease-out;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid var(--border);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }

        .back-btn:hover {
          color: var(--primary);
          border-color: var(--primary);
          background: var(--primary)10;
        }

        .dossier-header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .dossier-header h2 {
          margin: 0 0 0.5rem 0;
          color: var(--text);
          font-size: 1.75rem;
        }

        .dossier-meta {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.875rem;
          font-family: monospace;
        }

        .dossier-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .d-tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: var(--bg-main);
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--text-muted);
          cursor: pointer;
          white-space: nowrap;
          font-weight: 500;
          transition: all 0.2s;
        }

        .d-tab-btn:hover {
          background: var(--bg-card);
          color: var(--text);
          transform: translateY(-1px);
        }

        .d-tab-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
        }

        .dossier-section {
          background: var(--bg-main);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .dossier-section h3 {
          margin: 0 0 1rem 0;
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          color: var(--primary);
        }

        .dossier-section h3 span {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--text-muted);
        }

        .dossier-desc {
          margin: 0 0 1rem 0;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Structured Data Viewer Styles */
        .structured-data-viewer {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
        }

        .data-grid {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .root-grid > .data-row:not(:last-child) {
          border-bottom: 1px solid var(--border);
        }

        .data-row {
          display: flex;
          flex-direction: column;
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(0,0,0,0.05);
        }
        .root-grid > .data-row:first-child { border-top: none; }

        @media (min-width: 640px) {
          .data-row {
            flex-direction: row;
            align-items: flex-start;
          }
        }

        .data-row:hover {
          background: rgba(0,0,0,0.02);
        }

        .data-label {
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.85rem;
          min-width: 200px;
          padding-right: 1rem;
          margin-bottom: 0.25rem;
        }

        @media (min-width: 640px) {
          .data-label {
            margin-bottom: 0;
            padding-top: 0.15rem;
          }
        }

        .data-content {
          flex: 1;
          color: var(--text);
          font-size: 0.95rem;
          overflow-wrap: break-word;
          word-break: break-word;
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-left: 0.5rem;
          border-left: 2px solid var(--border);
          margin-top: 0.25rem;
        }

        .data-list-item {
          background: var(--bg-card);
          padding: 0.75rem;
          border-radius: 6px;
          border: 1px solid var(--border);
        }

        .text-muted { color: var(--text-muted); }
        .text-accent { color: var(--primary); font-weight: 500; }
        .val-primitive { font-family: monospace; font-size: 0.9rem; }

      `}</style>
    </div>
  );
};

export default ClientFinancialDossier;
