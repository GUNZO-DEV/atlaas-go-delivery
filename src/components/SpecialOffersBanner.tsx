import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SpecialOffersBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-3 bg-primary/5 border-y border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">First order?</span>
              <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                FREE DELIVERY
              </span>
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
    </section>
  );
};

export default SpecialOffersBanner;
