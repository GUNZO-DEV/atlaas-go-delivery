import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

const WalletCard = () => {
  const { toast } = useToast();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch balance
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wallet_balance")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setBalance(profile.wallet_balance || 0);

      // Fetch transactions
      const { data: txData, error: txError } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(txData || []);
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (amount < 10) {
      toast({
        title: "Minimum top-up",
        description: "Minimum top-up amount is 10 MAD",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update balance
      const newBalance = balance + amount;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Record transaction
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          user_id: user.id,
          amount: amount,
          transaction_type: "credit",
          description: "Wallet top-up",
        });

      if (txError) throw txError;

      toast({
        title: "Top-up successful!",
        description: `${amount.toFixed(2)} MAD added to your wallet`,
      });

      setTopUpAmount("");
      setTopUpDialogOpen(false);
      fetchWalletData();
    } catch (error: any) {
      console.error("Error topping up wallet:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const quickAmounts = [50, 100, 200, 500];

  return (
    <Card className="bg-gradient-to-br from-purple-500 to-purple-700 text-white animate-scale-in">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Wallet className="h-5 w-5" />
              ATLAAS Wallet
            </CardTitle>
            <CardDescription className="text-purple-100">
              Your digital wallet balance
            </CardDescription>
          </div>
          <Dialog open={topUpDialogOpen} onOpenChange={setTopUpDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white text-purple-700 hover:bg-purple-50">
                <Plus className="h-4 w-4 mr-1" />
                Top Up
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Top Up Wallet</DialogTitle>
                <DialogDescription>
                  Add funds to your ATLAAS wallet for faster checkout
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (MAD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    min="10"
                  />
                  <p className="text-xs text-muted-foreground">Minimum: 10 MAD</p>
                </div>
                <div>
                  <Label className="mb-2 block">Quick amounts</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => setTopUpAmount(amount.toString())}
                      >
                        {amount}
                      </Button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleTopUp} className="w-full">
                  Add {topUpAmount ? `${topUpAmount} MAD` : "Funds"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-purple-100 mb-1">Available Balance</p>
            <p className="text-4xl font-bold">{balance.toFixed(2)} MAD</p>
          </div>

          {transactions.length > 0 && (
            <div className="mt-4 bg-white/10 rounded-lg p-3">
              <h4 className="text-sm font-semibold mb-3 text-white">Recent Transactions</h4>
              <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between py-2 border-b border-white/10 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {tx.transaction_type === "credit" ? (
                          <ArrowUpRight className="h-4 w-4 text-green-300" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-300" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">
                            {tx.description}
                          </p>
                          <p className="text-xs text-purple-100">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={tx.transaction_type === "credit" ? "default" : "secondary"}
                        className={
                          tx.transaction_type === "credit"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-red-500 text-white hover:bg-red-600"
                        }
                      >
                        {tx.transaction_type === "credit" ? "+" : ""}
                        {tx.amount.toFixed(2)} MAD
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletCard;
