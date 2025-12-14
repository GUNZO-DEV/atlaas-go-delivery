import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Phone, Building, MapPin, Clock, Package, Store, DollarSign, User } from "lucide-react";
import { format } from "date-fns";

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

interface AuierOrderDetailsDialogProps {
  order: AuierOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (orderId: string, status: string) => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-500" },
  { value: "accepted", label: "Accepted", color: "bg-blue-500" },
  { value: "preparing", label: "Preparing", color: "bg-purple-500" },
  { value: "picked_up", label: "Picked Up", color: "bg-indigo-500" },
  { value: "on_the_way", label: "On The Way", color: "bg-cyan-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
];

export default function AuierOrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onStatusChange,
}: AuierOrderDetailsDialogProps) {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-500'} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const currentStatusIndex = STATUS_OPTIONS.findIndex(s => s.value === order.status);
  const nextStatus = STATUS_OPTIONS[currentStatusIndex + 1];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details</span>
            {getStatusBadge(order.status)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <a href={`tel:${order.customer_phone}`} className="font-medium text-primary flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {order.customer_phone}
                </a>
              </div>
            </div>
          </div>

          <Separator />

          {/* Delivery Location */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Location
            </h4>
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  Building {order.building_name}, Room {order.room_number}
                </span>
              </div>
              <Badge variant="outline" className="mt-2">
                {order.delivery_type === 'restaurant_to_dorm' ? 'Restaurant → Dorm' : 'Main Gate → Dorm'}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Order Details */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Order Details
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.restaurant_name}</span>
              </div>
              <div className="bg-muted p-3 rounded-lg text-sm">
                {order.order_details}
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Delivery Fee
              </h4>
              <p className="text-2xl font-bold text-primary">{order.delivery_fee} DH</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Created At
              </h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), 'PPp')}
              </p>
            </div>
          </div>

          {order.completed_at && (
            <div className="bg-green-500/10 p-3 rounded-lg">
              <span className="text-sm text-green-700">
                Completed at: {format(new Date(order.completed_at), 'PPp')}
              </span>
            </div>
          )}

          {/* Quick Status Actions */}
          {nextStatus && order.status !== 'completed' && (
            <div className="flex gap-2 pt-4">
              <Button
                className="flex-1"
                onClick={() => {
                  onStatusChange(order.id, nextStatus.value);
                  onOpenChange(false);
                }}
              >
                Mark as {nextStatus.label}
              </Button>
              {order.status !== 'pending' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onStatusChange(order.id, 'completed');
                    onOpenChange(false);
                  }}
                >
                  Complete Order
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
