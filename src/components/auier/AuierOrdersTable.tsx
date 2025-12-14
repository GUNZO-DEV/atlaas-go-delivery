import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, RefreshCw, Phone, MapPin, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import AuierOrderDetailsDialog from "./AuierOrderDetailsDialog";

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
  updated_at: string;
  completed_at: string | null;
}

interface AuierOrdersTableProps {
  statusFilter?: "pending" | "active" | "completed" | "all";
  limit?: number;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "accepted", label: "Accepted", color: "bg-blue-500" },
  { value: "preparing", label: "Preparing", color: "bg-purple-500" },
  { value: "picked_up", label: "Picked Up", color: "bg-indigo-500" },
  { value: "on_the_way", label: "On The Way", color: "bg-cyan-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
];

export default function AuierOrdersTable({ statusFilter = "all", limit }: AuierOrdersTableProps) {
  const [orders, setOrders] = useState<AuierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AuierOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('auier-orders-table')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auier_orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter, limit]);

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('auier_orders')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply status filter
      if (statusFilter === "pending") {
        query = query.eq('status', 'pending');
      } else if (statusFilter === "active") {
        query = query.not('status', 'in', '("pending","completed")');
      } else if (statusFilter === "completed") {
        query = query.eq('status', 'completed');
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching AUIER orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('auier_orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-500'} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getDeliveryTypeBadge = (type: string) => {
    const isRestaurant = type === 'restaurant_to_dorm';
    return (
      <Badge variant="outline" className={isRestaurant ? 'border-primary text-primary' : 'border-secondary text-secondary-foreground'}>
        {isRestaurant ? 'Restaurant → Dorm' : 'Gate → Dorm'}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order =>
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_phone.includes(searchTerm) ||
    order.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.building_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openDetails = (order: AuierOrder) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading orders...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm" onClick={fetchOrders}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{order.customer_name}</div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {order.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Building className="h-3 w-3" />
                          {order.building_name} - Room {order.room_number}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{order.restaurant_name}</TableCell>
                      <TableCell>{getDeliveryTypeBadge(order.delivery_type)}</TableCell>
                      <TableCell className="font-bold text-primary">{order.delivery_fee} DH</TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[130px] h-8">
                            <SelectValue>{getStatusBadge(order.status)}</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AuierOrderDetailsDialog
        order={selectedOrder}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onStatusChange={updateOrderStatus}
      />
    </>
  );
}
