import { BarChart3, CheckCircle, FileText, LogOut, Shield, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { signOut } from '../../services/authService';

const AdminDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalAgents: 0, pendingApprovals: 0, totalReports: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Get all agents
      const { data: agentsData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      // Get all reports created by agents
      const { data: reportsData } = await supabase
        .from('financial_plans')
        .select('id, plan_name, client_name, agent_id, created_at, updated_at, user_profiles(full_name)')
        .not('agent_id', 'is', null)
        .order('created_at', { ascending: false });

      setAgents(agentsData || []);
      setReports(reportsData || []);

      // Calculate stats
      setStats({
        totalAgents: agentsData?.length || 0,
        pendingApprovals: agentsData?.filter(a => !a.is_approved).length || 0,
        totalReports: reportsData?.length || 0,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
    setLoading(false);
  };

  const handleApproveAgent = async (agentId) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ is_approved: true })
        .eq('id', agentId);
      loadAdminData();
    } catch (error) {
      console.error('Error approving agent:', error);
    }
  };

  const handleRejectAgent = async (agentId) => {
    try {
      await supabase
        .from('user_profiles')
        .update({ is_approved: false })
        .eq('id', agentId);
      loadAdminData();
    } catch (error) {
      console.error('Error rejecting agent:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Shield size={28} color="var(--primary)" />
          <h1>Admin Portal</h1>
        </div>
        <button 
          className="btn"
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'transparent',
            border: '1px solid var(--border)'
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--primary)10', borderRadius: '8px' }}>
              <Users size={24} color="var(--primary)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Agents</p>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>{stats.totalAgents}</h2>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#fef08a66', borderRadius: '8px' }}>
              <CheckCircle size={24} color="#eab308" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Pending Approvals</p>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>{stats.pendingApprovals}</h2>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: 'var(--accent)10', borderRadius: '8px' }}>
              <FileText size={24} color="var(--accent)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Reports</p>
              <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '700' }}>{stats.totalReports}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={18} /> Overview
        </button>
        <button 
          className={`tab-button ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Users size={18} /> Agents ({stats.totalAgents})
        </button>
        <button 
          className={`tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={18} /> Reports ({stats.totalReports})
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : activeTab === 'overview' ? (
          <OverviewTab agents={agents} reports={reports} />
        ) : activeTab === 'agents' ? (
          <AgentsTab agents={agents} onApprove={handleApproveAgent} onReject={handleRejectAgent} />
        ) : (
          <ReportsTab reports={reports} />
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: var(--bg-main);
          padding: 2rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .admin-header h1 {
          margin: 0;
          font-size: 1.875rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .admin-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .tab-button:hover {
          color: var(--text);
        }

        .tab-button.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }

        .admin-content {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 2rem;
          min-height: 400px;
        }
      `}</style>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ agents, reports }) => {
  const approvedAgents = agents.filter(a => a.is_approved).length;
  const pendingAgents = agents.filter(a => !a.is_approved).length;

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Approved Agents</p>
          <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--primary)' }}>{approvedAgents}</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Pending Approval</p>
          <h3 style={{ margin: 0, fontSize: '1.75rem', color: '#eab308' }}>{pendingAgents}</h3>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--bg-main)', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Total Reports Generated</p>
          <h3 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--accent)' }}>{reports.length}</h3>
        </div>
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Recent Reports</h3>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {reports.slice(0, 10).map(report => (
          <div key={report.id} style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: '8px', marginBottom: '0.75rem', borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '600' }}>{report.plan_name}</p>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Client: {report.client_name || 'Unnamed'}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {new Date(report.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Agents Tab Component
const AgentsTab = ({ agents, onApprove, onReject }) => {
  return (
    <div>
      <h2>Agent Management</h2>
      <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Company</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Status</th>
              <th style={{ textAlign: 'left', padding: '1rem', fontWeight: '600' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map(agent => (
              <tr key={agent.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>{agent.full_name}</td>
                <td style={{ padding: '1rem' }}>{agent.email}</td>
                <td style={{ padding: '1rem' }}>{agent.company_name || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    background: agent.is_approved ? '#dcfce7' : '#fef08a',
                    color: agent.is_approved ? '#15803d' : '#854d0e'
                  }}>
                    {agent.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  {!agent.is_approved && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => onApprove(agent.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#15803d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => onReject(agent.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reports Tab Component
const ReportsTab = ({ reports }) => {
  return (
    <div>
      <h2>All Reports</h2>
      <div style={{ display: 'grid', gap: '1rem', marginTop: '1.5rem' }}>
        {reports.map(report => (
          <div key={report.id} style={{
            padding: '1.5rem',
            background: 'var(--bg-main)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--accent)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{report.plan_name}</h3>
                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <strong>Client:</strong> {report.client_name || 'Unnamed'}
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  <strong>Agent:</strong> {report.user_profiles?.full_name || 'Unknown'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Created: {new Date(report.created_at).toLocaleDateString()}
                </p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Updated: {new Date(report.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
