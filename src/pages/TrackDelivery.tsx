import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Navigation, Clock } from "lucide-react";
import OrderChat from "@/components/OrderChat";
import LiveTrackingMap from "@/components/LiveTrackingMap";

interface TrackingData {
  status: string;
  current_latitude: number;
  current_longitude: number;
  estimated_delivery_time: string;
}

export default function TrackDelivery() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
    fetchTracking();
    setupRealtimeSubscription();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          restaurant:restaurants(
            id,
            name,
            latitude,
            longitude
          )
        `)
        .eq("id", orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error: any) {
      console.error("Error fetching order:", error);
    }
  };

  const fetchTracking = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_tracking")
        .select("*")
        .eq("order_id", orderId)
        .maybeSingle();

      if (error) throw error;
      setTracking(data);
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
      .channel(`tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "delivery_tracking",
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          fetchTracking();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!tracking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Tracking Not Available</CardTitle>
            <CardDescription>No tracking data found for this order</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/customer")}>Back to Orders</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/customer")}>
            ← Back to Orders
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2">Live Tracking in Real-Time</h1>
          <p className="text-muted-foreground text-lg">
            Watch your order journey from restaurant to your door. Just like magic, but better — it's real.
          </p>
        </div>

        {/* Main Tracking Card */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Map Section */}
          <Card className="lg:col-span-2 animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-primary" />
                Your Order Journey
              </CardTitle>
              <CardDescription>Order #{orderId?.slice(0, 8)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg border border-primary/20">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <Navigation className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold capitalize">Status: {tracking.status}</p>
                  {tracking.estimated_delivery_time && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      ETA: {new Date(tracking.estimated_delivery_time).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Map Container */}
              <div className="relative">
                <div className="h-[500px] rounded-lg overflow-hidden border-2 border-border shadow-lg">
                  <LiveTrackingMap
                    riderLat={tracking.current_latitude || undefined}
                    riderLng={tracking.current_longitude || undefined}
                    restaurantLat={order?.restaurant?.latitude}
                    restaurantLng={order?.restaurant?.longitude}
                    customerLat={order?.delivery_latitude || undefined}
                    customerLng={order?.delivery_longitude || undefined}
                    deliveryAddress={order?.delivery_address}
                  />
                </div>

                {/* Map Legend */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-2xl">🍽️</span>
                    <div>
                      <p className="text-xs font-medium">Restaurant</p>
                      <p className="text-xs text-muted-foreground">Preparing</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20 animate-pulse">
                    <span className="text-2xl">🏍️</span>
                    <div>
                      <p className="text-xs font-medium">Driver</p>
                      <p className="text-xs text-muted-foreground">On the way</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-xs font-medium">You</p>
                      <p className="text-xs text-muted-foreground">Waiting</p>
                    </div>
                  </div>
                </div>

                {/* Time & Distance */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Time</p>
                    <p className="text-2xl font-bold text-primary">
                      {tracking.estimated_delivery_time 
                        ? `${Math.ceil((new Date(tracking.estimated_delivery_time).getTime() - new Date().getTime()) / 60000)} min`
                        : '12 min'}
                    </p>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground mb-1">Distance</p>
                    <p className="text-2xl font-bold text-primary">2.4 km</p>
                  </div>
                </div>
              </div>

              {tracking.current_latitude && tracking.current_longitude && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${tracking.current_latitude},${tracking.current_longitude}`,
                      "_blank"
                    )
                  }
                >
                  Open in Google Maps
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Features Sidebar */}
          <div className="space-y-4">
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Pulsing Location Pins</h3>
                    <p className="text-sm text-muted-foreground">
                      See exactly where your food is with animated markers that pulse with life.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Navigation className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Moving Driver Icon</h3>
                    <p className="text-sm text-muted-foreground">
                      Watch your driver move smoothly across the map in real-time, bringing your order closer.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Live ETA Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Get accurate arrival times that update as your driver navigates Moroccan streets.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Navigation className="h-5 w-5 text-primary rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Order Journey</h3>
                    <p className="text-sm text-muted-foreground">
                      From preparation to pickup to delivery — follow every step of your order's adventure.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat Section */}
        {order && (
          <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle>Order Chat</CardTitle>
              <CardDescription>Communicate with your driver in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <OrderChat orderId={orderId!} userType="customer" />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
