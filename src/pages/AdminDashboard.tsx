import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Users, Store, Bike, Briefcase, ShoppingCart, Tag, UtensilsCrossed, FileText, MessageSquare, Settings } from "lucide-react";
import { toast } from "sonner";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminRestaurantApplications from "@/components/admin/AdminRestaurantApplications";
import AdminRestaurantManagement from "@/components/admin/AdminRestaurantManagement";
import AdminRiderApplications from "@/components/admin/AdminRiderApplications";
import AdminJobApplications from "@/components/admin/AdminJobApplications";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminOrdersManagement from "@/components/admin/AdminOrdersManagement";
import AdminPromotions from "@/components/admin/AdminPromotions";
import AdminMenuManagement from "@/components/admin/AdminMenuManagement";
import AdminCompliancePanel from "@/components/admin/AdminCompliancePanel";
import AdminSupportCenter from "@/components/admin/AdminSupportCenter";
import AdminSettings from "@/components/admin/AdminSettings";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Signed out successfully");
  };

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      <header className="border-b bg-card sticky top-0 z-30">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold">Admin</h1>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-11 gap-1 sm:gap-2 h-auto">
              <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="restaurants" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <Store className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Restaurants
              </TabsTrigger>
              <TabsTrigger value="riders" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <Bike className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Riders
              </TabsTrigger>
              <TabsTrigger value="jobs" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <Briefcase className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Jobs
              </TabsTrigger>
              <TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger value="menu" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <UtensilsCrossed className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="compliance" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Compliance
              </TabsTrigger>
              <TabsTrigger value="support" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Support
              </TabsTrigger>
              <TabsTrigger value="promotions" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Promos
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3 py-2 whitespace-nowrap">
                <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="restaurants">
            <Tabs defaultValue="applications" className="space-y-4">
              <TabsList>
                <TabsTrigger value="applications">Applications</TabsTrigger>
                <TabsTrigger value="management">Active Restaurants</TabsTrigger>
              </TabsList>
              <TabsContent value="applications">
                <AdminRestaurantApplications />
              </TabsContent>
              <TabsContent value="management">
                <AdminRestaurantManagement />
              </TabsContent>
            </Tabs>
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

          <TabsContent value="menu">
            <AdminMenuManagement />
          </TabsContent>

          <TabsContent value="compliance">
            <AdminCompliancePanel />
          </TabsContent>

          <TabsContent value="support">
            <AdminSupportCenter />
          </TabsContent>

          <TabsContent value="promotions">
            <AdminPromotions />
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
