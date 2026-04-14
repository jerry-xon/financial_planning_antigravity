import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminDashboard from '../Admin/AdminDashboard';
import SubscriptionGate from './SubscriptionGate';

const RoleBasedRouting = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FORCE ALERT FOR DEBUGGING (will fire on mount if not cached)
    if (user) {
      console.log('--- ROLE BASED ROUTING DEBUG ---', { userEmail: user.email, subscriptionActive });
    }

    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.warn('Profile fetch warning (User might be brand new):', error.message);
        }

        setUserRole(data?.role || 'user');
        // Default to false if the column does not even exist or is missing
        setSubscriptionActive(data?.subscription_active === true);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserRole('user');
        setSubscriptionActive(false);
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
  }

  const adminEmails = ['deepurswani@gmail.com'];
  const userEmail = user?.email?.toLowerCase().trim();
  const isAdmin = (userEmail && adminEmails.includes(userEmail)) || userRole === 'admin';

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (userRole === 'agent') {
    return (
      <>
        {children}
        <div style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '0.75rem 1rem',
          background: 'var(--primary)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: '600',
          zIndex: 9999
        }}>
          Agent Account
        </div>
      </>
    );
  }

  // DEBUG BANNER (Temporary)
  const debugBanner = (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', background: 'red', color: 'white', zIndex: 10000, padding: '5px', fontSize: '12px' }}>
      DEBUG: user={user?.email ? 'YES' : 'NO'} | role={userRole} | subActive={String(subscriptionActive)}
    </div>
  );

  if (!user) {
    return children;
  }

  if (!subscriptionActive) {
    return (
      <>
        {debugBanner}
        <SubscriptionGate onActivate={() => setSubscriptionActive(true)} />
      </>
    );
  }

  return (
    <>
      {debugBanner}
      {children}
    </>
  );
};

export default RoleBasedRouting;
