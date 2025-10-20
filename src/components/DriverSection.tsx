import { Button } from "@/components/ui/button";
import { Bike, Heart, DollarSign, Shield, Star } from "lucide-react";
import moroccanRider from "@/assets/moroccan-rider.jpg";

const DriverSection = () => {
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-gradient-atlas opacity-5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            Drive with Dignity
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            Join Morocco's fairest delivery platform. Earn more, work smarter, be valued.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-xl p-3 mt-1">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Weekly Payments</h3>
                <p className="text-muted-foreground">
                  Get paid every week directly to your account. No delays, no hassles. 
                  Transparent bonuses for excellent service.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-accent text-accent-foreground rounded-xl p-3 mt-1">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Respect & Support</h3>
                <p className="text-muted-foreground">
                  24/7 rider support team. Insurance coverage. We treat our riders like family.
                  Because that's who you are.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-midnight text-midnight-foreground rounded-xl p-3 mt-1">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Flexible Hours</h3>
                <p className="text-muted-foreground">
                  Work when you want. Morning, afternoon, evening — you choose. 
                  Your schedule, your way.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-xl p-3 mt-1">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Safety First</h3>
                <p className="text-muted-foreground">
                  Helmet provided. Safety training. Emergency support. 
                  Your safety is our priority, always.
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-accent text-accent-foreground rounded-xl p-3 mt-1">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Earn Bonuses</h3>
                <p className="text-muted-foreground">
                  Performance bonuses. Customer tips go 100% to you. 
                  The better you do, the more you earn.
                </p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold"
            >
              <Bike className="mr-2" />
              Become a Rider Today
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevation hover-lift">
              <img 
                src={moroccanRider} 
                alt="ATLAAS GO Moroccan Delivery Rider" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 to-transparent" />
              
              {/* Overlay Stats */}
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-white/80 mb-1">Average Weekly Earnings</div>
                  <div className="text-3xl font-bold text-white">3,500 MAD+</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-white/80 mb-1">Happy Riders</div>
                  <div className="text-3xl font-bold text-white">1,200+ Riders</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverSection;
