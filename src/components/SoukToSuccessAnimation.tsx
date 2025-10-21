import { Store, TrendingUp, Sparkles, DollarSign } from "lucide-react";

const SoukToSuccessAnimation = () => {
  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20">
      {/* Background Pattern */}
      <div className="absolute inset-0 zellij-pattern opacity-20" />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/80 via-midnight/40 to-transparent" />
      
      {/* Floating Elements Container */}
      <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-8">
        
        {/* Left Side - Traditional Souk */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 animate-fade-in">
          <div className="relative">
            {/* Souk Icon with Pulse */}
            <div className="absolute inset-0 bg-accent/30 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-accent/90 backdrop-blur-sm text-white rounded-3xl p-8 shadow-2xl border-4 border-white/20">
              <Store className="w-16 h-16 animate-[float_3s_ease-in-out_infinite]" />
              <div className="mt-4 text-center">
                <p className="text-sm font-bold">Traditional</p>
                <p className="text-xs">Souk</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center - Connection Path */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64">
          {/* Animated Dotted Line */}
          <svg className="w-full" viewBox="0 0 200 20" fill="none">
            <path
              d="M 10 10 L 190 10"
              stroke="url(#successGradient)"
              strokeWidth="4"
              strokeDasharray="10 5"
              strokeLinecap="round"
              className="animate-[dash_2s_linear_infinite]"
            />
            <defs>
              <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--accent))" />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
              </linearGradient>
            </defs>
          </svg>

          {/* Animated Money/Coins flowing along path */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full">
            <DollarSign className="absolute w-6 h-6 text-primary animate-[flow_3s_ease-in-out_infinite] opacity-80" />
            <DollarSign className="absolute w-6 h-6 text-primary-glow animate-[flow_3s_ease-in-out_infinite_0.5s] opacity-80" style={{ animationDelay: '0.5s' }} />
            <DollarSign className="absolute w-6 h-6 text-accent animate-[flow_3s_ease-in-out_infinite_1s] opacity-80" style={{ animationDelay: '1s' }} />
            <Sparkles className="absolute w-5 h-5 text-primary-glow animate-[flow_3s_ease-in-out_infinite_1.5s] opacity-60" style={{ animationDelay: '1.5s' }} />
            <Sparkles className="absolute w-5 h-5 text-accent animate-[flow_3s_ease-in-out_infinite_2s] opacity-60" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        {/* Right Side - Modern Success */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative">
            {/* Success Icon with Glow */}
            <div className="absolute inset-0 bg-primary-glow/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="relative bg-gradient-to-br from-primary via-primary-glow to-primary text-white rounded-3xl p-8 shadow-2xl border-4 border-white/30 hover-scale">
              <TrendingUp className="w-16 h-16 animate-[float_3s_ease-in-out_infinite_0.5s]" />
              <div className="mt-4 text-center">
                <p className="text-sm font-bold">Success</p>
                <p className="text-xs">+18% Growth</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sparkles */}
        <Sparkles className="absolute top-1/4 left-1/3 w-8 h-8 text-primary-glow opacity-60 animate-[float_4s_ease-in-out_infinite]" />
        <Sparkles className="absolute bottom-1/4 right-1/3 w-6 h-6 text-accent opacity-50 animate-[float_5s_ease-in-out_infinite_1s]" />
        <Sparkles className="absolute top-1/3 right-1/4 w-7 h-7 text-primary opacity-40 animate-[float_4.5s_ease-in-out_infinite_0.5s]" />

        {/* Bottom Text */}
        <div className="absolute bottom-6 left-6 text-white z-10">
          <p className="text-sm font-semibold mb-1 opacity-90">Traditional Quality</p>
          <p className="text-3xl font-bold drop-shadow-lg">From Souk to Success</p>
        </div>
      </div>

      {/* CSS for custom animations */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -30;
          }
        }

        @keyframes flow {
          0% {
            left: 0%;
            opacity: 0;
            transform: translateY(-50%) scale(0.5);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
          100% {
            left: 100%;
            opacity: 0;
            transform: translateY(-50%) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
};

export default SoukToSuccessAnimation;
