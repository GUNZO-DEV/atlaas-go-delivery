import { useState, useEffect } from "react";
import { Package, Bike, MapPin, MessageCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

const RealtimeDemoSection = () => {
  const [orderStatus, setOrderStatus] = useState(0);
  const [riderPosition, setRiderPosition] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const statuses = [
    { text: "Order Placed", icon: Package, color: "text-accent" },
    { text: "Preparing Food", icon: Package, color: "text-accent" },
    { text: "Rider Assigned", icon: Bike, color: "text-primary" },
    { text: "On the Way", icon: Bike, color: "text-primary" },
    { text: "Delivered!", icon: MapPin, color: "text-primary-glow" },
  ];

  useEffect(() => {
    const statusInterval = setInterval(() => {
      setOrderStatus((prev) => (prev < statuses.length - 1 ? prev + 1 : 0));
    }, 3000);

    const riderInterval = setInterval(() => {
      setRiderPosition((prev) => (prev < 100 ? prev + 2 : 0));
    }, 100);

    const chatTimeout = setTimeout(() => {
      setShowChat(true);
    }, 1500);

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
      const chatTimeout = setTimeout(() => {
        setShowChat(true);
      }, 1500);
      return () => clearTimeout(chatTimeout);
    }
  }, [orderStatus]);

  const CurrentIcon = statuses[orderStatus].icon;

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 zellij-pattern opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border-2 border-primary/30 rounded-full px-6 py-2 mb-6">
            <span className="text-2xl">🇲🇦</span>
            <span className="text-primary font-bold text-sm">Powered by Moroccan Developers</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Real-Time <span className="text-gradient-morocco">Technology</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Watch how our advanced real-time system works. Every order, every movement, every message — instantly synchronized.
          </p>
        </div>

        {/* Demo Container */}
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 bg-card/80 backdrop-blur-xl border-2 shadow-xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Map Visualization */}
              <div className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-2xl p-8 border-2 border-border overflow-hidden">
                {/* Map Background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                {/* Restaurant Pin */}
                <div className="absolute top-8 left-8 flex flex-col items-center animate-float">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/30 rounded-full animate-ping" />
                    <div className="relative bg-accent text-white p-3 rounded-full shadow-lg">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>
                  <span className="text-xs font-bold mt-2 bg-accent/90 text-white px-2 py-1 rounded">
                    Restaurant
                  </span>
                </div>

                {/* Customer Pin */}
                <div className="absolute bottom-8 right-8 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                    <div className="relative bg-primary text-white p-3 rounded-full shadow-lg">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                  <span className="text-xs font-bold mt-2 bg-primary/90 text-white px-2 py-1 rounded">
                    You
                  </span>
                </div>

                {/* Animated Delivery Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 80 80 Q 200 150, 320 320"
                    fill="none"
                    stroke="url(#pathGradient)"
                    strokeWidth="4"
                    strokeDasharray="10,5"
                    className="animate-pulse"
                  />
                </svg>

                {/* Animated Rider */}
                <div 
                  className="absolute transition-all duration-200 ease-linear"
                  style={{
                    left: `${20 + (riderPosition * 0.6)}%`,
                    top: `${20 + (riderPosition * 0.6)}%`,
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary-glow/40 rounded-full animate-ping" />
                    <div className="relative bg-gradient-to-br from-primary to-primary-glow text-white p-4 rounded-full shadow-2xl border-2 border-white">
                      <Bike className="w-7 h-7" />
                    </div>
                  </div>
                  
                  {/* ETA Badge */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white/95 backdrop-blur-sm text-primary font-bold text-xs px-3 py-1.5 rounded-full shadow-lg border border-primary/20">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {Math.max(1, Math.ceil((100 - riderPosition) / 10))} min
                  </div>
                </div>

                {/* Chat Bubbles */}
                {showChat && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 space-y-2 animate-fade-in">
                    <div className="bg-white/95 backdrop-blur-sm text-foreground text-xs px-4 py-2 rounded-2xl rounded-bl-none shadow-lg max-w-[160px] border border-border">
                      <MessageCircle className="w-3 h-3 inline mr-1 text-accent" />
                      Order confirmed!
                    </div>
                    <div className="bg-primary/95 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-2xl rounded-br-none shadow-lg max-w-[160px] ml-auto">
                      On my way 🏍️
                    </div>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="space-y-6">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-accent to-primary rounded-full" />
                  Live Order Status
                </h3>

                {statuses.map((status, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-4 transition-all duration-500 ${
                      index === orderStatus
                        ? "scale-110 translate-x-2"
                        : index < orderStatus
                        ? "opacity-50"
                        : "opacity-30"
                    }`}
                  >
                    <div
                      className={`${
                        index === orderStatus
                          ? `bg-gradient-to-br from-${status.color.split('-')[1]} to-${status.color.split('-')[1]}-glow shadow-glow`
                          : index < orderStatus
                          ? "bg-primary"
                          : "bg-muted"
                      } p-3 rounded-full transition-all duration-500 ${
                        index === orderStatus ? "animate-pulse" : ""
                      }`}
                    >
                      <status.icon
                        className={`w-6 h-6 ${
                          index <= orderStatus ? "text-white" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`font-bold transition-all duration-500 ${
                          index === orderStatus
                            ? `${status.color} text-lg`
                            : index < orderStatus
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {status.text}
                      </p>
                      {index === orderStatus && (
                        <p className="text-xs text-muted-foreground animate-fade-in">
                          Real-time update • Just now
                        </p>
                      )}
                    </div>
                    {index === orderStatus && (
                      <div className="w-2 h-2 bg-primary-glow rounded-full animate-pulse" />
                    )}
                  </div>
                ))}

                {/* Tech Stack Badge */}
                <div className="mt-8 pt-8 border-t border-border">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 bg-primary rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold text-white">
                        WS
                      </div>
                      <div className="w-6 h-6 bg-accent rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold text-white">
                        RT
                      </div>
                      <div className="w-6 h-6 bg-primary-glow rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold text-white">
                        DB
                      </div>
                    </div>
                    <span>WebSocket • Real-time DB • Live Tracking</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
              <div className="text-center">
                <div className="text-3xl font-black text-primary-glow mb-1">~50ms</div>
                <div className="text-xs text-muted-foreground">Average Latency</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-accent mb-1">100%</div>
                <div className="text-xs text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-primary mb-1">Live</div>
                <div className="text-xs text-muted-foreground">Real-time Updates</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RealtimeDemoSection;
