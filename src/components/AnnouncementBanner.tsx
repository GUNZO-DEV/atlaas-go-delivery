import { Sparkles, MapPin } from "lucide-react";

const AnnouncementBanner = () => {
  return (
    <div className="bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[gradient_3s_ease_infinite] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(255,255,255,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 py-3 md:py-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
          <div className="flex items-center gap-2 animate-bounce">
            <Sparkles className="w-5 h-5 text-white" />
            <span className="text-white font-bold text-sm md:text-base">BIG NEWS!</span>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <p className="text-white font-semibold text-sm md:text-lg">
              We're launching in <span className="underline decoration-2 underline-offset-2">Taourirt</span> this Monday!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
