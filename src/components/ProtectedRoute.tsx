import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "customer" | "merchant" | "rider" | "admin";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [authState, setAuthState] = useState<{
    loading: boolean;
    authenticated: boolean;
    authorized: boolean;
  }>({
    loading: true,
    authenticated: false,
    authorized: false,
  });

  useEffect(() => {
    checkAuth();
  }, [requiredRole]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setAuthState({ loading: false, authenticated: false, authorized: false });
        return;
      }

      // If no specific role required, just authenticated is enough
      if (!requiredRole) {
        setAuthState({ loading: false, authenticated: true, authorized: true });
        return;
      }

      // Check if user has the required role
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (error) throw error;

      const hasRole = roles?.some(r => r.role === requiredRole);
      
      setAuthState({
        loading: false,
        authenticated: true,
        authorized: hasRole || false,
      });
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState({ loading: false, authenticated: false, authorized: false });
    }
  };

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authState.authenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && !authState.authorized) {
    // Redirect to their appropriate dashboard based on available roles
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
