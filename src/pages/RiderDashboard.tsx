import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Navigation, Package, DollarSign } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  created_at: string;
  rider_id: string | null;
  restaurant: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

export default function RiderDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    activeDeliveries: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if user has rider role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "rider")
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have rider access",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurant:restaurants(name, address, latitude, longitude)
        `)
        .or(`rider_id.eq.${user.id},status.eq.ready`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      calculateStats(data || [], user.id);
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

  const calculateStats = (orders: Order[], userId: string) => {
    const today = new Date().toDateString();
    const myOrders = orders.filter((o) => o.rider_id === userId);
    const todayOrders = myOrders.filter(
      (o) => new Date(o.created_at).toDateString() === today
    );

    setStats({
      todayDeliveries: todayOrders.filter((o) => o.status === "delivered").length,
      todayEarnings: todayOrders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.delivery_fee), 0),
      activeDeliveries: myOrders.filter((o) => o.status === "picked_up").length,
    });
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("rider-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
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

  const acceptOrder = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("orders")
        .update({ rider_id: user.id, status: "picked_up" })
        .eq("id", orderId);

      if (error) throw error;

      // Create delivery tracking entry
      await supabase.from("delivery_tracking").insert({
        order_id: orderId,
        rider_id: user.id,
        status: "picked_up",
      });

      toast({
        title: "Success",
        description: "Order accepted!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      const { error: trackingError } = await supabase
        .from("delivery_tracking")
        .update({
          status: "delivered",
          actual_delivery_time: new Date().toISOString(),
        })
        .eq("order_id", orderId);

      if (trackingError) throw trackingError;

      toast({
        title: "Success",
        description: "Delivery completed!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openNavigation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Rider Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.todayDeliveries}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.todayEarnings.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.activeDeliveries}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {orders
              .filter((o) => o.status === "ready" && !o.rider_id)
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>New Delivery</CardTitle>
                        <CardDescription>{order.restaurant?.name}</CardDescription>
                      </div>
                      <Badge className="bg-green-500">{order.delivery_fee} MAD</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Pickup:</p>
                          <p className="text-sm text-muted-foreground">
                            {order.restaurant?.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Delivery:</p>
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_address}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => acceptOrder(order.id)}>
                      Accept Delivery
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {orders
              .filter((o) => o.status === "picked_up")
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Active Delivery</CardTitle>
                        <CardDescription>{order.restaurant?.name}</CardDescription>
                      </div>
                      <Badge className="bg-blue-500">In Progress</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">Deliver to:</p>
                          <p className="text-sm text-muted-foreground">
                            {order.delivery_address}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          openNavigation(order.delivery_latitude, order.delivery_longitude)
                        }
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                      <Button className="flex-1" onClick={() => completeDelivery(order.id)}>
                        Complete Delivery
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {orders
              .filter((o) => o.status === "delivered")
              .map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Completed</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-500">+{order.delivery_fee} MAD</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
