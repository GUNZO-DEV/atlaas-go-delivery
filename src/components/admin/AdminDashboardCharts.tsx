import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

interface OrderStats {
  date: string;
  orders: number;
  revenue: number;
}

const AdminDashboardCharts = () => {
  const [orderData, setOrderData] = useState<OrderStats[]>([]);
  const [revenueData, setRevenueData] = useState<OrderStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      // Get last 7 days of orders
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("orders")
        .select("created_at, total_amount, status")
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date
      const groupedData: Record<string, { orders: number; revenue: number }> = {};
      
      data?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!groupedData[date]) {
          groupedData[date] = { orders: 0, revenue: 0 };
        }
        groupedData[date].orders += 1;
        if (order.status === 'delivered') {
          groupedData[date].revenue += Number(order.total_amount);
        }
      });

      const chartData = Object.entries(groupedData).map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue,
      }));

      setOrderData(chartData);
      setRevenueData(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading charts...</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Orders Per Day (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="hsl(var(--primary))" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Per Day (MAD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue (MAD)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardCharts;