import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, DollarSign, TrendingUp, TrendingDown, CreditCard,
  Banknote, Wallet, Calendar, Download
} from "lucide-react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";

interface LynFinancesManagementProps {
  restaurant: any;
}

const expenseCategories = [
  "Supplies", "Utilities", "Rent", "Staff Wages", "Equipment", 
  "Marketing", "Maintenance", "Insurance", "Other"
];

const LynFinancesManagement = ({ restaurant }: LynFinancesManagementProps) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [closings, setClosings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("today");
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: "Other",
    description: "",
    amount: "",
    payment_method: "cash"
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id, dateRange]);

  const getDateFilter = () => {
    const now = new Date();
    switch (dateRange) {
      case "today":
        return format(now, "yyyy-MM-dd");
      case "week":
        return format(subDays(now, 7), "yyyy-MM-dd");
      case "month":
        return format(startOfMonth(now), "yyyy-MM-dd");
      default:
        return format(now, "yyyy-MM-dd");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = getDateFilter();

      // Load orders
      const { data: ordersData } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .gte("created_at", `${startDate}T00:00:00`)
        .eq("payment_status", "paid");

      setOrders(ordersData || []);

      // Load expenses
      const { data: expensesData } = await supabase
        .from("lyn_expenses")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .gte("expense_date", startDate)
        .order("expense_date", { ascending: false });

      setExpenses(expensesData || []);

      // Load daily closings
      const { data: closingsData } = await supabase
        .from("lyn_daily_closings")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("closing_date", { ascending: false })
        .limit(30);

      setClosings(closingsData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("lyn_expenses")
        .insert({
          restaurant_id: restaurant.id,
          category: newExpense.category,
          description: newExpense.description,
          amount: parseFloat(newExpense.amount),
          payment_method: newExpense.payment_method,
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Expense Added",
        description: "The expense has been recorded"
      });

      setNewExpense({ category: "Other", description: "", amount: "", payment_method: "cash" });
      setExpenseDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Calculate stats
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalRevenue - totalExpenses;

  const revenueByPayment = {
    cash: orders.filter(o => o.payment_method === "cash").reduce((sum, o) => sum + Number(o.total), 0),
    card: orders.filter(o => o.payment_method === "card").reduce((sum, o) => sum + Number(o.total), 0),
    wallet: orders.filter(o => o.payment_method === "wallet").reduce((sum, o) => sum + Number(o.total), 0)
  };

  const expensesByCategory = expenseCategories.map(cat => ({
    category: cat,
    amount: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0)
  })).filter(e => e.amount > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Overview</h2>
          <p className="text-muted-foreground">Track revenue, expenses, and daily closings</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(v) => setNewExpense({...newExpense, category: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description *</Label>
                  <Input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    placeholder="Describe the expense..."
                  />
                </div>
                <div>
                  <Label>Amount (DH) *</Label>
                  <Input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Payment Method</Label>
                  <Select 
                    value={newExpense.payment_method} 
                    onValueChange={(v) => setNewExpense({...newExpense, payment_method: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addExpense} className="w-full">
                  Add Expense
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{totalRevenue.toFixed(2)} DH</p>
                <p className="text-xs text-muted-foreground mt-1">{orders.length} orders</p>
              </div>
              <div className="h-14 w-14 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold text-red-600">{totalExpenses.toFixed(2)} DH</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} entries</p>
              </div>
              <div className="h-14 w-14 bg-red-500/20 rounded-full flex items-center justify-center">
                <TrendingDown className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-blue-500/10 to-blue-500/5 border-blue-500/20' : 'from-orange-500/10 to-orange-500/5 border-orange-500/20'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Profit</p>
                <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  {netProfit.toFixed(2)} DH
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0}% margin
                </p>
              </div>
              <div className={`h-14 w-14 ${netProfit >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20'} rounded-full flex items-center justify-center`}>
                <DollarSign className={`h-7 w-7 ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Breakdown</TabsTrigger>
          <TabsTrigger value="expenses">Expenses ({expenses.length})</TabsTrigger>
          <TabsTrigger value="closings">Daily Closings</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cash</p>
                    <p className="text-xl font-bold">{revenueByPayment.cash.toFixed(2)} DH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Card</p>
                    <p className="text-xl font-bold">{revenueByPayment.card.toFixed(2)} DH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet</p>
                    <p className="text-xl font-bold">{revenueByPayment.wallet.toFixed(2)} DH</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No expenses recorded</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {expenses.map(expense => (
                <Card key={expense.id}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-red-500/10 rounded-full flex items-center justify-center">
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{expense.description}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{expense.category}</Badge>
                          <span>{format(new Date(expense.expense_date), "MMM d")}</span>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">-{Number(expense.amount).toFixed(2)} DH</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="closings" className="space-y-4">
          {closings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No daily closings recorded</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {closings.map(closing => (
                <Card key={closing.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-semibold">
                        {format(new Date(closing.closing_date), "EEEE, MMM d, yyyy")}
                      </p>
                      <Badge variant={Number(closing.net_profit) >= 0 ? "default" : "destructive"}>
                        {Number(closing.net_profit) >= 0 ? "Profit" : "Loss"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium text-green-600">{Number(closing.total_revenue).toFixed(2)} DH</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Orders</p>
                        <p className="font-medium">{closing.total_orders}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expenses</p>
                        <p className="font-medium text-red-600">{Number(closing.total_expenses).toFixed(2)} DH</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Profit</p>
                        <p className={`font-medium ${Number(closing.net_profit) >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {Number(closing.net_profit).toFixed(2)} DH
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LynFinancesManagement;
