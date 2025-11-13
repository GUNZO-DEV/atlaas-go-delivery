import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, Minus, Plus, X, MapPin, Phone, ArrowLeft, Star, Calendar, CreditCard, Users, Tag } from "lucide-react";
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

  useEffect(() => {
    checkAuth();
    fetchRestaurantAndMenu();
    
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
    const deliveryFee = 15;
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
          status: "pending" as const,
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

  // Filter menu items by selected category
  const filteredMenuItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/group-order/new?restaurant=${restaurant.id}`)}
              >
                <Users className="h-4 w-4 mr-2" />
                Start Group Order
              </Button>
            </div>
            <h1 className="text-xl font-bold">{restaurant.name}</h1>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
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
                          {deliveryLat && deliveryLng && (
                            <div className="mt-2 h-[200px] rounded-lg overflow-hidden border">
                              <LiveTrackingMap
                                customerLat={deliveryLat}
                                customerLng={deliveryLng}
                                deliveryAddress={deliveryAddress}
                              />
                            </div>
                          )}
                          {deliveryAddress && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Tap to change location
                            </p>
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
                          <span>Delivery Fee</span>
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
          </div>
        </div>
      </header>

      {/* Restaurant Hero */}
      <div className="relative h-48 md:h-64">
        <img
          src={restaurant.image_url}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
          <div className="flex items-center gap-4 mb-2">
            <StarRating rating={restaurant.average_rating || 0} size="md" showNumber />
            <span className="text-sm">({restaurant.review_count || 0} reviews)</span>
          </div>
          <p className="text-sm mb-2">{restaurant.description}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {restaurant.address}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {restaurant.phone}
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp Button - Hani Sugar Art Only */}
      {restaurant.id === 'df84d31b-0214-4a78-bd37-775422949bcf' && (
        <div className="container mx-auto px-4 py-6">
          <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-lg p-6">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold">Order via WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Chat with us directly to see today's menu and place your order
              </p>
              <Button 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto"
                onClick={() => {
                  const message = encodeURIComponent('Hello Hani Sugar Art, I want to place an order.');
                  const whatsappUrl = `https://wa.me/212648760698?text=${message}`;
                  window.open(whatsappUrl, '_blank');
                }}
              >
                <Phone className="h-5 w-5 mr-2" />
                View Menu & Order via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Selector */}
        <div className="-mx-4 mb-8">
          <MenuCategorySelector
            menuItems={menuItems}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="reviews">
                <AccordionTrigger>
                  View {reviews.length} recent reviews
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id}>
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

        {/* Menu Items */}
        {Object.entries(groupedItems).map(([category, items]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 rounded-full">
                      <FavoriteButton itemId={item.id} itemType="menu_item" size="sm" />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold">{item.price} MAD</span>
                      <Button onClick={() => addToCart(item)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </main>

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
