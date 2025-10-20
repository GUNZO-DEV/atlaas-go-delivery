import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Package, Bike } from "lucide-react";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={atlasHero} 
          alt="Atlas Mountains Morocco" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 zellij-pattern opacity-30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="animate-fade-in-up">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <MapPin className="w-12 h-12 text-primary-glow" />
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              ATLAAS <span className="text-primary-glow">GO</span>
            </h1>
          </div>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl text-secondary mb-4 font-light italic">
            "From the mountains to your door."
          </p>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Fast. Fair. <span className="text-gradient-morocco">100% Moroccan.</span>
          </h2>

          <p className="text-xl md:text-2xl text-secondary/90 mb-12 max-w-3xl mx-auto">
            Morocco's first delivery platform built with our merchants and riders in mind. 
            Only 10% commission. Real-time tracking. Pure Moroccan hospitality.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary-glow text-white px-8 py-6 text-lg font-semibold shadow-glow transition-all hover:scale-105"
            >
              <Package className="mr-2" />
              Order Now
              <ArrowRight className="ml-2" />
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-midnight px-8 py-6 text-lg font-semibold transition-all hover:scale-105"
            >
              <Bike className="mr-2" />
              Become a Rider
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary-glow mb-2">10%</div>
              <div className="text-white/90">Commission Only</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary-glow mb-2">24/7</div>
              <div className="text-white/90">Live Support</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary-glow mb-2">100%</div>
              <div className="text-white/90">Moroccan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-2">
          <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
