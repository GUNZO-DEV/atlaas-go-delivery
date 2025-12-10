import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike, Smartphone, MapPin, Clock, Shield, Bell, CreditCard, QrCode } from "lucide-react";
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
      
      {/* Quick Order Section */}
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

      {/* Features Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Why Choose ATLAAS GO?</h2>
            <p className="text-muted-foreground">A seamless delivery experience built for Morocco</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Live Tracking</h3>
              <p className="text-muted-foreground text-sm">Real-time order tracking</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/20 transition-colors">
                <Clock className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold mb-1">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">30 min average</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-secondary/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-secondary/40 transition-colors">
                <Shield className="w-7 h-7 text-secondary-foreground" />
              </div>
              <h3 className="font-semibold mb-1">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">Cash & card accepted</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                <Bell className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Notifications</h3>
              <p className="text-muted-foreground text-sm">Stay updated always</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            {/* Phone Mockup */}
            <div className="flex-shrink-0 relative">
              <div className="w-64 h-[500px] bg-gradient-to-b from-muted to-muted/50 rounded-[3rem] p-3 shadow-2xl border border-border">
                <div className="w-full h-full bg-background rounded-[2.5rem] overflow-hidden relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-muted rounded-b-2xl" />
                  <div className="p-4 pt-10">
                    <div className="text-center mb-4">
                      <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">A</span>
                      </div>
                      <p className="font-bold text-sm">ATLAAS GO</p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                      <div className="h-16 bg-muted/30 rounded-xl" />
                      <div className="h-16 bg-muted/30 rounded-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get the App</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Download ATLAAS GO for the best ordering experience. Track your delivery in real-time, save favorites, and order with one tap.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-8 justify-center md:justify-start">
                <Button size="lg" className="gap-2" onClick={() => navigate("/install")}>
                  <Smartphone className="w-5 h-5" />
                  Install App
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <QrCode className="w-5 h-5" />
                  Scan QR Code
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4" /> Easy payments
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Live tracking
                </span>
                <span className="flex items-center gap-1">
                  <Bell className="w-4 h-4" /> Push notifications
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Section */}
      <section className="py-12 md:py-16 bg-muted/30">
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

      <Footer />
      <AtlaasAIChat />
    </div>
  );
};

export default Index;