import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SpecialOffersBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-full">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">First Order?</span>
                <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  FREE DELIVERY
                </span>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Limited time offer for new customers
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => navigate('/restaurants')}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            size="sm"
          >
            Claim Now
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersBanner;
