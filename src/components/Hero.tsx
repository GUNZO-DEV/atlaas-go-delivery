import { Button } from "@/components/ui/button";
import { ArrowRight, Package, Store, Percent, GraduationCap, Menu, User, Briefcase, HelpCircle, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";
import LanguageToggle from "@/components/LanguageToggle";
import DarkModeToggle from "@/components/DarkModeToggle";
import AtlaasGoLogo from "@/components/AtlaasGoLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { motion } from "framer-motion";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const Hero = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* AUIER Banner */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-gradient-to-r from-amber-600 to-orange-500">
        <Link to="/auier-delivery" className="block">
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-white font-semibold text-xs md:text-sm hover:opacity-90 transition-opacity">
            <GraduationCap className="w-4 h-4" />
            <span>🎓 AUIER Campus Delivery — From 20 DH</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      </div>

      {/* Background with Ken Burns */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          src={atlasHero} 
          alt="Atlas Mountains Morocco - From the Atlas to Your Door" 
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-9 left-0 right-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <AtlaasGoLogo className="w-28 md:w-40 h-auto drop-shadow-lg" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/restaurants" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Restaurants
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
            <Link to="/partner-restaurant" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Partner
            </Link>
            <Link to="/help" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Help
            </Link>
          </div>

          <div className="flex gap-2 items-center">
            <DarkModeToggle />
            <div className="rounded-lg p-1 bg-white/10 border border-white/20">
              <LanguageToggle />
            </div>
            <Link to="/auth?mode=login" className="hidden sm:block">
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm px-4 py-2"
              >
                {t('auth.login')}
              </Button>
            </Link>
            <Link to="/auth?mode=signup" className="hidden sm:block">
              <Button 
                className="bg-white text-primary font-semibold hover:bg-white/95 text-sm px-5 py-2"
              >
                {t('auth.signup')}
              </Button>
            </Link>
            
            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="sm:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-l">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-1 mt-6">
                  <Link to="/auier-delivery" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-xl font-semibold text-sm">
                    <GraduationCap className="w-5 h-5" />
                    <span>AUIER Delivery</span>
                  </Link>
                  
                  <div className="border-t border-border my-3" />
                  
                  {[
                    { to: "/restaurants", icon: Package, label: "Order Food" },
                    { to: "/partner-restaurant", icon: Store, label: "Partner with Us" },
                    { to: "/careers", icon: Briefcase, label: "Careers" },
                    { to: "/help", icon: HelpCircle, label: "Help Center" },
                  ].map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-foreground p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  
                  <div className="border-t border-border my-3" />
                  
                  <Link to="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-foreground p-3 rounded-lg hover:bg-muted transition-colors text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{t('auth.login')}</span>
                  </Link>
                  
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mt-2">{t('auth.signup')}</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-24 sm:pt-8">
        <div>
          {/* Badge */}
          <motion.div {...fadeUp(0.2)} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-5 py-2 mb-8">
            <span className="text-xl">🇲🇦</span>
            <span className="text-white font-medium text-sm tracking-wide">100% Moroccan Platform</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 {...fadeUp(0.4)} className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-6 leading-[1.1] tracking-tight">
            <span className="font-light">From the </span>
            <span className="font-black text-accent">Atlas</span>
            <br />
            <span className="font-light">to Your </span>
            <span className="font-black text-primary-foreground bg-primary/80 px-4 py-1 rounded-lg inline-block">Door</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p {...fadeUp(0.6)} className="text-lg sm:text-xl md:text-2xl text-white/80 font-medium mb-10 max-w-2xl mx-auto">
            Morocco's food delivery platform. Fast delivery, fair commissions, local restaurants.
          </motion.p>

          {/* CTA */}
          <motion.div {...fadeUp(0.8)} className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-16 px-4">
            <Link to="/restaurants" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-lg font-bold rounded-xl shadow-xl transition-transform hover:scale-105 w-full sm:w-auto"
              >
                <Package className="mr-2 w-5 h-5" />
                Order Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to="/partner-restaurant" className="w-full sm:w-auto">
              <Button 
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-6 text-lg font-semibold rounded-xl w-full sm:w-auto"
              >
                <Store className="mr-2 w-5 h-5" />
                Join as Partner
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-3 gap-3 max-w-3xl mx-auto">
          {[
            { icon: Package, value: "Free", label: "Delivery", sub: "On your 1st order" },
            { icon: Clock, value: "30 min", label: "Avg Delivery", sub: "Fast & reliable" },
            { icon: Shield, value: "24/7", label: "Support", sub: "Always available" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              {...fadeUp(1.0 + i * 0.15)}
              whileHover={{ scale: 1.05, y: -4 }}
              className="bg-white/10 rounded-2xl p-4 md:p-6 border border-white/15 hover:bg-white/15 transition-colors cursor-default"
            >
              <stat.icon className="w-5 h-5 text-white/60 mx-auto mb-2" />
              <div className="text-2xl md:text-4xl font-black text-white">{stat.value}</div>
              <div className="text-white/70 text-xs md:text-sm font-medium mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 hidden sm:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center p-1.5">
          <motion.div 
            className="w-1 h-2 bg-white/50 rounded-full"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
