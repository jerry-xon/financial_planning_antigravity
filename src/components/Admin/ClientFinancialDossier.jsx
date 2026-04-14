import React, { useState } from 'react';
import { ChevronLeft, User, DollarSign, PieChart, Target, ShieldAlert, Cpu } from 'lucide-react';

const ClientFinancialDossier = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!report) return null;

  const renderRawData = (data) => {
    return (
      <pre style={{ 
        background: '#1e1e1e', 
        color: '#d4d4d4', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        overflowX: 'auto',
        fontSize: '0.875rem'
      }}>
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  const tabs = [
    { id: 'profile', label: 'Profile Matrix', icon: <User size={18} /> },
    { id: 'cashflow', label: 'Cash Flow', icon: <DollarSign size={18} /> },
    { id: 'networth', label: 'Net Worth', icon: <PieChart size={18} /> },
    { id: 'goals', label: 'Goal Atlas', icon: <Target size={18} /> },
    { id: 'insurance', label: 'Insurance & Contingency', icon: <ShieldAlert size={18} /> },
    { id: 'algorithmic', label: 'Algorithmic Output', icon: <Cpu size={18} /> },
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
              inflow: report.inflow || {},
              outflow: report.outflow || {},
              monthly_commitments: report.monthly_commitments || {}
            })}
          </div>
        )}

        {activeTab === 'networth' && (
          <div className="dossier-section">
            <h3>Net Worth <span>(Assets & Liabilities)</span></h3>
            {renderRawData({
              assets: report.assets || {},
              liabilities: report.liabilities || {}
            })}
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="dossier-section">
            <h3>Goal Atlas</h3>
            {renderRawData(report.goals || [])}
          </div>
        )}

        {activeTab === 'insurance' && (
          <div className="dossier-section">
            <h3>Insurance & Contingency</h3>
            {renderRawData({
              insurance: report.insurance || {},
              contingency: report.contingency || {}
            })}
          </div>
        )}

        {activeTab === 'algorithmic' && (
          <div className="dossier-section">
            <h3>Algorithmic Output <span>(Engine Variables & Adjusted Matrices)</span></h3>
            {renderRawData({
              projected_ledger: report.projected_ledger || {},
              allocations: report.allocations || {},
              engine_variables: report.engine_variables || {}
            })}
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
      `}</style>
    </div>
  );
};

export default ClientFinancialDossier;
