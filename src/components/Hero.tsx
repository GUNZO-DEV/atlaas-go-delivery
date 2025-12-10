import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Store, Percent, Headphones, GraduationCap, Menu, User, Briefcase, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";
import LanguageToggle from "@/components/LanguageToggle";
import DarkModeToggle from "@/components/DarkModeToggle";
import AtlaasGoLogo from "@/components/AtlaasGoLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Hero = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-gradient-to-b from-primary to-primary/95 border-l-0">
                <div className="flex flex-col gap-4 mt-8">
                  {/* AUIER Delivery - Featured */}
                  <Link 
                    to="/auier-delivery" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                  >
                    <GraduationCap className="w-6 h-6" />
                    <div>
                      <div className="text-base">AUIER Delivery</div>
                      <div className="text-xs opacity-90">Campus Delivery Service</div>
                    </div>
                  </Link>
                  
                  <div className="border-t border-white/20 my-2" />
                  
                  {/* Navigation Links */}
                  <Link 
                    to="/restaurants" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-white p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    <span className="font-medium">Order Food</span>
                  </Link>
                  
                  <Link 
                    to="/partner-restaurant" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-white p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Store className="w-5 h-5" />
                    <span className="font-medium">Partner with Us</span>
                  </Link>
                  
                  <Link 
                    to="/careers" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-white p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Briefcase className="w-5 h-5" />
                    <span className="font-medium">Careers</span>
                  </Link>
                  
                  <Link 
                    to="/help" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-white p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Help Center</span>
                  </Link>
                  
                  <div className="border-t border-white/20 my-2" />
                  
                  {/* Auth Buttons */}
                  <Link 
                    to="/auth?mode=login" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-white p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">{t('auth.login')}</span>
                  </Link>
                  
                  <Link 
                    to="/auth?mode=signup" 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button className="w-full bg-white text-primary font-bold hover:bg-white/90">
                      {t('auth.signup')}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center animate-fade-in-up pt-24 sm:pt-8">
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

        {/* Simplified Stats - Just 2 key points */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-8 justify-center items-center max-w-3xl mx-auto px-4">
          {/* 10% Commission */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-2xl px-8 py-5 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 flex items-center gap-4">
            <Percent className="w-8 h-8 text-primary-glow" />
            <div className="text-left">
              <div className="text-2xl md:text-3xl font-black text-white">10% Commission</div>
              <div className="text-white/70 text-sm">Lowest in Morocco</div>
            </div>
          </div>
          
          {/* 24/7 Support */}
          <div className="group backdrop-blur-xl bg-white/10 rounded-2xl px-8 py-5 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/15 flex items-center gap-4">
            <Headphones className="w-8 h-8 text-accent" />
            <div className="text-left">
              <div className="text-2xl md:text-3xl font-black text-white">24/7 Support</div>
              <div className="text-white/70 text-sm">Always here for you</div>
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