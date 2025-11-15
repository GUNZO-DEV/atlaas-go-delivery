import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerId: string;
  totalAmount: number;
  paymentStatus: string;
  onSuccess: () => void;
}

const CANCEL_REASONS = [
  "Customer requested cancellation",
  "Restaurant unavailable",
  "No riders available",
  "Payment issue",
  "Duplicate order",
  "Other",
];

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderId,
  customerId,
  totalAmount,
  paymentStatus,
  onSuccess,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleCancel = async () => {
    if (!reason) {
      toast.error("Please select a cancellation reason");
      return;
    }

    setProcessing(true);
    try {
      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({ 
          status: "cancelled",
          notes: `Cancelled: ${reason}${notes ? ` - ${notes}` : ''}`
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Process refund if payment was made
      if (paymentStatus === "paid" || paymentStatus === "completed") {
        const { error: walletError } = await supabase
          .from("wallet_transactions")
          .insert({
            user_id: customerId,
            amount: totalAmount,
            transaction_type: "refund",
            description: `Refund for cancelled order - ${reason}`,
            order_id: orderId,
          });

        if (walletError) throw walletError;

        // Update customer wallet balance
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("profiles")
            .update({ wallet_balance: (profile.wallet_balance || 0) + totalAmount })
            .eq("id", customerId);
        }
      }

      // Create notification for customer
      await supabase.rpc("create_notification", {
        p_user_id: customerId,
        p_title: "Order Cancelled",
        p_message: `Your order has been cancelled. ${paymentStatus === "paid" ? `A refund of ${totalAmount} MAD has been added to your wallet.` : ""}`,
        p_type: "order_cancelled",
        p_order_id: orderId,
      });

      toast.success("Order cancelled successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("Failed to cancel order");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            This will cancel the order and process a refund if payment was made.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Cancellation Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {CANCEL_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional details..."
              rows={3}
            />
          </div>

          {(paymentStatus === "paid" || paymentStatus === "completed") && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Refund Information</p>
              <p className="text-sm text-muted-foreground">
                {totalAmount} MAD will be refunded to customer's wallet
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancel}
            disabled={processing}
          >
            {processing ? "Cancelling..." : "Cancel Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
