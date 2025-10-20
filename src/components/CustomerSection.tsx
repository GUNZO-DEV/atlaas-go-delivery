import { ShoppingBag, Coffee, Package, Sparkles } from "lucide-react";

const CustomerSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            From Souk to Sofa
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            Everything Morocco has to offer, delivered to your doorstep with care and speed.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Food */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-primary/20 h-full">
              <div className="bg-gradient-morocco text-white rounded-2xl p-6 mb-6 shadow-glow">
                <Coffee className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Food & Dining</h3>
              <p className="text-muted-foreground text-center mb-4">
                From traditional tagines to modern cafés. Taste Morocco, delivered hot and fresh.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Local restaurants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Fast food chains</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Traditional souks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Groceries */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-accent/20 h-full">
              <div className="bg-gradient-atlas text-white rounded-2xl p-6 mb-6 shadow-elevation">
                <ShoppingBag className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Groceries</h3>
              <p className="text-muted-foreground text-center mb-4">
                Fresh produce, pantry essentials, and everything you need for your Moroccan kitchen.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Fresh vegetables</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Meat & seafood</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>Spices & herbs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shops */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-midnight/20 h-full">
              <div className="bg-midnight text-midnight-foreground rounded-2xl p-6 mb-6 shadow-elevation">
                <Package className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Local Shops</h3>
              <p className="text-muted-foreground text-center mb-4">
                Support local businesses. From handicrafts to household items, shop Moroccan.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-midnight" />
                  <span>Artisan crafts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-midnight" />
                  <span>Electronics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-midnight" />
                  <span>Fashion & beauty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacies */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-primary/20 h-full">
              <div className="bg-gradient-sunset text-midnight rounded-2xl p-6 mb-6 shadow-glow">
                <Sparkles className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">Health & More</h3>
              <p className="text-muted-foreground text-center mb-4">
                Medicines, wellness products, and health essentials delivered with care.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Pharmacies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Health products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Personal care</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-card rounded-2xl p-8 shadow-elevation">
            <p className="text-2xl font-bold mb-2">
              Everything Morocco, One App
            </p>
            <p className="text-muted-foreground text-lg">
              Download ATLAAS GO and experience Moroccan delivery done right.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;
