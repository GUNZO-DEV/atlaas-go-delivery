import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Bike, Crown, Store } from "lucide-react";
import { Link } from "react-router-dom";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";
import LanguageToggle from "@/components/LanguageToggle";
import DarkModeToggle from "@/components/DarkModeToggle";
import AtlaasGoLogo from "@/components/AtlaasGoLogo";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Cinematic Mountains */}
      <div className="absolute inset-0 z-0">
        <img 
          src={atlasHero} 
          alt="Atlas Mountains Morocco - From the Atlas to Your Door" 
          className="w-full h-full object-cover animate-ken-burns"
        />
        
        {/* Moroccan gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/30 via-transparent to-accent/40" />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Logo - Top Left */}
      <div className="absolute top-3 left-3 md:top-6 md:left-6 z-20">
        <AtlaasGoLogo className="w-24 md:w-32 h-auto drop-shadow-2xl" />
      </div>

      {/* Auth Buttons & Language Toggle - Top Right */}
      <div className="absolute top-3 right-3 md:top-6 md:right-6 z-20 flex gap-2 md:gap-3 items-center">
        <DarkModeToggle />
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/30 rounded-lg p-1 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <LanguageToggle />
        </div>
        <Link to="/auth?mode=login" className="hidden sm:block">
          <Button 
            variant="outline" 
            className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-105 text-sm md:text-base px-3 md:px-4"
          >
            {t('auth.login')}
          </Button>
        </Link>
        <Link to="/auth?mode=signup" className="hidden sm:block">
          <Button 
            className="backdrop-blur-xl bg-white hover:bg-white/90 text-primary font-bold shadow-[0_4px_24px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.4)] transition-all hover:scale-105 text-sm md:text-base px-3 md:px-4"
          >
            {t('auth.signup')}
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center animate-fade-in-up pt-20 sm:pt-0">
        {/* Morocco Flag Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-full px-4 md:px-6 py-2 mb-6 md:mb-8">
            <span className="text-2xl md:text-3xl">🇲🇦</span>
            <span className="text-white font-bold text-base md:text-lg">100% Moroccan</span>
          </div>

          {/* Main Headline - Cinematic */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 md:mb-6 leading-tight tracking-tight px-2">
            From the <span className="text-accent drop-shadow-[0_0_30px_rgba(195,91,50,1)]">Atlas</span>
            <br />
            to Your <span className="text-primary-glow drop-shadow-[0_0_30px_rgba(23,94,84,1)]">Door</span>
          </h1>

          {/* Tagline - Simple & Bold */}
          <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white font-black mb-8 md:mb-12 drop-shadow-2xl px-2">
            <span className="bg-gradient-to-r from-accent via-primary-glow to-secondary bg-clip-text text-transparent">
              Fast. Fair. 100% Moroccan.
            </span>
          </p>

          {/* Single Clear CTA */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-12 md:mb-16 px-4">
            <Link to="/restaurants" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent/90 text-white px-8 md:px-12 py-6 md:py-8 text-lg md:text-2xl font-bold rounded-xl md:rounded-2xl shadow-[0_0_40px_rgba(195,91,50,0.6)] hover:shadow-[0_0_60px_rgba(195,91,50,0.8)] transition-all hover:scale-110 border-2 border-white/20 w-full sm:w-auto"
              >
                <Package className="mr-2 md:mr-3 w-6 h-6 md:w-8 md:h-8" />
                Order Now
                <ArrowRight className="ml-3 w-8 h-8" />
              </Button>
            </Link>
            
            <Link to="/partner-restaurant" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white border-2 border-white/40 px-8 md:px-10 py-6 md:py-8 text-lg md:text-xl font-bold rounded-xl md:rounded-2xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                <Store className="mr-2 w-6 h-6 md:w-7 md:h-7" />
                Join as Merchant
              </Button>
            </Link>
          </div>

          {/* Stats - Moroccan Themed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto px-4">
            <div className="backdrop-blur-xl bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-primary/40 shadow-[0_0_30px_rgba(23,94,84,0.3)] hover:shadow-[0_0_50px_rgba(23,94,84,0.5)] transition-all hover:scale-105">
              <div className="text-4xl md:text-6xl font-black text-white mb-2 md:mb-3 drop-shadow-lg">10%</div>
              <div className="text-secondary text-base md:text-lg font-bold">Commission</div>
              <div className="text-white/70 text-xs md:text-sm mt-1">Lowest in Morocco</div>
            </div>
            <div className="backdrop-blur-xl bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-accent/40 shadow-[0_0_30px_rgba(195,91,50,0.3)] hover:shadow-[0_0_50px_rgba(195,91,50,0.5)] transition-all hover:scale-105">
              <div className="text-4xl md:text-6xl font-black text-white mb-2 md:mb-3 drop-shadow-lg">24/7</div>
              <div className="text-secondary text-base md:text-lg font-bold">Support</div>
              <div className="text-white/70 text-xs md:text-sm mt-1">Always here for you</div>
            </div>
            <div className="backdrop-blur-xl bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-2xl md:rounded-3xl p-6 md:p-8 border-2 border-secondary/50 shadow-[0_0_30px_rgba(233,216,166,0.3)] hover:shadow-[0_0_50px_rgba(233,216,166,0.5)] transition-all hover:scale-105">
              <div className="text-4xl md:text-6xl font-black text-white mb-2 md:mb-3 drop-shadow-lg">100%</div>
              <div className="text-secondary text-base md:text-lg font-bold">Moroccan</div>
              <div className="text-white/70 text-xs md:text-sm mt-1">Built in Morocco</div>
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
