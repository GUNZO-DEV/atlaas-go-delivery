import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, ShoppingCart, Send, CheckCircle, UtensilsCrossed } from "lucide-react";
import { Helmet } from "react-helmet";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const CustomerTableMenu = () => {
  const { restaurantId, tableNumber } = useParams();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    if (restaurantId) {
      fetchData();
    }
  }, [restaurantId]);

  const fetchData = async () => {
    try {
      // Fetch restaurant
      const { data: restData } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", restaurantId)
        .single();

      if (restData) {
        setRestaurant(restData);
      }

      // Fetch menu items
      const { data: menuData } = await supabase
        .from("menu_items")
        .select("id, name, price, category, description")
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true)
        .order("category")
        .order("name");

      setMenuItems(menuData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category || "Other")))];
  const filteredItems = selectedCategory === "All" 
    ? menuItems 
    : menuItems.filter(item => (item.category || "Other") === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => item.id === itemId ? { ...item, quantity: item.quantity + delta } : item)
        .filter(item => item.quantity > 0);
    });
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const orderItems = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const subtotal = getCartTotal();
      const tax = subtotal * 0.1; // 10% tax
      const total = subtotal + tax;

      const { error } = await supabase
        .from("lyn_restaurant_orders")
        .insert({
          restaurant_id: restaurantId,
          table_number: tableNumber,
          customer_name: customerName || null,
          items: orderItems,
          subtotal,
          tax,
          total,
          notes: notes || null,
          order_type: "dine_in",
          status: "pending",
          kitchen_status: "pending",
          payment_status: "pending"
        });

      if (error) throw error;

      setOrderSubmitted(true);
      setCart([]);
      toast({ title: "Order sent to kitchen!" });
    } catch (error: any) {
      toast({ title: "Failed to submit order", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Restaurant not found</p>
      </div>
    );
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Helmet>
          <title>Order Submitted | {restaurant.name}</title>
        </Helmet>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">Order Submitted!</h1>
          <p className="text-muted-foreground">Your order has been sent to the kitchen.</p>
          <p className="text-sm">Table {tableNumber}</p>
          <Button onClick={() => setOrderSubmitted(false)} className="mt-4">
            Order More
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Helmet>
        <title>Menu | {restaurant.name}</title>
        <meta name="description" content={`Order from ${restaurant.name} - Table ${tableNumber}`} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold">{restaurant.name}</h1>
            <p className="text-xs text-muted-foreground">Table {tableNumber}</p>
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="sticky top-[73px] z-30 bg-background border-b border-border">
        <ScrollArea className="w-full">
          <div className="flex gap-2 p-3">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Menu Items */}
      <div className="p-3 space-y-2">
        {filteredItems.map(item => {
          const cartItem = cart.find(c => c.id === item.id);
          return (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-sm truncate">{item.name}</h3>
                  <p className="text-primary font-bold">{item.price.toFixed(2)} DH</p>
                </div>
                {cartItem ? (
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{cartItem.quantity}</span>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => addToCart(item)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border p-4 space-y-3">
          <Input
            placeholder="Your name (optional)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Textarea
            placeholder="Special instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{getCartCount()} items</p>
              <p className="font-bold text-lg">{getCartTotal().toFixed(2)} DH</p>
            </div>
            <Button onClick={submitOrder} disabled={submitting} size="lg">
              {submitting ? "Sending..." : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Order
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerTableMenu;
