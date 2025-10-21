import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, TrendingUp, ShoppingBag } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { RewardsDialog } from "./RewardsDialog";

export default function LoyaltyCard() {
  const [points, setPoints] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    fetchLoyaltyPoints();
  }, []);

  const fetchLoyaltyPoints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("loyalty_points")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setPoints(data?.loyalty_points || 0);
    } catch (error: any) {
      console.error("Error fetching loyalty points:", error);
    }
  };

  const nextRewardAt = Math.ceil(points / 100) * 100;
  const progressToNextReward = ((points % 100) / 100) * 100;

  return (
    <>
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Loyalty Rewards
            </span>
            <Badge variant="secondary" className="text-lg font-bold">
              {points} pts
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress to next reward</span>
              <span className="font-semibold">{nextRewardAt} pts</span>
            </div>
            <Progress value={progressToNextReward} className="h-2" />
          </div>
          <div className="bg-background/50 p-3 rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Earn 1 point for every 10 MAD spent
            </p>
          </div>
          <Button 
            onClick={() => setShowRewards(true)}
            className="w-full"
            variant="default"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Redeem Rewards
          </Button>
        </CardContent>
      </Card>

      <RewardsDialog 
        open={showRewards}
        onOpenChange={setShowRewards}
        userPoints={points}
        onRedemptionSuccess={fetchLoyaltyPoints}
      />
    </>
  );
}
