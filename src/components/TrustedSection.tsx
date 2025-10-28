import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Amina",
    location: "Fez",
    text: "Fast delivery and the riders are always respectful. I love supporting local restaurants!",
    role: "Customer"
  },
  {
    name: "Youssef",
    location: "Casablanca",
    text: "I earn more and the weekly payouts are always on time. Best decision I made!",
    role: "Rider"
  },
  {
    name: "Fatima",
    location: "Marrakech",
    text: "The 10% commission means we can actually grow our small restaurant. Shukran!",
    role: "Restaurant Owner"
  }
];

const cities = [
  { name: "Ifrane", x: "48%", y: "25%", status: "live" },
  { name: "Meknès", x: "46%", y: "30%", status: "q2-2026" },
  { name: "Fès", x: "52%", y: "28%", status: "live" },
  { name: "Casablanca", x: "38%", y: "55%", status: "q4-2026" },
  { name: "Marrakech", x: "40%", y: "68%", status: "2027" },
  { name: "Rabat", x: "42%", y: "45%", status: "live" }
];

const TrustedSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-20" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Trusted Across Morocco
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied customers, riders, and restaurants
          </p>
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all duration-300 border-2 border-primary/10 hover:border-primary/30"
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm mb-4 italic text-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-border pt-3">
                  <p className="font-bold text-primary">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Map */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-card rounded-3xl shadow-elevation p-8 border-2 border-primary/10">
            <div className="relative aspect-[16/10] bg-secondary/30 rounded-2xl overflow-hidden">
              {/* Morocco Map Outline */}
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 600">
                <path 
                  d="M 150 250 Q 200 200, 300 220 L 450 240 Q 500 260, 520 300 L 530 380 Q 510 420, 480 440 L 380 460 Q 320 470, 280 450 L 200 410 Q 150 360, 150 300 Z"
                  stroke="hsl(var(--primary))"
                  strokeWidth="3"
                  fill="hsl(var(--primary) / 0.1)"
                />
              </svg>

              {/* City Dots */}
              {cities.map((city, index) => (
                <div 
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: city.x, top: city.y }}
                >
                  <div className="relative">
                    {city.status === "live" && (
                      <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-50 animate-pulse-ring" />
                    )}
                    <div className={`relative ${
                      city.status === "live" ? "bg-primary" : "bg-muted-foreground"
                    } rounded-full p-2 shadow-lg`}>
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-1 text-xs font-semibold bg-card px-2 py-1 rounded shadow text-center whitespace-nowrap">
                    {city.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">6+</div>
              <div className="text-sm text-muted-foreground">Cities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Neighborhoods</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">500+</div>
              <div className="text-sm text-muted-foreground">Riders</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">15 min</div>
              <div className="text-sm text-muted-foreground">Avg Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedSection;
