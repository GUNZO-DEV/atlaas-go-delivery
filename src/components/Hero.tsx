import { Button } from "@/components/ui/button";
import {
  ArrowRight, Package, Store, GraduationCap, Menu, User, Briefcase,
  HelpCircle, Clock, Truck, Headphones, Star,
} from "lucide-react";
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
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const Hero = () => {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-background text-foreground">
      {/* Amber AUIER banner */}
      <Link to="/auier-delivery" className="absolute top-0 inset-x-0 z-40 ag-grad-amber text-[#1A0F00]">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold tracking-wide">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>🎓 AUIER Campus Delivery — From 20 DH</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </Link>

      {/* Background hero */}
      <div className="absolute inset-0 z-0">
        <img
          src={atlasHero}
          alt="Atlas Mountains Morocco — From the Atlas to Your Door"
          className="w-full h-full object-cover animate-ag-ken-burns"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14]/60 via-[#0B0E14]/35 to-[#0B0E14]/90" />
        <div className="absolute inset-0 ag-zellij-bg opacity-30 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Floating glass nav */}
      <nav className="absolute top-9 sm:top-10 left-3 right-3 sm:left-6 sm:right-6 z-30">
        <div
          className="h-14 rounded-2xl px-3 sm:px-4 flex items-center text-white border border-white/15"
          style={{
            background: "rgba(11,14,20,0.45)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 28px rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <AtlaasGoLogo className="w-24 sm:w-32 h-auto drop-shadow" />
          </div>

          <div className="hidden md:flex flex-1 justify-center gap-7 text-[13px] font-medium">
            {[
              { to: "/restaurants", label: "Eat" },
              { to: "/auier-delivery", label: "Campus" },
              { to: "/partner-restaurant", label: "Partners" },
              { to: "/careers", label: "Riders" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-white/85 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <DarkModeToggle />
            <div className="rounded-lg p-0.5 bg-white/10 border border-white/20">
              <LanguageToggle />
            </div>
            <Link to="/auth?mode=login" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 bg-white/10 hover:bg-white/20 border border-white/25 text-white"
              >
                {t("auth.login")}
              </Button>
            </Link>
            <Link to="/auth?mode=signup" className="hidden sm:block">
              <Button size="sm" className="h-9 px-3 ag-grad-sunset text-white ag-glow-orange border-0">
                {t("auth.signup")}
              </Button>
            </Link>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/15 h-9 w-9">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-l">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="flex flex-col gap-1 mt-6">
                  <Link
                    to="/auier-delivery"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 ag-grad-amber text-[#1A0F00] p-3 rounded-xl font-semibold text-sm"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>AUIER Delivery</span>
                  </Link>
                  <div className="border-t border-border my-3" />
                  {[
                    { to: "/restaurants", icon: Package, label: "Order Food" },
                    { to: "/partner-restaurant", icon: Store, label: "Partner with Us" },
                    { to: "/careers", icon: Briefcase, label: "Careers" },
                    { to: "/help", icon: HelpCircle, label: "Help Center" },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 text-foreground p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  <div className="border-t border-border my-3" />
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 text-foreground p-3 rounded-lg hover:bg-muted transition-colors text-sm"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{t("auth.login")}</span>
                  </Link>
                  <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mt-2 ag-grad-sunset text-white ag-glow-orange border-0">
                      {t("auth.signup")}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 container mx-auto px-5 sm:px-10 lg:px-16 pt-32 sm:pt-28 pb-16 w-full">
        <div className="grid lg:grid-cols-[1fr_auto] gap-10 lg:gap-12 items-center">
          <div className="max-w-2xl text-white">
            {/* Eyebrow pill */}
            <motion.div
              {...fadeUp(0.15)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.08em] uppercase mb-5 border border-white/20 bg-white/[0.08] backdrop-blur"
            >
              <Star className="w-3 h-3 fill-[#FF7849] text-[#FF7849]" />
              <span>Morocco's super-app · Ifrane → Marrakech</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.3)}
              className="ag-font-display text-white text-[44px] sm:text-6xl lg:text-[78px] leading-[0.95] tracking-tight"
            >
              From the <span className="ag-text-sunset">Atlas</span>
              <br />
              to your{" "}
              <span
                className="inline-block ag-grad-sunset text-white px-5 sm:px-6 pb-1 rounded-full ag-glow-orange"
                style={{ transform: "rotate(-1.5deg)" }}
              >
                door
              </span>
              .
            </motion.h1>

            {/* Subhead */}
            <motion.p
              {...fadeUp(0.45)}
              className="mt-6 text-base sm:text-lg text-white/75 max-w-xl leading-relaxed"
            >
              Food delivery, dine-in QR, and campus runners — built for Morocco.
              Zellij-crafted UX, neighborhood-fast.
            </motion.p>

            {/* CTAs */}
            <motion.div {...fadeUp(0.6)} className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/restaurants" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-7 py-6 text-base font-semibold ag-grad-sunset text-white border-0 ag-glow-orange animate-ag-pulse rounded-xl"
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
                  className="w-full sm:w-auto h-13 px-7 py-6 text-base font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/25 rounded-xl backdrop-blur"
                >
                  <Store className="mr-2 w-5 h-5" />
                  Join as Partner
                </Button>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              {...fadeUp(0.8)}
              className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-7 max-w-xl"
            >
              {[
                { Icon: Truck, label: "Free delivery", sub: "Orders 80 DH+" },
                { Icon: Clock, label: "30 min avg", sub: "Verified arrival times" },
                { Icon: Headphones, label: "24/7 support", sub: "EN · FR · العربية" },
              ].map(({ Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.08] border border-white/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#FF8A4C]" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-white leading-tight">{label}</div>
                    <div className="text-[11px] text-white/55 mt-0.5">{sub}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right-side mini phone preview (desktop only) */}
          <motion.div
            initial={{ opacity: 0, y: 30, rotate: 6 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block w-[230px] h-[470px] rounded-[34px] p-1.5 shrink-0"
            style={{
              background: "linear-gradient(180deg, #1a1d24, #0d0f15)",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <div className="w-full h-full rounded-[28px] overflow-hidden bg-[#0B0E14] relative">
              <img
                src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80"
                alt="Live order preview"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              <div
                className="absolute bottom-3 left-3 right-3 rounded-2xl p-3 text-white border border-white/10"
                style={{
                  background: "rgba(11,14,20,0.72)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="inline-flex items-center gap-1 ag-grad-sunset text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                    ● Live
                  </span>
                  <span className="text-[9px] text-white/60">· Order #4072</span>
                </div>
                <div className="ag-font-display text-[14px] leading-tight">Mehdi is 4 min away</div>
                <div className="text-[10px] text-white/60 mt-0.5">Café Hafa · 2 items</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-1.5 text-white/50"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-semibold">Scroll</span>
        <div className="w-px h-6 bg-gradient-to-b from-white/50 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
