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
import { AtlaasAIChat } from "@/components/AtlaasAIChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero - No animation, already visible */}
      <Hero />

      {/* AUIER Campus Delivery */}
      <ScrollReveal>
        <AuierHighlightSection />
      </ScrollReveal>

      {/* Categories */}
      <ScrollReveal delay={0.1}>
        <PopularCategories />
      </ScrollReveal>

      {/* Featured Restaurants */}
      <ScrollReveal delay={0.1}>
        <FeaturedRestaurants />
      </ScrollReveal>

      {/* Testimonials */}
      <ScrollReveal direction="left">
        <TestimonialsSection />
      </ScrollReveal>

      {/* Special Offer */}
      <ScrollReveal>
        <SpecialOffersBanner />
      </ScrollReveal>
      
      {/* Partner CTA */}
      <ScrollReveal direction="right">
        <PartnerCTA />
      </ScrollReveal>

      {/* Social Proof Stats */}
      <ScrollReveal>
        <SocialProofStrip />
      </ScrollReveal>
      
      {/* Footer */}
      <Footer />
      
      {/* Floating elements */}
      <StickyCategoryNav />
      <FloatingOrderButton />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
