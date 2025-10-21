import { Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const FutureVisionBanner = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-midnight via-primary/90 to-accent relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 zellij-pattern opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6 animate-fade-in border border-white/30">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Coming Soon</span>
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Main heading */}
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            The Future of Morocco
            <br />
            <span className="text-gradient-sunset inline-block mt-2">
              Is Being Delivered
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
            From your favorite tajine to your weekly groceries — Morocco, delivered.
          </p>

          {/* Coming features */}
          <div className="grid md:grid-cols-2 gap-6 mb-10 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-scale transition-all duration-300">
              <div className="text-3xl mb-3">🛒</div>
              <h3 className="text-xl font-bold text-white mb-2">ATLAAS MARKET</h3>
              <p className="text-white/80">
                Fresh groceries from local markets to your kitchen
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-scale transition-all duration-300">
              <div className="text-3xl mb-3">💊</div>
              <h3 className="text-xl font-bold text-white mb-2">ATLAAS PHARMA</h3>
              <p className="text-white/80">
                Medicines and health essentials, delivered with care
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-bold px-8 py-6 text-lg shadow-glow"
            >
              <TrendingUp className="w-5 h-5 mr-2" />
              Join the Waiting List
            </Button>
            <p className="text-white/70 text-sm">
              Be the first to know when we launch
            </p>
          </div>

          {/* Footer tagline */}
          <p className="mt-12 text-2xl md:text-3xl font-bold text-white/90 italic">
            "Building Morocco's future, one delivery at a time."
          </p>
        </div>
      </div>
    </section>
  );
};

export default FutureVisionBanner;
