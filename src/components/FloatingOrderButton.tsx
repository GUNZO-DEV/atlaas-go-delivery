import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingOrderButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Button
            onClick={() => navigate('/restaurants')}
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl px-6 py-6 font-bold text-base group transition-all hover:scale-105 active:scale-95"
          >
            <ShoppingBag className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
            Order Now
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingOrderButton;
