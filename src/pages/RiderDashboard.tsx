import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Navigation, Package, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle, Settings, MessageCircle, GraduationCap, Phone, Building } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import OrderChat from "@/components/OrderChat";
import SupportTicketDialog from "@/components/SupportTicketDialog";
import RiderApplicationForm from "@/components/RiderApplicationForm";
import RiderNavigationMap from "@/components/RiderNavigationMap";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";
import RiderPerformanceBadges from "@/components/RiderPerformanceBadges";
import WeatherPrayerWidget from "@/components/WeatherPrayerWidget";
import EmergencySOSButton from "@/components/EmergencySOSButton";
import { useRiderLocationTracking } from "@/hooks/useRiderLocationTracking";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  created_at: string;
  rider_id: string | null;
  restaurant: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
}

interface AuierOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  room_number: string;
  building_name: string;
  restaurant_name: string;
  order_details: string;
  delivery_type: string;
  delivery_fee: number;
  status: string;
  rider_id: string | null;
  created_at: string;
}

export default function RiderDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [riderProfile, setRiderProfile] = useState<any>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auierOrders, setAuierOrders] = useState<AuierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    activeDeliveries: 0,
    allTimeDeliveries: 0,
    totalEarnings: 0,
  });
  const [isAvailable, setIsAvailable] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [tab, setTab] = useState<'available' | 'active' | 'completed' | 'auier'>('available');
  const hasRequestedLocationRef = useRef(false);
  
  // Get active order ID for location tracking
  const activeOrder = orders.find(o => 
    (o.status === 'picking_it_up' || o.status === 'picked_up') && o.rider_id
  );
  
  // Track rider location when on active delivery
  useRiderLocationTracking(
    activeOrder?.id || null,
    locationPermission === 'granted' && !!activeOrder
  );

  useEffect(() => {
    checkAuth();
    checkRiderProfile();
    fetchOrders();
    fetchAuierOrders();
    fetchTotalEarnings();
    setupRealtimeSubscription();
    setupAuierRealtimeSubscription();
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    if ('geolocation' in navigator && 'permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        result.addEventListener('change', () => {
          setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
        });
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    }
  };

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationPermission('granted');
          toast({
            title: "Location Access Granted",
            description: "You can now receive delivery requests",
          });
        },
        (error) => {
          setLocationPermission('denied');
          toast({
            title: "Location Access Denied",
            description: "Please enable location access in your browser settings",
            variant: "destructive",
          });
        }
      );
    }
  };

  // Auto-request geolocation on first visit when in prompt state
  useEffect(() => {
    if (locationPermission === 'prompt' && !hasRequestedLocationRef.current) {
      hasRequestedLocationRef.current = true;
      requestLocationPermission();
    }
  }, [locationPermission]);

  const toggleAvailability = async () => {
    // Block if location permission is not granted
    if (locationPermission !== 'granted') {
      await requestLocationPermission();
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newAvailability = !isAvailable;
      
      const { error } = await supabase
        .from('rider_profiles')
        .update({ is_available: newAvailability })
        .eq('rider_id', user.id);

      if (error) throw error;

      setIsAvailable(newAvailability);
      toast({
        title: newAvailability ? "You're Now Online" : "You're Now Offline",
        description: newAvailability 
          ? "You will receive new delivery requests" 
          : "You won't receive new delivery requests",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
      .maybeSingle();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have rider access",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const checkRiderProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("rider_profiles")
        .select("*")
        .eq("rider_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setRiderProfile(data);
        setProfileStatus(data.status);
        setIsAvailable(data.is_available || false);
      } else {
        setProfileStatus("none");
      }
    } catch (error: any) {
      console.error("Error checking rider profile:", error);
    } finally {
      setLoading(false);
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
        .or(`rider_id.eq.${user.id},status.eq.ready_for_pickup`)
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

  const fetchTotalEarnings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("rider_earnings")
        .select("total_earned")
        .eq("rider_id", user.id);

      if (error) throw error;

      const total = data?.reduce((sum, earning) => sum + Number(earning.total_earned), 0) || 0;
      
      setStats(prev => ({
        ...prev,
        totalEarnings: total,
      }));
    } catch (error: any) {
      console.error("Error fetching total earnings:", error);
    }
  };

  const calculateStats = (orders: Order[], userId: string) => {
    const today = new Date().toDateString();
    const myOrders = orders.filter((o) => o.rider_id === userId);
    const todayOrders = myOrders.filter(
      (o) => new Date(o.created_at).toDateString() === today
    );

    const deliveredCount = myOrders.filter((o) => o.status === "delivered").length;

    setStats(prev => ({
      ...prev,
      todayDeliveries: todayOrders.filter((o) => o.status === "delivered").length,
      todayEarnings: todayOrders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.delivery_fee), 0),
      activeDeliveries: myOrders.filter((o) => o.status === "picked_up").length,
      allTimeDeliveries: deliveredCount,
    }));
  };

  const setupRealtimeSubscription = () => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.id;
    };
    
    getUserId().then(userId => {
      if (!userId) return;
      
      const channel = supabase
        .channel("rider-orders")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: `rider_id=eq.${userId}`,
          },
          (payload) => {
            console.log('[Rider] Order updated:', payload);
            fetchOrders();
            
            if (payload.eventType === 'UPDATE') {
              toast({
                title: "Order Updated",
                description: `Order status changed to ${payload.new.status}`,
              });
            }
          }
        )
        .subscribe((status) => {
          console.log('[Rider] Subscription status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    });
  };

  const fetchAuierOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("auier_orders")
        .select("*")
        .or(`rider_id.eq.${user.id},status.eq.pending`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAuierOrders((data as AuierOrder[]) || []);
    } catch (error: any) {
      console.error("Error fetching AUIER orders:", error);
    }
  };

  const setupAuierRealtimeSubscription = () => {
    const channel = supabase
      .channel("auier-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "auier_orders",
        },
        (payload) => {
          console.log('[Rider] AUIER Order updated:', payload);
          fetchAuierOrders();
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New AUIER Order!",
              description: "A new campus delivery is available",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const acceptAuierOrder = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("auier_orders")
        .update({ rider_id: user.id, status: "accepted" })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AUIER order accepted! Contact the customer.",
      });
      fetchAuierOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeAuierOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("auier_orders")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AUIER delivery completed!",
      });
      fetchAuierOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update order status and assign rider
      const { error: orderError } = await supabase
        .from("orders")
        .update({ rider_id: user.id, status: "picking_it_up" })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Get current location for tracking
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Create or update delivery tracking entry with location
            const { error: trackingError } = await supabase.from("delivery_tracking").upsert([{
              order_id: orderId,
              rider_id: user.id,
              status: "in_transit" as const,
              current_latitude: position.coords.latitude,
              current_longitude: position.coords.longitude,
              estimated_delivery_time: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min from now
            }]);

            if (trackingError) {
              console.error("Tracking error:", trackingError);
            }
          },
          (error) => {
            console.error("Location error:", error);
            // Create tracking entry without location
            supabase.from("delivery_tracking").upsert([{
              order_id: orderId,
              rider_id: user.id,
              status: "in_transit" as const,
              estimated_delivery_time: new Date(Date.now() + 30 * 60000).toISOString(),
            }]);
          }
        );
      } else {
        // No geolocation - create tracking without location
        const { error: trackingError } = await supabase.from("delivery_tracking").upsert([{
          order_id: orderId,
          rider_id: user.id,
          status: "in_transit" as const,
          estimated_delivery_time: new Date(Date.now() + 30 * 60000).toISOString(),
        }]);

        if (trackingError) {
          console.error("Tracking error:", trackingError);
        }
      }

      toast({
        title: "Success",
        description: "Order accepted! Head to the restaurant.",
      });
      setTab('active');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const markPickedUp = async (orderId: string) => {
    try {
      // Get current location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // Update order status
            const { error: orderError } = await supabase
              .from("orders")
              .update({ status: "picked_up" })
              .eq("id", orderId);

            if (orderError) throw orderError;

            // Update tracking with current location
            const { error: trackingError } = await supabase
              .from("delivery_tracking")
              .update({ 
                status: "picked_up",
                current_latitude: position.coords.latitude,
                current_longitude: position.coords.longitude,
              })
              .eq("order_id", orderId);

            if (trackingError) {
              console.error("Tracking update error:", trackingError);
            }

            toast({
              title: "Success",
              description: "Order picked up! Now deliver it to the customer.",
            });
          },
          async (error) => {
            console.error("Location error:", error);
            // Update without location
            const { error: orderError } = await supabase
              .from("orders")
              .update({ status: "picked_up" })
              .eq("id", orderId);

            if (orderError) throw orderError;

            await supabase
              .from("delivery_tracking")
              .update({ status: "picked_up" })
              .eq("order_id", orderId);

            toast({
              title: "Success",
              description: "Order picked up! Now deliver it to the customer.",
            });
          }
        );
      }
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

      // Refresh total earnings after completion
      fetchTotalEarnings();

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

  const openNavigation = (lat: number | null, lng: number | null, address?: string) => {
    if ((!lat || !lng)) {
      if (address) {
        const encoded = encodeURIComponent(address);
        const searchUrl = `https://www.openstreetmap.org/search?query=${encoded}`;
        window.open(searchUrl, "_blank");
        toast({
          title: "Opening Map",
          description: "Using the delivery address since GPS coordinates are missing.",
        });
        return;
      }
      toast({
        title: "Navigation Unavailable",
        description: "No coordinates or address available.",
        variant: "destructive",
      });
      return;
    }
    
    // Use geo: protocol which opens native maps on mobile, OpenStreetMap on desktop
    const geoUrl = `geo:${lat},${lng}`;
    const fallbackUrl = `https://www.openstreetmap.org/directions?to=${lat},${lng}`;
    
    // Try geo: protocol first (works on mobile)
    window.location.href = geoUrl;
    
    // Fallback to OpenStreetMap after a short delay if geo: doesn't work
    setTimeout(() => {
      window.open(fallbackUrl, "_blank");
    }, 1000);
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

  // Show application form if no profile exists
  if (profileStatus === "none") {
    return (
      <div className="min-h-screen bg-background p-8">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Rider Registration</h1>
            <p className="text-muted-foreground mt-2">Complete your application to start delivering orders</p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </header>
        <RiderApplicationForm onSuccess={() => {
          checkRiderProfile();
          toast({ title: "Success!", description: "Your application is now under review" });
        }} />
      </div>
    );
  }

  // Show pending/rejected status
  if (profileStatus === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Clock className="h-8 w-8 text-yellow-500" />
              <CardTitle className="text-2xl">Application Under Review</CardTitle>
            </div>
            <CardDescription>Your rider application is being reviewed by our team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Our team is reviewing your application</li>
                <li>• You'll receive a notification within 24-48 hours</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignOut} className="flex-1">Sign Out</Button>
              <SupportTicketDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileStatus === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="h-8 w-8 text-destructive" />
              <CardTitle className="text-2xl">Application Rejected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {riderProfile?.rejection_reason && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Reason:</h3>
                <p className="text-sm">{riderProfile.rejection_reason}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSignOut} className="flex-1">Sign Out</Button>
              <SupportTicketDialog />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Rider Dashboard</h1>
            <div className="flex items-center gap-2">
              <EmergencySOSButton />
              <Button variant="outline" size="sm" onClick={() => navigate("/rider/earnings")}>
                <DollarSign className="h-4 w-4 mr-2" />
                Earnings
              </Button>
              <SupportTicketDialog />
              <NotificationBell />
              <Button variant="outline" size="icon" onClick={() => navigate("/rider/settings")}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
          
          {/* Availability Toggle */}
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                  <div>
                    <p className="font-semibold">
                      {isAvailable ? "You're Online" : "You're Offline"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {locationPermission === 'granted' 
                        ? isAvailable ? "Accepting delivery requests" : "Not accepting delivery requests"
                        : "Location access required"}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={toggleAvailability}
                  variant={isAvailable ? "destructive" : "default"}
                  className="min-w-[120px]"
                >
                  {isAvailable ? "Go Offline" : "Go Online"}
                </Button>
              </div>
              {locationPermission !== 'granted' && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    📍 Enable location access to start receiving orders
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {locationPermission !== 'granted' ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Navigation className="h-6 w-6" />
                Location Access Required
              </CardTitle>
              <CardDescription>
                You must enable location access to use the rider app
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Why do we need your location?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Track your position during deliveries</li>
                  <li>• Show you available orders nearby</li>
                  <li>• Provide accurate navigation to pickup and delivery locations</li>
                  <li>• Keep customers informed of delivery progress</li>
                </ul>
              </div>
              <Button 
                onClick={requestLocationPermission}
                className="w-full"
                size="lg"
              >
                <Navigation className="h-5 w-5 mr-2" />
                Enable Location Access
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Weather & Prayer Times Widget */}
            <div className="mb-6">
              <WeatherPrayerWidget />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">{stats.totalEarnings.toFixed(2)} MAD</span>
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
                    All-time Deliveries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-2xl font-bold">{stats.allTimeDeliveries}</span>
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

            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="auier" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              AUIER
              {auierOrders.filter(o => o.status === 'pending' && !o.rider_id).length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {auierOrders.filter(o => o.status === 'pending' && !o.rider_id).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            {orders
              .filter((o) => o.status === "ready_for_pickup" && !o.rider_id)
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

          <TabsContent value="auier" className="space-y-4">
            {/* Pending AUIER Orders */}
            {auierOrders.filter(o => o.status === 'pending' && !o.rider_id).length === 0 && 
             auierOrders.filter(o => o.status === 'accepted' && o.rider_id).length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No AUIER campus orders available right now</p>
                </CardContent>
              </Card>
            )}
            
            {auierOrders
              .filter((o) => o.status === "pending" && !o.rider_id)
              .map((order) => (
                <Card key={order.id} className="border-primary/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <div>
                          <CardTitle className="text-lg">AUIER Campus Order</CardTitle>
                          <CardDescription>{order.restaurant_name}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-primary">{order.delivery_fee} DH</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Order Details:</p>
                      <p className="text-sm text-muted-foreground">{order.order_details}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Building {order.building_name}, Room {order.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${order.customer_phone}`} className="text-sm text-primary hover:underline">
                          {order.customer_phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Customer: </span>
                      <span className="text-muted-foreground">{order.customer_name}</span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      {order.delivery_type === 'restaurant_to_dorm' ? 'Restaurant → Dorm' : 'Main Gate → Dorm'}
                    </div>
                    
                    <Button className="w-full" onClick={() => acceptAuierOrder(order.id)}>
                      Accept AUIER Order
                    </Button>
                  </CardContent>
                </Card>
              ))}
            
            {/* My Active AUIER Orders */}
            {auierOrders
              .filter((o) => o.status === "accepted")
              .map((order) => (
                <Card key={order.id} className="border-blue-500/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-500" />
                        <div>
                          <CardTitle className="text-lg">Active AUIER Delivery</CardTitle>
                          <CardDescription>{order.restaurant_name}</CardDescription>
                        </div>
                      </div>
                      <Badge className="bg-blue-500">In Progress</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Order Details:</p>
                      <p className="text-sm text-muted-foreground">{order.order_details}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Building {order.building_name}, Room {order.room_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${order.customer_phone}`} className="text-sm text-primary hover:underline">
                          {order.customer_phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Customer: </span>
                      <span className="text-muted-foreground">{order.customer_name}</span>
                    </div>
                    
                    <Button className="w-full" onClick={() => completeAuierOrder(order.id)}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Complete Delivery
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {/* Fixed Chat for Active Order */}
            {orders.filter((o) => o.status === "picking_it_up" || o.status === "picked_up").length > 0 && (
              <OrderChat 
                orderId={orders.filter((o) => o.status === "picking_it_up" || o.status === "picked_up")[0].id} 
                userType="rider" 
                floating 
              />
            )}
            
            {orders
              .filter((o) => o.status === "picking_it_up" || o.status === "picked_up")
              .map((order) => (
                <Card key={order.id} className="animate-fade-in">
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
                    <OrderStatusTimeline currentStatus={order.status} />
                    
                    <div className="relative min-h-[400px]">
                      <RiderNavigationMap
                        restaurantLat={order.restaurant?.latitude}
                        restaurantLng={order.restaurant?.longitude}
                        restaurantName={order.restaurant?.name}
                        restaurantAddress={order.restaurant?.address}
                        deliveryLat={order.delivery_latitude}
                        deliveryLng={order.delivery_longitude}
                        deliveryAddress={order.delivery_address}
                      />
                    </div>
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
                      {order.status === "picking_it_up" ? (
                        <Button 
                          className="flex-1 animate-scale-in" 
                          onClick={() => markPickedUp(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Picked Up
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 animate-scale-in" 
                          onClick={() => completeDelivery(order.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Delivery
                        </Button>
                      )}
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

        {/* Performance Badges Section */}
        <div className="mt-8">
          <RiderPerformanceBadges />
        </div>
          </>
        )}
      </main>
    </div>
  );
}
