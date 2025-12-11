import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingOrderButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past ~500px (roughly past hero)
      setIsVisible(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <Button
        onClick={() => navigate('/restaurants')}
        size="lg"
        className="rounded-full shadow-lg hover:shadow-xl bg-primary hover:bg-primary/90 px-6 py-6 font-bold text-base animate-pulse hover:animate-none"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        Order Now
      </Button>
    </div>
  );
};

export default FloatingOrderButton;
