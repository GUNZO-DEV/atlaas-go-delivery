import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Store, Clock } from "lucide-react";

interface OrderStats {
  date: string;
  orders: number;
  revenue: number;
}

interface RestaurantStats {
  name: string;
  orders: number;
}

interface HourStats {
  hour: string;
  orders: number;
}

const AdminDashboardCharts = () => {
  const [orderData, setOrderData] = useState<OrderStats[]>([]);
  const [revenueData, setRevenueData] = useState<OrderStats[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<RestaurantStats[]>([]);
  const [peakHours, setPeakHours] = useState<HourStats[]>([]);
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
        .select(`
          created_at, 
          total_amount, 
          status,
          restaurant_id,
          restaurants(name)
        `)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group by date for order trends
      const groupedData: Record<string, { orders: number; revenue: number }> = {};
      // Group by restaurant for top performers
      const restaurantData: Record<string, { name: string; orders: number }> = {};
      // Group by hour for peak hours
      const hourData: Record<number, number> = {};
      
      data?.forEach((order: any) => {
        // Date grouping
        const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!groupedData[date]) {
          groupedData[date] = { orders: 0, revenue: 0 };
        }
        groupedData[date].orders += 1;
        if (order.status === 'delivered') {
          groupedData[date].revenue += Number(order.total_amount);
        }

        // Restaurant grouping
        const restaurantId = order.restaurant_id;
        const restaurantName = order.restaurants?.name || "Unknown";
        if (!restaurantData[restaurantId]) {
          restaurantData[restaurantId] = { name: restaurantName, orders: 0 };
        }
        restaurantData[restaurantId].orders += 1;

        // Hour grouping
        const hour = new Date(order.created_at).getHours();
        hourData[hour] = (hourData[hour] || 0) + 1;
      });

      const chartData = Object.entries(groupedData).map(([date, stats]) => ({
        date,
        orders: stats.orders,
        revenue: stats.revenue,
      }));

      // Top 5 restaurants
      const topRestaurantsData = Object.values(restaurantData)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 5);

      // Peak hours (format as 12-hour time)
      const peakHoursData = Object.entries(hourData)
        .map(([hour, orders]) => ({
          hour: `${parseInt(hour) % 12 || 12}${parseInt(hour) >= 12 ? 'PM' : 'AM'}`,
          orders,
        }))
        .sort((a, b) => {
          const aHour = parseInt(a.hour);
          const bHour = parseInt(b.hour);
          return aHour - bHour;
        });

      setOrderData(chartData);
      setRevenueData(chartData);
      setTopRestaurants(topRestaurantsData);
      setPeakHours(peakHoursData);
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Top Restaurants (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topRestaurants} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="orders" fill="hsl(var(--accent))" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Peak Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--secondary))" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardCharts;