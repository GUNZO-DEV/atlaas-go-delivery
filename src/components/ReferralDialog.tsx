import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, Users, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

interface ReferralStats {
  referralCode: string;
  referralCount: number;
  referrals: Array<{
    id: string;
    created_at: string;
    discount_used: boolean;
  }>;
}

export const ReferralDialog = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchReferralStats();
    }
  }, [open]);

  const fetchReferralStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's referral code and count
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("referral_code, referral_count")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Get referral history
      const { data: referrals, error: referralsError } = await supabase
        .from("referrals")
        .select("id, created_at, discount_used")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (referralsError) throw referralsError;

      setStats({
        referralCode: profile.referral_code,
        referralCount: profile.referral_count || 0,
        referrals: referrals || [],
      });
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      toast.error("Failed to load referral information");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/auth?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    if (!stats) return;
    
    const referralLink = `${window.location.origin}/auth?ref=${stats.referralCode}`;
    const text = `Join Atlaas and get 10% off your first order! Use my referral code: ${stats.referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join Atlaas",
        text: text,
        url: referralLink,
      });
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Gift className="w-4 h-4" />
          Refer & Earn
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Refer Friends & Get 10% Off
          </DialogTitle>
          <DialogDescription>
            Share your referral code and both you and your friend get 10% off on your next orders!
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4 py-4">
            <div className="h-20 bg-muted animate-pulse rounded-lg" />
            <div className="h-32 bg-muted animate-pulse rounded-lg" />
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Referral Code Card */}
            <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">Your Referral Code</p>
                  <div className="text-3xl font-bold tracking-wider text-primary">
                    {stats.referralCode}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="secondary"
                      className="flex-1 gap-2"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Link
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={shareReferral}
                      className="flex-1 gap-2"
                    >
                      <Gift className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats.referralCount}</div>
                  <p className="text-sm text-muted-foreground">Friends Referred</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Percent className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold">10%</div>
                  <p className="text-sm text-muted-foreground">Discount Off</p>
                </CardContent>
              </Card>
            </div>

            {/* How it works */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">How it works:</h4>
              <ol className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  Share your unique referral code with friends
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  They sign up using your code and get 10% off
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  You get 10% off on your next order too!
                </li>
              </ol>
            </div>

            {/* Recent Referrals */}
            {stats.referrals.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Recent Referrals</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {stats.referrals.slice(0, 5).map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                    >
                      <span className="text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </span>
                      <span className={referral.discount_used ? "text-green-500" : "text-muted-foreground"}>
                        {referral.discount_used ? "✓ Used" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Unable to load referral information
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
