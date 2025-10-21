import { Button } from "@/components/ui/button";
import { Smartphone, QrCode, Apple, Play } from "lucide-react";
import appMockup from "@/assets/app-mockup.jpg";

const AppPreview = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-atlas opacity-5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            Morocco in Your Pocket
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            Beautiful design meets Moroccan functionality. Download now for iOS and Android.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* App Features */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="bg-primary/10 rounded-xl p-3 mt-1">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Moroccan UI Design</h3>
                <p className="text-muted-foreground text-lg">
                  Beautiful interface inspired by Moroccan art and colors. 
                  Easy to use in Arabic, French, and English.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-accent/10 rounded-xl p-3 mt-1">
                <QrCode className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Quick & Simple</h3>
                <p className="text-muted-foreground text-lg">
                  Order in 3 taps. Save your favorite spots. 
                  Reorder with one click. It's that easy.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="bg-midnight/10 rounded-xl p-3 mt-1">
                <Smartphone className="w-6 h-6 text-midnight" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground text-lg">
                  Your data stays in Morocco. Bank-level security. 
                  Multiple payment options including cash.
                </p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="pt-8 space-y-4">
              <Button 
                size="lg" 
                className="w-full bg-midnight hover:bg-midnight/90 text-midnight-foreground py-6 text-lg font-semibold flex items-center justify-center gap-3"
              >
                <Apple className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-base font-bold">App Store</div>
                </div>
              </Button>

              <Button 
                size="lg" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-base font-bold">Google Play</div>
                </div>
              </Button>
            </div>

            {/* QR Code Placeholder */}
            <div className="bg-card rounded-2xl p-6 shadow-warm text-center">
              <div className="inline-block bg-secondary/30 p-4 rounded-xl mb-3">
                <QrCode className="w-24 h-24 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Scan QR code to download instantly
              </p>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div className="relative">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-center gap-4 animate-fade-in">
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-glow">
                  1
                </div>
                <div className="flex-1">
                  <div className="bg-card rounded-2xl p-6 shadow-warm border-l-4 border-primary">
                    <h3 className="text-xl font-bold mb-2">Order Placed</h3>
                    <p className="text-muted-foreground">Customer browses restaurants and places order</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full animate-pulse" />
              </div>

              {/* Step 2 */}
              <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex-shrink-0 w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-glow">
                  2
                </div>
                <div className="flex-1">
                  <div className="bg-card rounded-2xl p-6 shadow-warm border-l-4 border-accent">
                    <h3 className="text-xl font-bold mb-2">Restaurant Prepares</h3>
                    <p className="text-muted-foreground">Restaurant receives and prepares the order</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-accent to-midnight rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
              </div>

              {/* Step 3 */}
              <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="flex-shrink-0 w-16 h-16 bg-midnight text-midnight-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-glow">
                  3
                </div>
                <div className="flex-1">
                  <div className="bg-card rounded-2xl p-6 shadow-warm border-l-4 border-midnight">
                    <h3 className="text-xl font-bold mb-2">Rider Picks Up</h3>
                    <p className="text-muted-foreground">Rider collects order and starts delivery</p>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-1 h-8 bg-gradient-to-b from-midnight to-primary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>

              {/* Step 4 */}
              <div className="flex items-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="flex-shrink-0 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold shadow-glow animate-pulse">
                  4
                </div>
                <div className="flex-1">
                  <div className="bg-card rounded-2xl p-6 shadow-warm border-l-4 border-primary">
                    <h3 className="text-xl font-bold mb-2">Delivered</h3>
                    <p className="text-muted-foreground">Order arrives at customer's door with live tracking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
