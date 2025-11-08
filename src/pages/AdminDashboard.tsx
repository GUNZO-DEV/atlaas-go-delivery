import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Store, Bike, Briefcase, ShoppingCart, Tag } from "lucide-react";
import { toast } from "sonner";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminRestaurantApplications from "@/components/admin/AdminRestaurantApplications";
import AdminRiderApplications from "@/components/admin/AdminRiderApplications";
import AdminJobApplications from "@/components/admin/AdminJobApplications";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminOrdersManagement from "@/components/admin/AdminOrdersManagement";
import AdminPromotions from "@/components/admin/AdminPromotions";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!roles?.some(r => r.role === 'admin')) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/");
        return;
      }

      setLoading(false);
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Restaurants</span>
            </TabsTrigger>
            <TabsTrigger value="riders" className="gap-2">
              <Bike className="h-4 w-4" />
              <span className="hidden sm:inline">Riders</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="promotions" className="gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Promos</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="restaurants">
            <AdminRestaurantApplications />
          </TabsContent>

          <TabsContent value="riders">
            <AdminRiderApplications />
          </TabsContent>

          <TabsContent value="jobs">
            <AdminJobApplications />
          </TabsContent>

          <TabsContent value="orders">
            <AdminOrdersManagement />
          </TabsContent>

          <TabsContent value="promotions">
            <AdminPromotions />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
