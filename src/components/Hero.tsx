import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Package, Bike, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";
import LanguageToggle from "@/components/LanguageToggle";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image - Fully Animated Mountains */}
      <div className="absolute inset-0 z-0">
        {/* Base mountain image with zoom effect */}
        <img 
          src={atlasHero} 
          alt="Atlas Mountains Morocco" 
          className="w-full h-full object-cover animate-ken-burns"
        />
        
        {/* Subtle dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Prime Membership Badge - Top Left - Mobile Optimized */}
      <Link to="/auth" className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <div className="group backdrop-blur-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary-glow hover:via-primary hover:to-primary/90 rounded-full px-3 py-2 md:px-6 md:py-3 border-2 border-white/30 transition-all hover:scale-105 shadow-[0_8px_32px_rgba(217,119,6,0.5)] hover:shadow-[0_8px_48px_rgba(217,119,6,0.7)]">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Crown className="w-4 h-4 md:w-5 md:h-5 text-white drop-shadow-lg animate-pulse" />
            <span className="text-white text-xs md:text-base font-bold drop-shadow-lg">{t('prime.join')}</span>
            <span className="text-white/90 text-xs md:text-sm font-semibold drop-shadow-lg hidden sm:inline">49 MAD/{t('prime.month')}</span>
          </div>
        </div>
      </Link>

      {/* Auth Buttons & Language Toggle - Top Right - Mobile Optimized */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex gap-2 md:gap-3 items-center">
        <DarkModeToggle />
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/30 rounded-lg p-1 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <LanguageToggle />
        </div>
        <Link to="/auth?mode=login" className="hidden sm:block">
          <Button 
            variant="outline" 
            className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-105"
          >
            {t('auth.login')}
          </Button>
        </Link>
        <Link to="/auth?mode=signup" className="hidden sm:block">
          <Button 
            className="backdrop-blur-xl bg-white hover:bg-white/90 text-primary font-bold shadow-[0_4px_24px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.4)] transition-all hover:scale-105"
          >
            {t('auth.signup')}
          </Button>
        </Link>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <div className="animate-fade-in-up">
          {/* Logo/Brand - Mobile Responsive */}
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
            <MapPin className="w-8 h-8 md:w-12 md:h-12 text-primary-glow" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white">
              ATLAAS <span className="text-primary-glow">GO</span>
            </h1>
          </div>

          {/* Tagline - Mobile Responsive */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 mb-3 md:mb-4 font-light italic px-4">
            "{t('hero.tagline')}"
          </p>

          {/* Main Headline - Mobile Responsive */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight px-4">
            {t('hero.headline')}
          </h2>

          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/80 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
            {t('hero.description')}
          </p>

          {/* CTA Buttons - Mobile Optimized with Touch Targets */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center px-4">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-primary hover:bg-primary-glow text-white px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold shadow-glow transition-all hover:scale-105 min-h-[56px]"
              >
                <Package className="mr-2 w-5 h-5" />
                {t('hero.orderNow')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/auth" className="w-full sm:w-auto">
              <Button 
                size="lg"
                className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent-foreground/20 px-6 md:px-8 py-5 md:py-6 text-base md:text-lg font-semibold shadow-glow transition-all hover:scale-105 animate-pulse-glow min-h-[56px]"
              >
                <Bike className="mr-2 w-5 h-5" />
                {t('hero.becomeRider')}
              </Button>
            </Link>
          </div>

          {/* Login/Signup for Mobile Only */}
          <div className="flex sm:hidden gap-3 justify-center mt-4 px-4">
            <Link to="/auth?mode=login" className="flex-1">
              <Button 
                variant="outline" 
                className="w-full backdrop-blur-xl bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold shadow-[0_4px_24px_rgba(0,0,0,0.3)] min-h-[48px]"
              >
                {t('auth.login')}
              </Button>
            </Link>
            <Link to="/auth?mode=signup" className="flex-1">
              <Button 
                className="w-full backdrop-blur-xl bg-white hover:bg-white/90 text-primary font-bold shadow-[0_4px_24px_rgba(255,255,255,0.3)] min-h-[48px]"
              >
                {t('auth.signup')}
              </Button>
            </Link>
          </div>

          {/* Stats - Mobile Responsive */}
          <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto px-4">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow mb-1 md:mb-2">10%</div>
              <div className="text-sm md:text-base text-white/90">{t('hero.commission')}</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow mb-1 md:mb-2">24/7</div>
              <div className="text-sm md:text-base text-white/90">{t('hero.support')}</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 md:p-6 border border-white/20">
              <div className="text-3xl md:text-4xl font-bold text-primary-glow mb-1 md:mb-2">100%</div>
              <div className="text-sm md:text-base text-white/90">{t('hero.moroccan')}</div>
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
