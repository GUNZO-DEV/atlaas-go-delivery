import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Navigation, Clock, Phone, ArrowLeft, Bike } from "lucide-react";
import OrderChat from "@/components/OrderChat";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import OrderStatusProgress from "@/components/OrderStatusProgress";

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
  const [rider, setRider] = useState<any>(null);

  useEffect(() => {
    fetchOrder();
    fetchTracking();
    setupRealtimeSubscriptions();
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
      
      // Fetch rider details if order has a rider
      if (data.rider_id) {
        const { data: riderData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.rider_id)
          .single();
        
        setRider(riderData);
      }
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

  const setupRealtimeSubscriptions = () => {
    // Subscribe to delivery tracking updates
    const trackingChannel = supabase
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
          toast({
            title: "Location Updated",
            description: "Rider location has been updated",
          });
        }
      )
      .subscribe();

    // Subscribe to order status updates
    const orderChannel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        () => {
          fetchOrder();
          toast({
            title: "Order Status Updated",
            description: "Your order status has changed",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trackingChannel);
      supabase.removeChannel(orderChannel);
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Preparing Your Order
            </CardTitle>
            <CardDescription>
              {order?.status === "pending" && "Your order is being confirmed by the restaurant"}
              {order?.status === "confirmed" && "Restaurant is preparing your delicious food"}
              {order?.status === "preparing" && "Your order is being prepared with care"}
              {order?.status === "ready_for_pickup" && "Your order is ready! Waiting for a rider..."}
              {order?.status === "picking_it_up" && "Rider is on the way to pick up your order"}
              {!order && "Loading order details..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-primary/5 rounded-lg border border-primary/10 text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Live tracking will be available once a rider accepts your order and starts heading your way!
              </p>
              {order && (
                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Status:</span>
                    <span className="font-medium capitalize">{order.status.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Restaurant:</span>
                    <span className="font-medium">{order.restaurant?.name}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate("/customer")} variant="outline" className="flex-1">
                Back to Orders
              </Button>
              <Button onClick={() => window.location.reload()} className="flex-1">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 glass-nav">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/customer")} className="rounded-full">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Orders
          </Button>
          <div className="text-xs text-muted-foreground">
            #{orderId?.slice(0, 8)}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-6 md:mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            LIVE TRACKING
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-bold mb-2">
            Your order is on its way
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Real-time updates every step from kitchen to your dorm.
          </p>
        </div>

        {/* Status Timeline */}
        {order && (
          <Card className="mb-6 border-border/60">
            <CardContent className="pt-6">
              <OrderStatusProgress currentStatus={order.status} />
            </CardContent>
          </Card>
        )}

        {/* Live ETA + Distance strip */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
          <Card className="border-border/60 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <CardContent className="p-4 md:p-5 relative">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Estimated arrival
              </p>
              <p className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {tracking.estimated_delivery_time
                  ? `${Math.max(1, Math.ceil((new Date(tracking.estimated_delivery_time).getTime() - Date.now()) / 60000))} min`
                  : "12 min"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/60 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <CardContent className="p-4 md:p-5 relative">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Navigation className="h-3 w-3" /> Distance
              </p>
              <p className="font-display text-2xl md:text-3xl font-bold text-foreground">2.4 km</p>
            </CardContent>
          </Card>
        </div>

        {/* Map + Rider */}
        <div className="grid lg:grid-cols-3 gap-5 mb-6">
          <Card className="lg:col-span-2 border-border/60 overflow-hidden">
            <div className="h-[420px] md:h-[500px]">
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
            {tracking.current_latitude && tracking.current_longitude && (
              <CardContent className="p-3">
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
                  <Navigation className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </Button>
              </CardContent>
            )}
          </Card>

          <div className="space-y-4">
            {rider ? (
              <Card className="border-border/60 overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary to-primary-glow" />
                <CardHeader>
                  <CardTitle className="font-display text-lg">Your rider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-xl font-bold font-display">
                      {rider.full_name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{rider.full_name || "Rider"}</p>
                      <p className="text-xs text-muted-foreground">Verified Atlaasgo rider</p>
                    </div>
                  </div>
                  {rider.phone && (
                    <Button className="w-full" asChild>
                      <a href={`tel:${rider.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call rider
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed border-border/60">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
                    <Bike className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">Finding a rider…</p>
                  <p className="text-xs text-muted-foreground mt-1">We'll show their details here as soon as one accepts.</p>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="font-display text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Drop-off
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm break-words">{order?.delivery_address || "—"}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chat */}
        {order && (
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="font-display">Order chat</CardTitle>
              <CardDescription>Talk to your rider in real time</CardDescription>
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
