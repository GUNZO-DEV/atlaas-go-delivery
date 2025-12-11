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
import { AtlaasAIChat } from "@/components/AtlaasAIChat";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* 1. Hero - First impression */}
      <Hero />

      {/* 2. Social Proof - Build trust immediately */}
      <SocialProofStrip />

      {/* 3. Categories - What are you craving? */}
      <PopularCategories />

      {/* 4. Featured Restaurants - Discovery */}
      <FeaturedRestaurants />

      {/* 5. Testimonials - Social proof while browsing */}
      <TestimonialsSection />

      {/* 6. Special Offer - Conversion nudge */}
      <SpecialOffersBanner />

      {/* 7. AUIER Campus Delivery */}
      <AuierHighlightSection />
      
      {/* 8. Partner CTA */}
      <PartnerCTA />
      
      {/* 9. Footer */}
      <Footer />
      
      {/* Floating elements */}
      <StickyCategoryNav />
      <FloatingOrderButton />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
