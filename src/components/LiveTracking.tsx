import { MapPin, Navigation, Clock, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const LiveTracking = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-16 bg-background relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Track Every Delivery in Real-Time
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Know exactly where your food is, from kitchen to your doorstep
          </p>
        </div>

        {/* Visual Map Preview */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card rounded-3xl shadow-elevation p-6 border-2 border-primary/10">
            <div className="aspect-video bg-secondary/30 rounded-2xl relative overflow-hidden">
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
              </div>

              {/* Moving Driver Pin */}
              <div className="absolute top-32 right-20 z-10">
                <div className="relative animate-[move-path_6s_ease-in-out_infinite]">
                  <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 animate-pulse-ring" />
                  <div className="relative bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                    <Navigation className="w-6 h-6" />
                  </div>
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
              </div>
            </div>
          </div>
        </div>

        {/* Three Key Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">📍 Live Driver Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Watch your driver's exact location in real-time
            </p>
          </div>

          <div className="text-center">
            <div className="bg-accent/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-accent" />
            </div>
            <h3 className="text-lg font-bold mb-2">🕓 Accurate ETA</h3>
            <p className="text-muted-foreground text-sm">
              Get precise delivery times that update live
            </p>
          </div>

          <div className="text-center">
            <div className="bg-midnight/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Package className="w-10 h-10 text-midnight" />
            </div>
            <h3 className="text-lg font-bold mb-2">🍲 Order Journey Made Simple</h3>
            <p className="text-muted-foreground text-sm">
              Follow every step from prep to delivery
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveTracking;
