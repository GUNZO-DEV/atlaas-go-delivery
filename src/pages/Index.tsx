import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import TestimonialsSection from "@/components/TestimonialsSection";
import AppPreview from "@/components/AppPreview";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike } from "lucide-react";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";
import { useLanguage } from "@/contexts/LanguageContext";
import AuierDeliveryIcon from "@/components/AuierDeliveryIcon";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedRestaurants />
      
      {/* Quick Order Section - Simplified */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            {/* AUIER Campus Delivery */}
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-amber-500/30 bg-gradient-to-br from-background to-amber-50/10" onClick={() => navigate("/auier-delivery")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-32 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg mb-4">
                  <AuierDeliveryIcon className="w-28 h-auto" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-600">AUIER Campus Delivery</h3>
                <p className="text-muted-foreground text-sm mb-4">From 20 DH - Fast campus delivery for students</p>
                <Button className="w-full bg-amber-500 hover:bg-amber-600" size="lg">
                  Order for Campus
                </Button>
              </CardContent>
            </Card>
            
            {/* Hani Sugar Art */}
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-primary/20" onClick={() => navigate("/restaurant")}>
              <CardContent className="p-6">
                <img src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800" alt="Hani Sugar Art" className="w-full h-32 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-bold mb-2 text-primary">Hani Sugar Art</h3>
                <p className="text-muted-foreground text-sm mb-4">Custom cakes & pastries crafted with love</p>
                <Button className="w-full" size="lg">
                  Order Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('partner.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('partner.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/partner-restaurant")}>
              <CardContent className="p-6 text-center">
                <Store className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">{t('partner.restaurant')}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t('partner.restaurantDesc')}</p>
                <Button className="w-full">{t('partner.applyNow')}</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate("/rider-auth")}>
              <CardContent className="p-6 text-center">
                <Bike className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-bold mb-1">{t('partner.rider')}</h3>
                <p className="text-muted-foreground text-sm mb-4">{t('partner.riderDesc')}</p>
                <Button className="w-full">{t('partner.portal')}</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <AppPreview />
      <Footer />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;