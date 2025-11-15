import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, XCircle, DollarSign } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AssignRiderDialog } from "./AssignRiderDialog";
import { CancelOrderDialog } from "./CancelOrderDialog";
import { RefundOrderDialog } from "./RefundOrderDialog";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_id: string;
  customer_name: string;
  restaurant_name: string;
  delivery_address: string;
  rider_id: string | null;
  payment_status: string;
}

const AdminOrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assignRiderOpen, setAssignRiderOpen] = useState(false);
  const [cancelOrderOpen, setCancelOrderOpen] = useState(false);
  const [refundOrderOpen, setRefundOrderOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          status,
          total_amount,
          delivery_address,
          customer_id,
          rider_id,
          payment_status,
          profiles!orders_customer_id_fkey(full_name),
          restaurants(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const formattedOrders = data?.map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        delivery_address: order.delivery_address,
        customer_id: order.customer_id,
        customer_name: order.profiles?.full_name || "Unknown",
        restaurant_name: order.restaurants?.name || "Unknown",
        rider_id: order.rider_id,
        payment_status: order.payment_status || "pending",
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.restaurant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      preparing: "default",
      ready_for_pickup: "default",
      picked_up: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Orders Management</h2>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order ID, customer, or restaurant..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Restaurant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>{order.restaurant_name}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.total_amount.toFixed(2)} MAD</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!order.rider_id && order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setAssignRiderOpen(true);
                          }}
                        >
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      )}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setCancelOrderOpen(true);
                          }}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      )}
                      {order.payment_status === "paid" && order.status !== "cancelled" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setRefundOrderOpen(true);
                          }}
                        >
                          <DollarSign className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No orders found
        </div>
      )}

      {selectedOrder && (
        <>
          <AssignRiderDialog
            open={assignRiderOpen}
            onOpenChange={setAssignRiderOpen}
            orderId={selectedOrder.id}
            onSuccess={fetchOrders}
          />
          <CancelOrderDialog
            open={cancelOrderOpen}
            onOpenChange={setCancelOrderOpen}
            orderId={selectedOrder.id}
            customerId={selectedOrder.customer_id}
            totalAmount={selectedOrder.total_amount}
            paymentStatus={selectedOrder.payment_status}
            onSuccess={fetchOrders}
          />
          <RefundOrderDialog
            open={refundOrderOpen}
            onOpenChange={setRefundOrderOpen}
            orderId={selectedOrder.id}
            customerId={selectedOrder.customer_id}
            totalAmount={selectedOrder.total_amount}
            onSuccess={fetchOrders}
          />
        </>
      )}
    </div>
  );
};

export default AdminOrdersManagement;
