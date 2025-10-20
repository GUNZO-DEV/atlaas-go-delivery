import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Package, Clock, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  created_at: string;
  restaurant: {
    name: string;
    image_url: string;
  };
  order_items: {
    quantity: number;
    price: number;
    menu_item: {
      name: string;
    };
  }[];
}

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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
    setUser(user);
  };

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurant:restaurants(name, image_url),
          order_items(
            quantity,
            price,
            menu_item:menu_items(name)
          )
        `)
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel("customer-orders")
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <Package className="h-4 w-4" />;
      case "preparing":
        return <Package className="h-4 w-4" />;
      case "ready":
        return <Package className="h-4 w-4" />;
      case "picked_up":
        return <MapPin className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "confirmed":
      case "preparing":
        return "bg-blue-500";
      case "ready":
      case "picked_up":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const filterOrders = (status?: string) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
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
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No orders yet</p>
                  <Button className="mt-4" onClick={() => navigate("/")}>
                    Browse Restaurants
                  </Button>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{order.restaurant?.name}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()} at{" "}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="text-sm">{order.delivery_address}</p>
                      </div>
                      <div className="space-y-1">
                        {order.order_items?.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.menu_item?.name} - {item.price} MAD
                          </p>
                        ))}
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{order.total_amount + order.delivery_fee} MAD</span>
                        </div>
                      </div>
                      {order.status === "picked_up" && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          Track Delivery
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filterOrders("pending").concat(filterOrders("confirmed"), filterOrders("preparing"), filterOrders("ready"), filterOrders("picked_up")).map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{order.restaurant?.name}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()} at{" "}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="text-sm">{order.delivery_address}</p>
                      </div>
                      <div className="space-y-1">
                        {order.order_items?.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.menu_item?.name} - {item.price} MAD
                          </p>
                        ))}
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{order.total_amount + order.delivery_fee} MAD</span>
                        </div>
                      </div>
                      {order.status === "picked_up" && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          Track Delivery
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {filterOrders("delivered").map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{order.restaurant?.name}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()} at{" "}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="text-sm">{order.delivery_address}</p>
                      </div>
                      <div className="space-y-1">
                        {order.order_items?.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.menu_item?.name} - {item.price} MAD
                          </p>
                        ))}
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{order.total_amount + order.delivery_fee} MAD</span>
                        </div>
                      </div>
                      {order.status === "picked_up" && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          Track Delivery
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {filterOrders("cancelled").map((order) => (
              <Card key={order.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{order.restaurant?.name}</CardTitle>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleDateString()} at{" "}
                          {new Date(order.created_at).toLocaleTimeString()}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                        <p className="text-sm">{order.delivery_address}</p>
                      </div>
                      <div className="space-y-1">
                        {order.order_items?.map((item, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            {item.quantity}x {item.menu_item?.name} - {item.price} MAD
                          </p>
                        ))}
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between font-semibold">
                          <span>Total:</span>
                          <span>{order.total_amount + order.delivery_fee} MAD</span>
                        </div>
                      </div>
                      {order.status === "picked_up" && (
                        <Button
                          className="w-full mt-4"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          Track Delivery
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
