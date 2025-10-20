import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, DollarSign, TrendingUp, Download, Mail, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_available: boolean;
}

interface Order {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  commission_amount: number;
  created_at: string;
  customer_id: string;
  delivery_address: string;
  notes: string;
  order_items: {
    id: string;
    quantity: number;
    price: number;
    menu_item: {
      name: string;
    };
  }[];
}

interface OrderWithCustomer extends Order {
  customer: {
    full_name: string;
    phone: string;
    email?: string;
  };
}

export default function MerchantDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [orders, setOrders] = useState<OrderWithCustomer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });

  // New menu item form
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    image_url: "",
  });
  const [addingItem, setAddingItem] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant) {
      fetchOrders();
      fetchMenuItems();
      setupRealtimeSubscription();
    }
  }, [restaurant]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "merchant")
      .limit(1);

    if (!roles || roles.length === 0) {
      toast({
        title: "Access Denied",
        description: "You don't have merchant access",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchRestaurant = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;
      setRestaurant((data && data[0]) || null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!restaurant) return;

    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(
            id,
            quantity,
            price,
            menu_item:menu_items(name)
          )
        `)
        .eq("restaurant_id", restaurant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch customer details separately
      const ordersWithCustomers = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: profileArr } = await supabase
            .from("profiles")
            .select("full_name, phone")
            .eq("id", order.customer_id)
            .limit(1);

          const profile = profileArr?.[0];

          return {
            ...order,
            customer: profile || { full_name: "Unknown", phone: "N/A" },
          };
        })
      );

      setOrders(ordersWithCustomers as OrderWithCustomer[]);
      calculateStats(ordersData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const fetchMenuItems = async () => {
    if (!restaurant) return;

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .order("category", { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const calculateStats = (orders: Order[]) => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(
      (o) => new Date(o.created_at).toDateString() === today
    );

    setStats({
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      totalRevenue: orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total_amount) - Number(o.commission_amount || 0), 0),
    });
  };

  const setupRealtimeSubscription = () => {
    if (!restaurant) return;

    const channel = supabase
      .channel("merchant-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateOrderStatus = async (orderId: string, newStatus: "pending" | "confirmed" | "preparing" | "ready_for_pickup" | "picked_up" | "delivering" | "delivered" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Order status updated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addMenuItem = async () => {
    if (!restaurant) return;

    setAddingItem(true);
    try {
      const { error } = await supabase.from("menu_items").insert({
        restaurant_id: restaurant.id,
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        category: newItem.category,
        image_url: newItem.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400`,
        is_available: true,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item added",
      });

      setNewItem({ name: "", description: "", price: "", category: "Main Course", image_url: "" });
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingItem(false);
    }
  };

  const toggleMenuItem = async (itemId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_available: !isAvailable })
        .eq("id", itemId);

      if (error) throw error;
      fetchMenuItems();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToExcel = (order: OrderWithCustomer) => {
    const csvContent = [
      ["Atlas Tajine House - Receipt"],
      [""],
      ["Order ID", order.id],
      ["Date", new Date(order.created_at).toLocaleString()],
      ["Customer", order.customer?.full_name || "Unknown"],
      ["Phone", order.customer?.phone || "N/A"],
      ["Delivery Address", order.delivery_address],
      [""],
      ["Item", "Quantity", "Price"],
      ...order.order_items.map((item) => [
        item.menu_item?.name,
        item.quantity,
        `${item.price} MAD`,
      ]),
      [""],
      ["Subtotal", "", `${order.total_amount} MAD`],
      ["Delivery Fee", "", `${order.delivery_fee} MAD`],
      ["Commission", "", `-${order.commission_amount || 0} MAD`],
      ["Total", "", `${order.total_amount + order.delivery_fee - (order.commission_amount || 0)} MAD`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${order.id}.csv`;
    a.click();
  };

  const sendReceiptEmail = async (order: OrderWithCustomer) => {
    toast({
      title: "Email Feature",
      description: "Email functionality would be integrated with Resend here",
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Restaurant Found</CardTitle>
            <CardDescription>
              You need to set up your restaurant first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <Badge variant={restaurant.is_active ? "default" : "secondary"}>
                {restaurant.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.todayOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today's Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.todayRevenue.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.pendingOrders}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)} MAD</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="receipts">Receipts</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No orders yet</p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                          Customer: {order.customer?.full_name || "Unknown"}
                        </CardDescription>
                        <CardDescription>
                          Phone: {order.customer?.phone || "N/A"}
                        </CardDescription>
                        <CardDescription>
                          {new Date(order.created_at).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge>{order.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold mb-2">Items:</p>
                        {order.order_items?.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.menu_item?.name}
                            </span>
                            <span>{item.price} MAD</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-1 pt-2 border-t">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-semibold">{order.total_amount} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Delivery Fee:</span>
                          <span>{order.delivery_fee} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Commission:</span>
                          <span>-{order.commission_amount || 0} MAD</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Your Earnings:</span>
                          <span>
                            {(Number(order.total_amount) - Number(order.commission_amount || 0)).toFixed(2)} MAD
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        {order.status === "pending" && (
                          <>
                            <Button
                              className="flex-1"
                              onClick={() => updateOrderStatus(order.id, "confirmed")}
                            >
                              Accept Order
                            </Button>
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => updateOrderStatus(order.id, "cancelled")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {order.status === "confirmed" && (
                          <Button
                            className="w-full"
                            onClick={() => updateOrderStatus(order.id, "preparing")}
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === "preparing" && (
                          <Button
                            className="w-full"
                            onClick={() => updateOrderStatus(order.id, "ready_for_pickup")}
                          >
                            Mark as Ready
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Menu Management</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Menu Item</DialogTitle>
                        <DialogDescription>
                          Add a new item to your menu
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="Item name"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Item description"
                          />
                        </div>
                        <div>
                          <Label>Price (MAD)</Label>
                          <Input
                            type="number"
                            value={newItem.price}
                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <Select
                            value={newItem.category}
                            onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Starter">Starter</SelectItem>
                              <SelectItem value="Main Course">Main Course</SelectItem>
                              <SelectItem value="Dessert">Dessert</SelectItem>
                              <SelectItem value="Beverage">Beverage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Image URL (optional)</Label>
                          <Input
                            value={newItem.image_url}
                            onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={addMenuItem}
                          disabled={!newItem.name || !newItem.price || addingItem}
                        >
                          {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Item"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {Object.entries(groupedMenuItems).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <p className="font-bold mt-2">{item.price} MAD</p>
                              </div>
                              <Button
                                variant={item.is_available ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleMenuItem(item.id, item.is_available)}
                              >
                                {item.is_available ? "Available" : "Unavailable"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Receipts</CardTitle>
                <CardDescription>Export or email receipts for completed orders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders
                  .filter((o) => o.status === "delivered")
                  .map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer?.full_name} - {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <p className="font-semibold">{order.total_amount} MAD</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportToExcel(order)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => sendReceiptEmail(order)}
                            >
                              <Mail className="h-4 w-4 mr-1" />
                              Email
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
