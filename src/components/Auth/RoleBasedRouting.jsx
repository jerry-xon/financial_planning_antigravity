import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import AdminDashboard from "../Admin/AdminDashboard";
import SubscriptionGate from "./SubscriptionGate";

const RoleBasedRouting = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;

    // #region agent log (debug-89950b)
    fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H5',location:'src/components/Auth/RoleBasedRouting.jsx:13',message:'RoleBasedRouting useEffect fired',data:{hasUser:!!user,hasEmail:!!user?.email,subscriptionActiveState:subscriptionActive},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    // FORCE ALERT FOR DEBUGGING (will fire on mount if not cached)
    if (user) {
      console.log("--- ROLE BASED ROUTING DEBUG ---", {
        userEmail: user.email,
        subscriptionActive,
      });
    }

    const fetchUserRole = async () => {
      if (!userId) {
        // #region agent log (debug-89950b)
        fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H1',location:'src/components/Auth/RoleBasedRouting.jsx:23',message:'No user; skipping profile fetch',data:{hasUser:false},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        setUserRole(null);
        setSubscriptionActive(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // #region agent log (debug-89950b)
        fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H2',location:'src/components/Auth/RoleBasedRouting.jsx:28',message:'Fetching user profile',data:{hasUser:true,hasUserId:!!user?.id},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) {
          console.warn(
            "Profile fetch warning (User might be brand new):",
            error.message,
          );
        }

        setUserRole(data?.role || "user");
        // Always mirror DB; otherwise a previous session's true sticks and skips SubscriptionGate
        setSubscriptionActive(data?.subscription_active === true);
        // #region agent log (debug-89950b)
        fetch('/__cursor_debug_log',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'89950b',runId:'pre-fix',hypothesisId:'H2',location:'src/components/Auth/RoleBasedRouting.jsx:43',message:'Profile fetch completed',data:{hasData:!!data,hasError:!!error,role:data?.role||null,subscriptionActiveFromDb:data?.subscription_active===true},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserRole("user");
        setSubscriptionActive(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div>Loading...</div>
      </div>
    );
  }

  const adminEmails = ["deepurswani@gmail.com"];
  const userEmail = (user?.email || "").toLowerCase().trim();
  const isAdmin =
    (userEmail && adminEmails.includes(userEmail)) || userRole === "admin";

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (userRole === "agent") {
    return (
      <>
        {children}
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            padding: "0.75rem 1rem",
            background: "var(--primary)",
            color: "white",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: "600",
            zIndex: 9999,
          }}
        >
          Agent Account
        </div>
      </>
    );
  }

  // DEBUG BANNER (Temporary)
  const debugBanner = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        background: "red",
        color: "white",
        zIndex: 10000,
        padding: "5px",
        fontSize: "12px",
      }}
    >
      DEBUG: user={user?.email ? "YES" : "NO"} | role={userRole} | subActive=
      {String(subscriptionActive)}
    </div>
  );

  if (!user) {
    return (
      <>
        {debugBanner}
        {children}
      </>
    );
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
