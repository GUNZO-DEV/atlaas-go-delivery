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

const categories = [
  { name: 'Pizza', icon: Pizza, color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20' },
  { name: 'Burgers', icon: Beef, color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
  { name: 'Desserts', icon: Cake, color: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20' },
  { name: 'Coffee', icon: Coffee, color: 'bg-brown-500/10 text-yellow-700 hover:bg-yellow-500/20' },
  { name: 'Healthy', icon: Salad, color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20' },
  { name: 'Sandwiches', icon: Sandwich, color: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20' },
  { name: 'Seafood', icon: Fish, color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
  { name: 'All', icon: UtensilsCrossed, color: 'bg-primary/10 text-primary hover:bg-primary/20' },
];

const PopularCategories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    if (category === 'All') {
      navigate('/restaurants');
    } else {
      navigate(`/restaurants?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <section className="py-8 md:py-10 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-1">What are you craving?</h2>
          <p className="text-muted-foreground text-sm">Browse by category</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category.name)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${category.color} group-hover:scale-110 group-hover:shadow-md`}>
                  <category.icon className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
