import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import LiveTracking from "@/components/LiveTracking";
import RealtimeDemoSection from "@/components/RealtimeDemoSection";
import MerchantSection from "@/components/MerchantSection";
import DriverSection from "@/components/DriverSection";
import CustomerSection from "@/components/CustomerSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import CityPresenceMap from "@/components/CityPresenceMap";
import AppPreview from "@/components/AppPreview";
import SocialProofStrip from "@/components/SocialProofStrip";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike } from "lucide-react";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";
import { useLanguage } from "@/contexts/LanguageContext";
import AuierDeliveryIcon from "@/components/AuierDeliveryIcon";

const Index = () => {
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  return <div className="min-h-screen">
      <Hero />
      <FeaturedRestaurants />
      
      {/* Quick Order Section */}
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-4">{t('order.title')}</h2>
            <p className="text-muted-foreground text-sm md:text-base px-4">{t('order.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
            <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/restaurants")}>
                <CardContent className="p-6">
                  <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" alt="Browse Restaurants" className="w-full h-48 object-cover rounded-lg mb-4 transition-transform" />
                  <h3 className="text-2xl font-bold mb-2">{t('order.browseTitle')}</h3>
                  <p className="text-muted-foreground mb-4">{t('order.browseDesc')}</p>
                  <Button className="w-full" size="lg">
                    {t('order.browse')}
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-amber-500/30 bg-gradient-to-br from-background to-amber-50/10" onClick={() => navigate("/auier-delivery")}>
                <CardContent className="p-6">
                  <div className="relative flex items-center justify-center h-48 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg mb-4">
                    <AuierDeliveryIcon className="w-40 h-auto" />
                    <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      Students Only 🎓
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-amber-600">AUIER Delivery</h3>
                  <p className="text-muted-foreground mb-2">Campus delivery from 20 dh - Fast & affordable</p>
                  <div className="flex gap-2 text-xs text-muted-foreground mb-4">
                    <span>• Restaurant to Dorm: 35 dh</span>
                    <span>• Main Gate to Dorm: 20 dh</span>
                  </div>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600" size="lg">
                    Order for Campus
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="w-full hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-primary/20" onClick={() => navigate("/restaurant")}>
                <CardContent className="p-6">
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800" alt="Hani Sugar Art - Premium Desserts" className="w-full h-48 object-cover rounded-lg mb-4 transition-transform" />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      Order Now! 🍰
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-primary">Hani Sugar Art</h3>
                  <p className="text-muted-foreground mb-4">Exquisite cakes, pastries & custom desserts crafted with love. Order your sweet masterpiece today!</p>
                  <Button className="w-full" size="lg" variant="default">
                    Order Now - Don't Miss Out!
                  </Button>
                </CardContent>
              </Card>
          </div>
        </div>
      </section>

      <SocialProofStrip />

      <LiveTracking />
      <RealtimeDemoSection />
      
      {/* Login Section */}
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 animate-fade-in">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4 px-4">{t('partner.title')}</h2>
            <p className="text-muted-foreground text-sm md:text-base px-4">{t('partner.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/partner-restaurant")}>
              <CardContent className="p-6 md:p-8 text-center">
                <Store className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-3 md:mb-4 transition-transform" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">{t('partner.restaurant')}</h3>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">{t('partner.restaurantDesc')}</p>
                <Button className="w-full" size="lg">
                  {t('partner.applyNow')}
                </Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer" onClick={() => navigate("/rider-auth")}>
              <CardContent className="p-6 md:p-8 text-center">
                <Bike className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-3 md:mb-4 transition-transform" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">{t('partner.rider')}</h3>
                <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">{t('partner.riderDesc')}</p>
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
      
      <Footer />
      <AtlaasAIChat />
    </div>;
};
export default Index;