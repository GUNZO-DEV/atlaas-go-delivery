import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Trash2, UtensilsCrossed, Package, Truck, Search, WifiOff } from "lucide-react";

interface LynNewOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
  onSuccess: () => void;
}

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

const LynNewOrderDialog = ({ open, onOpenChange, restaurant, onSuccess }: LynNewOrderDialogProps) => {
  const [orderType, setOrderType] = useState("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isOnline, queueAction, cacheData, getCachedData } = useOfflineSync();

  // Fetch menu items (with offline support)
  useEffect(() => {
    if (open && restaurant?.id) {
      fetchMenuItems();
    }
  }, [open, restaurant?.id]);

  const fetchMenuItems = async () => {
    const cacheKey = `menu_items_${restaurant.id}`;
    
    // Try to get cached data first if offline
    if (!isOnline) {
      const cachedItems = getCachedData<MenuItem[]>(cacheKey);
      if (cachedItems) {
        setMenuItems(cachedItems);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, price, category")
        .eq("restaurant_id", restaurant.id)
        .eq("is_available", true)
        .order("category")
        .order("name");

      if (data) {
        setMenuItems(data);
        // Cache for offline use
        cacheData(cacheKey, data);
      }
    } catch (error) {
      // If fetch fails, try cached data
      const cachedItems = getCachedData<MenuItem[]>(cacheKey);
      if (cachedItems) {
        setMenuItems(cachedItems);
        toast({
          title: "Using Cached Menu",
          description: "Showing saved menu items from last sync.",
        });
      }
    }
  };

  // Get unique categories
  const categories = ["all", ...new Set(menuItems.map(item => item.category || "Other"))];

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addMenuItemToOrder = (menuItem: MenuItem) => {
    const existingIndex = items.findIndex(item => item.name === menuItem.name);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, {
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]);
    }
  };

  const addCustomItem = () => {
    if (!newItemName || !newItemPrice) {
      toast({ title: "Please enter item name and price", variant: "destructive" });
      return;
    }
    
    setItems([...items, {
      name: newItemName,
      price: parseFloat(newItemPrice),
      quantity: 1
    }]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const createOrder = async () => {
    if (items.length === 0) {
      toast({ title: "Please add at least one item", variant: "destructive" });
      return;
    }

    if (orderType === "dine_in" && !tableNumber) {
      toast({ title: "Please enter table number", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        id: crypto.randomUUID(), // Generate ID for offline tracking
        restaurant_id: restaurant.id,
        order_type: orderType,
        table_number: tableNumber || null,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        items: items as any,
        subtotal: subtotal,
        discount: discountAmount,
        total: total,
        payment_method: paymentMethod,
        payment_status: "pending",
        status: "pending",
        notes: notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (isOnline) {
        // Online: Insert directly
        const { error } = await supabase
          .from("lyn_restaurant_orders")
          .insert(orderData);

        if (error) throw error;
        toast({ title: "Order Created", description: "The order has been added successfully" });
      } else {
        // Offline: Queue for sync
        queueAction('insert', 'lyn_restaurant_orders', orderData);
        toast({ 
          title: "Order Saved Offline", 
          description: "Order will sync when you're back online",
        });
      }
      
      // Reset form
      setOrderType("dine_in");
      setTableNumber("");
      setCustomerName("");
      setCustomerPhone("");
      setItems([]);
      setDiscount("0");
      setPaymentMethod("cash");
      setNotes("");
      setSearchTerm("");
      setSelectedCategory("all");
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create New Order
            {!isOnline && (
              <Badge variant="outline" className="gap-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                <WifiOff className="h-3 w-3" />
                Offline
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Left: Menu Selection */}
            <div className="flex flex-col space-y-3 overflow-hidden">
              {/* Order Type */}
              <div>
                <Label className="text-xs">Order Type</Label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {[
                    { value: "dine_in", label: "Dine-in", icon: UtensilsCrossed },
                    { value: "pickup", label: "Pickup", icon: Package },
                    { value: "delivery", label: "Delivery", icon: Truck }
                  ].map(type => (
                    <Button
                      key={type.value}
                      type="button"
                      variant={orderType === type.value ? "default" : "outline"}
                      className="flex items-center gap-1 h-9 text-xs"
                      onClick={() => setOrderType(type.value)}
                    >
                      <type.icon className="h-3 w-3" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-3 gap-2">
                {orderType === "dine_in" && (
                  <Input
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Table #"
                    className="h-8 text-sm"
                  />
                )}
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Name"
                  className="h-8 text-sm"
                />
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone"
                  className="h-8 text-sm"
                />
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search menu..."
                  className="pl-8 h-8 text-sm"
                />
              </div>

              {/* Category Tabs */}
              <ScrollArea className="w-full">
                <div className="flex gap-1 pb-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs whitespace-nowrap"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === "all" ? "All" : category}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {/* Menu Items Grid */}
              <ScrollArea className="flex-1 border rounded-lg p-2">
                <div className="grid grid-cols-2 gap-2">
                  {filteredMenuItems.map(item => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-auto py-2 px-3 flex flex-col items-start text-left"
                      onClick={() => addMenuItemToOrder(item)}
                    >
                      <span className="text-xs font-medium truncate w-full">{item.name}</span>
                      <span className="text-xs text-primary font-bold">{item.price} DH</span>
                    </Button>
                  ))}
                </div>
                
                {filteredMenuItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No items found
                  </div>
                )}
              </ScrollArea>

              {/* Custom Item */}
              <div className="flex gap-2">
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Custom item"
                  className="flex-1 h-8 text-sm"
                />
                <Input
                  type="number"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="Price"
                  className="w-20 h-8 text-sm"
                />
                <Button size="sm" onClick={addCustomItem} className="h-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="flex flex-col space-y-3 overflow-hidden border-l pl-4">
              <h3 className="font-semibold text-sm">Order Items</h3>
              
              {/* Items List */}
              <ScrollArea className="flex-1 border rounded-lg">
                {items.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    Click menu items to add them to the order
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.price} DH each</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => removeItem(index)}
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                          <span className="w-16 text-right text-sm font-medium">
                            {(item.price * item.quantity).toFixed(0)} DH
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Payment & Discount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Discount (DH)</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="h-8 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">Payment</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes..."
                rows={2}
                className="text-sm"
              />

              {/* Summary */}
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{subtotal.toFixed(0)} DH</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Discount</span>
                    <span>-{discountAmount.toFixed(0)} DH</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{total.toFixed(0)} DH</span>
                </div>
              </div>

              {/* Submit */}
              <Button 
                className={`w-full ${!isOnline ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                size="lg"
                onClick={createOrder}
                disabled={loading || items.length === 0}
              >
                {loading ? "Creating..." : 
                  !isOnline ? `Save Offline - ${total.toFixed(0)} DH` : 
                  `Create Order - ${total.toFixed(0)} DH`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LynNewOrderDialog;
