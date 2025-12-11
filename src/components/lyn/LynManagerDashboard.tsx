import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, Users, TrendingUp, Clock, 
  ChefHat, CheckCircle, AlertTriangle, Star
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { format, startOfDay, endOfDay } from "date-fns";

interface LynManagerDashboardProps {
  restaurant: any;
}

const COLORS = ["#22c55e", "#f97316", "#3b82f6", "#eab308", "#ef4444", "#8b5cf6"];

const LynManagerDashboard = ({ restaurant }: LynManagerDashboardProps) => {
  const [tables, setTables] = useState<any[]>([]);
  const [todayOrders, setTodayOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    const today = new Date();
    
    // Fetch tables
    const { data: tablesData } = await supabase
      .from("lyn_tables")
      .select("*")
      .eq("restaurant_id", restaurant.id);

    // Fetch today's orders
    const { data: ordersData } = await supabase
      .from("lyn_restaurant_orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", startOfDay(today).toISOString())
      .lte("created_at", endOfDay(today).toISOString())
      .order("created_at", { ascending: false });

    setTables(tablesData || []);
    setTodayOrders(ordersData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("manager-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "lyn_tables" }, fetchData)
      .on("postgres_changes", { event: "*", schema: "public", table: "lyn_restaurant_orders" }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  // Calculate stats
  const stats = {
    totalTables: tables.length,
    occupiedTables: tables.filter(t => t.status === "occupied").length,
    availableTables: tables.filter(t => t.status === "available").length,
    reservedTables: tables.filter(t => t.status === "reserved").length,
    
    totalOrders: todayOrders.length,
    pendingOrders: todayOrders.filter(o => o.status === "pending" || o.status === "preparing").length,
    completedOrders: todayOrders.filter(o => o.status === "completed").length,
    
    todayRevenue: todayOrders
      .filter(o => o.payment_status === "paid")
      .reduce((sum, o) => sum + (o.total || 0), 0),
    
    avgOrderValue: todayOrders.length > 0
      ? todayOrders.reduce((sum, o) => sum + (o.total || 0), 0) / todayOrders.length
      : 0,
  };

  // Best sellers
  const itemSales: Record<string, number> = {};
  todayOrders.forEach(order => {
    const items = (order.items || []) as any[];
    items.forEach(item => {
      itemSales[item.name] = (itemSales[item.name] || 0) + item.quantity;
    });
  });

  const bestSellers = Object.entries(itemSales)
    .map(([name, qty]) => ({ name, quantity: qty as number }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Hourly orders
  const hourlyData: Record<number, number> = {};
  todayOrders.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourlyData[hour] = (hourlyData[hour] || 0) + 1;
  });

  const hourlyChartData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    orders: hourlyData[i] || 0
  })).filter((_, i) => i >= 8 && i <= 23);

  // Payment methods pie
  const paymentMethods: Record<string, number> = {};
  todayOrders.filter(o => o.payment_status === "paid").forEach(order => {
    const method = order.payment_method || "cash";
    paymentMethods[method] = (paymentMethods[method] || 0) + order.total;
  });

  const paymentChartData = Object.entries(paymentMethods).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number
  }));

  // Table utilization
  const tableUtilization = stats.totalTables > 0 
    ? (stats.occupiedTables / stats.totalTables) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today Revenue</p>
                <p className="text-2xl font-bold">{stats.todayRevenue.toFixed(0)} DH</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tables</p>
                <p className="text-2xl font-bold">{stats.occupiedTables}/{stats.totalTables}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/20 rounded-full">
                <ChefHat className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{stats.pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Order</p>
                <p className="text-2xl font-bold">{stats.avgOrderValue.toFixed(0)} DH</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Table Utilization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Occupied</span>
                <span>{tableUtilization.toFixed(0)}%</span>
              </div>
              <Progress value={tableUtilization} className="h-3" />
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">{stats.availableTables}</p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{stats.occupiedTables}</p>
                <p className="text-xs text-muted-foreground">Occupied</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{stats.reservedTables}</p>
                <p className="text-xs text-muted-foreground">Reserved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Orders by Hour</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="hour" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Best Sellers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Best Sellers Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {bestSellers.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <Badge 
                      variant={index === 0 ? "default" : "outline"}
                      className={index === 0 ? "bg-yellow-500" : ""}
                    >
                      #{index + 1}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <Badge variant="secondary">{item.quantity} sold</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Revenue by Payment</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentChartData.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No paid orders yet</p>
            ) : (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={150}>
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value.toFixed(0)} DH`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {paymentChartData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value.toFixed(0)} DH</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {todayOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{order.table_number || order.order_type}</Badge>
                  <span className="text-sm">{format(new Date(order.created_at), "HH:mm")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={order.status === "completed" ? "default" : "secondary"}
                    className={order.status === "completed" ? "bg-green-600" : ""}
                  >
                    {order.status}
                  </Badge>
                  <span className="font-medium">{order.total?.toFixed(0)} DH</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LynManagerDashboard;
