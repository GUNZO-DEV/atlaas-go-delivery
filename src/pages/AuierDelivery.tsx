import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GraduationCap, Store, MapPin, User, Phone, Building, Package, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function AuierDelivery() {
  const [isAuier, setIsAuier] = useState<boolean | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [orderDetails, setOrderDetails] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [roomNumber, setRoomNumber] = useState<string>("");
  const [building, setBuilding] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!isAuier) {
      toast.error("This service is only available for AUIER students");
      return;
    }

    if (!restaurantName.trim()) {
      toast.error("Please enter the restaurant name");
      return;
    }

    if (!orderDetails.trim()) {
      toast.error("Please enter your order details");
      return;
    }

    if (!deliveryType) {
      toast.error("Please select a delivery type");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    if (!roomNumber.trim()) {
      toast.error("Please enter your room number");
      return;
    }

    if (!building.trim()) {
      toast.error("Please enter your building");
      return;
    }

    const deliveryFee = deliveryType === "restaurant" ? 35 : 20;
    
    setIsSubmitting(true);
    
    try {
      // Use type assertion since auier_orders is a new table not in generated types
      const { error } = await supabase
        .from('auier_orders' as any)
        .insert({
          customer_name: customerName.trim(),
          customer_phone: phoneNumber.trim(),
          room_number: roomNumber.trim(),
          building_name: building.trim(),
          restaurant_name: restaurantName.trim(),
          order_details: orderDetails.trim(),
          delivery_type: deliveryType === "restaurant" ? "restaurant_to_dorm" : "maingate_to_dorm",
          delivery_fee: deliveryFee,
          status: 'pending'
        } as any);

      if (error) {
        console.error('AUIER order insert error:', error);
        throw error;
      }

      setOrderSubmitted(true);
      toast.success("Order submitted successfully! A rider will contact you soon.");
    } catch (error: any) {
      console.error('Order submission error:', error);
      toast.error("Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Order Submitted!</h2>
            <p className="text-muted-foreground">
              Your order has been sent to our delivery team. A rider will contact you at {phoneNumber} shortly.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left space-y-2">
              <p><strong>Restaurant:</strong> {restaurantName}</p>
              <p><strong>Delivery to:</strong> Room {roomNumber}, Building {building}</p>
              <p><strong>Delivery Fee:</strong> {deliveryType === "restaurant" ? 35 : 20} DH</p>
            </div>
            <Button onClick={() => {
              setOrderSubmitted(false);
              setRestaurantName("");
              setOrderDetails("");
              setDeliveryType("");
              setCustomerName("");
              setPhoneNumber("");
              setRoomNumber("");
              setBuilding("");
              setIsAuier(null);
            }} variant="outline" className="w-full">
              Place Another Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AUIER Campus Delivery
            </h1>
            <p className="text-muted-foreground text-lg">
              Fast and affordable delivery service for AUIER students
            </p>
          </div>

          {/* Step 1: Verify AUIER Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Step 1: Are you an AUIER student?
              </CardTitle>
              <CardDescription>
                This service is exclusively for AUIER students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={isAuier === null ? "" : isAuier.toString()}
                onValueChange={(value) => setIsAuier(value === "true")}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="auier-yes" />
                  <Label htmlFor="auier-yes" className="cursor-pointer">
                    Yes, I'm an AUIER student
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="auier-no" />
                  <Label htmlFor="auier-no" className="cursor-pointer">
                    No, I'm not an AUIER student
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Step 2: Restaurant Name */}
          {isAuier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Step 2: Which Restaurant?
                </CardTitle>
                <CardDescription>
                  Enter the name of the restaurant you want to order from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="e.g., Hani Sugar Art, McDonald's, etc."
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  className="text-base"
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Order Details */}
          {isAuier && restaurantName && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Step 3: What would you like to order?
                </CardTitle>
                <CardDescription>
                  Describe your order in detail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., 2 Big Mac meals with Coke, 1 Chicken nuggets..."
                  value={orderDetails}
                  onChange={(e) => setOrderDetails(e.target.value)}
                  className="min-h-[120px] text-base"
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Delivery Type */}
          {isAuier && restaurantName && orderDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Step 4: Select Delivery Type
                </CardTitle>
                <CardDescription>
                  Choose your delivery option
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={deliveryType} onValueChange={setDeliveryType}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="restaurant" id="restaurant-delivery" />
                      <Label
                        htmlFor="restaurant-delivery"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Restaurant to Dorm</div>
                            <div className="text-sm text-muted-foreground">
                              Direct delivery from restaurant
                            </div>
                          </div>
                          <div className="text-lg font-bold text-primary">35 dh</div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="maingate" id="maingate-delivery" />
                      <Label
                        htmlFor="maingate-delivery"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">Main Gate to Dorm</div>
                            <div className="text-sm text-muted-foreground">
                              Pick up from main gate
                            </div>
                          </div>
                          <div className="text-lg font-bold text-primary">20 dh</div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Customer Information */}
          {isAuier && restaurantName && orderDetails && deliveryType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Step 5: Your Information
                </CardTitle>
                <CardDescription>
                  We need these details to deliver your order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+212 6XX XXX XXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      placeholder="e.g., 205"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building">Building</Label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="building"
                        placeholder="e.g., A, B, C"
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          {isAuier && restaurantName && orderDetails && deliveryType && customerName && phoneNumber && roomNumber && building && (
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Order
                  <CheckCircle className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          )}

          {/* Not AUIER Message */}
          {isAuier === false && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Sorry, this service is currently only available for AUIER students.
                  Please check out our regular delivery options.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}