import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, DollarSign, TrendingUp } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  commission_amount: number;
  created_at: string;
  customer_id: string;
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchOrders();
      setupRealtimeSubscription();
    }
  }, [restaurant]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has merchant role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "merchant")
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have merchant access",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchRestaurant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("merchant_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setRestaurant(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!restaurant) return;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      calculateStats(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateStats = (orders: Order[]) => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.created_at).toDateString() === today
    );

    setStats({
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      totalRevenue: orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total_amount) - Number(o.commission_amount || 0), 0),
    });
  };

  const setupRealtimeSubscription = () => {
    if (!restaurant) return;

    const channel = supabase
      .channel("merchant-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "picked_up" | "delivering" | "delivered" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Restaurant Found</CardTitle>
            <CardDescription>
              You need to set up your restaurant first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                {restaurant.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.todayOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.todayRevenue.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.pendingOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          {["pending", "confirmed", "preparing", "ready", "completed"].map((status) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {orders
                .filter((o) => (status === "completed" ? o.status === "delivered" : o.status === status))
                .map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                          <CardDescription>
                            {new Date(order.created_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span className="font-semibold">{order.total_amount} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Commission:</span>
                          <span>-{order.commission_amount || 0} MAD</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Your Earnings:</span>
                          <span>
                            {(Number(order.total_amount) - Number(order.commission_amount || 0)).toFixed(2)} MAD
                          </span>
                        </div>

                        <div className="flex gap-2 pt-4">
                          {order.status === "pending" && (
                            <>
                              <Button
                                className="flex-1"
                                onClick={() => updateOrderStatus(order.id, "confirmed")}
                              >
                                Accept Order
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {order.status === "confirmed" && (
                            <Button
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                            >
                              Start Preparing
                            </Button>
                          )}
                          {order.status === "preparing" && (
                            <Button
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "ready_for_pickup")}
                            >
                              Mark as Ready
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
