import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, FileWarning, Wrench, Truck, UserX, 
  Plus, Check, Clock, AlertCircle 
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface LynIncidentsLogProps {
  restaurant: any;
}

const incidentTypes = [
  { value: "customer_complaint", label: "Customer Complaint", icon: UserX },
  { value: "equipment_failure", label: "Equipment Failure", icon: Wrench },
  { value: "supplier_delay", label: "Supplier Delay", icon: Truck },
  { value: "staff_issue", label: "Staff Issue", icon: AlertTriangle },
  { value: "food_quality", label: "Food Quality", icon: FileWarning },
  { value: "other", label: "Other", icon: AlertCircle }
];

const LynIncidentsLog = ({ restaurant }: LynIncidentsLogProps) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [resolution, setResolution] = useState("");
  const [newIncident, setNewIncident] = useState({
    incident_type: "customer_complaint",
    severity: "low",
    title: "",
    description: "",
    reported_by: "",
    customer_name: "",
    customer_phone: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("lyn_incidents")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(100);
      setIncidents(data || []);
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async () => {
    if (!newIncident.title || !newIncident.description) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("lyn_incidents").insert({
        restaurant_id: restaurant.id,
        incident_type: newIncident.incident_type,
        severity: newIncident.severity,
        title: newIncident.title,
        description: newIncident.description,
        reported_by: newIncident.reported_by || null,
        customer_name: newIncident.customer_name || null,
        customer_phone: newIncident.customer_phone || null
      });

      if (error) throw error;
      toast({ title: "Incident Logged" });
      setDialogOpen(false);
      setNewIncident({
        incident_type: "customer_complaint", severity: "low", title: "",
        description: "", reported_by: "", customer_name: "", customer_phone: ""
      });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const resolveIncident = async () => {
    if (!selectedIncident || !resolution) return;

    try {
      const { error } = await supabase
        .from("lyn_incidents")
        .update({
          resolution,
          resolved_at: new Date().toISOString(),
          resolved_by: "Manager"
        })
        .eq("id", selectedIncident.id);

      if (error) throw error;
      toast({ title: "Incident Resolved" });
      setResolveDialogOpen(false);
      setSelectedIncident(null);
      setResolution("");
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500/20 text-red-700 border-red-300";
      case "medium": return "bg-orange-500/20 text-orange-700 border-orange-300";
      default: return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
    }
  };

  const getTypeIcon = (type: string) => {
    const found = incidentTypes.find(t => t.value === type);
    return found ? <found.icon className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />;
  };

  const openIncidents = incidents.filter(i => !i.resolved_at);
  const resolvedIncidents = incidents.filter(i => i.resolved_at);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Incident Logbook</h2>
          <p className="text-muted-foreground">Track complaints, issues, and resolutions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Log Incident</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Log New Incident</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={newIncident.incident_type} onValueChange={(v) => setNewIncident({...newIncident, incident_type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={newIncident.severity} onValueChange={(v) => setNewIncident({...newIncident, severity: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  value={newIncident.title}
                  onChange={(e) => setNewIncident({...newIncident, title: e.target.value})}
                  placeholder="Brief summary"
                />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({...newIncident, description: e.target.value})}
                  placeholder="Detailed description..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Reported By</Label>
                <Input
                  value={newIncident.reported_by}
                  onChange={(e) => setNewIncident({...newIncident, reported_by: e.target.value})}
                  placeholder="Staff name"
                />
              </div>
              {newIncident.incident_type === "customer_complaint" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name</Label>
                    <Input
                      value={newIncident.customer_name}
                      onChange={(e) => setNewIncident({...newIncident, customer_name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Customer Phone</Label>
                    <Input
                      value={newIncident.customer_phone}
                      onChange={(e) => setNewIncident({...newIncident, customer_phone: e.target.value})}
                    />
                  </div>
                </div>
              )}
              <Button onClick={createIncident} className="w-full">Log Incident</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Issues</p>
                <p className="text-xl font-bold">{openIncidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-xl font-bold">{resolvedIncidents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <UserX className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Complaints</p>
                <p className="text-xl font-bold">{incidents.filter(i => i.incident_type === "customer_complaint").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Wrench className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Equipment</p>
                <p className="text-xl font-bold">{incidents.filter(i => i.incident_type === "equipment_failure").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open ({openIncidents.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({resolvedIncidents.length})</TabsTrigger>
          <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "open", data: openIncidents },
          { value: "resolved", data: resolvedIncidents },
          { value: "all", data: incidents }
        ].map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-3">
            {tab.data.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No incidents</CardContent></Card>
            ) : (
              tab.data.map(incident => (
                <Card key={incident.id} className={!incident.resolved_at ? "border-l-4 border-l-red-500" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          incident.resolved_at ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"
                        }`}>
                          {getTypeIcon(incident.incident_type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{incident.title}</p>
                            <Badge className={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                            <Badge variant="outline">{incidentTypes.find(t => t.value === incident.incident_type)?.label}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{incident.description}</p>
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                            {incident.reported_by && <span>Reported by: {incident.reported_by}</span>}
                            {incident.customer_name && <span>Customer: {incident.customer_name}</span>}
                            <span>{formatDistanceToNow(new Date(incident.created_at), { addSuffix: true })}</span>
                          </div>
                          {incident.resolved_at && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                              <p className="font-medium text-green-700 dark:text-green-400">Resolution:</p>
                              <p className="text-muted-foreground">{incident.resolution}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Resolved by {incident.resolved_by} • {format(new Date(incident.resolved_at), "MMM d, h:mm a")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      {!incident.resolved_at && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setResolveDialogOpen(true);
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" />Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolve Incident</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resolution *</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                rows={4}
              />
            </div>
            <Button onClick={resolveIncident} className="w-full">Mark as Resolved</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LynIncidentsLog;
