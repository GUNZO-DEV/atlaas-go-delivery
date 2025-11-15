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

interface BlockUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  currentStatus: string;
  onSuccess: () => void;
}

const BLOCK_REASONS = [
  "Fraudulent activity",
  "Payment issues",
  "Abusive behavior",
  "Terms of service violation",
  "Spam or bot activity",
  "Multiple complaints",
  "Other",
];

export function BlockUserDialog({
  open,
  onOpenChange,
  userId,
  userName,
  currentStatus,
  onSuccess,
}: BlockUserDialogProps) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const isBlocking = currentStatus === "active";

  const handleSubmit = async () => {
    if (isBlocking && !reason) {
      toast.error("Please select a reason for blocking");
      return;
    }

    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Not authenticated");

      const updateData: any = {
        account_status: isBlocking ? "blocked" : "active",
      };

      if (isBlocking) {
        updateData.blocked_at = new Date().toISOString();
        updateData.blocked_by = user.id;
        updateData.block_reason = `${reason}${notes ? ` - ${notes}` : ""}`;
      } else {
        updateData.blocked_at = null;
        updateData.blocked_by = null;
        updateData.block_reason = null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);

      if (error) throw error;

      // Create notification
      await supabase.rpc("create_notification", {
        p_user_id: userId,
        p_title: isBlocking ? "Account Blocked" : "Account Unblocked",
        p_message: isBlocking 
          ? `Your account has been blocked. Reason: ${reason}` 
          : "Your account has been unblocked. You can now use the platform.",
        p_type: isBlocking ? "account_blocked" : "account_unblocked",
      });

      toast.success(
        isBlocking 
          ? `${userName}'s account has been blocked` 
          : `${userName}'s account has been unblocked`
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating account status:", error);
      toast.error("Failed to update account status");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isBlocking ? "Block User Account" : "Unblock User Account"}
          </DialogTitle>
          <DialogDescription>
            {isBlocking
              ? `This will prevent ${userName} from placing orders and accessing most platform features.`
              : `This will restore ${userName}'s full access to the platform.`}
          </DialogDescription>
        </DialogHeader>

        {isBlocking && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Blocking *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {BLOCK_REASONS.map((r) => (
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
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isBlocking ? "destructive" : "default"}
            onClick={handleSubmit}
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : isBlocking
              ? "Block User"
              : "Unblock User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
