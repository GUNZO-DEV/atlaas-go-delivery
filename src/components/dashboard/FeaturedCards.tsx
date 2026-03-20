import { Link } from "react-router-dom";
import { Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import FavoriteButton from "@/components/FavoriteButton";

interface Restaurant {
  id: string;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  time: string;
  distance: string;
  promo?: string;
}

const demoRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Atlas Tajine House",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
    cuisine: "Traditional Moroccan",
    rating: 4.8,
    time: "25-35 min",
    distance: "1.2 km",
    promo: "Free delivery",
  },
  {
    id: "2",
    name: "Café Medina",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80",
    cuisine: "Café & Pastries",
    rating: 4.6,
    time: "15-20 min",
    distance: "0.8 km",
  },
  {
    id: "3",
    name: "Le Grill Royal",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
    cuisine: "Grills & BBQ",
    rating: 4.7,
    time: "30-40 min",
    distance: "2.1 km",
    promo: "-20%",
  },
  {
    id: "4",
    name: "Pizza Souiri",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    cuisine: "Pizza & Italian",
    rating: 4.5,
    time: "20-30 min",
    distance: "1.5 km",
  },
];

const FeaturedCards = () => {
  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Near You</h2>
        <Link to="/restaurants" className="text-xs font-semibold text-primary">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {demoRestaurants.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Link to={`/restaurant/${r.id}`}>
              <div
                className="bg-card rounded-2xl overflow-hidden border border-border/40 hover:border-primary/20 transition-all group"
                style={{ boxShadow: "var(--shadow-float)" }}
              >
                <div className="relative aspect-[16/9]">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {r.promo && (
                      <span className="bg-accent text-accent-foreground text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {r.promo}
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-full">
                    <FavoriteButton itemId={r.id} itemType="restaurant" />
                  </div>
                  {/* Time badge */}
                  <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{r.time}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{r.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{r.cuisine}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 rounded-lg px-2 py-1">
                      <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      <span className="text-xs font-bold text-foreground">{r.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[11px]">{r.distance}</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCards;
