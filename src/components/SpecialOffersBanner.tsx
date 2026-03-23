import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SpecialOffersBanner = () => {
  const navigate = useNavigate();

  return (
    <motion.section
      className="py-3 bg-primary/5 border-y border-primary/10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            </motion.div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">First order?</span>
              <motion.span
                className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                FREE DELIVERY
              </motion.span>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/restaurants')}
            variant="ghost"
            size="sm"
            className="text-accent font-semibold text-sm flex-shrink-0"
          >
            Order Now
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </motion.section>
  );
};

export default SpecialOffersBanner;
