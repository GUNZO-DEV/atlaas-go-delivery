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
      
      {/* Quick Order Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('order.title')}</h2>
            <p className="text-muted-foreground">{t('order.subtitle')}</p>
          </div>
          <div className="flex justify-center">
            <div className="flex gap-6 justify-center flex-wrap">
              <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/restaurants")}>
                <CardContent className="p-6">
                  <img 
                    src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" 
                    alt="Browse Restaurants" 
                    className="w-full h-48 object-cover rounded-lg mb-4 transition-transform"
                  />
                  <h3 className="text-2xl font-bold mb-2">{t('order.browseTitle')}</h3>
                  <p className="text-muted-foreground mb-4">{t('order.browseDesc')}</p>
                  <Button className="w-full" size="lg">
                    {t('order.browse')}
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-primary/20" onClick={() => navigate("/restaurant")}>
                <CardContent className="p-6">
                  <div className="relative">
                    <img 
                      src="/images/bonsai-sushi-bar.jpg" 
                      alt="Bonsai Sushi Bar - Fresh Sushi" 
                      className="w-full h-48 object-cover rounded-lg mb-4 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      Order Now! 🍣
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">Bonsai Sushi Bar</h3>
                  <p className="text-muted-foreground mb-4">Fresh sushi & Japanese cuisine made to perfection. Limited availability - order now before it's too late!</p>
                  <Button className="w-full" size="lg" variant="default">
                    Order Now - Don't Miss Out!
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <LiveTracking />
      
      {/* Login Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('partner.title')}</h2>
            <p className="text-muted-foreground">{t('partner.subtitle')}</p>
          </div>
          <div className="flex gap-6 justify-center flex-wrap">
            <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/partner-restaurant")}>
              <CardContent className="p-8 text-center">
                <Store className="w-16 h-16 text-primary mx-auto mb-4 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">{t('partner.restaurant')}</h3>
                <p className="text-muted-foreground mb-6">{t('partner.restaurantDesc')}</p>
                <Button className="w-full" size="lg">
                  {t('partner.applyNow')}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="w-full max-w-md hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/rider-auth")}>
              <CardContent className="p-8 text-center">
                <Bike className="w-16 h-16 text-primary mx-auto mb-4 transition-transform" />
                <h3 className="text-2xl font-bold mb-2">{t('partner.rider')}</h3>
                <p className="text-muted-foreground mb-6">{t('partner.riderDesc')}</p>
                <Button className="w-full" size="lg">
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
