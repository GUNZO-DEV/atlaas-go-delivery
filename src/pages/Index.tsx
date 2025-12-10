import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike, Smartphone, MapPin, Clock, Shield, Bell, CreditCard, QrCode, Star, Package, Heart, Search } from "lucide-react";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";
import { useLanguage } from "@/contexts/LanguageContext";
import AuierDeliveryIcon from "@/components/AuierDeliveryIcon";

// Phone screen content components
const HomeScreen = () => (
  <div className="p-3 h-full">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[10px] text-muted-foreground">Deliver to</p>
        <p className="text-xs font-semibold">Ifrane, Morocco 📍</p>
      </div>
      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
        <Bell className="w-3.5 h-3.5 text-primary" />
      </div>
    </div>
    <div className="bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-2 mb-3">
      <Search className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">Search restaurants...</span>
    </div>
    <p className="text-xs font-semibold mb-2">Popular Near You</p>
    <div className="space-y-2">
      {["Hani Sugar Art", "Café La Paix", "Bonsai Sushi"].map((name, i) => (
        <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg" />
          <div className="flex-1">
            <p className="text-[10px] font-semibold">{name}</p>
            <div className="flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span className="text-[8px] text-muted-foreground">4.{8-i} • 20-30 min</span>
            </div>
          </div>
          <Heart className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      ))}
    </div>
  </div>
);

const TrackingScreen = () => (
  <div className="p-3 h-full">
    <p className="text-xs font-semibold mb-2">Order Tracking</p>
    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl h-24 mb-3 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full" />
        <div className="absolute top-8 right-6 w-2 h-2 bg-accent rounded-full animate-pulse" />
        <div className="absolute bottom-4 left-1/2 w-2 h-2 bg-primary rounded-full" />
        <svg className="absolute inset-0 w-full h-full">
          <path d="M20 20 Q60 40 80 30 T120 50" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeDasharray="4" />
        </svg>
      </div>
      <MapPin className="w-6 h-6 text-accent animate-bounce" />
    </div>
    <div className="bg-muted/30 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <Package className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold">On the way!</p>
          <p className="text-[8px] text-muted-foreground">Arriving in 12 min</p>
        </div>
      </div>
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
    </div>
  </div>
);

const OrderScreen = () => (
  <div className="p-3 h-full">
    <p className="text-xs font-semibold mb-2">Your Order</p>
    <div className="space-y-2 mb-3">
      {[
        { name: "Chocolate Cake", price: "85 DH", qty: 1 },
        { name: "Custom Pastry", price: "45 DH", qty: 2 },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent/30 to-primary/20 rounded-lg" />
            <div>
              <p className="text-[10px] font-semibold">{item.name}</p>
              <p className="text-[8px] text-muted-foreground">Qty: {item.qty}</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-primary">{item.price}</p>
        </div>
      ))}
    </div>
    <div className="border-t border-border pt-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span className="text-muted-foreground">Subtotal</span>
        <span>175 DH</span>
      </div>
      <div className="flex justify-between text-[10px] mb-2">
        <span className="text-muted-foreground">Delivery</span>
        <span>15 DH</span>
      </div>
      <div className="flex justify-between text-xs font-bold">
        <span>Total</span>
        <span className="text-primary">190 DH</span>
      </div>
    </div>
    <Button size="sm" className="w-full mt-3 h-7 text-[10px]">Place Order</Button>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeScreen, setActiveScreen] = useState(0);
  const screens = [
    { component: <HomeScreen />, label: "Browse" },
    { component: <TrackingScreen />, label: "Track" },
    { component: <OrderScreen />, label: "Order" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
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
            {/* Phone Mockup with Real Screens */}
            <div className="flex-shrink-0 relative">
              <div className="w-56 h-[440px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[2.5rem] p-2 shadow-2xl border border-zinc-700">
                {/* Phone frame details */}
                <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-900 rounded-b-xl z-10 flex items-center justify-center">
                    <div className="w-8 h-2 bg-zinc-800 rounded-full" />
                  </div>
                  {/* Status bar */}
                  <div className="h-8 bg-background flex items-end justify-between px-4 pb-1 text-[8px] text-muted-foreground">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-1.5 bg-foreground rounded-sm" />
                      <div className="w-3 h-1.5 bg-foreground rounded-sm" />
                    </div>
                  </div>
                  {/* Screen content with transition */}
                  <div className="h-[340px] overflow-hidden">
                    <div 
                      className="transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${activeScreen * 100}%)`, display: 'flex', width: '300%' }}
                    >
                      {screens.map((screen, i) => (
                        <div key={i} className="w-full flex-shrink-0" style={{ width: '224px' }}>
                          {screen.component}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bottom nav */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-background border-t border-border flex items-center justify-around px-4">
                    {screens.map((screen, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveScreen(i)}
                        className={`flex flex-col items-center gap-0.5 transition-colors ${activeScreen === i ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {i === 0 && <Search className="w-4 h-4" />}
                        {i === 1 && <MapPin className="w-4 h-4" />}
                        {i === 2 && <Package className="w-4 h-4" />}
                        <span className="text-[8px]">{screen.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Screen indicator dots */}
              <div className="flex gap-2 justify-center mt-4">
                {screens.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScreen(i)}
                    className={`w-2 h-2 rounded-full transition-all ${activeScreen === i ? 'bg-primary w-6' : 'bg-muted-foreground/30'}`}
                  />
                ))}
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