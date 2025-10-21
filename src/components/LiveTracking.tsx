import { MapPin, Navigation, Clock, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LiveTracking = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            {t('tracking.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            {t('tracking.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Map Mockup */}
          <div className="relative">
            <div className="bg-card rounded-3xl shadow-elevation p-6 border-2 border-primary/10">
              {/* Simplified Map Interface */}
              <div className="aspect-square bg-secondary/30 rounded-2xl relative overflow-hidden">
                {/* Map Grid */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
                    {Array.from({ length: 64 }).map((_, i) => (
                      <div key={i} className="border border-muted" />
                    ))}
                  </div>
                </div>

                {/* Route Line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                  <path
                    d="M 100 320 Q 150 250, 200 200 T 300 80"
                    stroke="hsl(var(--accent))"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="8 4"
                    className="opacity-70"
                  />
                </svg>

                {/* Restaurant Pin */}
                <div className="absolute bottom-20 left-16 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent rounded-full blur-md opacity-50 animate-pulse-ring" />
                    <div className="relative bg-accent text-accent-foreground rounded-full p-3 shadow-lg">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-semibold bg-card px-2 py-1 rounded shadow">
                    Restaurant
                  </div>
                </div>

                {/* Moving Driver Pin - Enhanced Animation */}
                <div className="absolute top-32 right-20 z-10">
                  <div className="relative animate-[move-path_6s_ease-in-out_infinite]">
                    <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 animate-pulse-ring" />
                    <div className="relative bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                      <Navigation className="w-6 h-6 animate-[spin_3s_linear_infinite]" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-semibold bg-card px-2 py-1 rounded shadow animate-pulse">
                    Driver • Moving
                  </div>
                </div>

                {/* Customer Pin */}
                <div className="absolute top-12 right-12 z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-midnight rounded-full blur-md opacity-50" />
                    <div className="relative bg-midnight text-midnight-foreground rounded-full p-3 shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs font-semibold bg-card px-2 py-1 rounded shadow">
                    You
                  </div>
                </div>
              </div>

              {/* Tracking Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between bg-accent/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent" />
                    <span className="font-semibold">Estimated Time</span>
                  </div>
                  <span className="text-xl font-bold text-primary">12 min</span>
                </div>
                <div className="flex items-center justify-between bg-primary/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Navigation className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Distance</span>
                  </div>
                  <span className="text-xl font-bold text-primary">2.4 km</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="flex gap-4 items-start animate-fade-in">
              <div className="bg-primary/10 rounded-xl p-3 mt-1">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Pulsing Location Pins</h3>
                <p className="text-muted-foreground">
                  See exactly where your food is with animated markers that pulse with life.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="bg-accent/10 rounded-xl p-3 mt-1">
                <Navigation className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Moving Driver Icon</h3>
                <p className="text-muted-foreground">
                  Watch your driver move smoothly across the map in real-time, bringing your order closer.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="bg-midnight/10 rounded-xl p-3 mt-1">
                <Clock className="w-6 h-6 text-midnight" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Live ETA Updates</h3>
                <p className="text-muted-foreground">
                  Get accurate arrival times that update as your driver navigates Moroccan streets.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="bg-primary/10 rounded-xl p-3 mt-1">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Order Journey</h3>
                <p className="text-muted-foreground">
                  From preparation to pickup to delivery — follow every step of your order's adventure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveTracking;
