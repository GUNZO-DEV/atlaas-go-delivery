import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Users, TrendingUp, Clock, CheckCircle, ArrowRight } from "lucide-react";

// Input validation schema
const restaurantApplicationSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(100, { message: "Password must be less than 100 characters" }),
  restaurant_name: z.string()
    .trim()
    .min(2, { message: "Restaurant name must be at least 2 characters" })
    .max(100, { message: "Restaurant name must be less than 100 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .regex(/^[+\d\s()-]+$/, { message: "Invalid phone number format" }),
  address: z.string()
    .trim()
    .min(5, { message: "Address must be at least 5 characters" })
    .max(200, { message: "Address must be less than 200 characters" }),
  description: z.string()
    .trim()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),
  cuisine_type: z.string()
    .trim()
    .max(50, { message: "Cuisine type must be less than 50 characters" })
    .optional(),
  business_license: z.string()
    .trim()
    .max(100, { message: "License number must be less than 100 characters" })
    .optional(),
});

const PartnerRestaurant = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    restaurant_name: "",
    description: "",
    cuisine_type: "",
    address: "",
    phone: "",
    business_license: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // Validate input
      const validatedData = restaurantApplicationSchema.parse(formData);

      // Create account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.restaurant_name,
          },
          emailRedirectTo: `${window.location.origin}/merchant`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("Failed to create account");

      // Add merchant role using database function
      const { error: roleError } = await supabase
        .rpc("assign_merchant_role", {
          user_id_param: authData.user.id,
        });

      if (roleError) throw roleError;

      // Submit application
      const { error: appError } = await supabase
        .from("restaurant_applications")
        .insert({
          merchant_id: authData.user.id,
          restaurant_name: validatedData.restaurant_name,
          description: validatedData.description || null,
          cuisine_type: validatedData.cuisine_type || null,
          address: validatedData.address,
          phone: validatedData.phone,
          business_license: validatedData.business_license || null,
        });

      if (appError) throw appError;

      toast({
        title: "Application Submitted!",
        description: "Your restaurant application has been submitted. We'll review it within 24-48 hours.",
      });

      setTimeout(() => navigate("/merchant"), 2000);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => setShowForm(false)}
            className="mb-6"
          >
            ← Back to Info
          </Button>

          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Store className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">Restaurant Application</h2>
                  <p className="text-sm text-muted-foreground">Join ATLAAS GO today</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Account Details */}
                <div className="space-y-4 pb-4 border-b">
                  <h3 className="font-semibold">Account Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="restaurant@example.com"
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      required
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>
                </div>

                {/* Restaurant Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Restaurant Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="restaurant_name">Restaurant Name *</Label>
                    <Input
                      id="restaurant_name"
                      value={formData.restaurant_name}
                      onChange={(e) => setFormData({ ...formData, restaurant_name: e.target.value })}
                      placeholder="Atlas Tajine House"
                      required
                    />
                    {errors.restaurant_name && <p className="text-sm text-destructive">{errors.restaurant_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your restaurant..."
                      rows={3}
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cuisine_type">Cuisine Type</Label>
                      <Input
                        id="cuisine_type"
                        value={formData.cuisine_type}
                        onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                        placeholder="Moroccan, Mediterranean..."
                      />
                      {errors.cuisine_type && <p className="text-sm text-destructive">{errors.cuisine_type}</p>}
                    </div>

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
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
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
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business_license">Business License Number</Label>
                    <Input
                      id="business_license"
                      value={formData.business_license}
                      onChange={(e) => setFormData({ ...formData, business_license: e.target.value })}
                      placeholder="Optional - helps speed up approval"
                    />
                    {errors.business_license && <p className="text-sm text-destructive">{errors.business_license}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              Partner With <span className="text-primary">ATLAAS GO</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Grow your restaurant business with Morocco's leading food delivery platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Reach More Customers</h3>
                <p className="text-muted-foreground">
                  Access thousands of hungry customers across Morocco
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Boost Revenue</h3>
                <p className="text-muted-foreground">
                  Increase sales with our marketing and promotional tools
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Easy Management</h3>
                <p className="text-muted-foreground">
                  Simple dashboard to manage orders and menu in real-time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button
              size="lg"
              className="text-lg px-8"
              onClick={() => setShowForm(true)}
            >
              Apply Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Why Partner With Us?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Low Commission Rates", desc: "Competitive rates to maximize your profits" },
              { title: "Real-Time Analytics", desc: "Track your performance with detailed insights" },
              { title: "Marketing Support", desc: "Featured placements and promotional campaigns" },
              { title: "Dedicated Support", desc: "24/7 partner support team to help you succeed" },
              { title: "Fast Payouts", desc: "Weekly payments directly to your bank account" },
              { title: "No Setup Fees", desc: "Get started with zero upfront costs" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of restaurants already partnered with ATLAAS GO
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setShowForm(true)}
            >
              Apply as Partner
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerRestaurant;
