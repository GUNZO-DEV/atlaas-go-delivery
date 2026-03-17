import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Search, Filter, Printer, Eye, Check, X, Clock,
  UtensilsCrossed, Package, Truck, WifiOff, Bike
} from "lucide-react";
import { format } from "date-fns";
import LynNewOrderDialog from "./LynNewOrderDialog";
import LynOrderDetailsDialog from "./LynOrderDetailsDialog";
import LynReceiptGenerator from "./LynReceiptGenerator";

interface LynOrdersManagementProps {
  restaurant: any;
}

// Unified order type for display
interface UnifiedOrder {
  id: string;
  source: "lyn" | "platform";
  status: string;
  order_type: string;
  customer_name: string | null;
  customer_phone: string | null;
  receipt_number: string | null;
  total: number;
  created_at: string;
  table_number: string | null;
  delivery_address?: string;
  items?: any;
  notes?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  // Keep raw data for dialogs
  _raw: any;
}

const LynOrdersManagement = ({ restaurant }: LynOrdersManagementProps) => {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [receiptOrder, setReceiptOrder] = useState<any>(null);
  const { toast } = useToast();
  const { isOnline, cacheData, getCachedData, queueAction } = useOfflineSync();

  const cacheKey = `lyn_orders_${restaurant.id}`;

  useEffect(() => {
    loadOrders();
    setupRealtimeSubscription();
  }, [restaurant.id]);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`merchant-orders-${restaurant.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurant.id}` },
        () => loadOrders()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lyn_restaurant_orders", filter: `restaurant_id=eq.${restaurant.id}` },
        () => loadOrders()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadOrders = async () => {
    setLoading(true);
    
    const cached = getCachedData<UnifiedOrder[]>(cacheKey);
    
    if (!navigator.onLine) {
      if (cached) {
        setOrders(cached);
        setFromCache(true);
      } else {
        setOrders([]);
        toast({ title: "Offline Mode", description: "No cached orders available." });
      }
      setLoading(false);
      return;
    }

    if (cached) {
      setOrders(cached);
      setFromCache(true);
    }

    try {
      // Fetch both LYN internal orders and platform delivery orders in parallel
      const [lynResult, platformResult] = await Promise.all([
        supabase
          .from("lyn_restaurant_orders")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("orders")
          .select("*, profiles:customer_id(full_name, phone)")
          .eq("restaurant_id", restaurant.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (lynResult.error) throw lynResult.error;

      const lynOrders: UnifiedOrder[] = (lynResult.data || []).map((o: any) => ({
        id: o.id,
        source: "lyn" as const,
        status: o.status || "pending",
        order_type: o.order_type || "dine_in",
        customer_name: o.customer_name,
        customer_phone: o.customer_phone,
        receipt_number: o.receipt_number,
        total: Number(o.total),
        created_at: o.created_at,
        table_number: o.table_number,
        items: o.items,
        notes: o.notes,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        _raw: o,
      }));

      const platformOrders: UnifiedOrder[] = (platformResult.data || []).map((o: any) => ({
        id: o.id,
        source: "platform" as const,
        status: mapPlatformStatus(o.status),
        order_type: "delivery",
        customer_name: o.profiles?.full_name || null,
        customer_phone: o.profiles?.phone || null,
        receipt_number: `PLT-${o.id.substring(0, 8).toUpperCase()}`,
        total: Number(o.total_amount),
        created_at: o.created_at,
        table_number: null,
        delivery_address: o.delivery_address,
        notes: o.order_notes || o.notes,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        _raw: o,
      }));

      const all = [...lynOrders, ...platformOrders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setOrders(all);
      setFromCache(false);
      cacheData(cacheKey, all);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      if (!cached) {
        toast({ title: "Error", description: "Failed to load orders", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  // Map platform order statuses to simplified display statuses
  const mapPlatformStatus = (status: string): string => {
    const map: Record<string, string> = {
      pending: "pending",
      confirmed: "confirmed",
      preparing: "preparing",
      ready_for_pickup: "ready",
      picking_it_up: "rider_assigned",
      picked_up: "picked_up",
      delivering: "delivering",
      delivered: "completed",
      cancelled: "cancelled",
    };
    return map[status] || status;
  };

  // Map back to platform statuses for DB update
  const getPlatformStatus = (displayStatus: string): string => {
    const map: Record<string, string> = {
      confirmed: "confirmed",
      preparing: "preparing",
      ready: "ready_for_pickup",
      completed: "delivered",
      cancelled: "cancelled",
    };
    return map[displayStatus] || displayStatus;
  };

  const updateOrderStatus = async (order: UnifiedOrder, newDisplayStatus: string) => {
    try {
      if (order.source === "platform") {
        const platformStatus = getPlatformStatus(newDisplayStatus);
        const { error } = await supabase
          .from("orders")
          .update({ status: platformStatus as any, updated_at: new Date().toISOString() })
          .eq("id", order.id);
        if (error) throw error;
      } else {
        const updates: any = { 
          status: newDisplayStatus, 
          updated_at: new Date().toISOString(),
        };
        if (newDisplayStatus === "completed") {
          updates.payment_status = "paid";
        }

        if (isOnline) {
          const { error } = await supabase
            .from("lyn_restaurant_orders")
            .update(updates)
            .eq("id", order.id);
          if (error) throw error;
        } else {
          queueAction('update', 'lyn_restaurant_orders', { ...updates, id: order.id });
          setOrders(prev => prev.map(o => 
            o.id === order.id ? { ...o, status: newDisplayStatus } : o
          ));
        }
      }

      toast({
        title: isOnline ? "Status Updated" : "Saved Offline",
        description: isOnline ? `Order marked as ${newDisplayStatus}` : "Changes will sync when back online"
      });

      if (isOnline) loadOrders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType = typeFilter === "all" || 
      (typeFilter === "platform" ? order.source === "platform" : order.order_type === typeFilter);

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeOrders = filteredOrders.filter(o => !["completed", "cancelled"].includes(o.status));
  const completedOrders = filteredOrders.filter(o => o.status === "completed");
  const cancelledOrders = filteredOrders.filter(o => o.status === "cancelled");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      confirmed: "bg-blue-400/20 text-blue-500 border-blue-400/30",
      preparing: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      ready: "bg-green-500/20 text-green-600 border-green-500/30",
      ready_for_pickup: "bg-green-500/20 text-green-600 border-green-500/30",
      rider_assigned: "bg-purple-500/20 text-purple-600 border-purple-500/30",
      picked_up: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      delivering: "bg-indigo-500/20 text-indigo-600 border-indigo-500/30",
      completed: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      cancelled: "bg-red-500/20 text-red-600 border-red-500/30"
    };
    return colors[status] || "bg-gray-500/20 text-gray-600";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready",
      rider_assigned: "Rider Assigned",
      picked_up: "Picked Up",
      delivering: "Delivering",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || status;
  };

  const getTypeIcon = (type: string, source: string) => {
    if (source === "platform") return <Truck className="h-4 w-4" />;
    switch (type) {
      case "dine_in": return <UtensilsCrossed className="h-4 w-4" />;
      case "pickup": return <Package className="h-4 w-4" />;
      case "delivery": return <Truck className="h-4 w-4" />;
      default: return <UtensilsCrossed className="h-4 w-4" />;
    }
  };

  const renderActionButtons = (order: UnifiedOrder) => {
    if (order.source === "platform") {
      // Platform delivery order flow: pending → confirmed → preparing → ready (→ rider picks up)
      return (
        <>
          {order.status === "pending" && (
            <Button size="sm" onClick={() => updateOrderStatus(order, "confirmed")}>
              <Check className="h-3 w-3 mr-1" />
              Confirm
            </Button>
          )}
          {order.status === "confirmed" && (
            <Button size="sm" onClick={() => updateOrderStatus(order, "preparing")}>
              <Clock className="h-3 w-3 mr-1" />
              Start Preparing
            </Button>
          )}
          {order.status === "preparing" && (
            <Button size="sm" onClick={() => updateOrderStatus(order, "ready")}>
              <Check className="h-3 w-3 mr-1" />
              Ready for Pickup
            </Button>
          )}
          {!["completed", "cancelled", "rider_assigned", "picked_up", "delivering"].includes(order.status) && (
            <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order, "cancelled")}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </>
      );
    }

    // LYN internal order flow
    return (
      <>
        {order.status === "pending" && (
          <Button size="sm" onClick={() => updateOrderStatus(order, "preparing")}>
            <Clock className="h-3 w-3 mr-1" />
            Start
          </Button>
        )}
        {order.status === "preparing" && (
          <Button size="sm" onClick={() => updateOrderStatus(order, "ready")}>
            <Check className="h-3 w-3 mr-1" />
            Ready
          </Button>
        )}
        {order.status === "ready" && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => updateOrderStatus(order, "completed")}>
            <Check className="h-3 w-3 mr-1" />
            Complete
          </Button>
        )}
        {!["completed", "cancelled"].includes(order.status) && (
          <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order, "cancelled")}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </>
    );
  };

  const OrderCard = ({ order }: { order: UnifiedOrder }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              order.source === "platform" ? "bg-orange-500/10" : "bg-primary/10"
            }`}>
              {getTypeIcon(order.order_type, order.source)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold">{order.receipt_number}</p>
                {order.source === "platform" && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0 bg-orange-500/10 text-orange-600 border-orange-500/30">
                    <Bike className="h-2.5 w-2.5 mr-0.5" />
                    Delivery
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(order.created_at), "HH:mm")}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(order.status)} variant="outline">
            {getStatusLabel(order.status)}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Customer</span>
            <span>{order.customer_name || "Walk-in"}</span>
          </div>
          {order.order_type === "dine_in" && order.table_number && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Table</span>
              <span>{order.table_number}</span>
            </div>
          )}
          {order.source === "platform" && order.delivery_address && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-right max-w-[200px] truncate">{order.delivery_address}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{order.source === "platform" ? "Platform Delivery" : order.order_type.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Total</span>
            <span className="text-primary">{order.total.toFixed(2)} DH</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {order.source === "lyn" && (
            <>
              <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order._raw)}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReceiptOrder(order._raw)}>
                <Printer className="h-3 w-3 mr-1" />
                Receipt
              </Button>
            </>
          )}
          {order.source === "platform" && (
            <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order._raw)}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Button>
          )}
          {renderActionButtons(order)}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Orders Management</h2>
            <p className="text-muted-foreground">Manage dine-in, delivery, and platform orders</p>
          </div>
          {fromCache && (
            <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
              <WifiOff className="h-3 w-3" />
              Offline
            </Badge>
          )}
        </div>
        <Button onClick={() => setNewOrderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by receipt, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dine_in">Dine-in</SelectItem>
                <SelectItem value="pickup">Pickup</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
                <SelectItem value="platform">Platform Orders</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No active orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No completed orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cancelled">
          {cancelledOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cancelled orders</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cancelledOrders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <LynNewOrderDialog 
        open={newOrderOpen} 
        onOpenChange={setNewOrderOpen}
        restaurant={restaurant}
        onSuccess={loadOrders}
      />
      
      {selectedOrder && (
        <LynOrderDetailsDialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
          onStatusUpdate={(status) => {
            const unified = orders.find(o => o.id === selectedOrder.id);
            if (unified) updateOrderStatus(unified, status);
            setSelectedOrder(null);
          }}
        />
      )}

      {receiptOrder && (
        <LynReceiptGenerator
          open={!!receiptOrder}
          onOpenChange={(open) => !open && setReceiptOrder(null)}
          order={receiptOrder}
          restaurant={restaurant}
        />
      )}
    </div>
  );
};

export default LynOrdersManagement;
