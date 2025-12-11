import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Moon, DollarSign, ShoppingCart, TrendingDown, AlertCircle } from "lucide-react";

interface LynCloseDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
  onSuccess: () => void;
}

const LynCloseDayDialog = ({ open, onOpenChange, restaurant, onSuccess }: LynCloseDayDialogProps) => {
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    cashRevenue: 0,
    cardRevenue: 0,
    walletRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyClosed, setAlreadyClosed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadDaySummary();
    }
  }, [open, restaurant.id]);

  const loadDaySummary = async () => {
    const today = format(new Date(), "yyyy-MM-dd");

    // Check if already closed
    const { data: existingClosing } = await supabase
      .from("lyn_daily_closings")
      .select("id")
      .eq("restaurant_id", restaurant.id)
      .eq("closing_date", today)
      .maybeSingle();

    if (existingClosing) {
      setAlreadyClosed(true);
      return;
    }

    setAlreadyClosed(false);

    // Get today's orders
    const { data: ordersData } = await supabase
      .from("lyn_restaurant_orders")
      .select("*")
      .eq("restaurant_id", restaurant.id)
      .gte("created_at", `${today}T00:00:00`)
      .eq("payment_status", "paid");

    const orders = ordersData || [];

    // Get today's expenses
    const { data: expensesData } = await supabase
      .from("lyn_expenses")
      .select("amount")
      .eq("restaurant_id", restaurant.id)
      .eq("expense_date", today);

    const expenses = expensesData || [];

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const cashRevenue = orders.filter(o => o.payment_method === "cash").reduce((sum, o) => sum + Number(o.total), 0);
    const cardRevenue = orders.filter(o => o.payment_method === "card").reduce((sum, o) => sum + Number(o.total), 0);
    const walletRevenue = orders.filter(o => o.payment_method === "wallet").reduce((sum, o) => sum + Number(o.total), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    setSummary({
      totalRevenue,
      totalOrders: orders.length,
      cashRevenue,
      cardRevenue,
      walletRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    });
  };

  const closeDay = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("lyn_daily_closings")
        .insert({
          restaurant_id: restaurant.id,
          closing_date: today,
          total_revenue: summary.totalRevenue,
          total_orders: summary.totalOrders,
          cash_revenue: summary.cashRevenue,
          card_revenue: summary.cardRevenue,
          wallet_revenue: summary.walletRevenue,
          total_expenses: summary.totalExpenses,
          net_profit: summary.netProfit,
          notes: notes || null,
          closed_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Day Closed",
        description: `Daily summary for ${format(new Date(), "MMMM d")} has been saved.`
      });

      setNotes("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5" />
            Close Day - {format(new Date(), "MMMM d, yyyy")}
          </DialogTitle>
        </DialogHeader>

        {alreadyClosed ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg font-medium">Day Already Closed</p>
            <p className="text-muted-foreground">
              Today's summary has already been recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-500/10 border-green-500/20">
                <CardContent className="p-3 text-center">
                  <DollarSign className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="font-bold text-green-600">{summary.totalRevenue.toFixed(2)} DH</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/10 border-blue-500/20">
                <CardContent className="p-3 text-center">
                  <ShoppingCart className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Orders</p>
                  <p className="font-bold text-blue-600">{summary.totalOrders}</p>
                </CardContent>
              </Card>
              <Card className="bg-red-500/10 border-red-500/20">
                <CardContent className="p-3 text-center">
                  <TrendingDown className="h-5 w-5 mx-auto text-red-600 mb-1" />
                  <p className="text-xs text-muted-foreground">Expenses</p>
                  <p className="font-bold text-red-600">{summary.totalExpenses.toFixed(2)} DH</p>
                </CardContent>
              </Card>
              <Card className={`${summary.netProfit >= 0 ? 'bg-purple-500/10 border-purple-500/20' : 'bg-orange-500/10 border-orange-500/20'}`}>
                <CardContent className="p-3 text-center">
                  <DollarSign className={`h-5 w-5 mx-auto ${summary.netProfit >= 0 ? 'text-purple-600' : 'text-orange-600'} mb-1`} />
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className={`font-bold ${summary.netProfit >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                    {summary.netProfit.toFixed(2)} DH
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Breakdown */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <p className="font-medium">Payment Breakdown</p>
              <div className="flex justify-between">
                <span>Cash</span>
                <span>{summary.cashRevenue.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span>Card</span>
                <span>{summary.cardRevenue.toFixed(2)} DH</span>
              </div>
              <div className="flex justify-between">
                <span>Wallet</span>
                <span>{summary.walletRevenue.toFixed(2)} DH</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about today's operations..."
                rows={3}
              />
            </div>

            {/* Submit */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={closeDay}
              disabled={loading}
            >
              <Moon className="h-4 w-4 mr-2" />
              {loading ? "Closing..." : "Close Day & Save Summary"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LynCloseDayDialog;
