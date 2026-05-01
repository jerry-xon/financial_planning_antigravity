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

    const fetchUserRole = async () => {
      if (!userId) {
        setUserRole(null);
        setSubscriptionActive(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
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

  if (userRole === "admin") {
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

  if (!user) {
    return <>{children}</>;
  }

  if (!subscriptionActive) {
    return <SubscriptionGate onActivate={() => setSubscriptionActive(true)} />;
  }

  return <>{children}</>;
};

export default RoleBasedRouting;
