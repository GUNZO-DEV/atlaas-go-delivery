import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Bike, Star, MapPin } from "lucide-react";
import { toast } from "sonner";

interface Rider {
  id: string;
  rider_id: string;
  full_name: string;
  phone: string;
  rating: number;
  total_deliveries: number;
  is_available: boolean;
  city: string;
}

interface AssignRiderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSuccess: () => void;
}

export function AssignRiderDialog({
  open,
  onOpenChange,
  orderId,
  onSuccess,
}: AssignRiderDialogProps) {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAvailableRiders();
    }
  }, [open]);

  const fetchAvailableRiders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("rider_profiles")
        .select(`
          id,
          rider_id,
          phone,
          rating,
          total_deliveries,
          is_available,
          city,
          profiles!rider_profiles_rider_id_fkey(full_name)
        `)
        .eq("status", "approved")
        .eq("is_available", true)
        .order("rating", { ascending: false });

      if (error) throw error;

      const formattedRiders = data?.map((rider: any) => ({
        id: rider.id,
        rider_id: rider.rider_id,
        full_name: rider.profiles?.full_name || "Unknown",
        phone: rider.phone,
        rating: rider.rating || 0,
        total_deliveries: rider.total_deliveries || 0,
        is_available: rider.is_available,
        city: rider.city,
      })) || [];

      setRiders(formattedRiders);
    } catch (error) {
      console.error("Error fetching riders:", error);
      toast.error("Failed to load available riders");
    } finally {
      setLoading(false);
    }
  };

  const assignRider = async (riderId: string) => {
    setAssigning(true);
    try {
      // Update order with rider
      const { error: orderError } = await supabase
        .from("orders")
        .update({ 
          rider_id: riderId,
          status: "picked_up"
        })
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Create notification for rider
      const { error: notificationError } = await supabase.rpc(
        "create_notification",
        {
          p_user_id: riderId,
          p_title: "New Delivery Assignment",
          p_message: "You have been assigned a new delivery. Please check your dashboard.",
          p_type: "order_assigned",
          p_order_id: orderId,
        }
      );

      if (notificationError) console.error("Notification error:", notificationError);

      toast.success("Rider assigned successfully");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning rider:", error);
      toast.error("Failed to assign rider");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Rider to Order</DialogTitle>
          <DialogDescription>
            Select an available rider to assign to this order
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">Loading available riders...</div>
          ) : riders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No available riders at the moment
            </div>
          ) : (
            riders.map((rider) => (
              <div
                key={rider.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4 text-primary" />
                    <span className="font-medium">{rider.full_name}</span>
                    <Badge variant="secondary">
                      <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                      {rider.rating.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {rider.city}
                    </span>
                    <span>{rider.total_deliveries} deliveries</span>
                    <span>{rider.phone}</span>
                  </div>
                </div>
                <Button
                  onClick={() => assignRider(rider.rider_id)}
                  disabled={assigning}
                  size="sm"
                >
                  Assign
                </Button>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
