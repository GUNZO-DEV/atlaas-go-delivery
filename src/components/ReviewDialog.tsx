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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import StarRating from "./StarRating";
import { Loader2 } from "lucide-react";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  restaurantId: string;
  riderId?: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewDialog({
  open,
  onOpenChange,
  orderId,
  restaurantId,
  riderId,
  onReviewSubmitted,
}: ReviewDialogProps) {
  const { toast } = useToast();
  const [restaurantRating, setRestaurantRating] = useState(5);
  const [riderRating, setRiderRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("reviews").insert({
        order_id: orderId,
        customer_id: user.id,
        restaurant_id: restaurantId,
        rider_id: riderId || null,
        restaurant_rating: restaurantRating,
        rider_rating: riderId ? riderRating : null,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      onOpenChange(false);
      onReviewSubmitted?.();
      
      // Reset form
      setRestaurantRating(5);
      setRiderRating(5);
      setComment("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with this order
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Restaurant Rating */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              How was the food?
            </label>
            <StarRating
              rating={restaurantRating}
              size="lg"
              interactive
              onRatingChange={setRestaurantRating}
            />
          </div>

          {/* Rider Rating */}
          {riderId && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                How was the delivery?
              </label>
              <StarRating
                rating={riderRating}
                size="lg"
                interactive
                onRatingChange={setRiderRating}
              />
            </div>
          )}

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional comments (optional)
            </label>
            <Textarea
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
