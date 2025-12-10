import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import FeaturedRestaurants from "@/components/FeaturedRestaurants";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Bike, Smartphone, MapPin, Clock, Shield, Bell, CreditCard, QrCode, Star, Package, Heart, Search, Navigation, CheckCircle2, Utensils, MessageCircle } from "lucide-react";
import { AtlaasAIChat } from "@/components/AtlaasAIChat";
import { useLanguage } from "@/contexts/LanguageContext";
import AuierDeliveryIcon from "@/components/AuierDeliveryIcon";

// Enhanced Phone screen content components
const HomeScreen = () => (
  <div className="p-3 h-full bg-gradient-to-b from-background to-muted/20">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[10px] text-muted-foreground">Deliver to</p>
        <p className="text-xs font-semibold flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary" />
          Ifrane, Morocco
        </p>
      </div>
      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
        <Bell className="w-3.5 h-3.5 text-primary" />
      </div>
    </div>
    <div className="bg-muted/50 rounded-xl px-3 py-2 flex items-center gap-2 mb-3 border border-border/50">
      <Search className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">Search restaurants...</span>
    </div>
    <p className="text-xs font-semibold mb-2">Popular Near You</p>
    <div className="space-y-2">
      {[
        { name: "Hani Sugar Art", rating: "4.9", time: "25-35", cuisine: "Desserts" },
        { name: "Café La Paix", rating: "4.7", time: "20-30", cuisine: "Café" },
        { name: "Bonsai Sushi", rating: "4.8", time: "30-40", cuisine: "Japanese" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2 bg-card rounded-xl p-2 border border-border/30 shadow-sm">
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
            <Utensils className="w-4 h-4 text-primary/70" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold truncate">{item.name}</p>
            <div className="flex items-center gap-1">
              <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              <span className="text-[8px] text-muted-foreground">{item.rating} • {item.time} min</span>
            </div>
          </div>
          <Heart className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
      ))}
    </div>
  </div>
);

