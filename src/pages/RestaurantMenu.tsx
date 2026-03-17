import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, ShoppingCart, Minus, Plus, X, MapPin, Phone, ArrowLeft, Star, Calendar, 
  CreditCard, Users, Tag, Search, Clock, Flame, TrendingUp, Heart, ChefHat, 
  Sparkles, Filter, Leaf, Wheat
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import StarRating from "@/components/StarRating";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AddressSelector from "@/components/AddressSelector";
import PaymentMethodSelector from "@/components/PaymentMethodSelector";
import LiveTrackingMap from "@/components/LiveTrackingMap";
import OrderNotesInput from "@/components/OrderNotesInput";
import FavoriteButton from "@/components/FavoriteButton";
import MenuCategorySelector from "@/components/MenuCategorySelector";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  image_url: string;
  address: string;
  phone: string;
  cuisine_type: string;
  average_rating: number;
  review_count: number;
}

interface Review {
  id: string;
  restaurant_rating: number;
  comment: string;
  created_at: string;
  customer_id: string;
  profiles: {
    full_name: string;
  };
}

interface CartItem extends MenuItem {
  quantity: number;
  special_instructions?: string;
}

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
  usage_count?: number;
}

export default function RestaurantMenu() {
  const { restaurantId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLat, setDeliveryLat] = useState<number | null>(null);
  const [deliveryLng, setDeliveryLng] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [itemInstructions, setItemInstructions] = useState<Record<string, string>>({});
  const [addressSelectorOpen, setAddressSelectorOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [auierDelivery, setAuierDelivery] = useState<{
    isAuier: boolean;
    deliveryType: string;
    deliveryFee: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [dietaryFilter, setDietaryFilter] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchRestaurantAndMenu();
    
    // Check for AUIER delivery settings
    const auierSettings = localStorage.getItem("auierDelivery");
    if (auierSettings) {
      setAuierDelivery(JSON.parse(auierSettings));
    }
    
    // Handle reorder if coming from customer dashboard
    if (location.state?.reorderItems) {
      handleReorderItems(location.state.reorderItems);
    }
  }, [restaurantId]);

  const handleReorderItems = (reorderItems: any[]) => {
    const cartItems = reorderItems.map(item => {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id);
      if (menuItem) {
        return {
          ...menuItem,
          quantity: item.quantity
        };
      }
      return null;
    }).filter(Boolean) as CartItem[];

    if (cartItems.length > 0) {
      setCart(cartItems);
      toast({
        title: "Items added to cart",
        description: "Your previous order has been added to the cart",
      });
    }
  };

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchRestaurantAndMenu = async () => {
    try {
      console.log("Fetching restaurant and menu...");
      
      let restaurantData: any;
      
      // If restaurantId is provided, fetch that specific restaurant
      if (restaurantId) {
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("id", restaurantId)
          .eq("is_active", true)
          .single();

        if (error) throw error;
        restaurantData = data;
      } else {
        // Otherwise, fetch the first active restaurant (Atlas Tajine House)
        const { data, error } = await supabase
          .from("restaurants")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false});

        console.log("Restaurant data:", data, "Error:", error);

        if (error) throw error;
        
        if (!data || data.length === 0) {
          console.log("No restaurants found");
          setLoading(false);
          return;
        }

        restaurantData = data[0];
      }

      console.log("Setting restaurant:", restaurantData);
      setRestaurant(restaurantData);

      // Fetch menu items
      const { data: menuData, error: menuError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantData.id)
        .eq("is_available", true)
        .order("category", { ascending: true });

      console.log("Menu data:", menuData, "Error:", menuError);

      if (menuError) throw menuError;
      setMenuItems(menuData || []);
      
      // Fetch reviews for this restaurant
      await fetchReviewsForRestaurant(restaurantData.id);
    } catch (error: any) {
      console.error("Error fetching restaurant and menu:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewsForRestaurant = async (restId: string) => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          restaurant_rating,
          comment,
          created_at,
          customer_id
        `)
        .eq("restaurant_id", restId)
        .not("restaurant_rating", "is", null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Fetch customer names separately
      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", review.customer_id)
            .single();
          
          return {
            ...review,
            profiles: profile || { full_name: "Anonymous" }
          };
        })
      );
      
      setReviews(reviewsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching reviews:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    
    // Show animation
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 600);
    
    toast({
      title: "Added to cart",
      description: `${item.name} added to your cart`,
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("code", promoCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast({
          title: "Invalid promo code",
          description: "This promo code is not valid or has expired",
          variant: "destructive",
        });
        return;
      }

      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      if (subtotal < data.min_order_amount) {
        toast({
          title: "Minimum order not met",
          description: `Minimum order of ${data.min_order_amount} MAD required`,
          variant: "destructive",
        });
        return;
      }

      setAppliedPromo(data as Promotion);
      toast({
        title: "Promo applied!",
        description: data.description,
      });
    } catch (error: any) {
      console.error("Error applying promo:", error);
      toast({
        title: "Error",
        description: "Failed to apply promo code",
        variant: "destructive",
      });
    }
  };

  const getTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Use AUIER delivery fee if applicable, otherwise default to 15
    const deliveryFee = auierDelivery?.deliveryFee || 15;
    let discount = 0;
    
    if (appliedPromo) {
      if (appliedPromo.discount_type === 'percentage') {
        discount = (subtotal * appliedPromo.discount_value) / 100;
        if (appliedPromo.max_discount_amount) {
          discount = Math.min(discount, appliedPromo.max_discount_amount);
        }
      } else {
        discount = appliedPromo.discount_value;
      }
    }
    
    return { subtotal, deliveryFee, discount, total: subtotal + deliveryFee - discount };
  };

  const placeOrder = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery address required",
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart",
        variant: "destructive",
      });
      return;
    }

    setIsOrdering(true);
    try {
      const { subtotal, deliveryFee, total } = getTotal();

      // Handle wallet payment - check balance first
      if (paymentMethod === "wallet") {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile || profile.wallet_balance < total) {
          toast({
            title: "Insufficient wallet balance",
            description: "Please top up your wallet or choose another payment method",
            variant: "destructive",
          });
          setIsOrdering(false);
          return;
        }
      }

      // Determine payment status
      const paymentStatus = paymentMethod === "wallet" ? "completed" : "pending";

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_id: user.id,
          restaurant_id: restaurant!.id,
          total_amount: subtotal,
          delivery_fee: deliveryFee,
          delivery_address: deliveryAddress,
          delivery_latitude: deliveryLat,
          delivery_longitude: deliveryLng,
          order_notes: notes || null,
          status: "ready_for_pickup" as const,
          scheduled_for: scheduledDate?.toISOString() || null,
          promo_code: appliedPromo?.code || null,
          discount_amount: appliedPromo ? getTotal().discount : 0,
          payment_method: paymentMethod,
          payment_status: paymentStatus,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
        special_instructions: item.special_instructions || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Increment promotion usage count if promo was applied
      if (appliedPromo) {
        const { error: promoError } = await supabase
          .from("promotions")
          .update({ usage_count: (appliedPromo.usage_count || 0) + 1 })
          .eq("id", appliedPromo.id);

        if (promoError) console.error("Error updating promo usage:", promoError);
      }

      // Process wallet payment
      if (paymentMethod === "wallet") {
        // Get current balance
        const { data: currentProfile, error: balanceError } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", user.id)
          .single();

        if (balanceError) throw balanceError;

        // Deduct from wallet
        const newBalance = (currentProfile.wallet_balance || 0) - total;
        const { error: walletError } = await supabase
          .from("profiles")
          .update({ wallet_balance: newBalance })
          .eq("id", user.id);

        if (walletError) throw walletError;

        // Record transaction
        const { error: txError } = await supabase
          .from("wallet_transactions")
          .insert({
            user_id: user.id,
            amount: -total,
            transaction_type: "debit",
            description: `Payment for order #${order.id.substring(0, 8)}`,
            order_id: order.id,
          });

        if (txError) throw txError;

        toast({
          title: "Order placed & paid!",
          description: `${total.toFixed(2)} MAD deducted from your wallet`,
        });
      } else if (paymentMethod === "stripe") {
        // Redirect to Stripe checkout
        try {
          const { data: stripeData, error: stripeError } = await supabase.functions.invoke("create-order-payment", {
            body: {
              order_id: order.id,
              restaurant_id: restaurant!.id,
              amount: total,
              order_items: cart.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          });

          if (stripeError) throw stripeError;
          if (stripeData?.error) throw new Error(stripeData.error);
          if (!stripeData?.url) throw new Error("Online payment checkout link was not returned");

          window.location.href = stripeData.url;
          return; // Don't clear cart — user is being redirected
        } catch (stripeErr: any) {
          const errorMessage = stripeErr?.message || "Failed to initiate online payment. Your order is saved — please try again or choose another payment method.";
          console.error("Stripe error:", stripeErr);
          toast({
            title: "Payment Error",
            description: errorMessage,
            variant: "destructive",
          });
          setIsOrdering(false);
          return;
        }
      } else if (paymentMethod === "cih_pay") {
        toast({
          title: "Order placed!",
          description: "You'll receive a CIH Pay payment link via SMS shortly",
        });
      } else {
        toast({
          title: "Order placed!",
          description: `Pay ${total.toFixed(2)} MAD on delivery`,
        });
      }

      setCart([]);
      setDeliveryAddress("");
      setDeliveryLat(null);
      setDeliveryLng(null);
      setNotes("");
      setPromoCode("");
      setAppliedPromo(null);
      setScheduledDate(undefined);
      setPaymentMethod("cash");
      setItemInstructions({});
      navigate("/customer");
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsOrdering(false);
    }
  };

  // Search and filter menu items
  const searchedItems = useMemo(() => {
    let items = menuItems;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  }, [menuItems, searchQuery, selectedCategory]);

  // Get popular items (first 4 items for now - in production this would be based on order count)
  const popularItems = useMemo(() => {
    return menuItems.slice(0, 4);
  }, [menuItems]);

  // Filter menu items by selected category
  const filteredMenuItems = searchedItems;

  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
          <Button onClick={() => navigate("/")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 sm:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="hidden sm:flex"
                onClick={() => navigate(`/group-order/new?restaurant=${restaurant.id}`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Start Group Order
              </Button>
            </div>
            <h1 className="text-sm sm:text-xl font-bold truncate max-w-[180px] sm:max-w-none">{restaurant.name}</h1>
            {restaurant.id !== 'df84d31b-0214-4a78-bd37-775422949bcf' && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                  <ShoppingCart className="h-5 w-5 sm:h-5 sm:w-5" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-[10px] sm:text-xs">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Your cart is empty</p>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex gap-4 items-start">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-sm text-muted-foreground">{item.price} MAD</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Input
                              placeholder="Special instructions (optional)"
                              value={item.special_instructions || ""}
                              onChange={(e) => {
                                setCart(prev => prev.map(i => 
                                  i.id === item.id 
                                    ? { ...i, special_instructions: e.target.value }
                                    : i
                                ));
                              }}
                              className="text-sm"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label>Delivery Address *</Label>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal h-auto py-3"
                            onClick={() => setAddressSelectorOpen(true)}
                          >
                            <MapPin className="mr-2 h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 text-left">
                              {deliveryAddress || "Select delivery address on map"}
                            </span>
                          </Button>
                          <AddressSelector
                            open={addressSelectorOpen}
                            onOpenChange={setAddressSelectorOpen}
                            initialAddress={deliveryAddress}
                            onSelectAddress={(address, lat, lng) => {
                              setDeliveryAddress(address);
                              setDeliveryLat(lat);
                              setDeliveryLng(lng);
                            }}
                          />
                          {deliveryAddress && (
                            <div className="mt-4 h-40">
                              <LiveTrackingMap customerLat={deliveryLat!} customerLng={deliveryLng!} deliveryAddress={deliveryAddress} />
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Schedule Order (Optional)</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal">
                                <Calendar className="mr-2 h-4 w-4" />
                                {scheduledDate ? format(scheduledDate, "PPP p") : "Order now"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <CalendarComponent
                                mode="single"
                                selected={scheduledDate}
                                onSelect={setScheduledDate}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <PaymentMethodSelector 
                          value={paymentMethod}
                          onChange={setPaymentMethod}
                          orderTotal={getTotal().total}
                          restaurantId={restaurant?.id}
                        />

                        <div>
                          <Label htmlFor="promo">Promo Code</Label>
                          <div className="flex gap-2">
                            <Input
                              id="promo"
                              placeholder="Enter promo code"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            />
                            <Button 
                              variant="outline" 
                              onClick={applyPromoCode}
                              disabled={!promoCode.trim() || !!appliedPromo}
                            >
                              <Tag className="h-4 w-4" />
                            </Button>
                          </div>
                          {appliedPromo && (
                            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                              ✓ {appliedPromo.description}
                            </p>
                          )}
                        </div>

                        <OrderNotesInput 
                          value={notes}
                          onChange={setNotes}
                        />
                      </div>

                      <div className="space-y-2 pt-4 border-t">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{getTotal().subtotal.toFixed(2)} MAD</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>
                            Delivery Fee
                            {auierDelivery && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({auierDelivery.deliveryType === "restaurant" ? "Restaurant to Dorm" : "Main Gate to Dorm"})
                              </span>
                            )}
                          </span>
                          <span>{getTotal().deliveryFee} MAD</span>
                        </div>
                        {appliedPromo && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span>Discount ({appliedPromo.code})</span>
                            <span>-{getTotal().discount.toFixed(2)} MAD</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>{getTotal().total.toFixed(2)} MAD</span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        size="lg"
                        onClick={placeOrder}
                        disabled={isOrdering}
                      >
                        {isOrdering ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          "Place Order"
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Restaurant Hero */}
      <div className="relative h-40 sm:h-56 md:h-72 lg:h-80 overflow-hidden">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 truncate">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4 mb-1 sm:mb-2">
                <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{restaurant.average_rating?.toFixed(1) || '0'}</span>
                  <span className="opacity-80">({restaurant.review_count || 0})</span>
                </div>
                <Badge variant="secondary" className="bg-white/20 border-0 text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                  <Clock className="h-3 w-3 mr-1" />
                  20-35 min
                </Badge>
              </div>
              <p className="text-[11px] sm:text-xs md:text-sm mb-1 sm:mb-2 line-clamp-1 sm:line-clamp-2 opacity-90">{restaurant.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-[11px] sm:text-xs md:text-sm opacity-80">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{restaurant.address}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  {restaurant.phone}
                </span>
              </div>
            </div>
            <div className="hidden md:block">
              <FavoriteButton itemId={restaurant.id} itemType="restaurant" size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Button (Mobile) */}
      {cart.length > 0 && restaurant.id !== 'df84d31b-0214-4a78-bd37-775422949bcf' && (
        <div className="fixed bottom-16 sm:bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-50 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full h-12 text-base shadow-2xl rounded-2xl">
                <ShoppingCart className="h-5 w-5 mr-2" />
                View Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                <span className="ml-auto font-bold">{getTotal().total.toFixed(0)} MAD</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Your Cart</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <img src={item.image_url} alt={item.name} className="w-14 h-14 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">{item.price} MAD</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => removeFromCart(item.id)}><X className="h-4 w-4" /></Button>
                    </div>
                  ))}

                  <div className="pt-4 border-t space-y-3">
                    <div>
                      <Label>Delivery Address *</Label>
                      <Button variant="outline" className="w-full justify-start text-left font-normal h-auto py-3" onClick={() => setAddressSelectorOpen(true)}>
                        <MapPin className="mr-2 h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left truncate">{deliveryAddress || "Select delivery address"}</span>
                      </Button>
                    </div>

                    <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} orderTotal={getTotal().total} restaurantId={restaurant?.id} />

                    <OrderNotesInput value={notes} onChange={setNotes} />
                  </div>

                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm"><span>Subtotal</span><span>{getTotal().subtotal.toFixed(2)} MAD</span></div>
                    <div className="flex justify-between text-sm"><span>Delivery Fee</span><span>{getTotal().deliveryFee} MAD</span></div>
                    {appliedPromo && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{getTotal().discount.toFixed(2)} MAD</span></div>}
                    <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{getTotal().total.toFixed(2)} MAD</span></div>
                  </div>

                  <Button className="w-full" size="lg" onClick={placeOrder} disabled={isOrdering}>
                    {isOrdering ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Placing Order...</> : "Place Order"}
                  </Button>
                </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* WhatsApp Button & Info - Hani Sugar Art Only */}
      {restaurant.id === 'df84d31b-0214-4a78-bd37-775422949bcf' && (
        <div className="container mx-auto px-4 py-4 md:py-6 space-y-4 md:space-y-6">
          {/* WhatsApp CTA */}
          <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-lg p-4 md:p-6">
            <div className="text-center space-y-2 md:space-y-3">
              <h3 className="text-base md:text-lg font-semibold">Order via WhatsApp</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Chat with us directly to see today's menu and place your order
              </p>
              <a
                href="https://wa.me/212648760698?text=Hello%20Hani%20Sugar%20Art%2C%20I%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-green-600 hover:bg-green-700 text-white h-11 px-6 md:px-8 w-full md:w-auto animate-pulse hover:animate-none hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
              >
                <Phone className="h-4 w-4 md:h-5 md:w-5" />
                <span className="text-xs md:text-sm">View Menu & Order via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Business Info */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Opening Hours */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Opening Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monday - Thursday</span>
                    <span className="font-medium">2:00 PM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Friday</span>
                    <span className="font-medium">3:00 PM - 12:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Saturday - Sunday</span>
                    <span className="font-medium">2:00 PM - 11:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </h3>
                <div className="text-sm">
                  <p className="text-muted-foreground">Résidence bowling</p>
                  <p className="text-muted-foreground">Bd massira, Ifrane</p>
                </div>
              </CardContent>
            </Card>

            {/* Specialties */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Why Choose Us
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Personalized cake designs tailored to your vision</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>10+ years of experience in Morocco</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Premium quality ingredients and craftsmanship</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Menu - Hidden for Hani Sugar Art */}
      {restaurant.id !== 'df84d31b-0214-4a78-bd37-775422949bcf' && (
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Search & Delivery Info Bar */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span>20-35 min</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap">
                <Tag className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                <span>Min. 30 MAD</span>
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div className="-mx-3 sm:-mx-4 mb-6 sm:mb-8">
            <MenuCategorySelector
              menuItems={menuItems}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Popular Items */}
          {!searchQuery && selectedCategory === "all" && popularItems.length > 0 && (
            <section className="mb-8 sm:mb-12">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold">Popular Right Now</h2>
                <Badge variant="secondary" className="ml-1 sm:ml-2 text-[10px] sm:text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`overflow-hidden cursor-pointer group relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                        addedItemId === item.id ? 'ring-2 ring-primary scale-95' : ''
                      }`}
                      onClick={() => addToCart(item)}
                    >
                      <div className="aspect-square relative">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <Badge className="absolute top-2 left-2 bg-primary/90">
                          #{index + 1} Popular
                        </Badge>
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="font-semibold text-white text-sm line-clamp-1">{item.name}</h3>
                          <p className="text-white/80 text-xs mt-0.5">{item.price} MAD</p>
                        </div>
                        {/* Quick Add Overlay */}
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: addedItemId === item.id ? 1.2 : 0 }}
                            className="bg-primary text-primary-foreground rounded-full p-3"
                          >
                            <Plus className="h-6 w-6" />
                          </motion.div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Reviews Section */}
          {reviews.length > 0 && !searchQuery && (
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Star className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
              </div>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="reviews" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <span className="flex items-center gap-2">
                      View {reviews.length} recent reviews
                      <Badge variant="outline">{restaurant.average_rating?.toFixed(1) || '0'} ⭐</Badge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {reviews.map((review) => (
                        <Card key={review.id} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold">{review.profiles.full_name}</p>
                                <StarRating rating={review.restaurant_rating} size="sm" />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-sm text-muted-foreground">{review.comment}</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Search Results Info */}
          {searchQuery && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex items-center justify-between"
            >
              <p className="text-muted-foreground">
                {filteredMenuItems.length} results for "{searchQuery}"
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            </motion.div>
          )}

          {/* No Results */}
          {filteredMenuItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or browse our categories
              </p>
              <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                View all items
              </Button>
            </motion.div>
          )}

          {/* Menu Items */}
          <AnimatePresence mode="wait">
            {Object.entries(groupedItems).map(([category, items], categoryIndex) => (
              <motion.div 
                key={category} 
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ChefHat className="h-5 w-5 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">{category}</h2>
                  <Badge variant="secondary">{items.length} items</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                    >
                      <Card 
                        className={`overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          addedItemId === item.id ? 'ring-2 ring-primary' : ''
                        }`}
                      >
                        <div className="aspect-video relative overflow-hidden">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <div className="bg-background/90 backdrop-blur rounded-full">
                              <FavoriteButton itemId={item.id} itemType="menu_item" size="sm" />
                            </div>
                          </div>
                          {/* Quick add button on hover */}
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              className="rounded-full shadow-lg"
                              onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-lg line-clamp-1">{item.name}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                            {item.description || "Delicious dish prepared with fresh ingredients"}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-primary">{item.price}</span>
                              <span className="text-sm text-muted-foreground">MAD</span>
                            </div>
                            <Button 
                              onClick={() => addToCart(item)}
                              className="group/btn"
                            >
                              <Plus className="h-4 w-4 mr-1 group-hover/btn:rotate-90 transition-transform" />
                              Add
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </main>
      )}

      {/* Address Selector Modal */}
      <AddressSelector
        open={addressSelectorOpen}
        onOpenChange={setAddressSelectorOpen}
        onSelectAddress={(address, lat, lng) => {
          setDeliveryAddress(address);
          setDeliveryLat(lat);
          setDeliveryLng(lng);
        }}
        initialAddress={deliveryAddress}
      />
    </div>
  );
}
