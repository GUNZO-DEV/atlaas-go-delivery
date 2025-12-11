import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Search, Filter, Download, History, User, ShoppingCart, Package, CreditCard, Settings } from "lucide-react";

interface AuditLog {
  id: string;
  staff_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

interface LynAuditLogsProps {
  restaurant: any;
}

const LynAuditLogs = ({ restaurant }: LynAuditLogsProps) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterEntity, setFilterEntity] = useState("all");

  useEffect(() => {
    loadAuditLogs();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('audit-logs-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lyn_audit_logs',
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          setLogs((prev) => [payload.new as AuditLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [restaurant.id]);

  const loadAuditLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("lyn_audit_logs")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error loading audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("add")) return "bg-green-500";
    if (action.includes("update") || action.includes("edit")) return "bg-blue-500";
    if (action.includes("delete") || action.includes("remove")) return "bg-red-500";
    if (action.includes("complete") || action.includes("paid")) return "bg-purple-500";
    return "bg-gray-500";
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "order": return <ShoppingCart className="h-4 w-4" />;
      case "inventory": return <Package className="h-4 w-4" />;
      case "payment": return <CreditCard className="h-4 w-4" />;
      case "staff": return <User className="h-4 w-4" />;
      case "settings": return <Settings className="h-4 w-4" />;
      default: return <History className="h-4 w-4" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.staff_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAction = filterAction === "all" || log.action.includes(filterAction);
    const matchesEntity = filterEntity === "all" || log.entity_type === filterEntity;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const exportLogs = () => {
    const csvContent = [
      ["Date", "Time", "Staff", "Action", "Entity", "Details"].join(","),
      ...filteredLogs.map((log) => [
        format(new Date(log.created_at), "yyyy-MM-dd"),
        format(new Date(log.created_at), "HH:mm:ss"),
        log.staff_name || "System",
        log.action,
        log.entity_type,
        JSON.stringify(log.details || {}).replace(/,/g, ";"),
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Created</SelectItem>
                <SelectItem value="update">Updated</SelectItem>
                <SelectItem value="delete">Deleted</SelectItem>
                <SelectItem value="complete">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="order">Orders</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="table">Tables</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{logs.length}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter(l => l.action.includes("create")).length}
            </div>
            <div className="text-sm text-muted-foreground">Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter(l => l.action.includes("update")).length}
            </div>
            <div className="text-sm text-muted-foreground">Updated</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter(l => l.action.includes("delete")).length}
            </div>
            <div className="text-sm text-muted-foreground">Deleted</div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No audit logs found. Actions will be recorded here.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className={`p-2 rounded-full ${getActionColor(log.action)} text-white`}>
                    {getEntityIcon(log.entity_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{log.staff_name || "System"}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {log.entity_type}
                      </Badge>
                    </div>
                    {log.details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {typeof log.details === 'object' 
                          ? Object.entries(log.details).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: <span className="font-medium">{String(value)}</span>
                              </span>
                            ))
                          : String(log.details)
                        }
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                      {format(new Date(log.created_at), "PPpp")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LynAuditLogs;