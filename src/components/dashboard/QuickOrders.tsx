import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const quickItems = [
  {
    name: "Petit Déjeuner Beldi",
    description: "Traditional Moroccan breakfast",
    price: "35 DH",
    time: "20 min",
    emoji: "🫖",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&q=80",
  },
  {
    name: "Couscous Vendredi",
    description: "Friday family couscous",
    price: "55 DH",
    time: "35 min",
    emoji: "🍲",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80",
  },
  {
    name: "Msemen & Honey",
    description: "Flaky pancakes with honey",
    price: "20 DH",
    time: "15 min",
    emoji: "🫓",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80",
  },
  {
    name: "Tajine Express",
    description: "Quick tajine delivery",
    price: "45 DH",
    time: "30 min",
    emoji: "🥘",
    image: "https://images.unsplash.com/photo-1541518763-27a026e5c0db?w=200&q=80",
  },
];

const QuickOrders = () => {
  return (
    <section className="px-4 py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Quick Order</h2>
          <p className="text-xs text-muted-foreground">Moroccan staples, delivered fast</p>
        </div>
        <Link to="/restaurants" className="flex items-center gap-1 text-xs font-semibold text-primary">
          See all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {quickItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[160px]"
          >
            <Link to="/restaurants" className="block">
              <div
                className="bg-card rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-all group"
                style={{ boxShadow: "var(--shadow-float)" }}
              >
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm rounded-full px-2 py-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-semibold">{item.time}</span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm leading-tight text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                  <p className="text-sm font-bold text-primary mt-1.5">{item.price}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default QuickOrders;
