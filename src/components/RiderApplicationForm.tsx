import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bike } from "lucide-react";

interface RiderApplicationFormProps {
  onSuccess: () => void;
}

const RiderApplicationForm = ({ onSuccess }: RiderApplicationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: "",
    vehicle_plate_number: "",
    license_number: "",
    phone: "",
    city: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("rider_profiles")
        .insert({
          rider_id: user.id,
          ...formData,
        });

      if (error) throw error;

      toast({
        title: "Application Submitted!",
        description: "Your rider application has been submitted for review. We'll notify you once it's approved.",
      });

      onSuccess();
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

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Bike className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">Rider Application</CardTitle>
        </div>
        <CardDescription>
          Tell us about yourself and your vehicle. Our team will review your application within 24-48 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type *</Label>
              <Select
                value={formData.vehicle_type}
                onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorcycle">Motorcycle</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                  <SelectItem value="bicycle">Bicycle</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle_plate_number">Vehicle Plate Number *</Label>
              <Input
                id="vehicle_plate_number"
                value={formData.vehicle_plate_number}
                onChange={(e) => setFormData({ ...formData, vehicle_plate_number: e.target.value })}
                placeholder="12345-أ-67"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_number">Driver's License Number *</Label>
            <Input
              id="license_number"
              value={formData.license_number}
              onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
              placeholder="AB123456"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+212 6XX-XXXXXX"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Casablanca, Rabat, etc."
                required
              />
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Requirements:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Valid driver's license</li>
              <li>Vehicle registration documents</li>
              <li>Must be 18 years or older</li>
              <li>Smartphone with GPS</li>
            </ul>
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

export default RiderApplicationForm;
