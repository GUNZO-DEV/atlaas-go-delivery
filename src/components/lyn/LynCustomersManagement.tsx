import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Users, Star, MessageSquare, TrendingUp,
  Phone, Mail, Calendar
} from "lucide-react";
import { format } from "date-fns";

interface LynCustomersManagementProps {
  restaurant: any;
}

interface Customer {
  name: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  averageRating?: number;
}

const LynCustomersManagement = ({ restaurant }: LynCustomersManagementProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load orders to aggregate customer data
      const { data: ordersData } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .not("customer_phone", "is", null);

      // Aggregate customer data
      const customerMap = new Map<string, Customer>();
      
      (ordersData || []).forEach(order => {
        if (!order.customer_phone) return;
        
        const existing = customerMap.get(order.customer_phone);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalSpent += Number(order.total);
          if (new Date(order.created_at) > new Date(existing.lastOrder)) {
            existing.lastOrder = order.created_at;
          }
        } else {
          customerMap.set(order.customer_phone, {
            name: order.customer_name || "Unknown",
            phone: order.customer_phone,
            totalOrders: 1,
            totalSpent: Number(order.total),
            lastOrder: order.created_at
          });
        }
      });

      setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));

      // Load feedback
      const { data: feedbackData } = await supabase
        .from("lyn_customer_feedback")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setFeedback(feedbackData || []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const stats = {
    totalCustomers: customers.length,
    repeatCustomers: customers.filter(c => c.totalOrders > 1).length,
    averageSpend: customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length 
      : 0,
    averageRating: feedback.length > 0
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length
      : 0
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

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
      <div>
        <h2 className="text-2xl font-bold text-foreground">Customers & Feedback</h2>
        <p className="text-muted-foreground">Track customer profiles, order history, and feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>
                <p className="text-xl font-bold">{stats.totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Repeat Customers</p>
                <p className="text-xl font-bold">{stats.repeatCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Spend</p>
                <p className="text-xl font-bold">{stats.averageSpend.toFixed(0)} DH</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-xl font-bold">{stats.averageRating.toFixed(1)}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="feedback">Feedback ({feedback.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Customer List */}
          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No customers found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer, index) => (
                <Card key={customer.phone}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-primary">
                            {customer.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{customer.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-muted-foreground">Orders</p>
                          <p className="font-semibold">{customer.totalOrders}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Total Spent</p>
                          <p className="font-semibold text-primary">{customer.totalSpent.toFixed(0)} DH</p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground">Last Order</p>
                          <p className="font-semibold">{format(new Date(customer.lastOrder), "MMM d")}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          {feedback.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No feedback yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {feedback.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{item.customer_name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      {renderStars(item.rating)}
                    </div>
                    {item.comment && (
                      <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-3 rounded-lg">
                        "{item.comment}"
                      </p>
                    )}
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

export default LynCustomersManagement;
