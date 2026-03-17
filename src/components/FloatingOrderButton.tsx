import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FloatingOrderButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const handleScroll = useCallback(() => {
    const shouldShow = window.scrollY > 500;
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 hidden sm:block">
      <Button
        onClick={() => navigate('/restaurants')}
        size="lg"
        className="rounded-full shadow-lg px-6 py-6 font-bold text-base transition-transform hover:scale-105 active:scale-95"
      >
        <ShoppingBag className="w-5 h-5 mr-2" />
        Order Now
      </Button>
    </div>
  );
};

export default FloatingOrderButton;
