import { Button } from "@/components/ui/button";
import { TrendingUp, Percent, BarChart3, Wallet } from "lucide-react";
import MoroccanLifeCarousel from "@/components/MoroccanLifeCarousel";

const MerchantSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            Fair to Every Merchant
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            We believe Moroccan businesses deserve better. That's why we only take 10% commission.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Cinematic Carousel */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-elevation hover-lift">
              <MoroccanLifeCarousel />
            </div>
          </div>

          {/* Benefits */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift border-2 border-primary/20 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-xl p-4">
                  <Percent className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-primary">Only 10% Commission</h3>
                  <p className="text-muted-foreground text-lg">
                    Other platforms take 20-30%. We keep it fair so small businesses can thrive. 
                    Your success is our success.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-accent-foreground rounded-xl p-4">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Smart Dashboard</h3>
                  <p className="text-muted-foreground text-lg">
                    Track orders, earnings, and customer reviews in real-time. 
                    Simple analytics built for Moroccan merchants.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-midnight text-midnight-foreground rounded-xl p-4">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Weekly Payouts</h3>
                  <p className="text-muted-foreground text-lg">
                    Get paid every week, on time, every time. No hidden fees. No surprises.
                    Just honest business.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-xl p-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">Grow Your Business</h3>
                  <p className="text-muted-foreground text-lg">
                    Reach more customers across Morocco. Free marketing support. 
                    We help you succeed.
                  </p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary-glow text-white py-6 text-lg font-semibold shadow-glow"
            >
              Join as Partner Restaurant
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchantSection;
