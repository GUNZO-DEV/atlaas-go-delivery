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
    noAdminExists?: boolean;
  }>({
    loading: true,
    authenticated: false,
    authorized: false,
    noAdminExists: false,
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

      const hasRole = roles?.some(r => r.role === requiredRole) || false;

      // If admin role required and user doesn't have it, check if any admin exists
      let noAdminExists = false;
      if (requiredRole === 'admin' && !hasRole) {
        const { data: hasAdmin, error: rpcError } = await supabase.rpc('admin_exists');
        if (!rpcError) {
          noAdminExists = !hasAdmin;
        }
      }
      
      setAuthState({
        loading: false,
        authenticated: true,
        authorized: hasRole,
        noAdminExists,
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
    if (requiredRole === 'admin' && authState.noAdminExists) {
      return <Navigate to="/admin/setup" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
