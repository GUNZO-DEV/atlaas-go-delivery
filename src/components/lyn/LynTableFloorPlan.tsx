import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, RefreshCw, Users, DollarSign, Clock, ChefHat, WifiOff } from "lucide-react";
import LynTableCard from "./LynTableCard";
import LynTableOrderDialog from "./LynTableOrderDialog";

interface LynTableFloorPlanProps {
  restaurant: any;
}

const LynTableFloorPlan = ({ restaurant }: LynTableFloorPlanProps) => {
  const [tables, setTables] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const { isOnline, cacheData, getCachedData, queueAction } = useOfflineSync();

  const fetchData = async () => {
    setLoading(true);
    
    const tablesCacheKey = `lyn_tables_${restaurant.id}`;
    const ordersCacheKey = `lyn_active_orders_${restaurant.id}`;

    // If offline, use cached data
    if (!isOnline) {
      const cachedTables = getCachedData<any[]>(tablesCacheKey);
      const cachedOrders = getCachedData<any[]>(ordersCacheKey);
      if (cachedTables) {
        setTables(cachedTables);
        setOrders(cachedOrders || []);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    try {
      // Fetch tables
      const { data: tablesData } = await supabase
        .from("lyn_tables")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("table_number");

      // Fetch active orders
      const { data: ordersData } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .in("status", ["pending", "preparing", "ready"])
        .not("table_id", "is", null);

      setTables(tablesData || []);
      setOrders(ordersData || []);
      setFromCache(false);
      
      // Cache for offline
      cacheData(tablesCacheKey, tablesData);
      cacheData(ordersCacheKey, ordersData);
    } catch (error) {
      // Try cached data on error
      const cachedTables = getCachedData<any[]>(tablesCacheKey);
      if (cachedTables) {
        setTables(cachedTables);
        setOrders(getCachedData<any[]>(ordersCacheKey) || []);
        setFromCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Subscribe to realtime updates only when online
    if (!isOnline) return;

    const tablesChannel = supabase
      .channel("lyn-tables-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "lyn_tables" }, () => {
        fetchData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "lyn_restaurant_orders" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tablesChannel);
    };
  }, [restaurant.id, isOnline]);

  const getOrderForTable = (tableId: string) => {
    return orders.find(o => o.table_id === tableId);
  };

  const handleTableClick = (table: any) => {
    setSelectedTable(table);
    setOrderDialogOpen(true);
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    avgWaitTime: orders.length > 0 
      ? Math.round(orders.reduce((sum, o) => {
          const minutes = Math.floor((Date.now() - new Date(o.created_at).getTime()) / 60000);
          return sum + minutes;
        }, 0) / orders.length)
      : 0
  };

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardContent className="p-2 md:p-3 flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-emerald-500/20 rounded-full shrink-0">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-muted-foreground">Available</p>
              <p className="font-bold text-base md:text-lg">{stats.available}/{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/10 border-orange-500/20">
          <CardContent className="p-2 md:p-3 flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-orange-500/20 rounded-full shrink-0">
              <Users className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-muted-foreground">Occupied</p>
              <p className="font-bold text-base md:text-lg">{stats.occupied}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-2 md:p-3 flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-blue-500/20 rounded-full shrink-0">
              <Clock className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-muted-foreground">Reserved</p>
              <p className="font-bold text-base md:text-lg">{stats.reserved}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-2 md:p-3 flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-primary/20 rounded-full shrink-0">
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-muted-foreground">Bills</p>
              <p className="font-bold text-base md:text-lg">{stats.totalRevenue.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20 col-span-2 sm:col-span-1">
          <CardContent className="p-2 md:p-3 flex items-center gap-2">
            <div className="p-1.5 md:p-2 bg-yellow-500/20 rounded-full shrink-0">
              <ChefHat className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] md:text-xs text-muted-foreground">Avg Wait</p>
              <p className="font-bold text-base md:text-lg">{stats.avgWaitTime}m</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floor Plan */}
      <Card>
        <CardHeader className="pb-2 px-3 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CardTitle className="text-base md:text-lg">Floor Plan</CardTitle>
              {fromCache && (
                <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30 text-[10px] md:text-xs shrink-0">
                  <WifiOff className="h-3 w-3" />
                  <span className="hidden sm:inline">Cached</span>
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="shrink-0 h-8">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline ml-1">Refresh</span>
            </Button>
          </div>
          
          {/* Legend */}
          <div className="flex flex-wrap gap-2 md:gap-4 text-[10px] md:text-xs mt-2">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-emerald-500/40 border border-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-orange-500/40 border border-orange-500" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-blue-500/40 border border-blue-500" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded bg-yellow-500/40 border border-yellow-500" />
              <span>Cleaning</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-3 md:px-6">
          <ScrollArea className="h-[300px] md:h-[400px]">
            <div className="relative min-h-[300px] md:min-h-[400px] bg-muted/30 rounded-lg p-3 md:p-4 border-2 border-dashed">
              {/* Restaurant Layout Background */}
              <div className="absolute inset-0 opacity-10 hidden md:block">
                <div className="absolute top-2 left-2 text-xs font-bold">ENTRANCE</div>
                <div className="absolute bottom-2 right-2 text-xs font-bold">KITCHEN</div>
                <div className="absolute top-2 right-2 text-xs font-bold">BAR</div>
              </div>

              {/* Tables Grid */}
              <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
                {tables.map(table => (
                  <LynTableCard
                    key={table.id}
                    table={table}
                    order={getOrderForTable(table.id)}
                    onClick={() => handleTableClick(table)}
                    isSelected={selectedTable?.id === table.id}
                  />
                ))}
              </div>

              {tables.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Users className="h-10 w-10 md:h-12 md:w-12 mb-2" />
                  <p className="text-sm">No tables configured</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Table Order Dialog */}
      {selectedTable && (
        <LynTableOrderDialog
          open={orderDialogOpen}
          onOpenChange={setOrderDialogOpen}
          table={selectedTable}
          order={getOrderForTable(selectedTable.id)}
          restaurant={restaurant}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default LynTableFloorPlan;
