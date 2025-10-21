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

      {/* Prime Membership Badge - Top Left */}
      <Link to="/auth" className="absolute top-6 left-6 z-20">
        <div className="group backdrop-blur-xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary-glow hover:via-primary hover:to-primary/90 rounded-full px-6 py-3 border-2 border-white/30 transition-all hover:scale-105 shadow-[0_8px_32px_rgba(217,119,6,0.5)] hover:shadow-[0_8px_48px_rgba(217,119,6,0.7)]">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-white drop-shadow-lg animate-pulse" />
            <span className="text-white font-bold drop-shadow-lg">{t('prime.join')}</span>
            <span className="text-white/90 text-sm font-semibold drop-shadow-lg">49 MAD/{t('prime.month')}</span>
          </div>
        </div>
      </Link>

      {/* Auth Buttons & Language Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20 flex gap-3 items-center">
        <DarkModeToggle />
        <div className="backdrop-blur-xl bg-white/10 border-2 border-white/30 rounded-lg p-1 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
          <LanguageToggle />
        </div>
        <Link to="/auth?mode=login">
          <Button 
            variant="outline" 
            className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border-2 border-white/30 text-white font-semibold shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_32px_rgba(0,0,0,0.4)] transition-all hover:scale-105"
          >
            {t('auth.login')}
          </Button>
        </Link>
        <Link to="/auth?mode=signup">
          <Button 
            className="backdrop-blur-xl bg-white hover:bg-white/90 text-primary font-bold shadow-[0_4px_24px_rgba(255,255,255,0.3)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.4)] transition-all hover:scale-105"
          >
            {t('auth.signup')}
          </Button>
        </Link>
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
            "{t('hero.tagline')}"
          </p>

          {/* Main Headline */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t('hero.headline')}
          </h2>

          <p className="text-xl md:text-2xl text-secondary/90 mb-12 max-w-3xl mx-auto">
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary-glow text-white px-8 py-6 text-lg font-semibold shadow-glow transition-all hover:scale-105"
              >
                <Package className="mr-2" />
                {t('hero.orderNow')}
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            
            <Link to="/auth">
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground border-2 border-accent-foreground/20 px-8 py-6 text-lg font-semibold shadow-glow transition-all hover:scale-105 animate-pulse-glow"
              >
                <Bike className="mr-2" />
                {t('hero.becomeRider')}
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary-glow mb-2">10%</div>
              <div className="text-white/90">{t('hero.commission')}</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary-glow mb-2">24/7</div>
              <div className="text-white/90">{t('hero.support')}</div>
            </div>
            <div className="backdrop-blur-md bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="text-4xl font-bold text-primary-glow mb-2">100%</div>
              <div className="text-white/90">{t('hero.moroccan')}</div>
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