const LiveTrackingScreen = () => (
  <div className="p-3 h-full bg-gradient-to-b from-primary/5 to-background">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-semibold">Live Tracking</p>
      <span className="text-[8px] bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full font-medium">LIVE</span>
    </div>
    {/* Map visualization */}
    <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-xl h-28 mb-3 relative overflow-hidden border border-primary/20">
      {/* Animated map elements */}
      <div className="absolute inset-0">
        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M10 60 Q50 30 100 50 T180 40" stroke="hsl(var(--muted-foreground))" strokeWidth="2" fill="none" opacity="0.3" />
          <path d="M20 80 Q80 70 120 85 T200 70" stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" fill="none" opacity="0.2" />
        </svg>
        {/* Restaurant marker */}
        <div className="absolute top-3 left-4 flex flex-col items-center">
          <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center shadow-lg">
            <Store className="w-2.5 h-2.5 text-white" />
          </div>
          <div className="w-1 h-2 bg-accent/50 rounded-b" />
        </div>
        {/* Animated rider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-xl ring-4 ring-primary/30">
            <Bike className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        {/* Destination marker */}
        <div className="absolute bottom-3 right-4 flex flex-col items-center">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <MapPin className="w-2.5 h-2.5 text-white" />
          </div>
        </div>
        {/* Dotted path */}
        <svg className="absolute inset-0 w-full h-full">
          <path d="M35 25 Q90 50 112 56 T175 85" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-pulse" />
        </svg>
      </div>
    </div>
    {/* Status card */}
    <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow">
          <Navigation className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-bold">Ahmed is on the way!</p>
          <p className="text-[9px] text-muted-foreground">Your order arrives in ~8 min</p>
        </div>
      </div>
      {/* Progress steps */}
      <div className="flex items-center gap-1 mt-2">
        {["Confirmed", "Preparing", "Picked up", "Arriving"].map((step, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className={`w-full h-1 rounded-full ${i <= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`text-[7px] mt-1 ${i <= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{step}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const NotificationsScreen = () => (
  <div className="p-3 h-full bg-gradient-to-b from-background to-muted/20">
    <p className="text-xs font-semibold mb-3">Notifications</p>
    <div className="space-y-2">
      {[
        { icon: CheckCircle2, title: "Order Delivered!", desc: "Your order has been delivered", time: "Just now", color: "text-green-500", bg: "bg-green-500/10" },
        { icon: Bike, title: "Rider Assigned", desc: "Ahmed is picking up your order", time: "5 min ago", color: "text-primary", bg: "bg-primary/10" },
        { icon: Utensils, title: "Order Confirmed", desc: "Hani Sugar Art accepted your order", time: "15 min ago", color: "text-accent", bg: "bg-accent/10" },
        { icon: Star, title: "Rate Your Order", desc: "How was your last delivery?", time: "1 hour ago", color: "text-amber-500", bg: "bg-amber-500/10" },
      ].map((notif, i) => (
        <div key={i} className="flex items-start gap-2 bg-card rounded-xl p-2.5 border border-border/30">
          <div className={`w-8 h-8 ${notif.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <notif.icon className={`w-4 h-4 ${notif.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold">{notif.title}</p>
            <p className="text-[8px] text-muted-foreground truncate">{notif.desc}</p>
          </div>
          <span className="text-[7px] text-muted-foreground whitespace-nowrap">{notif.time}</span>
        </div>
      ))}
    </div>
  </div>
);

const ChatScreen = () => (
  <div className="p-3 h-full bg-gradient-to-b from-background to-muted/20 flex flex-col">
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
        <Bike className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold">Ahmed - Your Rider</p>
        <p className="text-[8px] text-green-500">Online</p>
      </div>
    </div>
    <div className="flex-1 space-y-2 overflow-hidden">
      <div className="bg-muted/50 rounded-xl rounded-tl-sm p-2 max-w-[80%]">
        <p className="text-[9px]">Hello! I'm on my way to pick up your order 🏍️</p>
        <p className="text-[7px] text-muted-foreground mt-1">2:34 PM</p>
      </div>
      <div className="bg-primary text-white rounded-xl rounded-tr-sm p-2 max-w-[80%] ml-auto">
        <p className="text-[9px]">Great, thank you! 👍</p>
        <p className="text-[7px] text-white/70 mt-1">2:35 PM</p>
      </div>
      <div className="bg-muted/50 rounded-xl rounded-tl-sm p-2 max-w-[80%]">
        <p className="text-[9px]">I've picked up your order, arriving in 8 minutes!</p>
        <p className="text-[7px] text-muted-foreground mt-1">2:45 PM</p>
      </div>
    </div>
    <div className="mt-2 flex gap-2">
      <div className="flex-1 bg-muted/50 rounded-full px-3 py-1.5 text-[9px] text-muted-foreground">Type a message...</div>
      <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
        <MessageCircle className="w-3.5 h-3.5 text-white" />
      </div>
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeScreen, setActiveScreen] = useState(0);
  
  const screens = [
    { component: <HomeScreen />, label: "Home", icon: Search },
    { component: <LiveTrackingScreen />, label: "Track", icon: MapPin },
    { component: <NotificationsScreen />, label: "Alerts", icon: Bell },
    { component: <ChatScreen />, label: "Chat", icon: MessageCircle },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 4000);
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
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-amber-500/30 bg-gradient-to-br from-background to-amber-50/10" onClick={() => navigate("/auier-delivery")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-32 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 rounded-lg mb-4">
                  <AuierDeliveryIcon className="w-28 h-auto" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-amber-600">AUIER Campus Delivery</h3>
                <p className="text-muted-foreground text-sm mb-4">From 20 DH - Fast campus delivery for students</p>
                <Button className="w-full bg-amber-500 hover:bg-amber-600" size="lg">Order for Campus</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg hover-scale transition-all duration-300 cursor-pointer border-primary/20" onClick={() => navigate("/restaurant")}>
              <CardContent className="p-6">
                <img src="https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800" alt="Hani Sugar Art" className="w-full h-32 object-cover rounded-lg mb-4" />
                <h3 className="text-xl font-bold mb-2 text-primary">Hani Sugar Art</h3>
                <p className="text-muted-foreground text-sm mb-4">Custom cakes & pastries crafted with love</p>
                <Button className="w-full" size="lg">Order Now</Button>
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
            {[
              { icon: MapPin, title: "Live Tracking", desc: "Real-time order tracking", color: "text-primary", bg: "bg-primary/10" },
              { icon: Clock, title: "Fast Delivery", desc: "30 min average", color: "text-accent", bg: "bg-accent/10" },
              { icon: Shield, title: "Secure Payments", desc: "Cash & card accepted", color: "text-secondary-foreground", bg: "bg-secondary/30" },
              { icon: Bell, title: "Notifications", desc: "Stay updated always", color: "text-primary", bg: "bg-primary/10" },
            ].map((feature, i) => (
              <div key={i} className="text-center group">
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile App Section with Enhanced Mockup */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
            {/* Enhanced Phone Mockup */}
            <div className="flex-shrink-0 relative">
              <div className="w-60 h-[480px] bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-[2.5rem] p-2 shadow-2xl border border-zinc-700">
                <div className="w-full h-full bg-background rounded-[2rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-10 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-zinc-700 rounded-full" />
                    <div className="w-10 h-3 bg-zinc-800 rounded-full" />
                  </div>
                  {/* Status bar */}
                  <div className="h-8 bg-background flex items-end justify-between px-6 pb-1 text-[9px] font-medium">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-0.5">
                        {[1,2,3,4].map(i => <div key={i} className="w-1 h-2 bg-foreground rounded-sm" />)}
                      </div>
                      <div className="w-6 h-2.5 bg-foreground rounded-sm relative">
                        <div className="absolute right-0.5 top-0.5 bottom-0.5 w-0.5 bg-green-500 rounded-sm" />
                      </div>
                    </div>
                  </div>
                  {/* Screen content */}
                  <div className="h-[380px] overflow-hidden">
                    <div 
                      className="transition-all duration-700 ease-in-out flex"
                      style={{ transform: `translateX(-${activeScreen * 100}%)`, width: `${screens.length * 100}%` }}
                    >
                      {screens.map((screen, i) => (
                        <div key={i} className="flex-shrink-0" style={{ width: `${100 / screens.length}%` }}>
                          {screen.component}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Bottom nav */}
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-background/95 backdrop-blur border-t border-border flex items-center justify-around px-2">
                    {screens.map((screen, i) => {
                      const Icon = screen.icon;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveScreen(i)}
                          className={`flex flex-col items-center gap-0.5 p-2 rounded-xl transition-all ${activeScreen === i ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-[8px] font-medium">{screen.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Home indicator */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-foreground/20 rounded-full" />
                </div>
              </div>
              {/* Screen indicator dots */}
              <div className="flex gap-2 justify-center mt-5">
                {screens.map((screen, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScreen(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${activeScreen === i ? 'bg-primary w-8' : 'bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50'}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get the App</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Download ATLAAS GO for the best ordering experience. Track your delivery in real-time, chat with your rider, and get instant notifications.
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
                <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> Easy payments</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Live tracking</span>
                <span className="flex items-center gap-1"><Bell className="w-4 h-4" /> Push notifications</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> Chat with rider</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Where We Deliver</h2>
            <p className="text-muted-foreground">Currently serving these cities in Morocco</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Active City - Ifrane */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background hover:shadow-lg transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  LIVE NOW
                </div>
                <h3 className="text-xl font-bold mb-1">Ifrane</h3>
                <p className="text-muted-foreground text-sm mb-3">Including AUIER Campus</p>
                <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                  <span>🏪 10+ Restaurants</span>
                  <span>🛵 Fast Delivery</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Coming Soon Cities */}
            {[
              { name: "Fes", desc: "Morocco's cultural capital" },
              { name: "Meknes", desc: "The Imperial city" },
            ].map((city, i) => (
              <Card key={i} className="border-dashed border-2 bg-muted/20 hover:bg-muted/30 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                    COMING SOON
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-muted-foreground">{city.name}</h3>
                  <p className="text-muted-foreground text-sm">{city.desc}</p>
                </CardContent>
              </Card>
            ))}
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