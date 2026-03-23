import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import AuierHighlightSection from "@/components/AuierHighlightSection";
import SpecialOffersBanner from "@/components/SpecialOffersBanner";
import PopularCategories from "@/components/PopularCategories";
import SocialProofStrip from "@/components/SocialProofStrip";
import PartnerCTA from "@/components/PartnerCTA";
import TestimonialsSection from "@/components/TestimonialsSection";
import FloatingOrderButton from "@/components/FloatingOrderButton";
import StickyCategoryNav from "@/components/StickyCategoryNav";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import HowItWorksSection from "@/components/HowItWorksSection";
import InstallAppSection from "@/components/InstallAppSection";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />

      {/* Special Offer Banner */}
      <SpecialOffersBanner />

      {/* Categories */}
      <ScrollReveal>
        <PopularCategories />
      </ScrollReveal>

      {/* Featured Restaurants */}
      <ScrollReveal>
        <FeaturedRestaurants />
      </ScrollReveal>

      {/* How It Works */}
      <ScrollReveal>
        <HowItWorksSection />
      </ScrollReveal>

      {/* AUIER Campus */}
      <ScrollReveal>
        <AuierHighlightSection />
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal>
        <TestimonialsSection />
      </ScrollReveal>

      {/* Social Proof */}
      <ScrollReveal>
        <SocialProofStrip />
      </ScrollReveal>

      {/* Install App */}
      <ScrollReveal>
        <InstallAppSection />
      </ScrollReveal>

      {/* Partner CTA */}
      <ScrollReveal>
        <PartnerCTA />
      </ScrollReveal>

      <Footer />
      
      <StickyCategoryNav />
      <FloatingOrderButton />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
