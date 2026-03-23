import { useNavigate } from 'react-router-dom';
import { 
  Pizza, 
  Beef, 
  Cake, 
  Coffee, 
  Salad, 
  Sandwich,
  UtensilsCrossed,
  Fish
} from 'lucide-react';
import { motion } from 'framer-motion';

const categories = [
  { name: 'All', icon: UtensilsCrossed, gradient: 'from-primary/15 to-primary/5' },
  { name: 'Pizza', icon: Pizza, gradient: 'from-orange-500/15 to-orange-500/5' },
  { name: 'Burgers', icon: Beef, gradient: 'from-amber-500/15 to-amber-500/5' },
  { name: 'Desserts', icon: Cake, gradient: 'from-pink-500/15 to-pink-500/5' },
  { name: 'Coffee', icon: Coffee, gradient: 'from-yellow-700/15 to-yellow-700/5' },
  { name: 'Healthy', icon: Salad, gradient: 'from-green-500/15 to-green-500/5' },
  { name: 'Sandwiches', icon: Sandwich, gradient: 'from-yellow-500/15 to-yellow-500/5' },
  { name: 'Seafood', icon: Fish, gradient: 'from-blue-500/15 to-blue-500/5' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const PopularCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(category === 'All' ? '/restaurants' : `/restaurants?category=${encodeURIComponent(category)}`);
  };

  return (
    <section className="py-10 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">What are you craving?</h2>
          <p className="text-muted-foreground text-sm">Browse by category</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="grid grid-cols-4 md:grid-cols-8 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {categories.map((category) => (
              <motion.button
                key={category.name}
                variants={itemVariants}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryClick(category.name)}
                className="flex flex-col items-center gap-2.5 group"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center transition-all duration-200 group-hover:shadow-md border border-border/50`}>
                  <category.icon className="w-6 h-6 md:w-7 md:h-7 text-foreground/70 group-hover:text-foreground transition-colors" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {category.name}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
