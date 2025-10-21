import { Button } from "@/components/ui/button";
import { Smartphone, QrCode, Apple, Play } from "lucide-react";
import moroccanFood from "@/assets/moroccan-food.jpg";
import atlasHero from "@/assets/atlas-mountains-hero.jpg";

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

          {/* Fading Text Over Images */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-elevation">
            {/* Background Images - Crossfade */}
            <div className="absolute inset-0">
              <img 
                src={moroccanFood} 
                alt="Moroccan Tagines" 
                className="absolute inset-0 w-full h-full object-cover animate-[fadeInOut_8s_ease-in-out_infinite]"
              />
              <img 
                src={atlasHero} 
                alt="City Lights" 
                className="absolute inset-0 w-full h-full object-cover animate-[fadeInOut_8s_ease-in-out_infinite_4s]"
              />
            </div>
            
            {/* Dark Overlay for Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
            
            {/* Fading Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-5xl md:text-7xl font-bold text-white text-center px-8 animate-[textFade_4s_ease-in-out_infinite] drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
                From Souk to Success
              </h3>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-8 right-8 bg-primary/90 backdrop-blur-sm text-primary-foreground rounded-2xl p-4 shadow-glow animate-float">
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-xs">User Rating</div>
            </div>

            <div className="absolute bottom-8 left-8 bg-accent/90 backdrop-blur-sm text-accent-foreground rounded-2xl p-4 shadow-glow animate-float" style={{ animationDelay: '1s' }}>
              <div className="text-2xl font-bold">50K+</div>
              <div className="text-xs">Downloads</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppPreview;
