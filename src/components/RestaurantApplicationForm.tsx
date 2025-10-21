import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store } from "lucide-react";
import { restaurantApplicationSchema } from "@/lib/validation";

interface RestaurantApplicationFormProps {
  onSuccess: () => void;
}

const RestaurantApplicationForm = ({ onSuccess }: RestaurantApplicationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    restaurant_name: "",
    description: "",
    cuisine_type: "",
    address: "",
    phone: "",
    business_license: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate input
      const validatedData = restaurantApplicationSchema.parse({
        restaurant_name: formData.restaurant_name.trim(),
        description: formData.description.trim(),
        cuisine_type: formData.cuisine_type.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        business_license: formData.business_license.trim(),
      });

      const { error } = await supabase
        .from("restaurant_applications")
        .insert({
          merchant_id: user.id,
          ...validatedData,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your restaurant application has been submitted for review. We'll notify you once it's approved.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Validation Error",
        description: error.errors?.[0]?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Store className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Restaurant Application</CardTitle>
        </div>
        <CardDescription>
          Tell us about your restaurant. Our team will review your application within 24-48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant_name">Restaurant Name *</Label>
            <Input
              id="restaurant_name"
              value={formData.restaurant_name}
              onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
              placeholder="Atlas Tajine House"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Authentic Moroccan cuisine with traditional recipes..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cuisine_type">Cuisine Type</Label>
              <Input
                id="cuisine_type"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                placeholder="Moroccan, Mediterranean, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+212612345678"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: +212 followed by 9 digits (e.g., +212612345678)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Restaurant Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Avenue Mohammed V, Casablanca"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_license">Business License Number</Label>
            <Input
              id="business_license"
              value={formData.business_license}
              onChange={(e) => setFormData({ ...formData, business_license: e.target.value })}
              placeholder="Optional - helps speed up approval"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RestaurantApplicationForm;
