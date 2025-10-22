import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Package, Clock, CheckCircle, Star, RotateCcw, Wallet, CreditCard, Banknote, Smartphone, Settings } from "lucide-react";
import ReviewDialog from "@/components/ReviewDialog";
import NotificationBell from "@/components/NotificationBell";
import OrderChat from "@/components/OrderChat";
import LoyaltyCard from "@/components/LoyaltyCard";
import WalletCard from "@/components/WalletCard";
import SupportTicketDialog from "@/components/SupportTicketDialog";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import { PrimeCard } from "@/components/PrimeCard";

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  created_at: string;
  estimated_delivery_time: number;
  restaurant_id: string;
  rider_id?: string;
  payment_method?: string;
  payment_status?: string;
  restaurant: {
    id: string;
    name: string;
    image_url: string;
    latitude?: number;
    longitude?: number;
  };
  order_items: {
    id: string;
    quantity: number;
    price: number;
    menu_item_id: string;
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
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchOrders();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (activeOrderId) {
      fetchTrackingData(activeOrderId);
      setupTrackingSubscription(activeOrderId);
    }
  }, [activeOrderId]);

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
          restaurant:restaurants(id, name, image_url, latitude, longitude),
          order_items(
            id,
            quantity,
            price,
            menu_item_id,
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
    if (!user) return;
    
    const channel = supabase
      .channel("customer-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Order updated:', payload);
          fetchOrders();
          
          // Show toast for status changes
          if (payload.eventType === 'UPDATE') {
            toast({
              title: "Order Updated",
              description: `Your order status changed to ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchTrackingData = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("delivery_tracking")
        .select(`
          *,
          order:orders(
            delivery_address,
            delivery_latitude,
            delivery_longitude,
            restaurant:restaurants(
              name,
              address,
              latitude,
              longitude
            )
          )
        `)
        .eq("order_id", orderId)
        .maybeSingle();

      if (error) throw error;
      setTrackingData(data || null);
    } catch (error: any) {
      console.error("Error fetching tracking data:", error);
      setTrackingData(null);
    }
  };

  const setupTrackingSubscription = (orderId: string) => {
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
        (payload) => {
          console.log('Tracking updated:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setTrackingData(payload.new);
            toast({
              title: "Location Updated",
              description: "Your delivery location has been updated",
            });
          }
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

  const getPaymentMethodInfo = (method?: string) => {
    switch (method) {
      case "cash":
        return { icon: Banknote, label: "Cash", color: "text-green-600" };
      case "card":
        return { icon: CreditCard, label: "Card", color: "text-blue-600" };
      case "cih_pay":
        return { icon: Smartphone, label: "CIH Pay", color: "text-orange-600" };
      case "wallet":
        return { icon: Wallet, label: "Wallet", color: "text-purple-600" };
      default:
        return { icon: Banknote, label: "Cash", color: "text-green-600" };
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

  const handleReorder = async (order: Order) => {
    if (!order.order_items || order.order_items.length === 0) {
      toast({
        title: "Cannot reorder",
        description: "This order has no items",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Adding to cart",
      description: "Redirecting to restaurant menu...",
    });

    // Navigate to restaurant with order items in state
    navigate(`/restaurant/${order.restaurant_id}`, {
      state: { reorderItems: order.order_items }
    });
  };

  const openReviewDialog = (order: Order) => {
    setSelectedOrder(order);
    setReviewDialogOpen(true);
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
          <div className="flex items-center gap-2">
            <SupportTicketDialog />
            <NotificationBell />
            <Button variant="outline" size="icon" onClick={() => navigate("/customer/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <PrimeCard />
          <LoyaltyCard />
          <WalletCard />
        </div>

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
                  <Button className="mt-4" onClick={() => navigate("/restaurant")}>
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
                      {order.restaurant?.latitude && order.restaurant?.longitude && order.delivery_latitude && order.delivery_longitude && (
                        <div className="mt-2 h-[180px] rounded-lg overflow-hidden border relative">
                          <LiveTrackingMap
                            restaurantLat={order.restaurant.latitude}
                            restaurantLng={order.restaurant.longitude}
                            customerLat={order.delivery_latitude}
                            customerLng={order.delivery_longitude}
                            deliveryAddress={order.delivery_address}
                          />
                          <OrderChat orderId={order.id} userType="customer" floating />
                        </div>
                      )}
                      <div className="pt-4 border-t space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            {(() => {
                              const paymentInfo = getPaymentMethodInfo(order.payment_method);
                              const PaymentIcon = paymentInfo.icon;
                              return (
                                <>
                                  <PaymentIcon className={`h-4 w-4 ${paymentInfo.color}`} />
                                  {paymentInfo.label}
                                  {order.payment_status === "completed" && (
                                    <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-800">
                                      Paid
                                    </Badge>
                                  )}
                                </>
                              );
                            })()}
                          </span>
                          <span className="font-semibold">
                            {order.total_amount + order.delivery_fee} MAD
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {["confirmed", "preparing", "ready", "picked_up"].includes(order.status) && (
                            <Button
                              className="w-full"
                              onClick={() => navigate(`/track/${order.id}`)}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Track Order
                            </Button>
                          )}
                          {order.status === "delivered" && (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openReviewDialog(order);
                                }}
                              >
                                <Star className="h-4 w-4 mr-2" />
                                Write Review
                              </Button>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReorder(order);
                                }}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reorder
                              </Button>
                            </>
                          )}
                          {order.status === "pending" && (
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReorder(order);
                              }}
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reorder
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {/* Live Tracking Map for Active Delivery */}
            {activeOrderId && trackingData && (
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Live Tracking</CardTitle>
                  <CardDescription>Follow your delivery in real-time</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="relative h-[400px]">
                    <LiveTrackingMap
                      restaurantLat={trackingData.order?.restaurant?.latitude}
                      restaurantLng={trackingData.order?.restaurant?.longitude}
                      riderLat={trackingData.current_latitude}
                      riderLng={trackingData.current_longitude}
                      customerLat={trackingData.order?.delivery_latitude}
                      customerLng={trackingData.order?.delivery_longitude}
                      deliveryAddress={trackingData.order?.delivery_address}
                    />
                    <OrderChat orderId={activeOrderId} userType="customer" floating />
                  </div>
                </CardContent>
              </Card>
            )}

            {filterOrders("pending").concat(filterOrders("confirmed"), filterOrders("preparing"), filterOrders("ready"), filterOrders("picked_up")).map((order) => {
              // Set active order for map tracking
              if (order.status === "picked_up" && !activeOrderId) {
                setActiveOrderId(order.id);
              }
              return (
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
                      {order.restaurant?.latitude && order.restaurant?.longitude && order.delivery_latitude && order.delivery_longitude && (
                        <div className="mt-2 h-[180px] rounded-lg overflow-hidden border relative">
                          <LiveTrackingMap
                            restaurantLat={order.restaurant.latitude}
                            restaurantLng={order.restaurant.longitude}
                            customerLat={order.delivery_latitude}
                            customerLng={order.delivery_longitude}
                            deliveryAddress={order.delivery_address}
                          />
                          <OrderChat orderId={order.id} userType="customer" floating />
                        </div>
                      )}
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
              );
            })}
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

      {selectedOrder && (
        <ReviewDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          orderId={selectedOrder.id}
          restaurantId={selectedOrder.restaurant_id}
          riderId={selectedOrder.rider_id}
          onReviewSubmitted={fetchOrders}
        />
      )}
    </div>
  );
}
