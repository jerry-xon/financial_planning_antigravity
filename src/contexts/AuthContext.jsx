import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, onAuthStateChange } from '../services/authService';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // #region agent log (debug-89950b)
    fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H1',location:'src/contexts/AuthContext.jsx:useEffect(init)',message:'AuthProvider mounted; initializing auth',data:{hasWindow:typeof window!=='undefined'},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // Get initial session
    const initAuth = async () => {
      try {
        const { user: currentUser } = await getCurrentUser();
        // #region agent log (debug-89950b)
        fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H2',location:'src/contexts/AuthContext.jsx:initAuth',message:'getCurrentUser result',data:{hasUser:!!currentUser,hasEmail:!!currentUser?.email},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: authListener } = onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      // #region agent log (debug-89950b)
      fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H3',location:'src/contexts/AuthContext.jsx:onAuthStateChange',message:'Auth state changed',data:{event,hasSession:!!session,hasUser:!!session?.user,hasEmail:!!session?.user?.email},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const value = {
    user,
    session,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
