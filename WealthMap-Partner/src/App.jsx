import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthContext';
import { Loader } from './components/ui';
import { ForcePasswordChange } from './components/ForcePasswordChange';
import { AppChrome } from './components/AppChrome';
import { LoginPage } from './pages/LoginPage';
import { RegisterPartnerPage } from './pages/RegisterPartnerPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientDetailPage } from './pages/ClientDetailPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { RenewalsPage } from './pages/RenewalsPage';
import { ClientWizardPage } from './pages/ClientWizardPage';
import { ClientReportPage } from './pages/ClientReportPage';
import { PartnerReportPreviewPage } from './pages/PartnerReportPreviewPage';
import { ProfilePage } from './pages/ProfilePage';

function RequireAuth({ children, kind }) {
  const { session, loading, me, meLoading, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading || (session && meLoading && !me)) {
    return <Loader label="Signing you in…" />;
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!me) {
    return <Navigate to="/login" replace />;
  }
  if (kind && me.kind !== kind) {
    return <Navigate to={me.kind === 'client' ? '/report' : '/'} replace />;
  }
  if (mustChangePassword) {
    return (
      <>
        <ForcePasswordChange />
        <div style={{ filter: 'blur(2px)', pointerEvents: 'none' }}>{children}</div>
      </>
    );
  }
  return children;
}

function PartnerRoute({ children }) {
  return (
    <RequireAuth kind="partner">
      <AppChrome>{children}</AppChrome>
    </RequireAuth>
  );
}

export default function App() {
  const { session, loading, me } = useAuth();

  if (loading) return <Loader />;

  return (
    <Routes>
      <Route path="/login" element={session && me ? <Navigate to={me.kind === 'client' ? '/report' : '/'} replace /> : <LoginPage />} />
      <Route path="/register-partner" element={<RegisterPartnerPage />} />

      <Route path="/" element={<PartnerRoute><DashboardPage /></PartnerRoute>} />
      <Route path="/clients" element={<PartnerRoute><ClientsPage /></PartnerRoute>} />
      <Route path="/clients/new" element={<PartnerRoute><ClientWizardPage /></PartnerRoute>} />
      <Route path="/clients/:clientId/crm" element={<PartnerRoute><ClientDetailPage /></PartnerRoute>} />
      <Route path="/clients/:clientId" element={<PartnerRoute><ClientWizardPage /></PartnerRoute>} />
      <Route path="/clients/:clientId/report" element={<PartnerRoute><PartnerReportPreviewPage /></PartnerRoute>} />
      <Route path="/policies" element={<PartnerRoute><PoliciesPage /></PartnerRoute>} />
      <Route path="/renewals" element={<PartnerRoute><RenewalsPage /></PartnerRoute>} />
      <Route path="/profile" element={<PartnerRoute><ProfilePage /></PartnerRoute>} />

      <Route
        path="/report"
        element={
          <RequireAuth kind="client">
            <AppChrome clientMode>
              <ClientReportPage />
            </AppChrome>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to={session ? (me?.kind === 'client' ? '/report' : '/') : '/login'} replace />} />
    </Routes>
  );
}
