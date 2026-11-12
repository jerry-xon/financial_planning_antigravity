import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import AdminDashboard from "../Admin/AdminDashboard";
// FLAG_PAYMENT_DISABLED: import SubscriptionGate from "./SubscriptionGate";

const RoleBasedRouting = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?.id;

    const fetchUserRole = async () => {
      if (!userId) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      const shouldShowLoader = userRole === null;
      if (shouldShowLoader) {
        setLoading(true);
      }

      try {
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.warn("Profile fetch:", error.code, error.message);
        }

        if (!data && !error) {
          console.warn(
            "No user_profiles row for this account. If you just signed up, wait a moment or check Supabase.",
          );
        }

        setUserRole(data?.role || "user");
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserRole("user");
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

  // Legacy agent accounts: no special B2C chrome — partners use WealthMap-Partner
  if (!user) {
    return <>{children}</>;
  }

  /* FLAG_PAYMENT_DISABLED:
  if (!subscriptionActive) {
    return <SubscriptionGate onActivate={() => setSubscriptionActive(true)} />;
  }
  */

  return <>{children}</>;
};

export default RoleBasedRouting;
