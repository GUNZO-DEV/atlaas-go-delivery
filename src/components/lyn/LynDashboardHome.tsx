import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  ShoppingCart, 
  AlertTriangle, 
  Plus, 
  RefreshCw, 
  Printer, 
  Moon,
  TrendingUp,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import LynNewOrderDialog from "./LynNewOrderDialog";
import LynCloseDayDialog from "./LynCloseDayDialog";

interface LynDashboardHomeProps {
  restaurant: any;
  onNavigate: (tab: string) => void;
}

const LynDashboardHome = ({ restaurant, onNavigate }: LynDashboardHomeProps) => {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    activeOrders: 0,
    completedOrders: 0,
    lowStockItems: 0,
    pendingTasks: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [closeDayOpen, setCloseDayOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [restaurant.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");

      // Get today's orders
      const { data: ordersData } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: false });

      const orders = ordersData || [];
      const activeOrders = orders.filter(o => 
        !["completed", "cancelled"].includes(o.status)
      ).length;
      const completedOrders = orders.filter(o => o.status === "completed").length;
      const todayRevenue = orders
        .filter(o => o.payment_status === "paid")
        .reduce((sum, o) => sum + Number(o.total), 0);

      // Get low stock items - fetch all and filter client-side
      const { data: allInventory } = await supabase
        .from("lyn_inventory_items")
        .select("*")
        .eq("restaurant_id", restaurant.id);

      const lowStock = (allInventory || []).filter(
        item => item.current_stock <= item.min_stock_level
      );

      // Get pending tasks
      const { data: tasksData } = await supabase
        .from("lyn_staff_tasks")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("status", "pending");

      setStats({
        todayRevenue,
        activeOrders,
        completedOrders,
        lowStockItems: lowStock.length,
        pendingTasks: (tasksData || []).length
      });

      setRecentOrders(orders.slice(0, 5));
      setLowStockAlerts(lowStock.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600",
      preparing: "bg-blue-500/20 text-blue-600",
      ready: "bg-green-500/20 text-green-600",
      completed: "bg-gray-500/20 text-gray-600",
      cancelled: "bg-red-500/20 text-red-600"
    };
    return colors[status] || "bg-gray-500/20 text-gray-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold text-green-600">{stats.todayRevenue.toFixed(2)} DH</p>
              </div>
              <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completedOrders}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${stats.lowStockItems > 0 ? 'from-red-500/10 to-red-500/5 border-red-500/20' : 'from-gray-500/10 to-gray-500/5 border-gray-500/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                <p className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {stats.lowStockItems}
                </p>
              </div>
              <div className={`h-12 w-12 ${stats.lowStockItems > 0 ? 'bg-red-500/20' : 'bg-gray-500/20'} rounded-full flex items-center justify-center`}>
                <AlertTriangle className={`h-6 w-6 ${stats.lowStockItems > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setNewOrderOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span>New Order</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onNavigate("finances")}
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refund</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => onNavigate("orders")}
            >
              <Printer className="h-5 w-5" />
              <span>Print Receipt</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => setCloseDayOpen(true)}
            >
              <Moon className="h-5 w-5" />
              <span>Close Day</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("orders")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No orders today</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {order.order_type === "dine_in" ? order.table_number || "T" : 
                           order.order_type === "pickup" ? "P" : "D"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{order.receipt_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer_name || "Walk-in"} • {format(new Date(order.created_at), "HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Number(order.total).toFixed(2)} DH</p>
                      <Badge className={getStatusColor(order.status)} variant="secondary">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Inventory Alerts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("inventory")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockAlerts.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-muted-foreground">All stock levels are healthy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockAlerts.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-red-600">
                        {item.current_stock} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Min: {item.min_stock_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <LynNewOrderDialog 
        open={newOrderOpen} 
        onOpenChange={setNewOrderOpen}
        restaurant={restaurant}
        onSuccess={loadDashboardData}
      />
      <LynCloseDayDialog
        open={closeDayOpen}
        onOpenChange={setCloseDayOpen}
        restaurant={restaurant}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};

// Package icon component
const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

export default LynDashboardHome;
