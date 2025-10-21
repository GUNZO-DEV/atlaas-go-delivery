import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const scenes = [
  {
    id: 1,
    title: "Traditional Tagine",
    description: "Steam rising from clay pots",
    emoji: "🍲",
    gradient: "from-orange-400/30 via-amber-300/20 to-yellow-400/30",
    illustration: (
      <div className="relative">
        <div className="text-[120px] animate-[float_3s_ease-in-out_infinite]">🍲</div>
        {/* Steam Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
          <div className="w-2 h-16 bg-white/40 blur-md animate-[rise_2s_ease-in-out_infinite] rounded-full" />
          <div className="w-2 h-16 bg-white/30 blur-md animate-[rise_2s_ease-in-out_infinite_0.5s] rounded-full absolute left-4" style={{ animationDelay: '0.3s' }} />
          <div className="w-2 h-16 bg-white/30 blur-md animate-[rise_2s_ease-in-out_infinite_1s] rounded-full absolute -left-4" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Medina Alleys",
    description: "Winding streets of heritage",
    emoji: "🏛️",
    gradient: "from-blue-400/30 via-indigo-300/20 to-purple-400/30",
    illustration: (
      <div className="relative">
        <div className="text-[120px] animate-[sway_4s_ease-in-out_infinite]">🏛️</div>
        {/* Floating lanterns */}
        <div className="absolute -top-8 left-4 text-4xl animate-[float_3s_ease-in-out_infinite]">🏮</div>
        <div className="absolute -top-4 right-8 text-3xl animate-[float_3.5s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>🏮</div>
        <div className="absolute bottom-4 left-0 text-2xl opacity-70 animate-[float_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-8 right-4 text-2xl opacity-70 animate-[float_4.5s_ease-in-out_infinite]" style={{ animationDelay: '1.5s' }}>✨</div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Happy Rider",
    description: "Delivering with pride",
    emoji: "🏍️",
    gradient: "from-green-400/30 via-emerald-300/20 to-teal-400/30",
    illustration: (
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="text-[100px] animate-[ride_3s_ease-in-out_infinite]">🏍️</div>
          <div className="text-[60px] animate-[wave_2s_ease-in-out_infinite]">👋</div>
        </div>
        {/* Speed lines */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          <div className="w-16 h-1 bg-primary/40 rounded animate-[speed_1s_linear_infinite]" />
          <div className="w-12 h-1 bg-primary/30 rounded animate-[speed_1s_linear_infinite]" style={{ animationDelay: '0.1s' }} />
          <div className="w-20 h-1 bg-primary/40 rounded animate-[speed_1s_linear_infinite]" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Restaurant Kitchen",
    description: "Culinary mastery in action",
    emoji: "👨‍🍳",
    gradient: "from-red-400/30 via-orange-300/20 to-yellow-400/30",
    illustration: (
      <div className="relative">
        <div className="text-[120px] animate-[cook_2s_ease-in-out_infinite]">👨‍🍳</div>
        {/* Cooking elements */}
        <div className="absolute -top-4 right-8 text-4xl animate-spin-slow">🔥</div>
        <div className="absolute bottom-4 left-4 text-3xl animate-[bounce_2s_ease-in-out_infinite]">🥄</div>
        <div className="absolute top-8 left-0 text-2xl animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>🧂</div>
        <div className="absolute bottom-0 right-0 text-2xl animate-[float_3.5s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>🌿</div>
      </div>
    ),
  },
  {
    id: 5,
    title: "Family Joy",
    description: "Happiness delivered home",
    emoji: "👨‍👩‍👧‍👦",
    gradient: "from-pink-400/30 via-rose-300/20 to-red-400/30",
    illustration: (
      <div className="relative">
        <div className="text-[100px] animate-[celebrate_2s_ease-in-out_infinite]">👨‍👩‍👧‍👦</div>
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl animate-[float_2s_ease-in-out_infinite]">🎉</div>
        {/* Hearts */}
        <div className="absolute top-4 right-0 text-3xl animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}>❤️</div>
        <div className="absolute bottom-8 left-0 text-2xl animate-[float_3.5s_ease-in-out_infinite]" style={{ animationDelay: '0.6s' }}>💚</div>
        <div className="absolute bottom-4 right-4 text-2xl animate-[float_4s_ease-in-out_infinite]" style={{ animationDelay: '0.9s' }}>💛</div>
      </div>
    ),
  },
];

const MoroccanLifeCarousel = () => {
  const [currentScene, setCurrentScene] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % scenes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToScene = (index: number) => {
    setCurrentScene(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const nextScene = () => {
    goToScene((currentScene + 1) % scenes.length);
  };

  const prevScene = () => {
    goToScene((currentScene - 1 + scenes.length) % scenes.length);
  };

  const scene = scenes[currentScene];

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-elevation">
      {/* Background with gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${scene.gradient} transition-all duration-1000`} />
      
      {/* Zellij pattern overlay */}
      <div className="absolute inset-0 zellij-pattern opacity-20" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 via-midnight/30 to-transparent" />

      {/* Main content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8 transition-all duration-700">
        {/* Scene illustration */}
        <div className="mb-8 relative z-10">
          {scene.illustration}
        </div>

        {/* Scene text */}
        <div className="text-center space-y-2 animate-fade-in relative z-10">
          <h3 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            {scene.title}
          </h3>
          <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
            {scene.description}
          </p>
        </div>

        {/* Tagline at bottom */}
        <div className="absolute bottom-6 left-6 right-6 text-center">
          <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-2xl italic">
            "From Souk to Smiles — Delivering the Spirit of Morocco."
          </p>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prevScene}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-3 transition-all hover:scale-110 z-20"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextScene}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-full p-3 transition-all hover:scale-110 z-20"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {scenes.map((_, index) => (
          <button
            key={index}
            onClick={() => goToScene(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentScene
                ? "bg-white w-8"
                : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes rise {
          0% {
            transform: translateY(0) scaleY(1);
            opacity: 0.6;
          }
          100% {
            transform: translateY(-80px) scaleY(1.5);
            opacity: 0;
          }
        }

        @keyframes sway {
          0%, 100% {
            transform: rotate(-2deg);
          }
          50% {
            transform: rotate(2deg);
          }
        }

        @keyframes ride {
          0%, 100% {
            transform: translateX(-5px);
          }
          50% {
            transform: translateX(5px);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-15deg);
          }
          75% {
            transform: rotate(15deg);
          }
        }

        @keyframes speed {
          0% {
            transform: translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100px);
            opacity: 0;
          }
        }

        @keyframes cook {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes celebrate {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.05) rotate(-5deg);
          }
          75% {
            transform: scale(1.05) rotate(5deg);
          }
        }

        .animate-spin-slow {
          animation: spin 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default MoroccanLifeCarousel;
