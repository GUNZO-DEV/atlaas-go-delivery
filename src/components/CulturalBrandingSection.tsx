import { Crown, Shield, Heart, TrendingUp, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SupportLocalBadge from "@/components/SupportLocalBadge";

const CulturalBrandingSection = () => {
  const cities = [
    { name: "Ifrane", status: "operational", gradient: "from-primary to-primary-glow" },
    { name: "Meknès", status: "coming", gradient: "from-accent to-accent/80", date: "Q2 2026" },
    { name: "Casablanca", status: "coming", gradient: "from-secondary to-secondary/70", date: "Q4 2026" },
  ];

  const trustSignals = [
    {
      icon: Heart,
      title: "Support Local Businesses",
      description: "Every order supports Moroccan restaurants and families",
      stat: "100%",
      statLabel: "Moroccan",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Shield,
      title: "Fair Commission",
      description: "Industry-lowest 10% commission - keep more of what you earn",
      stat: "10%",
      statLabel: "Commission",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: TrendingUp,
      title: "Growing Together",
      description: "Built by Moroccans, for Moroccans - we grow when you grow",
      stat: "24/7",
      statLabel: "Support",
      color: "text-primary-glow",
      bgColor: "bg-primary-glow/10",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 to-background relative overflow-hidden">
      {/* Moroccan Pattern Background */}
      <div className="absolute inset-0 zellij-pattern opacity-20" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-6">
            <SupportLocalBadge variant="detailed" showArabic />
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Authentic <span className="text-gradient-morocco">Moroccan</span> Service
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're not just another delivery app. We're a Moroccan company built on values of fairness, community, and supporting local businesses.
          </p>
        </div>

        {/* Trust Signals Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {trustSignals.map((signal, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm"
            >
              <CardContent className="p-8">
                <div className={`${signal.bgColor} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
                  <signal.icon className={`w-8 h-8 ${signal.color}`} />
                </div>
                
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  {signal.title}
                  <CheckCircle2 className="w-5 h-5 text-primary-glow" />
                </h3>
                
                <p className="text-muted-foreground mb-6">
                  {signal.description}
                </p>
                
                <div className="pt-6 border-t border-border">
                  <div className={`text-4xl font-black ${signal.color} mb-1`}>
                    {signal.stat}
                  </div>
                  <div className="text-sm text-muted-foreground font-semibold">
                    {signal.statLabel}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* City Presence Banners */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black mb-4 flex items-center justify-center gap-3">
              <MapPin className="w-8 h-8 text-accent" />
              Our Moroccan Cities
            </h3>
            <p className="text-muted-foreground">
              Expanding across Morocco, one city at a time
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {cities.map((city, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border-2 hover:scale-105 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${city.gradient} opacity-90`} />
                
                <div className="relative p-8 text-white">
                  {city.status === "operational" ? (
                    <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                      Live Now
                    </Badge>
                  ) : (
                    <Badge className="mb-4 bg-white/20 backdrop-blur-sm border-white/40 text-white hover:bg-white/30">
                      <Clock className="w-3 h-3 mr-1" />
                      Coming Soon
                    </Badge>
                  )}
                  
                  <h4 className="text-3xl font-black mb-2">{city.name}</h4>
                  
                  {city.status === "operational" ? (
                    <div className="flex items-center gap-2 text-sm opacity-90">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Serving now</span>
                    </div>
                  ) : (
                    <div className="text-sm opacity-90">{city.date}</div>
                  )}

                  {/* Decorative element */}
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fair Commission Showcase */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Left: Visual Comparison */}
                <div className="p-10 border-r border-border bg-muted/30">
                  <h4 className="text-2xl font-black mb-8 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-accent" />
                    Fair Commission
                  </h4>
                  
                  <div className="space-y-6">
                    {/* ATLAAS GO */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-primary">ATLAAS GO</span>
                        <span className="text-3xl font-black text-primary">10%</span>
                      </div>
                      <div className="h-4 bg-gradient-to-r from-primary to-primary-glow rounded-full shadow-glow" style={{ width: "20%" }} />
                      <p className="text-xs text-muted-foreground mt-1">You keep 90% of every order</p>
                    </div>

                    {/* Competitors */}
                    <div className="opacity-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Competitor A</span>
                        <span className="text-2xl font-bold text-destructive">30%</span>
                      </div>
                      <div className="h-4 bg-gradient-to-r from-destructive to-destructive/60 rounded-full" style={{ width: "60%" }} />
                    </div>

                    <div className="opacity-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Competitor B</span>
                        <span className="text-2xl font-bold text-destructive">25%</span>
                      </div>
                      <div className="h-4 bg-gradient-to-r from-destructive to-destructive/60 rounded-full" style={{ width: "50%" }} />
                    </div>
                  </div>
                </div>

                {/* Right: Benefits */}
                <div className="p-10 bg-gradient-to-br from-primary/5 to-accent/5">
                  <h4 className="text-xl font-bold mb-6">What This Means for You</h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg mt-1">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">More Profit Per Order</p>
                        <p className="text-sm text-muted-foreground">Keep up to 20% more than competitors</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg mt-1">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Transparent Pricing</p>
                        <p className="text-sm text-muted-foreground">No hidden fees, ever</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="bg-primary/20 p-2 rounded-lg mt-1">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Built for Morocco</p>
                        <p className="text-sm text-muted-foreground">Designed around local business needs</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-xs text-muted-foreground italic">
                      "We believe in fair partnerships. Your success is our success." 
                      <span className="block mt-1 font-semibold text-foreground">— ATLAAS GO Team</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Trust Badge */}
        <div className="text-center mt-16 pt-16 border-t border-border">
          <div className="inline-flex flex-wrap items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇲🇦</span>
              <span className="text-sm font-semibold">Made in Morocco</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-semibold">Verified Local</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-semibold">Community First</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Missing import
import { Clock } from "lucide-react";

export default CulturalBrandingSection;
