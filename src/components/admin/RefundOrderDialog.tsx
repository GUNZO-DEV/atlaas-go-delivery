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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";

interface RefundOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerId: string;
  totalAmount: number;
  onSuccess: () => void;
}

export function RefundOrderDialog({
  open,
  onOpenChange,
  orderId,
  customerId,
  totalAmount,
  onSuccess,
}: RefundOrderDialogProps) {
  const [refundType, setRefundType] = useState<"full" | "partial">("full");
  const [refundAmount, setRefundAmount] = useState(totalAmount);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleRefund = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for the refund");
      return;
    }

    if (refundType === "partial" && (refundAmount <= 0 || refundAmount > totalAmount)) {
      toast.error("Invalid refund amount");
      return;
    }

    setProcessing(true);
    try {
      const finalAmount = refundType === "full" ? totalAmount : refundAmount;

      // Add refund to wallet transactions
      const { error: walletError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: customerId,
          amount: finalAmount,
          transaction_type: "refund",
          description: `${refundType === "full" ? "Full" : "Partial"} refund - ${reason}`,
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
          .update({ 
            wallet_balance: (profile.wallet_balance || 0) + finalAmount 
          })
          .eq("id", customerId);
      }

      // Update order payment status
      await supabase
        .from("orders")
        .update({ 
          payment_status: refundType === "full" ? "refunded" : "partial_refund",
          discount_amount: (await supabase
            .from("orders")
            .select("discount_amount")
            .eq("id", orderId)
            .single()).data?.discount_amount || 0 + finalAmount
        })
        .eq("id", orderId);

      // Create notification
      await supabase.rpc("create_notification", {
        p_user_id: customerId,
        p_title: "Refund Processed",
        p_message: `A ${refundType} refund of ${finalAmount} MAD has been added to your wallet.`,
        p_type: "refund_processed",
        p_order_id: orderId,
      });

      toast.success("Refund processed successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Issue a refund to the customer's wallet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Refund Type</Label>
            <RadioGroup value={refundType} onValueChange={(v) => setRefundType(v as "full" | "partial")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">
                  Full Refund ({totalAmount} MAD)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="cursor-pointer">
                  Partial Refund
                </Label>
              </div>
            </RadioGroup>
          </div>

          {refundType === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="amount">Refund Amount (MAD) *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                max={totalAmount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {totalAmount} MAD
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Refund *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this refund is being issued..."
              rows={3}
            />
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Refund Summary</p>
            <p className="text-sm text-muted-foreground">
              {refundType === "full" ? totalAmount : refundAmount} MAD will be added to customer's wallet
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRefund} disabled={processing}>
            {processing ? "Processing..." : "Process Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
