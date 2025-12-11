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
  UtensilsCrossed, Package, Truck, WifiOff
} from "lucide-react";
import { format } from "date-fns";
import LynNewOrderDialog from "./LynNewOrderDialog";
import LynOrderDetailsDialog from "./LynOrderDetailsDialog";
import LynReceiptGenerator from "./LynReceiptGenerator";

interface LynOrdersManagementProps {
  restaurant: any;
}

const LynOrdersManagement = ({ restaurant }: LynOrdersManagementProps) => {
  const [orders, setOrders] = useState<any[]>([]);
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
  }, [restaurant.id]);

  const loadOrders = async () => {
    setLoading(true);
    
    // Always check cache first for immediate display
    const cached = getCachedData<any[]>(cacheKey);
    
    // If offline, use cached data immediately
    if (!navigator.onLine) {
      if (cached) {
        setOrders(cached);
        setFromCache(true);
      } else {
        setOrders([]);
        toast({
          title: "Offline Mode",
          description: "No cached orders available. Orders will load when back online.",
        });
      }
      setLoading(false);
      return;
    }

    // Show cached data while fetching fresh data
    if (cached) {
      setOrders(cached);
      setFromCache(true);
    }

    try {
      const { data, error } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders(data || []);
      setFromCache(false);
      
      // Cache for offline
      cacheData(cacheKey, data);
    } catch (error: any) {
      console.error("Error loading orders:", error);
      
      // Already showing cached data, just notify
      if (!cached) {
        toast({
          title: "Error",
          description: "Failed to load orders",
          variant: "destructive"
        });
      } else {
        setFromCache(true);
        toast({
          title: "Using Cached Data",
          description: "Showing saved orders from last sync.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = { 
        status: newStatus, 
        updated_at: new Date().toISOString(),
        id: orderId
      };
      
      if (newStatus === "completed") {
        updates.payment_status = "paid";
      }

      if (isOnline) {
        const { error } = await supabase
          .from("lyn_restaurant_orders")
          .update(updates)
          .eq("id", orderId);

        if (error) throw error;
      } else {
        // Queue for offline sync
        queueAction('update', 'lyn_restaurant_orders', updates);
        
        // Optimistically update local state
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, ...updates } : order
        ));
      }

      toast({
        title: isOnline ? "Status Updated" : "Saved Offline",
        description: isOnline ? `Order marked as ${newStatus}` : "Changes will sync when back online"
      });

      if (isOnline) loadOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesType = typeFilter === "all" || order.order_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const activeOrders = filteredOrders.filter(o => !["completed", "cancelled"].includes(o.status));
  const completedOrders = filteredOrders.filter(o => o.status === "completed");
  const cancelledOrders = filteredOrders.filter(o => o.status === "cancelled");

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      preparing: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      ready: "bg-green-500/20 text-green-600 border-green-500/30",
      completed: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      cancelled: "bg-red-500/20 text-red-600 border-red-500/30"
    };
    return colors[status] || "bg-gray-500/20 text-gray-600";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dine_in": return <UtensilsCrossed className="h-4 w-4" />;
      case "pickup": return <Package className="h-4 w-4" />;
      case "delivery": return <Truck className="h-4 w-4" />;
      default: return <UtensilsCrossed className="h-4 w-4" />;
    }
  };

  const OrderCard = ({ order }: { order: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
              {getTypeIcon(order.order_type)}
            </div>
            <div>
              <p className="font-semibold">{order.receipt_number}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(order.created_at), "HH:mm")}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(order.status)} variant="outline">
            {order.status}
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
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type</span>
            <span className="capitalize">{order.order_type.replace("_", " ")}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Total</span>
            <span className="text-primary">{Number(order.total).toFixed(2)} DH</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setSelectedOrder(order)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setReceiptOrder(order)}
          >
            <Printer className="h-3 w-3 mr-1" />
            Receipt
          </Button>
          {order.status === "pending" && (
            <Button 
              size="sm"
              onClick={() => updateOrderStatus(order.id, "preparing")}
            >
              <Clock className="h-3 w-3 mr-1" />
              Start
            </Button>
          )}
          {order.status === "preparing" && (
            <Button 
              size="sm"
              onClick={() => updateOrderStatus(order.id, "ready")}
            >
              <Check className="h-3 w-3 mr-1" />
              Ready
            </Button>
          )}
          {order.status === "ready" && (
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateOrderStatus(order.id, "completed")}
            >
              <Check className="h-3 w-3 mr-1" />
              Complete
            </Button>
          )}
          {!["completed", "cancelled"].includes(order.status) && (
            <Button 
              size="sm"
              variant="destructive"
              onClick={() => updateOrderStatus(order.id, "cancelled")}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
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
            <p className="text-muted-foreground">Manage dine-in, delivery, and pickup orders</p>
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
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
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
            updateOrderStatus(selectedOrder.id, status);
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
