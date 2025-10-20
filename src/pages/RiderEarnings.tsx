import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, DollarSign, TrendingUp, Calendar } from "lucide-react";

interface Earning {
  id: string;
  order_id: string;
  base_fee: number;
  distance_bonus: number;
  tip_amount: number;
  total_earned: number;
  paid_out: boolean;
  created_at: string;
}

export default function RiderEarnings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    thisWeek: 0,
    thisMonth: 0,
    pendingPayout: 0,
  });

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      await fetchEarnings(user.id);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async (riderId: string) => {
    const { data, error } = await supabase
      .from("rider_earnings")
      .select("*")
      .eq("rider_id", riderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setEarnings(data || []);

    // Calculate stats
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalEarned = data?.reduce((sum, e) => sum + Number(e.total_earned), 0) || 0;
    const thisWeek = data?.filter(e => new Date(e.created_at) >= weekAgo)
      .reduce((sum, e) => sum + Number(e.total_earned), 0) || 0;
    const thisMonth = data?.filter(e => new Date(e.created_at) >= monthAgo)
      .reduce((sum, e) => sum + Number(e.total_earned), 0) || 0;
    const pendingPayout = data?.filter(e => !e.paid_out)
      .reduce((sum, e) => sum + Number(e.total_earned), 0) || 0;

    setStats({ totalEarned, thisWeek, thisMonth, pendingPayout });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/rider")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Earnings</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalEarned.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.thisWeek.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.thisMonth.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold text-primary">{stats.pendingPayout.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Earnings History</CardTitle>
            <CardDescription>Your delivery earnings breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {earnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No earnings yet</p>
            ) : (
              <div className="space-y-4">
                {earnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">Order #{earning.order_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(earning.created_at).toLocaleDateString()} at{" "}
                        {new Date(earning.created_at).toLocaleTimeString()}
                      </p>
                      <div className="flex gap-4 mt-2 text-sm">
                        <span>Base: {earning.base_fee} MAD</span>
                        <span>Distance: {earning.distance_bonus} MAD</span>
                        {earning.tip_amount > 0 && <span>Tip: {earning.tip_amount} MAD</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{earning.total_earned} MAD</p>
                      <Badge variant={earning.paid_out ? "default" : "secondary"}>
                        {earning.paid_out ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
