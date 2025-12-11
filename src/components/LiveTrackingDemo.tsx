import { useState, useEffect } from "react";
import { Package, Bike, MapPin, MessageCircle, Clock, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const LiveTrackingDemo = () => {
  const { t } = useLanguage();
  const [orderStatus, setOrderStatus] = useState(0);
  const [riderPosition, setRiderPosition] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const statuses = [
    { text: "Order Placed", icon: Package },
    { text: "Preparing Food", icon: Package },
    { text: "Rider Assigned", icon: Bike },
    { text: "On the Way", icon: Bike },
    { text: "Delivered!", icon: MapPin },
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setOrderStatus((prev) => (prev < statuses.length - 1 ? prev + 1 : 0));
    }, 3000);

    const riderInterval = setInterval(() => {
      setRiderPosition((prev) => (prev < 100 ? prev + 2 : 0));
    }, 100);

    const chatTimeout = setTimeout(() => setShowChat(true), 1500);

    return () => {
      clearInterval(statusInterval);
      clearInterval(riderInterval);
      clearTimeout(chatTimeout);
    };
  }, []);

  useEffect(() => {
    if (orderStatus === 0) {
      setRiderPosition(0);
      setShowChat(false);
      const chatTimeout = setTimeout(() => setShowChat(true), 1500);
      return () => clearTimeout(chatTimeout);
    }
  }, [orderStatus]);

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('tracking.title')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('tracking.subtitle')}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-xl border shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Map Visualization */}
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-6 border overflow-hidden">
                {/* Grid Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                {/* Restaurant Pin */}
                <div className="absolute top-6 left-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/30 rounded-full animate-ping" />
                    <div className="relative bg-accent text-accent-foreground p-3 rounded-full shadow-lg">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-xs font-bold mt-2 bg-accent text-accent-foreground px-2 py-1 rounded">
                    Restaurant
                  </span>
                </div>

                {/* Customer Pin */}
                <div className="absolute bottom-6 right-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                    <div className="relative bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <span className="text-xs font-bold mt-2 bg-primary text-primary-foreground px-2 py-1 rounded">
                    You
                  </span>
                </div>

                {/* Delivery Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 60 60 Q 180 130, 300 300"
                    fill="none"
                    stroke="url(#pathGradient)"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    className="animate-pulse"
                  />
                </svg>

                {/* Animated Rider */}
                <div 
                  className="absolute transition-all duration-200 ease-linear z-10"
                  style={{
                    left: `${15 + (riderPosition * 0.65)}%`,
                    top: `${15 + (riderPosition * 0.65)}%`,
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping" />
                    <div className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-3 rounded-full shadow-xl border-2 border-background">
                      <Bike className="w-6 h-6" />
                    </div>
                  </div>
                  
                  {/* ETA Badge */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/95 backdrop-blur-sm text-primary font-bold text-xs px-2 py-1 rounded-full shadow-lg border">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {Math.max(1, Math.ceil((100 - riderPosition) / 10))} min
                  </div>
                </div>

                {/* Chat Bubbles */}
                {showChat && (
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 space-y-2 animate-fade-in">
                    <div className="bg-background/95 backdrop-blur-sm text-foreground text-xs px-3 py-1.5 rounded-xl rounded-bl-none shadow-lg border">
                      <MessageCircle className="w-3 h-3 inline mr-1 text-accent" />
                      Order confirmed!
                    </div>
                    <div className="bg-primary/95 text-primary-foreground text-xs px-3 py-1.5 rounded-xl rounded-br-none shadow-lg ml-auto">
                      On my way 🏍️
                    </div>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-accent to-primary rounded-full" />
                  Live Order Status
                </h3>

                {statuses.map((status, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 transition-all duration-300 ${
                      index === orderStatus
                        ? "scale-105 translate-x-1"
                        : index < orderStatus
                        ? "opacity-60"
                        : "opacity-30"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-full transition-all duration-300 ${
                        index === orderStatus
                          ? "bg-primary shadow-lg animate-pulse"
                          : index < orderStatus
                          ? "bg-primary/70"
                          : "bg-muted"
                      }`}
                    >
                      <status.icon
                        className={`w-5 h-5 ${
                          index <= orderStatus ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold transition-all duration-300 ${
                        index === orderStatus ? "text-primary" : ""
                      }`}>
                        {status.text}
                      </p>
                      {index === orderStatus && (
                        <p className="text-xs text-muted-foreground animate-fade-in">
                          Just now
                        </p>
                      )}
                    </div>
                    {index === orderStatus && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                ))}

                {/* Features */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Real-time GPS tracking</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">In-app chat with rider</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">Live ETA updates</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default LiveTrackingDemo;
