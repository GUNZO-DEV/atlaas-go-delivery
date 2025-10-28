import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Bike, Crown, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";
import LanguageToggle from "@/components/LanguageToggle";
import DarkModeToggle from "@/components/DarkModeToggle";
import AtlaasGoLogo from "@/components/AtlaasGoLogo";
import { PrimeMembershipDialog } from "@/components/PrimeMembershipDialog";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();
  const [isPrimeDialogOpen, setIsPrimeDialogOpen] = useState(false);
  
  const handlePrimeSuccess = () => {
    setIsPrimeDialogOpen(false);
  };
  
  return (
    <>
    <PrimeMembershipDialog 
      open={isPrimeDialogOpen} 
      onOpenChange={setIsPrimeDialogOpen}
      onSuccess={handlePrimeSuccess}
    />
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

      {/* Animated Scooter - Cinematic Element */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="animate-scooter-ride">
          <Bike className="w-16 h-16 text-accent drop-shadow-[0_0_20px_rgba(195,91,50,0.8)]" />
        </div>
      </div>

      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <AtlaasGoLogo className="w-32 h-auto drop-shadow-2xl" />
      </div>

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
          {/* Morocco Flag Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-full px-6 py-2 mb-8">
            <span className="text-3xl">🇲🇦</span>
            <span className="text-white font-bold text-lg">100% Moroccan</span>
          </div>

          {/* Main Headline - Cinematic */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            From the <span className="text-accent drop-shadow-[0_0_30px_rgba(195,91,50,1)]">Atlas Mountains</span>
            <br />
            to Your <span className="text-primary-glow drop-shadow-[0_0_30px_rgba(23,94,84,1)]">Door</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 font-medium max-w-3xl mx-auto">
            Order food from Moroccan restaurants — fast, local, authentic.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/restaurants">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent/90 text-white px-12 py-8 text-2xl font-bold rounded-2xl shadow-[0_0_40px_rgba(195,91,50,0.6)] hover:shadow-[0_0_60px_rgba(195,91,50,0.8)] transition-all hover:scale-110 border-2 border-white/20"
              >
                <Package className="mr-3 w-8 h-8" />
                Order Now
                <ArrowRight className="ml-3 w-8 h-8" />
              </Button>
            </Link>
            
            <Button 
              size="lg"
              onClick={() => setIsPrimeDialogOpen(true)}
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary text-white px-10 py-8 text-xl font-bold rounded-2xl shadow-[0_0_40px_rgba(23,94,84,0.6)] hover:shadow-[0_0_60px_rgba(23,94,84,0.8)] transition-all hover:scale-105 border-2 border-white/20"
            >
              <Crown className="mr-2 w-7 h-7" />
              Join Prime
            </Button>
            
            <Link to="/partner-restaurant">
              <Button 
                size="lg"
                className="bg-white/10 backdrop-blur-xl hover:bg-white/20 text-white border-2 border-white/40 px-10 py-8 text-xl font-bold rounded-2xl transition-all hover:scale-105"
              >
                <Store className="mr-2 w-7 h-7" />
                Join as Partner
              </Button>
            </Link>
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
    </>
  );
};

export default Hero;
