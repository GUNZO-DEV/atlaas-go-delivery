import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Navigation, Clock } from "lucide-react";

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

  useEffect(() => {
    fetchTracking();
    setupRealtimeSubscription();
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      const { data, error } = await supabase
        .from("delivery_tracking")
        .select("*")
        .eq("order_id", orderId)
        .single();

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
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Delivery Tracking</CardTitle>
            <CardDescription>Order #{orderId?.slice(0, 8)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
              <Navigation className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">Status: {tracking.status}</p>
                {tracking.estimated_delivery_time && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    ETA: {new Date(tracking.estimated_delivery_time).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {tracking.current_latitude && tracking.current_longitude && (
              <div className="space-y-2">
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Current Location
                </p>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Lat: {tracking.current_latitude}, Lng: {tracking.current_longitude}
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${tracking.current_latitude},${tracking.current_longitude}`,
                      "_blank"
                    )
                  }
                >
                  View on Google Maps
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
