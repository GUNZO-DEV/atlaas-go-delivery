import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Bike, Store, MapPin, MessageCircle, 
  Clock, Package, CheckCircle, Navigation, Phone 
} from "lucide-react";
import OrderChat from "@/components/OrderChat";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import OrderStatusProgress from "@/components/OrderStatusProgress";

interface DemoOrder {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  created_at: string;
  customer_id: string;
  rider_id: string | null;
  restaurant_id: string;
  delivery_address: string;
  delivery_latitude: number;
  delivery_longitude: number;
  restaurant?: {
    name: string;
    latitude: number;
    longitude: number;
  };
}

interface TrackingData {
  order_id: string;
  rider_id: string;
  current_latitude: number;
  current_longitude: number;
  status: string;
  updated_at: string;
}

export default function RealtimeDemo() {
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeOrder, setActiveOrder] = useState<DemoOrder | null>(null);
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [messages, setMessages] = useState<number>(0);

  useEffect(() => {
    checkAuth();
    fetchLatestOrder();
  }, []);

  useEffect(() => {
    if (activeOrder) {
      setupOrderSubscription();
      setupTrackingSubscription();
      setupChatSubscription();
    }
  }, [activeOrder]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const fetchLatestOrder = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("orders")
      .select(`
        *,
        restaurant:restaurants(name, latitude, longitude)
      `)
      .or(`customer_id.eq.${user.id},rider_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setActiveOrder(data as DemoOrder);
      fetchTracking(data.id);
    }
  };

  const fetchTracking = async (orderId: string) => {
    const { data } = await supabase
      .from("delivery_tracking")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    setTracking(data);
  };

  const setupOrderSubscription = () => {
    if (!activeOrder) return;

    console.log('[Demo] Setting up order subscription for:', activeOrder.id);

    const channel = supabase
      .channel(`demo-order-${activeOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${activeOrder.id}`,
        },
        (payload) => {
          console.log('[Demo] Order status updated:', payload);
          setActiveOrder(prev => prev ? { ...prev, ...payload.new } : null);
          toast({
            title: "🔔 Order Status Changed",
            description: `Status: ${payload.new.status}`,
          });
        }
      )
      .subscribe((status) => {
        console.log('[Demo] Order subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupTrackingSubscription = () => {
    if (!activeOrder) return;

    console.log('[Demo] Setting up tracking subscription for:', activeOrder.id);

    const channel = supabase
      .channel(`demo-tracking-${activeOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_tracking",
          filter: `order_id=eq.${activeOrder.id}`,
        },
        (payload) => {
          console.log('[Demo] Location updated:', payload);
          setTracking(payload.new as TrackingData);
          toast({
            title: "📍 Location Updated",
            description: "Rider position refreshed",
          });
        }
      )
      .subscribe((status) => {
        console.log('[Demo] Tracking subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const setupChatSubscription = () => {
    if (!activeOrder) return;

    console.log('[Demo] Setting up chat subscription for:', activeOrder.id);

    const channel = supabase
      .channel(`demo-chat-${activeOrder.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `order_id=eq.${activeOrder.id}`,
        },
        (payload) => {
          console.log('[Demo] New message:', payload);
          setMessages(prev => prev + 1);
          toast({
            title: "💬 New Message",
            description: `${payload.new.sender_type}: ${payload.new.message.substring(0, 30)}...`,
          });
        }
      )
      .subscribe((status) => {
        console.log('[Demo] Chat subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateOrderStatus = async (newStatus: "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "picking_it_up" | "picked_up" | "delivered" | "cancelled") => {
    if (!activeOrder) return;

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", activeOrder.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const simulateLocationUpdate = async () => {
    if (!tracking || !activeOrder) {
      toast({
        title: "No tracking data",
        description: "Order must have a rider assigned",
        variant: "destructive",
      });
      return;
    }

    // Move slightly (simulate rider movement)
    const newLat = tracking.current_latitude + (Math.random() - 0.5) * 0.001;
    const newLng = tracking.current_longitude + (Math.random() - 0.5) * 0.001;

    const { error } = await supabase
      .from("delivery_tracking")
      .update({
        current_latitude: newLat,
        current_longitude: newLng,
        updated_at: new Date().toISOString(),
      })
      .eq("order_id", activeOrder.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getUserRole = () => {
    if (!currentUser || !activeOrder) return null;
    if (currentUser.id === activeOrder.customer_id) return 'customer';
    if (currentUser.id === activeOrder.rider_id) return 'rider';
    return 'merchant';
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground">Please sign in to view realtime demo</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground">No active orders found</p>
            <Button className="mt-4" onClick={() => window.location.href = "/restaurants"}>
              Create Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userRole = getUserRole();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Real-Time Order System Demo</h1>
              <p className="text-sm text-muted-foreground">
                Watching Order #{activeOrder.id.slice(0, 8)} • You are: {userRole}
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {messages} messages
            </Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Order Status & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status Flow</CardTitle>
                <CardDescription>Watch status update in real-time across all dashboards</CardDescription>
              </CardHeader>
              <CardContent>
                <OrderStatusProgress currentStatus={activeOrder.status} />
              </CardContent>
            </Card>

            {/* Live Map */}
            {tracking && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5 text-primary" />
                    Live Tracking Map
                  </CardTitle>
                  <CardDescription>
                    Location updates every 5 seconds automatically
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] rounded-lg overflow-hidden">
                    <LiveTrackingMap
                      restaurantLat={activeOrder.restaurant?.latitude}
                      restaurantLng={activeOrder.restaurant?.longitude}
                      riderLat={tracking.current_latitude}
                      riderLng={tracking.current_longitude}
                      customerLat={activeOrder.delivery_latitude}
                      customerLng={activeOrder.delivery_longitude}
                      deliveryAddress={activeOrder.delivery_address}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={simulateLocationUpdate}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Simulate Location Update
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Chat */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  Live Chat
                </CardTitle>
                <CardDescription>
                  Messages sync instantly between customer, rider, and merchant
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userRole && <OrderChat orderId={activeOrder.id} userType={userRole} />}
              </CardContent>
            </Card>
          </div>

          {/* Right: Controls & Info */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">ID: {activeOrder.customer_id.slice(0, 8)}</p>
                  </div>
                </div>
                {activeOrder.rider_id && (
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Rider</p>
                      <p className="text-sm text-muted-foreground">ID: {activeOrder.rider_id.slice(0, 8)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{activeOrder.restaurant?.name}</p>
                    <p className="text-sm text-muted-foreground">Restaurant</p>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-sm">Total:</span>
                    <span className="font-bold">{activeOrder.total_amount} MAD</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Status Controls</CardTitle>
                <CardDescription>Simulate order progression</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("pending")}
                  disabled={activeOrder.status === "pending"}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("confirmed")}
                  disabled={activeOrder.status === "confirmed"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmed
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("preparing")}
                  disabled={activeOrder.status === "preparing"}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Preparing
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("ready_for_pickup")}
                  disabled={activeOrder.status === "ready_for_pickup"}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Ready for Pickup
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("picking_it_up")}
                  disabled={activeOrder.status === "picking_it_up"}
                >
                  <Bike className="h-4 w-4 mr-2" />
                  Rider on the way
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("picked_up")}
                  disabled={activeOrder.status === "picked_up"}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Picked Up (En Route)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => updateOrderStatus("delivered")}
                  disabled={activeOrder.status === "delivered"}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Delivered
                </Button>
              </CardContent>
            </Card>

            {/* Real-time Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>Live Connections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">Order Status</span>
                  </div>
                  <Badge variant="secondary">{activeOrder.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">Location</span>
                  </div>
                  <Badge variant="secondary">
                    {tracking ? "Active" : "No rider"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">Chat</span>
                  </div>
                  <Badge variant="secondary">{messages} msgs</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card className="bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm">How it Works</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>✓ Status changes sync across all dashboards instantly</p>
                <p>✓ Rider location updates every 5 seconds automatically</p>
                <p>✓ Chat messages appear in real-time for all parties</p>
                <p>✓ Open multiple browser windows to test</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
