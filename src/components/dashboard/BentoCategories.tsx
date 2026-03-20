import { Link } from "react-router-dom";
import { UtensilsCrossed, ShoppingCart, Pill, Flower2 } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Food",
    nameAr: "أكل",
    nameFr: "Repas",
    icon: UtensilsCrossed,
    color: "from-primary to-primary-glow",
    emoji: "🍽️",
    link: "/restaurants",
    span: "col-span-2 row-span-2",
    description: "Restaurants & cafés",
  },
  {
    name: "Market",
    nameAr: "سوق",
    nameFr: "Marché",
    icon: ShoppingCart,
    color: "from-emerald-500 to-emerald-600",
    emoji: "🛒",
    link: "/restaurants?category=Groceries",
    span: "col-span-1 row-span-1",
    description: "Groceries & more",
  },
  {
    name: "Pharmacy",
    nameAr: "صيدلية",
    nameFr: "Pharmacie",
    icon: Pill,
    color: "from-rose-500 to-pink-600",
    emoji: "💊",
    link: "/restaurants?category=Pharmacy",
    span: "col-span-1 row-span-1",
    description: "Health & wellness",
  },
  {
    name: "Flowers",
    nameAr: "ورد",
    nameFr: "Fleurs",
    icon: Flower2,
    color: "from-violet-500 to-purple-600",
    emoji: "🌸",
    link: "/restaurants?category=Flowers",
    span: "col-span-1 row-span-1",
    description: "Bouquets & gifts",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

const BentoCategories = () => {
  return (
    <section className="px-4 py-6">
      <h2 className="text-lg font-bold text-foreground mb-4">What do you need?</h2>
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-3 gap-3 auto-rows-[120px]"
      >
        {categories.map((cat, i) => (
          <motion.div key={cat.name} variants={item} className={i === 0 ? cat.span : ""}>
            <Link to={cat.link} className="block h-full">
              <div
                className={`relative h-full rounded-2xl bg-gradient-to-br ${cat.color} p-4 flex flex-col justify-between overflow-hidden group transition-transform active:scale-[0.97]`}
                style={{ boxShadow: "var(--shadow-float)" }}
              >
                {/* Background emoji */}
                <span className="absolute -bottom-2 -right-2 text-6xl opacity-20 group-hover:opacity-30 transition-opacity select-none">
                  {cat.emoji}
                </span>

                <div className="relative z-10">
                  <cat.icon className="w-6 h-6 text-white/90 mb-1" />
                </div>
                <div className="relative z-10">
                  <p className="text-white font-bold text-base leading-tight">{cat.name}</p>
                  {i === 0 && (
                    <p className="text-white/70 text-xs mt-0.5">{cat.description}</p>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default BentoCategories;
