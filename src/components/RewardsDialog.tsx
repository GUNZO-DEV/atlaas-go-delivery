import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Gift, Clock, CheckCircle } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  reward_type: string;
  reward_value: number;
  icon: string;
}

interface Redemption {
  id: string;
  coupon_code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  rewards: Reward;
}

interface RewardsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPoints: number;
  onRedemptionSuccess: () => void;
}

export const RewardsDialog = ({ open, onOpenChange, userPoints, onRedemptionSuccess }: RewardsDialogProps) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchRewards();
      fetchRedemptions();
    }
  }, [open]);

  const fetchRewards = async () => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_cost', { ascending: true });

    if (error) {
      console.error('Error fetching rewards:', error);
    } else {
      setRewards(data || []);
    }
  };

  const fetchRedemptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('loyalty_redemptions')
      .select('*, rewards(*)')
      .eq('user_id', user.id)
      .eq('used', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching redemptions:', error);
    } else {
      setRedemptions(data || []);
    }
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to redeem rewards",
        variant: "destructive",
      });
      setRedeeming(null);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('redeem_reward', {
        p_reward_id: rewardId,
        p_user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Reward redeemed! Your coupon code: ${data}`,
      });

      onRedemptionSuccess();
      fetchRedemptions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to redeem reward",
        variant: "destructive",
      });
    } finally {
      setRedeeming(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards Catalog
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            You have <span className="font-bold text-primary">{userPoints} points</span> to spend
          </p>
        </DialogHeader>

        {/* Active Redemptions */}
        {redemptions.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Your Active Coupons
            </h3>
            {redemptions.map((redemption) => (
              <Card key={redemption.id} className="p-4 bg-green-50 border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-lg">{redemption.coupon_code}</p>
                    <p className="text-sm text-muted-foreground">{redemption.rewards.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      <Clock className="h-3 w-3 mr-1" />
                      Expires {formatDate(redemption.expires_at)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Available Rewards */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Available Rewards</h3>
          {rewards.map((reward) => {
            const canAfford = userPoints >= reward.points_cost;
            const isRedeeming = redeeming === reward.id;

            return (
              <Card key={reward.id} className={`p-4 ${!canAfford && 'opacity-50'}`}>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex gap-3 flex-1">
                    <div className="text-3xl">{reward.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={canAfford ? "default" : "secondary"}>
                          {reward.points_cost} points
                        </Badge>
                        {reward.reward_type === 'coupon' && (
                          <span className="text-xs text-muted-foreground">
                            Save {reward.reward_value} DH
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={!canAfford || isRedeeming}
                    size="sm"
                  >
                    {isRedeeming ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redeeming...
                      </>
                    ) : (
                      'Redeem'
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
