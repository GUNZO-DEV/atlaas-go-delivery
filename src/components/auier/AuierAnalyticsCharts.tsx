import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface DailyData {
  date: string;
  orders: number;
  revenue: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface DeliveryTypeData {
  name: string;
  value: number;
  fee: number;
}

interface RestaurantData {
  name: string;
  orders: number;
}

const COLORS = ['#f97316', '#3b82f6', '#a855f7', '#6366f1', '#06b6d4', '#22c55e'];

export default function AuierAnalyticsCharts() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [deliveryTypeData, setDeliveryTypeData] = useState<DeliveryTypeData[]>([]);
  const [topRestaurants, setTopRestaurants] = useState<RestaurantData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('auier_orders')
        .select('*');

      if (error) throw error;

      const allOrders = orders || [];

      // Calculate daily data for last 7 days
      const last7Days: DailyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i));
        const nextDate = startOfDay(subDays(new Date(), i - 1));
        
        const dayOrders = allOrders.filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= date && orderDate < nextDate;
        });

        last7Days.push({
          date: format(date, 'MMM d'),
          orders: dayOrders.length,
          revenue: dayOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.delivery_fee || 0), 0),
        });
      }
      setDailyData(last7Days);

      // Calculate status distribution
      const statusCounts: Record<string, number> = {};
      allOrders.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });
      setStatusData(
        Object.entries(statusCounts).map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
          value,
        }))
      );

      // Calculate delivery type distribution
      const restaurantToDorm = allOrders.filter(o => o.delivery_type === 'restaurant_to_dorm');
      const gateToDorm = allOrders.filter(o => o.delivery_type === 'maingate_to_dorm');
      setDeliveryTypeData([
        {
          name: 'Restaurant → Dorm',
          value: restaurantToDorm.length,
          fee: restaurantToDorm.reduce((sum, o) => sum + (o.delivery_fee || 0), 0),
        },
        {
          name: 'Gate → Dorm',
          value: gateToDorm.length,
          fee: gateToDorm.reduce((sum, o) => sum + (o.delivery_fee || 0), 0),
        },
      ]);

      // Calculate top restaurants
      const restaurantCounts: Record<string, number> = {};
      allOrders.forEach(o => {
        const name = o.restaurant_name.trim();
        restaurantCounts[name] = (restaurantCounts[name] || 0) + 1;
      });
      const sortedRestaurants = Object.entries(restaurantCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, orders]) => ({ name, orders }));
      setTopRestaurants(sortedRestaurants);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Daily Orders Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Orders (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Revenue (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value} DH`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Delivery Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Type Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={deliveryTypeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" className="text-xs" />
              <YAxis dataKey="name" type="category" className="text-xs" width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number, name: string) => [
                  name === 'fee' ? `${value} DH` : value,
                  name === 'fee' ? 'Total Revenue' : 'Orders'
                ]}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Restaurants */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Top Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          {topRestaurants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No restaurant data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topRestaurants}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
