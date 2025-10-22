import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, Package, DollarSign, TrendingUp, Download, Mail, Plus, Clock, CheckCircle, XCircle, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import NotificationBell from "@/components/NotificationBell";
import OrderChat from "@/components/OrderChat";
import SupportTicketDialog from "@/components/SupportTicketDialog";
import RestaurantApplicationForm from "@/components/RestaurantApplicationForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Restaurant {
  id: string;
  name: string;
  image_url: string;
  is_active: boolean;
  address: string;
  phone: string;
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
  const [application, setApplication] = useState<any>(null);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    checkApplication();
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

  const checkApplication = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("restaurant_applications")
        .select("*")
        .eq("merchant_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setApplication(data);
        setApplicationStatus(data.status);
      } else {
        setApplicationStatus("none");
      }
    } catch (error: any) {
      console.error("Error checking application:", error);
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
    if (!restaurant) {
      console.log("No restaurant found, skipping order fetch");
      return;
    }

    try {
      console.log("Fetching orders for restaurant:", restaurant.id);
      
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

      console.log("Orders fetched:", ordersData, "Error:", error);

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

      console.log("Orders with customer details:", ordersWithCustomers);
      setOrders(ordersWithCustomers as OrderWithCustomer[]);
      calculateStats(ordersData || []);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
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

  const playNotificationSound = () => {
    // Create a simple notification beep
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!restaurant) return;

    console.log('[Merchant] Setting up realtime for restaurant:', restaurant.id);

    const channel = supabase
      .channel(`merchant-orders-${restaurant.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          console.log("[Merchant] New order received!", payload);
          playNotificationSound();
          toast({
            title: "🔔 New Order Received!",
            description: "Check your orders tab for details",
            duration: 10000,
          });
          fetchOrders();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `restaurant_id=eq.${restaurant.id}`,
        },
        (payload) => {
          console.log("[Merchant] Order updated:", payload);
          toast({
            title: "Order Status Changed",
            description: `Order status updated to ${payload.new.status}`,
          });
          fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('[Merchant] Subscription status:', status);
      });

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

  const handleImageUpload = async (file: File) => {
    if (!restaurant) return null;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurant.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('menu-items')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('menu-items')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const addMenuItem = async () => {
    if (!restaurant) return;

    setAddingItem(true);
    try {
      let imageUrl = newItem.image_url;

      // Upload image if file is selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const { error } = await supabase.from("menu_items").insert({
        restaurant_id: restaurant.id,
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        category: newItem.category,
        image_url: imageUrl || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400`,
        is_available: true,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Menu item added",
      });

      setNewItem({ name: "", description: "", price: "", category: "Main Course", image_url: "" });
      setImageFile(null);
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

  const printReceipt = (order: OrderWithCustomer) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow popups to print receipts",
        variant: "destructive",
      });
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${order.id.slice(0, 8)}</title>
          <style>
            @media print {
              @page { margin: 0.5cm; }
            }
            body {
              font-family: 'Courier New', monospace;
              max-width: 80mm;
              margin: 0 auto;
              padding: 10px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
            }
            .restaurant-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .order-info {
              margin: 15px 0;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .items-table {
              width: 100%;
              margin: 15px 0;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .item-name {
              flex: 1;
              margin-right: 10px;
            }
            .item-qty {
              width: 30px;
              text-align: center;
            }
            .item-price {
              width: 80px;
              text-align: right;
            }
            .totals {
              margin-top: 15px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total-row.grand-total {
              font-weight: bold;
              font-size: 14px;
              border-top: 2px solid #000;
              padding-top: 8px;
              margin-top: 8px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              border-top: 2px dashed #000;
              padding-top: 10px;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="restaurant-name">${restaurant.name}</div>
            <div>${restaurant.address}</div>
            <div>${restaurant.phone}</div>
          </div>

          <div class="order-info">
            <div class="info-row">
              <span>Order #:</span>
              <span>${order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span>Date:</span>
              <span>${new Date(order.created_at).toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span>Customer:</span>
              <span>${order.customer?.full_name || "Unknown"}</span>
            </div>
            <div class="info-row">
              <span>Phone:</span>
              <span>${order.customer?.phone || "N/A"}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span>${order.status.toUpperCase()}</span>
            </div>
          </div>

          <div class="items-table">
            <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px;">
              <span class="item-name">ITEM</span>
              <span class="item-qty">QTY</span>
              <span class="item-price">PRICE</span>
            </div>
            ${order.order_items.map((item) => `
              <div class="item-row">
                <span class="item-name">${item.menu_item?.name}</span>
                <span class="item-qty">${item.quantity}</span>
                <span class="item-price">${item.price.toFixed(2)} MAD</span>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${order.total_amount.toFixed(2)} MAD</span>
            </div>
            <div class="total-row">
              <span>Delivery Fee:</span>
              <span>${order.delivery_fee.toFixed(2)} MAD</span>
            </div>
            <div class="total-row">
              <span>Commission:</span>
              <span>-${(order.commission_amount || 0).toFixed(2)} MAD</span>
            </div>
            <div class="total-row grand-total">
              <span>TOTAL:</span>
              <span>${(Number(order.total_amount) + Number(order.delivery_fee) - Number(order.commission_amount || 0)).toFixed(2)} MAD</span>
            </div>
          </div>

          <div class="footer">
            <div>Thank you for your business!</div>
            <div style="margin-top: 5px;">Delivery Address:</div>
            <div>${order.delivery_address}</div>
            ${order.notes ? `<div style="margin-top: 5px;">Notes: ${order.notes}</div>` : ''}
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  const exportToExcel = (order: OrderWithCustomer) => {
    const csvContent = [
      [`${restaurant.name} - Receipt`],
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
    a.download = `receipt-${order.id.slice(0, 8)}.csv`;
    a.click();
  };

  const sendReceiptEmail = async (order: OrderWithCustomer) => {
    toast({
      title: "Print Receipt",
      description: "Opening print dialog...",
    });
    printReceipt(order);
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
    // Show application form if no application exists
    if (applicationStatus === "none") {
      return (
        <div className="min-h-screen bg-background p-8">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Restaurant Registration</h1>
              <p className="text-muted-foreground mt-2">Complete your application to start accepting orders</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </header>
          <RestaurantApplicationForm onSuccess={() => {
            checkApplication();
            toast({
              title: "Success!",
              description: "Your application is now under review",
            });
          }} />
        </div>
      );
    }

    // Show pending status
    if (applicationStatus === "pending") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-8 w-8 text-yellow-500" />
                <CardTitle className="text-2xl">Application Under Review</CardTitle>
              </div>
              <CardDescription>
                Your restaurant application is being reviewed by our team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold mb-2">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Our team is reviewing your application</li>
                  <li>• You'll receive a notification via email within 24-48 hours</li>
                  <li>• We may contact you for additional information</li>
                </ul>
              </div>

              {application && (
                <div className="space-y-2 text-sm">
                  <h4 className="font-semibold">Application Details:</h4>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                    <span>Restaurant Name:</span>
                    <span className="font-medium text-foreground">{application.restaurant_name}</span>
                    <span>Submitted:</span>
                    <span className="font-medium text-foreground">
                      {new Date(application.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSignOut} className="flex-1">
                  Sign Out
                </Button>
                <SupportTicketDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Show rejected status
    if (applicationStatus === "rejected") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <XCircle className="h-8 w-8 text-destructive" />
                <CardTitle className="text-2xl">Application Rejected</CardTitle>
              </div>
              <CardDescription>
                Unfortunately, your application was not approved
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {application?.rejection_reason && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Reason:</h3>
                  <p className="text-sm text-muted-foreground">{application.rejection_reason}</p>
                </div>
              )}

              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Next Steps:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Review the rejection reason carefully</li>
                  <li>• Contact our support team for clarification</li>
                  <li>• You can submit a new application after addressing the issues</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSignOut} className="flex-1">
                  Sign Out
                </Button>
                <SupportTicketDialog />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Fallback: no restaurant and no application status
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Restaurant Found</CardTitle>
            <CardDescription>
              Loading your application status...
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
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/merchant/analytics")}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <SupportTicketDialog />
            <NotificationBell />
            <Button variant="outline" size="icon" onClick={() => navigate("/merchant/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
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

                      {/* Merchant Chat */}
                      {["confirmed", "preparing", "ready_for_pickup", "picking_it_up", "picked_up"].includes(order.status) && (
                        <div className="pt-4 border-t">
                          <OrderChat orderId={order.id} userType="merchant" />
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printReceipt(order)}
                          className="flex-1"
                        >
                          Print Receipt
                        </Button>
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
                        <div className="space-y-2">
                          <Label>Image</Label>
                          <div className="space-y-2">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setImageFile(file);
                                  setNewItem({ ...newItem, image_url: "" });
                                }
                              }}
                            />
                            {imageFile && (
                              <p className="text-sm text-muted-foreground">
                                Selected: {imageFile.name}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <div className="h-px bg-border flex-1" />
                              <span className="text-xs text-muted-foreground">OR</span>
                              <div className="h-px bg-border flex-1" />
                            </div>
                            <Input
                              value={newItem.image_url}
                              onChange={(e) => {
                                setNewItem({ ...newItem, image_url: e.target.value });
                                setImageFile(null);
                              }}
                              placeholder="Paste image URL..."
                              disabled={!!imageFile}
                            />
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={addMenuItem}
                          disabled={!newItem.name || !newItem.price || addingItem || uploadingImage}
                        >
                          {addingItem || uploadingImage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Add Item"
                          )}
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
                        <Card key={item.id} className="overflow-hidden">
                          <div className="flex gap-4 p-4">
                            <div className="w-24 h-24 flex-shrink-0">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                            <CardContent className="p-0 flex-1">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
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
                          </div>
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
                              size="sm"
                              onClick={() => printReceipt(order)}
                            >
                              Print Receipt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => exportToExcel(order)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Export CSV
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
