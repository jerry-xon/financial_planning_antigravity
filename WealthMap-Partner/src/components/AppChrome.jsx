import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  CalendarClock,
  UserCircle,
  LogOut,
  Menu,
  Search,
  Plus,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

const NAV = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/policies', label: 'Policies', icon: Shield },
  { to: '/renewals', label: 'Renewals', icon: CalendarClock },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export function AppChrome({ children, clientMode = false }) {
  const { me, seats, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');

  const name = clientMode
    ? me?.client?.full_name || me?.profile?.full_name || 'Client'
    : me?.partner?.full_name || me?.partner?.company_name || 'Partner';

  if (clientMode) {
    return (
      <div>
        <nav className="glass client-mode-nav">
          <Link to="/report" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 700 }}>
            Finbrella Report
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{name}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={async () => {
                await signOut();
                navigate('/login');
              }}
            >
              Log out
            </button>
          </div>
        </nav>
        {children}
      </div>
    );
  }

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/clients?q=${encodeURIComponent(q)}`);
    setSidebarOpen(false);
  };

  return (
    <div className="crm-shell">
      {sidebarOpen ? (
        <button
          type="button"
          className="crm-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside className={`crm-sidebar${sidebarOpen ? ' open' : ''}`}>
        <Link to="/" className="crm-brand" onClick={() => setSidebarOpen(false)}>
          <div className="crm-brand-mark">F</div>
          <div className="crm-brand-text">
            <strong>Finbrella</strong>
            <span>Partner CRM</span>
          </div>
        </Link>

        <nav className="crm-nav">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => (isActive ? 'active' : undefined)}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} strokeWidth={2.1} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="crm-sidebar-foot">
          {seats ? (
            <div className="crm-seat-pill">
              <span>Report seats</span>
              <strong>{seats.seats_remaining}</strong>
            </div>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', borderRadius: 12 }}
            onClick={() => {
              setSidebarOpen(false);
              navigate('/clients/new');
            }}
          >
            <Plus size={16} /> New report client
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: 'rgba(255,255,255,0.65)', width: '100%' }}
            onClick={async () => {
              await signOut();
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <div className="crm-main">
        <header className="crm-topbar">
          <button
            type="button"
            className="btn btn-secondary btn-sm crm-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <form className="crm-search" onSubmit={onSearch}>
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              aria-label="Search clients"
            />
          </form>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{name}</span>
            {!location.pathname.startsWith('/clients/new') ? (
              <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate('/clients/new')}>
                <Plus size={14} /> Report
              </button>
            ) : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
