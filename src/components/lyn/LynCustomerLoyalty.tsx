import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Users, Star, Crown, Gift, Tag, Plus, Edit,
  Phone, Award, AlertTriangle, GraduationCap, Cake
} from "lucide-react";
import { format } from "date-fns";

interface LynCustomerLoyaltyProps {
  restaurant: any;
}

const tagOptions = ["VIP", "Regular", "Student", "Vegetarian", "Vegan", "Allergies", "Birthday Club", "Corporate"];

const LynCustomerLoyalty = ({ restaurant }: LynCustomerLoyaltyProps) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    tags: [] as string[],
    allergies: "",
    preferences: "",
    birthday: "",
    is_vip: false,
    notes: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [restaurant.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load loyalty profiles
      const { data: loyaltyData } = await supabase
        .from("lyn_customer_loyalty")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("total_spent", { ascending: false });

      // Also aggregate from orders for customers without profiles
      const { data: ordersData } = await supabase
        .from("lyn_restaurant_orders")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .not("customer_phone", "is", null);

      const customerMap = new Map<string, any>();
      
      // Add loyalty profiles
      loyaltyData?.forEach(profile => {
        customerMap.set(profile.customer_phone, profile);
      });

      // Aggregate order data
      ordersData?.forEach(order => {
        if (!order.customer_phone) return;
        
        const existing = customerMap.get(order.customer_phone);
        if (existing) {
          // Update totals from orders if not in loyalty table
          if (!existing.id.startsWith('lyn_customer_loyalty')) {
            existing.total_visits = (existing.total_visits || 0) + 1;
            existing.total_spent = (existing.total_spent || 0) + Number(order.total);
          }
        } else {
          // Create temporary profile from orders
          customerMap.set(order.customer_phone, {
            id: `temp-${order.customer_phone}`,
            customer_phone: order.customer_phone,
            customer_name: order.customer_name || "Unknown",
            total_visits: 1,
            total_spent: Number(order.total),
            loyalty_points: 0,
            tags: [],
            is_vip: false
          });
        }
      });

      setCustomers(Array.from(customerMap.values()).sort((a, b) => b.total_spent - a.total_spent));
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveCustomer = async () => {
    if (!formData.customer_phone) {
      toast({ title: "Phone number required", variant: "destructive" });
      return;
    }

    try {
      const data = {
        restaurant_id: restaurant.id,
        customer_phone: formData.customer_phone,
        customer_name: formData.customer_name || null,
        tags: formData.tags,
        allergies: formData.allergies || null,
        preferences: formData.preferences || null,
        birthday: formData.birthday || null,
        is_vip: formData.is_vip,
        notes: formData.notes || null
      };

      if (editingCustomer && !editingCustomer.id.startsWith('temp-')) {
        const { error } = await supabase
          .from("lyn_customer_loyalty")
          .update(data)
          .eq("id", editingCustomer.id);
        if (error) throw error;
        toast({ title: "Customer Updated" });
      } else {
        const { error } = await supabase
          .from("lyn_customer_loyalty")
          .upsert(data, { onConflict: 'restaurant_id,customer_phone' });
        if (error) throw error;
        toast({ title: "Customer Saved" });
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addPoints = async (customerId: string, points: number) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer || customer.id.startsWith('temp-')) return;

      const { error } = await supabase
        .from("lyn_customer_loyalty")
        .update({ loyalty_points: (customer.loyalty_points || 0) + points })
        .eq("id", customerId);
      
      if (error) throw error;
      toast({ title: `Added ${points} points` });
      loadData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const editCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      customer_name: customer.customer_name || "",
      customer_phone: customer.customer_phone,
      tags: customer.tags || [],
      allergies: customer.allergies || "",
      preferences: customer.preferences || "",
      birthday: customer.birthday || "",
      is_vip: customer.is_vip || false,
      notes: customer.notes || ""
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({
      customer_name: "", customer_phone: "", tags: [], allergies: "",
      preferences: "", birthday: "", is_vip: false, notes: ""
    });
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const filteredCustomers = customers.filter(c =>
    (c.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_phone.includes(searchTerm)
  );

  const vipCustomers = filteredCustomers.filter(c => c.is_vip);
  const regularCustomers = filteredCustomers.filter(c => !c.is_vip);

  const stats = {
    total: customers.length,
    vip: customers.filter(c => c.is_vip).length,
    withAllergies: customers.filter(c => c.allergies).length,
    totalPoints: customers.reduce((sum, c) => sum + (c.loyalty_points || 0), 0)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Customer Loyalty</h2>
          <p className="text-muted-foreground">Manage customer profiles, tags, and rewards</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Customer</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    placeholder="+212..."
                  />
                </div>
              </div>
              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tagOptions.map(tag => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="vip"
                    checked={formData.is_vip}
                    onChange={(e) => setFormData({...formData, is_vip: e.target.checked})}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="vip" className="cursor-pointer flex items-center gap-1">
                    <Crown className="h-4 w-4 text-yellow-600" />VIP Customer
                  </Label>
                </div>
              </div>
              <div>
                <Label>Allergies / Dietary</Label>
                <Input
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="e.g., Nuts, Gluten-free"
                />
              </div>
              <div>
                <Label>Preferences</Label>
                <Input
                  value={formData.preferences}
                  onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                  placeholder="e.g., Window seat, extra spicy"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
              <Button onClick={saveCustomer} className="w-full">
                {editingCustomer ? "Update" : "Add"} Customer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">VIP Members</p>
                <p className="text-xl font-bold">{stats.vip}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Allergies</p>
                <p className="text-xl font-bold">{stats.withAllergies}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* Customer Lists */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({filteredCustomers.length})</TabsTrigger>
          <TabsTrigger value="vip">VIP ({vipCustomers.length})</TabsTrigger>
        </TabsList>

        {[
          { value: "all", data: filteredCustomers },
          { value: "vip", data: vipCustomers }
        ].map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-3">
            {tab.data.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">No customers found</CardContent></Card>
            ) : (
              tab.data.map(customer => (
                <Card key={customer.id} className={customer.is_vip ? "border-yellow-300 bg-yellow-50/30 dark:bg-yellow-900/10" : ""}>
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                          customer.is_vip ? "bg-yellow-500/20" : "bg-primary/10"
                        }`}>
                          {customer.is_vip ? (
                            <Crown className="h-6 w-6 text-yellow-600" />
                          ) : (
                            <span className="font-semibold text-primary">
                              {(customer.customer_name || "?").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{customer.customer_name || "Unknown"}</p>
                            {customer.is_vip && <Badge className="bg-yellow-500">VIP</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.customer_phone}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {customer.tags?.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                            {customer.allergies && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {customer.allergies}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Visits</p>
                          <p className="font-semibold">{customer.total_visits || 0}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Spent</p>
                          <p className="font-semibold text-primary">{(customer.total_spent || 0).toFixed(0)} DH</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">Points</p>
                          <p className="font-semibold text-purple-600">{customer.loyalty_points || 0}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => editCustomer(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {!customer.id.startsWith('temp-') && (
                            <Button size="sm" variant="outline" onClick={() => addPoints(customer.id, 10)}>
                              <Gift className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default LynCustomerLoyalty;
