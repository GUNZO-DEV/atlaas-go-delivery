import { useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

      {/* 5. Special Offer - Conversion nudge */}
      <SpecialOffersBanner />

      {/* 6. Quick Order Cards */}
      <section className="py-10 md:py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('order.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('order.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/restaurants")}>
              <CardContent className="p-4">
                <img 
                  src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" 
                  alt="Browse Restaurants" 
                  className="w-full h-36 object-cover rounded-lg mb-3" 
                />
                <h3 className="text-lg font-bold mb-1">{t('order.browseTitle')}</h3>
                <p className="text-muted-foreground text-sm mb-3">{t('order.browseDesc')}</p>
                <Button className="w-full" size="sm">
                  {t('order.browse')}
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-primary/30" onClick={() => navigate("/restaurant")}>
              <CardContent className="p-4">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800" 
                    alt="Hani Sugar Art" 
                    className="w-full h-36 object-cover rounded-lg mb-3" 
                  />
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                    🍰 Featured
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1 text-primary">Hani Sugar Art</h3>
                <p className="text-muted-foreground text-sm mb-3">Custom cakes & desserts</p>
                <Button className="w-full" size="sm">
                  Order Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 7. AUIER Campus Delivery */}
      <AuierHighlightSection />

      {/* 8. Testimonials */}
      <TestimonialsSection />
      
      {/* 9. Partner CTA */}
      <PartnerCTA />
      
      {/* 10. Footer */}
      <Footer />
      
      {/* Floating elements */}
      <StickyCategoryNav />
      <FloatingOrderButton />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
