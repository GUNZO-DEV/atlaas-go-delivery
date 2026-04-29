import { useNavigate } from "react-router-dom";
import { ShieldCheck, Star, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Legend {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  eta: string;
  image: string;
  video?: string;
  tagline: string;
}

// Placeholder until wired to DB. First two are real Ifrane partners.
const LEGENDS: Legend[] = [
  {
    id: "timedikin",
    name: "Timedikin",
    cuisine: "Berber Tagines",
    rating: 4.9,
    eta: "20–30 min",
    image: "https://images.unsplash.com/photo-1535850579205-72e2d6f37b30?w=800&q=80",
    tagline: "Traditional Atlas flavors",
  },
  {
    id: "slaoui",
    name: "Slaoui",
    cuisine: "Moroccan Bakery",
    rating: 4.8,
    eta: "15–25 min",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    tagline: "Fresh msemen daily",
  },
  {
    id: "ifrane-grill",
    name: "Ifrane Grill House",
    cuisine: "Brochettes & Burgers",
    rating: 4.7,
    eta: "25–35 min",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    tagline: "Student favorite",
  },
  {
    id: "atlas-pizza",
    name: "Atlas Pizza",
    cuisine: "Wood-fire Pizza",
    rating: 4.8,
    eta: "30–40 min",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    tagline: "Authentic Italian",
  },
  {
    id: "cedar-cafe",
    name: "Cedar Café",
    cuisine: "Coffee & Pastries",
    rating: 4.9,
    eta: "10–20 min",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    tagline: "Open until late",
  },
];

const LocalLegends = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              VERIFIED LOCAL
            </div>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground">
              Local Legends
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Ifrane's exclusive partners — handpicked, verified, loved.
            </p>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4">
          {LEGENDS.map((l) => (
            <Card
              key={l.id}
              onClick={() => navigate(`/restaurant/${l.id}`)}
              className="group relative shrink-0 w-[78%] sm:w-[340px] snap-start cursor-pointer overflow-hidden border-border/60 hover:shadow-elevation transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={l.image}
                  alt={l.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {l.video && (
                  <video
                    src={l.video}
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => e.currentTarget.pause()}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold verified-local-badge">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Local
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-display font-bold text-lg leading-tight">{l.name}</h3>
                  <p className="text-xs text-white/85">{l.cuisine}</p>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  {l.rating}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {l.eta}
                </span>
                <span className="text-xs text-primary font-medium truncate max-w-[40%] text-right">
                  {l.tagline}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LocalLegends;
