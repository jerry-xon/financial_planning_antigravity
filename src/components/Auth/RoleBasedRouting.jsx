import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AdminDashboard from '../Admin/AdminDashboard';

const RoleBasedRouting = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(data?.role || 'user');
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
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

  // Admin portal - hardcoded admin email
  const adminEmails = ['jayeshpurswani2004@gmail.com']; // Add your admin email here
  const isAdmin = user && adminEmails.includes(user.email);

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
          fontWeight: '600'
        }}>
          Agent Account
        </div>
      </>
    );
  }

  return children;
};

export default RoleBasedRouting;
