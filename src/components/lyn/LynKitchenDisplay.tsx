import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { differenceInMinutes } from "date-fns";
import { 
  ChefHat, Clock, CheckCircle, AlertTriangle, 
  Bell, Timer, Utensils, RefreshCw 
} from "lucide-react";

interface LynKitchenDisplayProps {
  restaurant: any;
}

const LynKitchenDisplay = ({ restaurant }: LynKitchenDisplayProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lyn_restaurant_orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .in("kitchen_status", ["pending", "preparing"])
      .order("created_at", { ascending: true });
    
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("kitchen-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lyn_restaurant_orders" },
        () => {
          fetchOrders();
          // Play notification sound for new orders
          if (typeof Audio !== 'undefined') {
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2JkYyMi4mHg3x2bGRcU01GQj48Ozo6Oz0/QkVITFBUWV5kaG5zeX6DhoqNkJKTlJSTkY6LhoF8dnBqY1xWUEtGQj46NzQyMDE');
              audio.volume = 0.5;
              audio.play().catch(() => {});
            } catch (e) {}
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  const updateKitchenStatus = async (orderId: string, newStatus: string) => {
    try {
      const updates: any = {
        kitchen_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === "preparing") {
        updates.kitchen_started_at = new Date().toISOString();
      } else if (newStatus === "ready") {
        updates.kitchen_ready_at = new Date().toISOString();
      }

      await supabase
        .from("lyn_restaurant_orders")
        .update(updates)
        .eq("id", orderId);

      toast({ 
        title: newStatus === "ready" ? "Order Ready!" : "Started Preparing",
        description: `Order marked as ${newStatus}`
      });

      fetchOrders();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getWaitTime = (createdAt: string) => {
    return differenceInMinutes(new Date(), new Date(createdAt));
  };

  const getUrgencyLevel = (minutes: number) => {
    if (minutes > 20) return "critical";
    if (minutes > 10) return "warning";
    return "normal";
  };

  const pendingOrders = orders.filter(o => o.kitchen_status === "pending");
  const preparingOrders = orders.filter(o => o.kitchen_status === "preparing");

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <Bell className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Orders</p>
              <p className="text-3xl font-bold">{pendingOrders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-full">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preparing</p>
              <p className="text-3xl font-bold">{preparingOrders.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-primary/20 rounded-full">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Wait</p>
              <p className="text-3xl font-bold">
                {orders.length > 0 
                  ? Math.round(orders.reduce((sum, o) => sum + getWaitTime(o.created_at), 0) / orders.length)
                  : 0}m
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refresh */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center text-muted-foreground">
              <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No active orders</p>
              <p className="text-sm">Kitchen is clear!</p>
            </CardContent>
          </Card>
        ) : (
          orders.map(order => {
            const waitTime = getWaitTime(order.created_at);
            const urgency = getUrgencyLevel(waitTime);
            const items = (order.items || []) as any[];

            return (
              <Card 
                key={order.id}
                className={`
                  ${urgency === "critical" ? "border-red-500 animate-pulse bg-red-50 dark:bg-red-950/20" : ""}
                  ${urgency === "warning" ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" : ""}
                  ${order.kitchen_status === "preparing" ? "border-orange-500" : ""}
                `}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={order.kitchen_status === "pending" ? "default" : "secondary"}
                        className="text-lg px-3"
                      >
                        {order.table_number || `#${order.receipt_number?.slice(-4)}`}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {order.order_type.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-bold
                      ${urgency === "critical" ? "text-red-600" : ""}
                      ${urgency === "warning" ? "text-yellow-600" : "text-muted-foreground"}
                    `}>
                      <Clock className="h-4 w-4" />
                      {waitTime}m
                      {urgency === "critical" && <AlertTriangle className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Items */}
                  <ScrollArea className="max-h-[200px]">
                    <div className="space-y-2">
                      {items.map((item: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                          <span className="text-2xl font-bold text-primary min-w-[40px]">
                            {item.quantity}x
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            {item.notes && (
                              <p className="text-sm text-orange-600 font-medium">
                                ⚠️ {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Order Notes */}
                  {order.notes && (
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-400">
                      <p className="text-sm font-medium">📝 {order.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {order.kitchen_status === "pending" ? (
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => updateKitchenStatus(order.id, "preparing")}
                    >
                      <ChefHat className="h-4 w-4 mr-2" />
                      Start Preparing
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => updateKitchenStatus(order.id, "ready")}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Ready
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LynKitchenDisplay;
