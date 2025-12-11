import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Clock, Check, X, UtensilsCrossed, Package, Truck, Phone, User } from "lucide-react";

interface LynOrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
  onStatusUpdate: (status: string) => void;
}

const LynOrderDetailsDialog = ({ open, onOpenChange, order, onStatusUpdate }: LynOrderDetailsDialogProps) => {
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

  const items = (order.items || []) as any[];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{order.receipt_number}</span>
            <Badge className={getStatusColor(order.status)} variant="outline">
              {order.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Info */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              {getTypeIcon(order.order_type)}
            </div>
            <div>
              <p className="font-medium capitalize">{order.order_type.replace("_", " ")}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), "MMM d, yyyy • HH:mm")}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          {(order.customer_name || order.customer_phone || order.table_number) && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">Customer</h4>
              <div className="space-y-1">
                {order.customer_name && (
                  <p className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {order.customer_name}
                  </p>
                )}
                {order.customer_phone && (
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {order.customer_phone}
                  </p>
                )}
                {order.table_number && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Table:</span> {order.table_number}
                  </p>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Items */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Items</h4>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No items</p>
            ) : (
              <div className="space-y-2">
                {items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} DH</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{Number(order.subtotal).toFixed(2)} DH</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span>-{Number(order.discount).toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>{Number(order.total).toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Payment</span>
              <span className="capitalize">{order.payment_method} • {order.payment_status}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm bg-muted/50 p-2 rounded">{order.notes}</p>
              </div>
            </>
          )}

          {/* Actions */}
          {!["completed", "cancelled"].includes(order.status) && (
            <>
              <Separator />
              <div className="flex gap-2">
                {order.status === "pending" && (
                  <Button className="flex-1" onClick={() => onStatusUpdate("preparing")}>
                    <Clock className="h-4 w-4 mr-2" />
                    Start Preparing
                  </Button>
                )}
                {order.status === "preparing" && (
                  <Button className="flex-1" onClick={() => onStatusUpdate("ready")}>
                    <Check className="h-4 w-4 mr-2" />
                    Mark Ready
                  </Button>
                )}
                {order.status === "ready" && (
                  <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => onStatusUpdate("completed")}>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Order
                  </Button>
                )}
                <Button variant="destructive" onClick={() => onStatusUpdate("cancelled")}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LynOrderDetailsDialog;
