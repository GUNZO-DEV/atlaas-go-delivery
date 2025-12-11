import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Phone, Plus, Check, X, AlertTriangle, WifiOff } from "lucide-react";
import { format, isToday, isTomorrow, parseISO, addDays } from "date-fns";

interface LynReservationsManagementProps {
  restaurant: any;
}

const LynReservationsManagement = ({ restaurant }: LynReservationsManagementProps) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newReservation, setNewReservation] = useState({
    customer_name: "",
    customer_phone: "",
    party_size: "2",
    reservation_date: format(new Date(), "yyyy-MM-dd"),
    reservation_time: "19:00",
    table_id: "",
    notes: ""
  });
  const { toast } = useToast();
  const { isOnline, cacheData, getCachedData, queueAction } = useOfflineSync();

  const reservationsCacheKey = `lyn_reservations_${restaurant.id}`;
  const tablesCacheKey = `lyn_tables_${restaurant.id}`;

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  useEffect(() => {
    if (!isOnline) return;
    
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lyn_reservations' }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [restaurant.id, isOnline]);

  const loadData = async () => {
    setLoading(true);
    
    // If offline, use cached data
    if (!isOnline) {
      const cachedReservations = getCachedData<any[]>(reservationsCacheKey);
      const cachedTables = getCachedData<any[]>(tablesCacheKey);
      if (cachedReservations) {
        setReservations(cachedReservations);
        setTables(cachedTables || []);
        setFromCache(true);
        setLoading(false);
        return;
      }
    }

    try {
      const [reservationsRes, tablesRes] = await Promise.all([
        supabase
          .from("lyn_reservations")
          .select("*, lyn_tables(table_number)")
          .eq("restaurant_id", restaurant.id)
          .gte("reservation_date", format(new Date(), "yyyy-MM-dd"))
          .order("reservation_date")
          .order("reservation_time"),
        supabase
          .from("lyn_tables")
          .select("*")
          .eq("restaurant_id", restaurant.id)
          .order("table_number")
      ]);

      setReservations(reservationsRes.data || []);
      setTables(tablesRes.data || []);
      setFromCache(false);
      
      // Cache for offline
      cacheData(reservationsCacheKey, reservationsRes.data);
      cacheData(tablesCacheKey, tablesRes.data);
    } catch (error: any) {
      console.error("Error:", error);
      
      // Try cached data
      const cachedReservations = getCachedData<any[]>(reservationsCacheKey);
      if (cachedReservations) {
        setReservations(cachedReservations);
        setTables(getCachedData<any[]>(tablesCacheKey) || []);
        setFromCache(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async () => {
    if (!newReservation.customer_name || !newReservation.customer_phone) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase.from("lyn_reservations").insert({
        restaurant_id: restaurant.id,
        customer_name: newReservation.customer_name,
        customer_phone: newReservation.customer_phone,
        party_size: parseInt(newReservation.party_size),
        reservation_date: newReservation.reservation_date,
        reservation_time: newReservation.reservation_time,
        table_id: newReservation.table_id || null,
        notes: newReservation.notes || null
      });

      if (error) throw error;
      toast({ title: "Reservation Created" });
      setDialogOpen(false);
      setNewReservation({
        customer_name: "", customer_phone: "", party_size: "2",
        reservation_date: format(new Date(), "yyyy-MM-dd"),
        reservation_time: "19:00", table_id: "", notes: ""
      });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateStatus = async (id: string, status: string, noShow = false) => {
    try {
      const { error } = await supabase
        .from("lyn_reservations")
        .update({ status, no_show: noShow })
        .eq("id", id);
      if (error) throw error;
      toast({ title: `Reservation ${status}` });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string, noShow: boolean) => {
    if (noShow) return "bg-red-500/20 text-red-700 border-red-300";
    switch (status) {
      case "confirmed": return "bg-blue-500/20 text-blue-700 border-blue-300";
      case "seated": return "bg-green-500/20 text-green-700 border-green-300";
      case "completed": return "bg-gray-500/20 text-gray-700 border-gray-300";
      case "cancelled": return "bg-red-500/20 text-red-700 border-red-300";
      default: return "bg-yellow-500/20 text-yellow-700 border-yellow-300";
    }
  };

  const todayReservations = reservations.filter(r => r.reservation_date === format(new Date(), "yyyy-MM-dd"));
  const tomorrowReservations = reservations.filter(r => r.reservation_date === format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const upcomingReservations = reservations.filter(r => r.reservation_date > format(addDays(new Date(), 1), "yyyy-MM-dd"));

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
          <h2 className="text-2xl font-bold text-foreground">Reservations</h2>
          <p className="text-muted-foreground">Manage table reservations</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Reservation</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New Reservation</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name *</Label>
                  <Input
                    value={newReservation.customer_name}
                    onChange={(e) => setNewReservation({...newReservation, customer_name: e.target.value})}
                    placeholder="Name"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={newReservation.customer_phone}
                    onChange={(e) => setNewReservation({...newReservation, customer_phone: e.target.value})}
                    placeholder="+212..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newReservation.reservation_date}
                    onChange={(e) => setNewReservation({...newReservation, reservation_date: e.target.value})}
                    min={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={newReservation.reservation_time}
                    onChange={(e) => setNewReservation({...newReservation, reservation_time: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Party Size</Label>
                  <Select value={newReservation.party_size} onValueChange={(v) => setNewReservation({...newReservation, party_size: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,10,12].map(n => <SelectItem key={n} value={n.toString()}>{n} people</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Assign Table (Optional)</Label>
                <Select value={newReservation.table_id} onValueChange={(v) => setNewReservation({...newReservation, table_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select table" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No table assigned</SelectItem>
                    {tables.map(t => <SelectItem key={t.id} value={t.id}>Table {t.table_number} ({t.capacity} seats)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Input
                  value={newReservation.notes}
                  onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                  placeholder="Special requests, allergies..."
                />
              </div>
              <Button onClick={createReservation} className="w-full">Create Reservation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-xl font-bold">{todayReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expected Guests</p>
                <p className="text-xl font-bold">{todayReservations.reduce((sum, r) => sum + r.party_size, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tomorrow</p>
                <p className="text-xl font-bold">{tomorrowReservations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No-Shows (30d)</p>
                <p className="text-xl font-bold">{reservations.filter(r => r.no_show).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservations Tabs */}
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today ({todayReservations.length})</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow ({tomorrowReservations.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingReservations.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "today", data: todayReservations },
          { value: "tomorrow", data: tomorrowReservations },
          { value: "upcoming", data: upcomingReservations }
        ].map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-3">
            {tab.data.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No reservations</CardContent></Card>
            ) : (
              tab.data.map(reservation => (
                <Card key={reservation.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-bold text-primary">{reservation.reservation_time.slice(0, 5)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{reservation.customer_name}</p>
                            <Badge className={getStatusColor(reservation.status, reservation.no_show)}>
                              {reservation.no_show ? "No-Show" : reservation.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{reservation.customer_phone}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{reservation.party_size} guests</span>
                            {reservation.lyn_tables && <span>Table {reservation.lyn_tables.table_number}</span>}
                          </div>
                          {reservation.notes && <p className="text-xs text-muted-foreground mt-1 bg-muted p-1 rounded">{reservation.notes}</p>}
                        </div>
                      </div>
                      {reservation.status === "confirmed" && !reservation.no_show && (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(reservation.id, "seated")}>
                            <Check className="h-4 w-4 mr-1" />Seat
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(reservation.id, "cancelled", true)}>
                            <X className="h-4 w-4 mr-1" />No-Show
                          </Button>
                        </div>
                      )}
                      {reservation.status === "seated" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(reservation.id, "completed")}>
                          Complete
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
    </div>
  );
};

export default LynReservationsManagement;
