import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, MapPin, Clock } from "lucide-react";
import SupportLocalBadge from "./SupportLocalBadge";
import moroccanFood from "@/assets/moroccan-food.jpg";

const SupportLocalShowcase = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-10" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            Support Local Badge System
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            Celebrate Moroccan-owned businesses with authentic, trustworthy badges
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto mb-16">
          {/* Restaurant Listing Card Example */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">1. Restaurant Listing Card</h3>
            
            <Card className="hover-lift transition-all duration-300 overflow-hidden">
              <div className="relative h-48">
                <img 
                  src={moroccanFood} 
                  alt="Restaurant" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <SupportLocalBadge variant="compact" />
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Atlas Tajine House</h3>
                    <div className="mb-3">
                      <SupportLocalBadge />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold">4.8</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>2.3 km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>25-35 min</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground text-sm">
                  Traditional Moroccan tajines, couscous, and authentic dishes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Merchant Detail Page Example */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4">2. Merchant Detail Page</h3>
            
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-background rounded-2xl shadow-warm flex items-center justify-center text-4xl">
                    🍽️
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold mb-3">Atlas Tajine House</h2>
                    <div className="mb-4">
                      <SupportLocalBadge variant="detailed" showArabic />
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-semibold">4.8</span>
                        <span className="text-muted-foreground">(500+ reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Family-owned since 1987, serving authentic Moroccan cuisine with pride and tradition.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Checkout Message Example */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-6 text-center">3. Checkout Success Message</h3>
          
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-accent/5 via-primary/5 to-secondary/10 border-2 border-accent/30">
            <CardContent className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-4xl shadow-glow">
                  🇲🇦
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gradient-morocco">
                Thank You for Supporting Local!
              </h3>
              <p className="text-lg text-muted-foreground mb-2">
                You've supported <span className="font-bold text-primary">5 Moroccan-owned businesses</span> this week
              </p>
              <p className="text-sm text-muted-foreground">
                Together we're building a stronger local economy 🇲🇦
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Toggle Example */}
        <div>
          <h3 className="text-2xl font-bold mb-6 text-center">4. Filter Toggle</h3>
          
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Restaurant Filters</CardTitle>
              <CardDescription>Customize your search preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-accent/30 bg-gradient-to-r from-accent/5 to-primary/5 hover:border-accent/50 transition-all">
                <div className="flex items-center gap-3">
                  <Checkbox id="support-local" defaultChecked />
                  <label 
                    htmlFor="support-local" 
                    className="font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-lg">🇲🇦</span>
                    Show only Support Local restaurants
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border">
                <div className="flex items-center gap-3">
                  <Checkbox id="vegetarian" />
                  <label htmlFor="vegetarian" className="font-medium cursor-pointer">
                    Vegetarian Options
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border-2 border-border">
                <div className="flex items-center gap-3">
                  <Checkbox id="fast-delivery" />
                  <label htmlFor="fast-delivery" className="font-medium cursor-pointer">
                    Fast Delivery (&lt;30 min)
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badge Variants Showcase */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6 text-center">Badge Variants</h3>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="text-center">
              <SupportLocalBadge variant="compact" />
              <p className="text-xs text-muted-foreground mt-2">Compact</p>
            </div>
            
            <div className="text-center">
              <SupportLocalBadge variant="default" />
              <p className="text-xs text-muted-foreground mt-2">Default</p>
            </div>
            
            <div className="text-center">
              <SupportLocalBadge variant="default" showArabic />
              <p className="text-xs text-muted-foreground mt-2">With Arabic</p>
            </div>
            
            <div className="text-center">
              <SupportLocalBadge variant="detailed" showArabic />
              <p className="text-xs text-muted-foreground mt-2">Detailed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportLocalShowcase;
