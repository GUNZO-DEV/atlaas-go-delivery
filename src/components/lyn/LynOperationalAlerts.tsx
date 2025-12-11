import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, Clock, Package, ChefHat, MessageSquare,
  Bell, X, Check
} from "lucide-react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";

interface LynOperationalAlertsProps {
  restaurant: any;
}

interface Alert {
  id: string;
  type: "wait_time" | "kitchen_backlog" | "low_stock" | "complaint";
  severity: "warning" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
}

const LynOperationalAlerts = ({ restaurant }: LynOperationalAlertsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [restaurant.id]);

  const loadAlerts = async () => {
    try {
      const now = new Date();
      const newAlerts: Alert[] = [];

      // 1. Check for long waiting orders (orders pending > 15 min)
      const { data: pendingOrders } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .in("status", ["pending", "preparing"])
        .order("created_at");

      pendingOrders?.forEach(order => {
        const waitTime = differenceInMinutes(now, new Date(order.created_at));
        if (waitTime > 30) {
          newAlerts.push({
            id: `wait-${order.id}`,
            type: "wait_time",
            severity: "critical",
            title: "Long Wait Time",
            message: `Table ${order.table_number || "Takeout"} waiting ${waitTime} minutes`,
            timestamp: new Date(order.created_at),
            data: order
          });
        } else if (waitTime > 15) {
          newAlerts.push({
            id: `wait-${order.id}`,
            type: "wait_time",
            severity: "warning",
            title: "Extended Wait",
            message: `Table ${order.table_number || "Takeout"} waiting ${waitTime} minutes`,
            timestamp: new Date(order.created_at),
            data: order
          });
        }
      });

      // 2. Check kitchen backlog (> 5 orders in preparing status)
      const preparingCount = pendingOrders?.filter(o => o.kitchen_status === "preparing").length || 0;
      if (preparingCount > 5) {
        newAlerts.push({
          id: "kitchen-backlog",
          type: "kitchen_backlog",
          severity: preparingCount > 8 ? "critical" : "warning",
          title: "Kitchen Backlog",
          message: `${preparingCount} orders currently being prepared`,
          timestamp: now
        });
      }

      // 3. Check low stock items
      const { data: inventory } = await supabase
        .from("lyn_inventory_items")
        .select("*")
        .eq("restaurant_id", restaurant.id);

      inventory?.forEach(item => {
        if (item.current_stock <= item.min_stock_level) {
          const severity = item.current_stock === 0 ? "critical" : "warning";
          newAlerts.push({
            id: `stock-${item.id}`,
            type: "low_stock",
            severity,
            title: item.current_stock === 0 ? "Out of Stock" : "Low Stock",
            message: `${item.name}: ${item.current_stock} ${item.unit} remaining`,
            timestamp: now,
            data: item
          });
        }
      });

      // 4. Check for recent unresolved incidents/complaints
      const { data: incidents } = await supabase
        .from("lyn_incidents")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .is("resolved_at", null)
        .eq("incident_type", "customer_complaint")
        .order("created_at", { ascending: false })
        .limit(5);

      incidents?.forEach(incident => {
        newAlerts.push({
          id: `complaint-${incident.id}`,
          type: "complaint",
          severity: incident.severity === "high" ? "critical" : "warning",
          title: "Unresolved Complaint",
          message: incident.title,
          timestamp: new Date(incident.created_at),
          data: incident
        });
      });

      setAlerts(newAlerts.filter(a => !dismissedAlerts.includes(a.id)));
    } catch (error) {
      console.error("Error loading alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "wait_time": return <Clock className="h-5 w-5" />;
      case "kitchen_backlog": return <ChefHat className="h-5 w-5" />;
      case "low_stock": return <Package className="h-5 w-5" />;
      case "complaint": return <MessageSquare className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const warningAlerts = alerts.filter(a => a.severity === "warning");

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-green-300 bg-green-50/50 dark:bg-green-900/10">
        <CardContent className="py-6 text-center">
          <Check className="h-12 w-12 mx-auto mb-2 text-green-600" />
          <p className="font-medium text-green-700 dark:text-green-400">All Clear</p>
          <p className="text-sm text-muted-foreground">No operational alerts at this time</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={criticalAlerts.length > 0 ? "border-red-300 bg-red-50/50 dark:bg-red-900/10" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className={`h-5 w-5 ${criticalAlerts.length > 0 ? "text-red-600 animate-pulse" : "text-yellow-600"}`} />
            Operational Alerts
          </CardTitle>
          <Badge variant={criticalAlerts.length > 0 ? "destructive" : "secondary"}>
            {alerts.length} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 max-h-80 overflow-y-auto">
        {/* Critical Alerts First */}
        {criticalAlerts.map(alert => (
          <div 
            key={alert.id}
            className="flex items-start justify-between gap-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-red-200 dark:bg-red-800 rounded-full flex items-center justify-center text-red-700 dark:text-red-300">
                {getAlertIcon(alert.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-red-700 dark:text-red-300">{alert.title}</p>
                  <Badge className="bg-red-500 text-white">Critical</Badge>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {/* Warning Alerts */}
        {warningAlerts.map(alert => (
          <div 
            key={alert.id}
            className="flex items-start justify-between gap-3 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-300"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 bg-yellow-200 dark:bg-yellow-800 rounded-full flex items-center justify-center text-yellow-700 dark:text-yellow-300">
                {getAlertIcon(alert.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-yellow-700 dark:text-yellow-300">{alert.title}</p>
                  <Badge className="bg-yellow-500 text-white">Warning</Badge>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="shrink-0"
              onClick={() => dismissAlert(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default LynOperationalAlerts;
