import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import LiveTracking from "@/components/LiveTracking";
import MerchantSection from "@/components/MerchantSection";
import DriverSection from "@/components/DriverSection";
import CustomerSection from "@/components/CustomerSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CityPresenceMap from "@/components/CityPresenceMap";
import AppPreview from "@/components/AppPreview";
import SupportLocalShowcase from "@/components/SupportLocalShowcase";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike } from "lucide-react";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Quick Order Section - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">{t('order.title')}</h2>
            <p className="text-sm md:text-base text-muted-foreground px-4">{t('order.subtitle')}</p>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-5xl w-full">
              <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer active:scale-95" onClick={() => navigate("/restaurants")}>
                <CardContent className="p-4 md:p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" 
                    alt="Browse Restaurants" 
                    className="w-full h-40 md:h-48 object-cover rounded-lg mb-3 md:mb-4 transition-transform"
                  />
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{t('order.browseTitle')}</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">{t('order.browseDesc')}</p>
                  <Button className="w-full min-h-[48px]" size="lg">
                    {t('order.browse')}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-primary/20 active:scale-95" onClick={() => navigate("/restaurant")}>
                <CardContent className="p-4 md:p-6">
                  <div className="relative">
                    <img 
                      src="/images/bonsai-sushi-bar.jpg" 
                      alt="Bonsai Sushi Bar - Fresh Sushi" 
                      className="w-full h-40 md:h-48 object-cover rounded-lg mb-3 md:mb-4 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold animate-pulse">
                      Order Now! 🍣
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-2 text-primary">Bonsai Sushi Bar</h3>
                  <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">Fresh sushi & Japanese cuisine made to perfection. Limited availability - order now before it's too late!</p>
                  <Button className="w-full min-h-[48px]" size="lg" variant="default">
                    Order Now - Don't Miss Out!
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <LiveTracking />
      
      {/* Partner Section - Mobile Optimized */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">{t('partner.title')}</h2>
            <p className="text-sm md:text-base text-muted-foreground px-4">{t('partner.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
            <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer active:scale-95" onClick={() => navigate("/partner-restaurant")}>
              <CardContent className="p-6 md:p-8 text-center">
                <Store className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-3 md:mb-4 transition-transform" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">{t('partner.restaurant')}</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">{t('partner.restaurantDesc')}</p>
                <Button className="w-full min-h-[48px]" size="lg">
                  {t('partner.applyNow')}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer active:scale-95" onClick={() => navigate("/rider-auth")}>
              <CardContent className="p-6 md:p-8 text-center">
                <Bike className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-3 md:mb-4 transition-transform" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">{t('partner.rider')}</h3>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">{t('partner.riderDesc')}</p>
                <Button className="w-full min-h-[48px]" size="lg">
                  {t('partner.portal')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <MerchantSection />
      <DriverSection />
      <CustomerSection />
      <TestimonialsSection />
      <CityPresenceMap />
      <AppPreview />
      <SupportLocalShowcase />
      <Footer />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;
