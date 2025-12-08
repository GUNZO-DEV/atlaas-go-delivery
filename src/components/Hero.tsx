import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Store, Percent, Headphones, MapPin, GraduationCap } from "lucide-react";
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
      {/* AUIER Announcement Banner */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-pulse">
        <Link to="/auier-delivery" className="block">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-white font-bold text-sm md:text-base hover:opacity-90 transition-opacity">
            <GraduationCap className="w-5 h-5 animate-bounce" />
            <span>🎓 AUIER Students! Campus Delivery Available - Order Now!</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Background Image - Cinematic Mountains */}
      <div className="absolute inset-0 z-0">
        <img 
          src={atlasHero} 
          alt="Atlas Mountains Morocco - From the Atlas to Your Door" 
          className="w-full h-full object-cover animate-ken-burns"
        />
        
        {/* Enhanced gradient overlay - soft dark to transparent for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-accent/20" />
      </div>

      {/* Top Navigation Bar with shadow */}
      <div className="absolute top-10 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 md:py-5 flex justify-between items-center">
          {/* Logo - Increased size 25% */}
          <div className="flex items-center gap-3">
            <AtlaasGoLogo className="w-32 md:w-44 h-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]" />
            {/* AUIER Badge next to logo */}
            <Link to="/auier-delivery" className="hidden md:flex">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hover:scale-105 transition-transform">
                <GraduationCap className="w-4 h-4" />
                <span>AUIER</span>
              </div>
            </Link>
          </div>

          {/* Auth Buttons & Language Toggle */}
          <div className="flex gap-2 md:gap-4 items-center">
            <DarkModeToggle />
            <div className="backdrop-blur-xl bg-white/15 border border-white/30 rounded-lg p-1.5 shadow-lg">
              <LanguageToggle />
            </div>
            <Link to="/auth?mode=login" className="hidden sm:block">
              <Button 
                variant="outline" 
                className="backdrop-blur-xl bg-white/10 hover:bg-white/25 border-2 border-white/40 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm md:text-base px-4 md:px-6 py-2.5"
              >
                {t('auth.login')}
              </Button>
            </Link>
            <Link to="/auth?mode=signup" className="hidden sm:block">
              <Button 
                className="bg-white hover:bg-white/95 text-primary font-extrabold shadow-[0_4px_20px_rgba(255,255,255,0.4)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.5)] transition-all duration-300 hover:scale-105 text-sm md:text-base px-4 md:px-6 py-2.5 border-2 border-white/50"
              >
                {t('auth.signup')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center animate-fade-in-up pt-24 sm:pt-8">
        {/* Morocco Flag Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/30 rounded-full px-5 md:px-7 py-2.5 mb-6 md:mb-8 shadow-lg">
          <span className="text-2xl md:text-3xl">🇲🇦</span>
          <span className="text-white font-bold text-base md:text-lg tracking-wide">100% Moroccan</span>
        </div>

        {/* Main Headline - Enhanced with bolder Atlas and Door */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-4 md:mb-6 leading-tight tracking-tight px-2">
          <span className="font-medium">From the </span>
          <span className="font-black text-accent drop-shadow-[0_0_40px_rgba(195,91,50,1)] [text-shadow:_0_4px_30px_rgb(195_91_50_/_60%)]">Atlas</span>
          <br />
          <span className="font-medium">to Your </span>
          <span className="font-black text-primary-glow drop-shadow-[0_0_40px_rgba(23,94,84,1)] [text-shadow:_0_4px_30px_rgb(23_94_84_/_60%)]">Door</span>
        </h1>

        {/* Tagline - Simple & Bold */}
        <p className="text-xl sm:text-2xl md:text-4xl lg:text-5xl text-white font-black mb-10 md:mb-14 drop-shadow-2xl px-2">
          <span className="bg-gradient-to-r from-accent via-secondary to-primary-glow bg-clip-text text-transparent">
            Fast. Fair. 100% Moroccan.
          </span>
        </p>

        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center mb-14 md:mb-20 px-4">
          {/* Primary CTA - Order Now (Warm Orange) */}
          <Link to="/restaurants" className="w-full sm:w-auto">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-accent via-[hsl(20,65%,52%)] to-accent hover:from-[hsl(20,70%,55%)] hover:to-accent text-white px-10 md:px-14 py-7 md:py-9 text-xl md:text-2xl font-extrabold rounded-2xl shadow-[0_8px_40px_rgba(195,91,50,0.7),_0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_50px_rgba(195,91,50,0.85),_0_6px_20px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-110 border-2 border-white/30 w-full sm:w-auto group"
            >
              <Package className="mr-3 w-7 h-7 md:w-8 md:h-8 group-hover:animate-bounce" />
              Order Now
              <ArrowRight className="ml-3 w-7 h-7 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          {/* Secondary CTA - Join as Merchant */}
          <Link to="/partner-restaurant" className="w-full sm:w-auto">
            <Button 
              size="lg"
              className="bg-white/15 backdrop-blur-xl hover:bg-white/25 text-white border-2 border-white/50 hover:border-white/70 px-10 md:px-12 py-7 md:py-9 text-xl md:text-2xl font-bold rounded-2xl shadow-[0_6px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <Store className="mr-3 w-7 h-7 md:w-8 md:h-8" />
              Join as Merchant
            </Button>
          </Link>
        </div>

        {/* Enhanced Stats - Glassmorphism with Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto px-4">
          {/* 10% Commission */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-3xl p-6 md:p-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_48px_rgba(23,94,84,0.4),_inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105 hover:bg-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent className="w-6 h-6 md:w-8 md:h-8 text-primary-glow" />
              <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">10%</div>
            </div>
            <div className="text-secondary text-base md:text-lg font-bold">Commission</div>
            <div className="text-white/70 text-xs md:text-sm mt-1">Lowest in Morocco</div>
          </div>
          
          {/* 24/7 Support */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-3xl p-6 md:p-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_48px_rgba(195,91,50,0.4),_inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105 hover:bg-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Headphones className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">24/7</div>
            </div>
            <div className="text-secondary text-base md:text-lg font-bold">Support</div>
            <div className="text-white/70 text-xs md:text-sm mt-1">Always here for you</div>
          </div>
          
          {/* 100% Moroccan */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-3xl p-6 md:p-8 border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3),_inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_12px_48px_rgba(233,216,166,0.4),_inset_0_1px_0_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105 hover:bg-white/15">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
              <div className="text-4xl md:text-6xl font-black text-white drop-shadow-lg">100%</div>
            </div>
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