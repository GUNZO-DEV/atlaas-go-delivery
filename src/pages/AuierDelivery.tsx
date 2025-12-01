import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GraduationCap, Store, MapPin, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AuierDelivery() {
  const navigate = useNavigate();
  const [isAuier, setIsAuier] = useState<boolean | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("");
  const [deliveryType, setDeliveryType] = useState<string>("");

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["active-restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id, name, address, image_url")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleProceed = () => {
    if (!isAuier) {
      toast.error("This service is only available for AUIER students");
      return;
    }

    if (!selectedRestaurant) {
      toast.error("Please select a restaurant");
      return;
    }

    if (!deliveryType) {
      toast.error("Please select a delivery type");
      return;
    }

    const deliveryFee = deliveryType === "restaurant" ? 35 : 20;
    
    // Store selection in localStorage and navigate to restaurant menu
    localStorage.setItem("auierDelivery", JSON.stringify({
      isAuier,
      deliveryType,
      deliveryFee
    }));

    navigate(`/restaurant/${selectedRestaurant}`);
  };

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

          {/* Step 2: Select Restaurant */}
          {isAuier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Step 2: Choose a Restaurant
                </CardTitle>
                <CardDescription>
                  Select where you want to order from
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading restaurants...
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedRestaurant}
                    onValueChange={setSelectedRestaurant}
                  >
                    <div className="space-y-3">
                      {restaurants?.map((restaurant) => (
                        <div
                          key={restaurant.id}
                          className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <RadioGroupItem
                            value={restaurant.id}
                            id={restaurant.id}
                          />
                          <Label
                            htmlFor={restaurant.id}
                            className="flex-1 cursor-pointer"
                          >
                            <div className="font-medium">{restaurant.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {restaurant.address}
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Choose Delivery Type */}
          {isAuier && selectedRestaurant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Step 3: Select Delivery Type
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

          {/* Proceed Button */}
          {isAuier && selectedRestaurant && deliveryType && (
            <Button
              onClick={handleProceed}
              size="lg"
              className="w-full"
            >
              Continue to Menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}

          {/* Not AUIER Message */}
          {isAuier === false && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Sorry, this service is currently only available for AUIER students.
                  Please check out our regular delivery options on the{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate("/restaurants")}
                  >
                    restaurants page
                  </Button>
                  .
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
