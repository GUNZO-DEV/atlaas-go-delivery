import { MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const cities = [
  { name: "Casablanca", top: "45%", left: "15%", delay: "0ms" },
  { name: "Rabat", top: "38%", left: "18%", delay: "100ms" },
  { name: "Fez", top: "35%", left: "30%", delay: "200ms" },
  { name: "Marrakech", top: "55%", left: "25%", delay: "300ms" },
  { name: "Tangier", top: "20%", left: "20%", delay: "400ms" },
  { name: "Ifrane", top: "40%", left: "35%", delay: "500ms" },
];

const CityPresenceMap = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-10" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            {t('cities.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            {t('cities.subtitle')}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/10 rounded-3xl border-2 border-primary/20 shadow-elevation p-8">
            {/* Simplified Morocco Shape */}
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full opacity-30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 100 L100 80 L150 70 L200 60 L250 70 L300 90 L320 120 L330 160 L320 200 L300 230 L250 250 L200 260 L150 250 L100 230 L70 200 L50 160 L50 100 Z"
                stroke="currentColor"
                strokeWidth="2"
                className="text-primary"
                fill="url(#moroccoGradient)"
              />
              <defs>
                <linearGradient id="moroccoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>

            {/* City Pins */}
            {cities.map((city, index) => (
              <div
                key={city.name}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fade-in group cursor-pointer"
                style={{
                  top: city.top,
                  left: city.left,
                  animationDelay: city.delay,
                }}
              >
                {/* Pulsing Ring */}
                <div className="absolute inset-0 w-12 h-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 animate-ping" />
                
                {/* Pin Icon */}
                <div className="relative bg-primary text-primary-foreground rounded-full p-3 shadow-glow hover-scale transition-all duration-300 border-2 border-white">
                  <MapPin className="w-6 h-6" />
                </div>

                {/* City Label */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-card text-card-foreground px-3 py-1 rounded-lg shadow-lg border border-primary/20 whitespace-nowrap text-sm font-semibold">
                    {city.name}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-primary/10 hover-scale transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">6+</div>
              <p className="text-sm text-muted-foreground">Major Cities</p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-primary/10 hover-scale transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">50+</div>
              <p className="text-sm text-muted-foreground">Neighborhoods</p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-primary/10 hover-scale transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">500+</div>
              <p className="text-sm text-muted-foreground">Active Riders</p>
            </div>
            <div className="text-center p-4 bg-card/50 rounded-2xl backdrop-blur-sm border border-primary/10 hover-scale transition-all duration-300">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1">15min</div>
              <p className="text-sm text-muted-foreground">Avg Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityPresenceMap;
