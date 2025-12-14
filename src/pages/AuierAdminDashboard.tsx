import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, LogOut, LayoutDashboard, Package, History, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import AuierStatsCards from "@/components/auier/AuierStatsCards";
import AuierOrdersTable from "@/components/auier/AuierOrdersTable";
import AuierAnalyticsCharts from "@/components/auier/AuierAnalyticsCharts";
import AuierDeliveryIcon from "@/components/AuierDeliveryIcon";

export default function AuierAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AuierDeliveryIcon className="w-32 h-auto" />
              <span className="text-sm font-medium text-muted-foreground bg-primary/10 px-2 py-1 rounded">
                Admin Dashboard
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AuierStatsCards />
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Recent Pending Orders</h3>
              <AuierOrdersTable statusFilter="pending" limit={5} />
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">Active Orders</h2>
            <AuierOrdersTable statusFilter="active" />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <h2 className="text-2xl font-bold">Order History</h2>
            <AuierOrdersTable statusFilter="all" />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Revenue</h2>
            <AuierAnalyticsCharts />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
