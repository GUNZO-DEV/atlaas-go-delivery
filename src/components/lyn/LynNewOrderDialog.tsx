import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trash2, UtensilsCrossed, Package, Truck } from "lucide-react";

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

const LynNewOrderDialog = ({ open, onOpenChange, restaurant, onSuccess }: LynNewOrderDialogProps) => {
  const [orderType, setOrderType] = useState("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addItem = () => {
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
        notes: notes || null
      };

      const { error } = await supabase
        .from("lyn_restaurant_orders")
        .insert(orderData);

      if (error) throw error;

      toast({ title: "Order Created", description: "The order has been added successfully" });
      
      // Reset form
      setOrderType("dine_in");
      setTableNumber("");
      setCustomerName("");
      setCustomerPhone("");
      setItems([]);
      setDiscount("0");
      setPaymentMethod("cash");
      setNotes("");
      
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Type */}
          <div>
            <Label>Order Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {[
                { value: "dine_in", label: "Dine-in", icon: UtensilsCrossed },
                { value: "pickup", label: "Pickup", icon: Package },
                { value: "delivery", label: "Delivery", icon: Truck }
              ].map(type => (
                <Button
                  key={type.value}
                  type="button"
                  variant={orderType === type.value ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setOrderType(type.value)}
                >
                  <type.icon className="h-5 w-5" />
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            {orderType === "dine_in" && (
              <div>
                <Label>Table Number *</Label>
                <Input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="e.g., T1"
                />
              </div>
            )}
            <div>
              <Label>Customer Name</Label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+212..."
              />
            </div>
          </div>

          {/* Add Items */}
          <div>
            <Label>Add Items</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name"
                className="flex-1"
              />
              <Input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(e.target.value)}
                placeholder="Price"
                className="w-24"
              />
              <Button type="button" onClick={addItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="border rounded-lg p-4 space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.price.toFixed(2)} DH</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(index, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(index, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                    <span className="w-20 text-right font-medium">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount (DH)</Label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
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
          <div>
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions..."
              rows={2}
            />
          </div>

          {/* Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{subtotal.toFixed(2)} DH</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span>-{discountAmount.toFixed(2)} DH</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{total.toFixed(2)} DH</span>
            </div>
          </div>

          {/* Submit */}
          <Button 
            className="w-full" 
            size="lg"
            onClick={createOrder}
            disabled={loading || items.length === 0}
          >
            {loading ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LynNewOrderDialog;
