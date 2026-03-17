import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pizza, Beef, Cake, Coffee, Salad, Sandwich, Fish, UtensilsCrossed
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const categories = [
  { name: 'All', icon: UtensilsCrossed },
  { name: 'Pizza', icon: Pizza },
  { name: 'Burgers', icon: Beef },
  { name: 'Desserts', icon: Cake },
  { name: 'Coffee', icon: Coffee },
  { name: 'Healthy', icon: Salad },
  { name: 'Sandwiches', icon: Sandwich },
  { name: 'Seafood', icon: Fish },
];

const StickyCategoryNav = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleScroll = useCallback(() => {
    const shouldShow = window.scrollY > 600;
    setIsVisible(prev => prev !== shouldShow ? shouldShow : prev);
  }, []);

  useEffect(() => {
    let ticking = false;
    const throttled = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', throttled, { passive: true });
    return () => window.removeEventListener('scroll', throttled);
  }, [handleScroll]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      navigate('/restaurants');
    } else {
      navigate(`/restaurants?category=${encodeURIComponent(category)}`);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-background/95 border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap mr-2">
            Browse:
          </span>
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={activeCategory === category.name ? "default" : "ghost"}
              size="sm"
              onClick={() => handleCategoryClick(category.name)}
              className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0"
            >
              <category.icon className="w-4 h-4" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickyCategoryNav;
