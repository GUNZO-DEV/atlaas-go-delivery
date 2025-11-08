import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Store, Bike, ShoppingCart, TrendingUp, Clock } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalRestaurants: number;
  totalRiders: number;
  totalOrders: number;
  pendingRestaurants: number;
  pendingRiders: number;
  todayOrders: number;
  totalRevenue: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalRestaurants: 0,
    totalRiders: 0,
    totalOrders: 0,
    pendingRestaurants: 0,
    pendingRiders: 0,
    todayOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalRestaurants },
        { count: totalRiders },
        { count: totalOrders },
        { count: pendingRestaurants },
        { count: pendingRiders },
        { data: todayOrdersData },
        { data: revenueData },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("restaurants").select("*", { count: "exact", head: true }),
        supabase.from("rider_profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("restaurant_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("rider_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("orders").select("id").gte("created_at", new Date().toISOString().split('T')[0]),
        supabase.from("orders").select("total_amount").eq("status", "delivered"),
      ]);

      const revenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalRestaurants: totalRestaurants || 0,
        totalRiders: totalRiders || 0,
        totalOrders: totalOrders || 0,
        pendingRestaurants: pendingRestaurants || 0,
        pendingRiders: pendingRiders || 0,
        todayOrders: todayOrdersData?.length || 0,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading statistics...</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Restaurants",
      value: stats.totalRestaurants,
      icon: Store,
      color: "text-green-600",
    },
    {
      title: "Active Riders",
      value: stats.totalRiders,
      icon: Bike,
      color: "text-purple-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-orange-600",
    },
    {
      title: "Pending Restaurants",
      value: stats.pendingRestaurants,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Pending Riders",
      value: stats.pendingRiders,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: TrendingUp,
      color: "text-indigo-600",
    },
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toFixed(2)} MAD`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
