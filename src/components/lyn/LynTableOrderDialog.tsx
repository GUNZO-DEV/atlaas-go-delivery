import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Minus, Trash2, Search, Users, Printer, Receipt, 
  CreditCard, Split, CheckCircle, Clock, ChefHat, X
} from "lucide-react";
import LynReceiptGenerator from "./LynReceiptGenerator";
import LynBillSplitDialog from "./LynBillSplitDialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  status?: string; // pending, preparing, ready, served
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface LynTableOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: any;
  order?: any;
  restaurant: any;
  onSuccess: () => void;
}

const LynTableOrderDialog = ({ 
  open, onOpenChange, table, order, restaurant, onSuccess 
}: LynTableOrderDialogProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [guestsCount, setGuestsCount] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [itemNotes, setItemNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [splitBillOpen, setSplitBillOpen] = useState(false);
  const { toast } = useToast();
  const { isOnline, queueAction, getCachedData } = useOfflineSync();
  const isMobile = useIsMobile();

  // Load existing order if any
  useEffect(() => {
    if (order) {
      setItems((order.items || []).map((item: any) => ({
        ...item,
        status: item.status || "pending"
      })));
      setGuestsCount(order.guests_count || 1);
      setDiscount(order.discount || 0);
      setNotes(order.notes || "");
    } else {
      setItems([]);
      setGuestsCount(1);
      setDiscount(0);
      setNotes("");
    }
  }, [order, open]);

  // Fetch menu items
  useEffect(() => {
    if (open && restaurant?.id) {
      fetchMenuItems();
    }
  }, [open, restaurant?.id]);

  const fetchMenuItems = async () => {
    const cacheKey = `menu_items_${restaurant.id}`;
    
    // Try cache first if offline
    if (!isOnline) {
      const cached = getCachedData<MenuItem[]>(cacheKey);
      if (cached) {
        setMenuItems(cached);
        return;
      }
    }

    try {
      const { data } = await supabase
        .from("menu_items")
        .select("id, name, price, category")
        .eq("restaurant_id", restaurant.id)
        .eq("is_available", true)
        .order("category")
        .order("name");
      
      if (data) {
        setMenuItems(data);
        // Cache for offline use (won't duplicate if already cached by dashboard)
      }
    } catch (error) {
      // Fallback to cache on error
      const cached = getCachedData<MenuItem[]>(cacheKey);
      if (cached) {
        setMenuItems(cached);
      }
    }
  };

  const categories = ["all", ...new Set(menuItems.map(item => item.category || "Other"))];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItem = (menuItem: MenuItem) => {
    const existingIndex = items.findIndex(item => item.name === menuItem.name && !item.notes);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, {
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        status: "pending"
      }]);
    }
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addItemNote = (index: number) => {
    const note = itemNotes[index];
    if (note) {
      const newItems = [...items];
      newItems[index].notes = note;
      setItems(newItems);
      setItemNotes({ ...itemNotes, [index]: "" });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discount);

  const openTable = async () => {
    if (items.length === 0) {
      toast({ title: "Add at least one item", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const orderId = crypto.randomUUID();
      const orderData = {
        id: orderId,
        restaurant_id: restaurant.id,
        table_id: table.id,
        order_type: "dine_in",
        table_number: table.table_number,
        guests_count: guestsCount,
        items: items as any,
        subtotal,
        discount,
        total,
        notes,
        status: "pending",
        kitchen_status: "pending",
        payment_status: "pending",
        payment_method: "cash",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const tableUpdate = {
        id: table.id,
        status: "occupied",
        current_order_id: orderId,
        updated_at: new Date().toISOString()
      };

      if (isOnline) {
        const { error: orderError } = await supabase
          .from("lyn_restaurant_orders")
          .insert(orderData);

        if (orderError) throw orderError;

        await supabase
          .from("lyn_tables")
          .update(tableUpdate)
          .eq("id", table.id);
      } else {
        queueAction('insert', 'lyn_restaurant_orders', orderData);
        queueAction('update', 'lyn_tables', tableUpdate);
        toast({ title: "Saved Offline", description: "Will sync when back online." });
      }

      toast({ title: "Table opened successfully" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async () => {
    if (!order) return;

    setLoading(true);
    try {
      const orderUpdate = {
        id: order.id,
        items: items as any,
        guests_count: guestsCount,
        subtotal,
        discount,
        total,
        notes,
        updated_at: new Date().toISOString()
      };

      if (isOnline) {
        await supabase
          .from("lyn_restaurant_orders")
          .update(orderUpdate)
          .eq("id", order.id);
      } else {
        queueAction('update', 'lyn_restaurant_orders', orderUpdate);
        toast({ title: "Saved Offline", description: "Will sync when back online." });
      }

      toast({ title: "Order updated" });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const closeTable = async (paymentMethod: string = "cash") => {
    if (!order) return;

    setLoading(true);
    try {
      const orderUpdate = {
        id: order.id,
        status: "completed",
        payment_status: "paid",
        payment_method: paymentMethod,
        served_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const tableUpdate = {
        id: table.id,
        status: "available",
        current_order_id: null,
        updated_at: new Date().toISOString()
      };

      if (isOnline) {
        await supabase
          .from("lyn_restaurant_orders")
          .update(orderUpdate)
          .eq("id", order.id);

        await supabase
          .from("lyn_tables")
          .update(tableUpdate)
          .eq("id", table.id);
      } else {
        queueAction('update', 'lyn_restaurant_orders', orderUpdate);
        queueAction('update', 'lyn_tables', tableUpdate);
        toast({ title: "Saved Offline", description: "Will sync when back online." });
      }

      toast({ title: "Table closed successfully" });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const setTableStatus = async (status: string) => {
    const tableUpdate = {
      id: table.id,
      status,
      updated_at: new Date().toISOString()
    };

    if (isOnline) {
      await supabase
        .from("lyn_tables")
        .update(tableUpdate)
        .eq("id", table.id);
    } else {
      queueAction('update', 'lyn_tables', tableUpdate);
      toast({ title: "Saved Offline", description: "Will sync when back online." });
    }
    onSuccess();
  };

  const isOccupied = table.status === "occupied";

  return (
    <>
      {/* Mobile: Full screen sheet */}
      <Sheet open={open && isMobile} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[95vh] p-0 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={isOccupied ? "default" : "secondary"} className="text-sm px-2 py-0.5">
                {table.table_number}
              </Badge>
              <span className="capitalize text-sm">{table.status}</span>
              <Badge variant="outline" className="text-xs">
                <Users className="h-3 w-3 mr-1" />
                {guestsCount}/{table.capacity}
              </Badge>
            </div>
          </div>

          <Tabs defaultValue="menu" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid grid-cols-2 mx-4 mt-2">
              <TabsTrigger value="menu">Menu</TabsTrigger>
              <TabsTrigger value="order">Order ({items.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="menu" className="flex-1 overflow-auto p-4 pt-2 m-0">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search..."
                      className="pl-8 h-9"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center">{guestsCount}</span>
                    <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => setGuestsCount(Math.min(table.capacity, guestsCount + 1))}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

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

                <div className="grid grid-cols-2 gap-2">
                  {filteredMenuItems.map(item => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="h-auto py-3 px-3 flex flex-col items-start text-left"
                      onClick={() => addItem(item)}
                    >
                      <span className="text-xs font-medium truncate w-full">{item.name}</span>
                      <span className="text-sm text-primary font-bold">{item.price} DH</span>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="order" className="flex-1 flex flex-col overflow-hidden p-4 pt-2 m-0">
              {/* Scrollable content */}
              <ScrollArea className="flex-1 pr-2">
                <div className="space-y-3 pb-4">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      Click menu items to add
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              {item.notes && (
                                <p className="text-xs text-orange-600">📝 {item.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(index, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(index, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => removeItem(index)}>
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex justify-end mt-1">
                            <span className="text-sm font-bold">{(item.price * item.quantity).toFixed(0)} DH</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Discount</Label>
                      <Input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                        className="h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Notes..."
                        className="h-9"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Sticky footer with totals + actions */}
              <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pt-3 space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(0)} DH</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount</span>
                      <span>-{discount.toFixed(0)} DH</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>{total.toFixed(0)} DH</span>
                  </div>
                </div>

                <div className="space-y-2 pb-2">
                  {!isOccupied ? (
                    <>
                      <Button className="w-full h-12 text-base" onClick={openTable} disabled={loading || items.length === 0}>
                        <Users className="h-5 w-5 mr-2" />
                        Open Table
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-10" onClick={() => setTableStatus("reserved")}>
                          Reserve
                        </Button>
                        <Button variant="outline" className="h-10" onClick={() => setTableStatus("cleaning")}>
                          Cleaning
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button className="w-full h-12 text-base" onClick={updateOrder} disabled={loading}>
                        Update Order
                      </Button>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" className="h-10" onClick={() => setReceiptOpen(true)}>
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="h-10" onClick={() => setSplitBillOpen(true)}>
                          <Split className="h-4 w-4" />
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 h-10" onClick={() => closeTable("cash")}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="h-10" onClick={() => closeTable("card")}>
                          <CreditCard className="h-4 w-4 mr-1" />
                          Card
                        </Button>
                        <Button variant="outline" className="h-10" onClick={() => closeTable("wallet")}>
                          <Receipt className="h-4 w-4 mr-1" />
                          Wallet
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Desktop: Dialog */}
      <Dialog open={open && !isMobile} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl w-[95vw] md:w-auto max-h-[90vh] md:max-h-[95vh] overflow-hidden flex flex-col p-4 md:p-6">
          <DialogHeader className="pb-2 md:pb-4">
            <DialogTitle className="flex flex-wrap items-center gap-2 md:gap-3">
              <Badge variant={isOccupied ? "default" : "secondary"} className="text-sm md:text-base px-2 md:px-3 py-0.5 md:py-1">
                {table.table_number}
              </Badge>
              <span className="capitalize text-sm md:text-base">{table.status}</span>
              <Badge variant="outline" className="text-xs md:text-sm">
                <Users className="h-3 w-3 mr-1" />
                {guestsCount}/{table.capacity}
              </Badge>
              {order && (
                <Badge variant={order.kitchen_status === "ready" ? "default" : "outline"} className="text-xs md:text-sm">
                  <ChefHat className="h-3 w-3 mr-1" />
                  {order.kitchen_status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {/* Desktop Layout */}
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Left: Menu */}
              <div className="flex flex-col space-y-3 overflow-hidden">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search menu..."
                      className="pl-8 h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Guests:</Label>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center">{guestsCount}</span>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setGuestsCount(Math.min(table.capacity, guestsCount + 1))}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

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

                <ScrollArea className="flex-1 border rounded-lg p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {filteredMenuItems.map(item => (
                      <Button
                        key={item.id}
                        variant="outline"
                        className="h-auto py-2 px-3 flex flex-col items-start text-left"
                        onClick={() => addItem(item)}
                      >
                        <span className="text-xs font-medium truncate w-full">{item.name}</span>
                        <span className="text-xs text-primary font-bold">{item.price} DH</span>
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Right: Order */}
              <div className="flex flex-col space-y-3 overflow-hidden border-l pl-4">
                <h3 className="font-semibold">Order Items</h3>

                <ScrollArea className="flex-1 border rounded-lg">
                  {items.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground text-sm">
                      Click menu items to add
                    </div>
                  ) : (
                    <div className="p-2 space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="p-2 bg-muted/50 rounded space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              {item.notes && (
                                <p className="text-xs text-orange-600">📝 {item.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(index, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">{item.quantity}</span>
                              <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(index, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(index)}>
                                <Trash2 className="h-3 w-3 text-red-600" />
                              </Button>
                              <span className="w-14 text-right text-sm font-medium">
                                {(item.price * item.quantity).toFixed(0)} DH
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Input
                              placeholder="Add note (no salt, extra sauce...)"
                              value={itemNotes[index] || ""}
                              onChange={(e) => setItemNotes({ ...itemNotes, [index]: e.target.value })}
                              className="h-6 text-xs"
                            />
                            <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => addItemNote(index)}>
                              Add
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Discount (DH)</Label>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Order Notes</Label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="General notes..."
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="border-t pt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{subtotal.toFixed(0)} DH</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Discount</span>
                      <span>-{discount.toFixed(0)} DH</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(0)} DH</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isOccupied ? (
                    <>
                      <Button className="w-full" onClick={openTable} disabled={loading || items.length === 0}>
                        <Users className="h-4 w-4 mr-2" />
                        Open Table
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={() => setTableStatus("reserved")}>
                          Reserve
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={() => setTableStatus("cleaning")}>
                          Cleaning
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" onClick={updateOrder} disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        Update Order
                      </Button>
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={() => setReceiptOpen(true)}>
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </Button>
                        <Button variant="outline" onClick={() => setSplitBillOpen(true)}>
                          <Split className="h-4 w-4 mr-1" />
                          Split
                        </Button>
                        <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => closeTable("cash")}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Close
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" onClick={() => closeTable("card")}>
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pay Card
                        </Button>
                        <Button variant="outline" onClick={() => closeTable("wallet")}>
                          <Receipt className="h-4 w-4 mr-1" />
                          Pay Wallet
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      {order && (
        <LynReceiptGenerator
          open={receiptOpen}
          onOpenChange={setReceiptOpen}
          order={{ ...order, items, subtotal, discount, total }}
          restaurant={restaurant}
        />
      )}

      {/* Split Bill Dialog */}
      {order && (
        <LynBillSplitDialog
          open={splitBillOpen}
          onOpenChange={setSplitBillOpen}
          order={{ ...order, items, subtotal, discount, total }}
          guestsCount={guestsCount}
          onPaySplit={(splits) => {
            toast({ title: "Bill split processed" });
            closeTable("split");
          }}
        />
      )}
    </>
  );
};

export default LynTableOrderDialog;
