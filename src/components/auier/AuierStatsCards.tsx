import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Clock, CheckCircle, DollarSign, TrendingUp, Bike } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  pendingOrders: number;
  todayOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeRiders: number;
}

export default function AuierStatsCards() {
  const [stats, setStats] = useState<Stats>({
    pendingOrders: 0,
    todayOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    activeRiders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('auier-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auier_orders' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Get all orders
      const { data: orders, error } = await supabase
        .from('auier_orders')
        .select('*');

      if (error) throw error;

      const allOrders = orders || [];

      // Calculate stats
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length;
      const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today).length;
      const completedOrders = allOrders.filter(o => o.status === 'completed').length;
      const totalRevenue = allOrders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
      const todayRevenue = allOrders
        .filter(o => o.status === 'completed' && new Date(o.created_at) >= today)
        .reduce((sum, o) => sum + (o.delivery_fee || 0), 0);
      const activeRiders = new Set(
        allOrders
          .filter(o => o.rider_id && !['completed', 'pending'].includes(o.status))
          .map(o => o.rider_id)
      ).size;

      setStats({
        pendingOrders,
        todayOrders,
        completedOrders,
        totalRevenue,
        todayRevenue,
        activeRiders,
      });
    } catch (error) {
      console.error('Error fetching AUIER stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Pending Orders",
      value: stats.pendingOrders,
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue} DH`,
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Today's Revenue",
      value: `${stats.todayRevenue} DH`,
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Active Riders",
      value: stats.activeRiders,
      icon: Bike,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
