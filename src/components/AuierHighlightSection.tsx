import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building, DoorOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuierDeliveryIcon from './AuierDeliveryIcon';

const AuierHighlightSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-8 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
          {/* Left: Header */}
          <div className="text-center md:text-left flex-shrink-0">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 rounded-full px-3 py-1 mb-2">
              <GraduationCap className="w-4 h-4 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400 font-bold text-xs">AUIER Students</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <AuierDeliveryIcon className="w-10 h-auto" />
              <h2 className="text-2xl font-black text-amber-600 dark:text-amber-500">Campus Delivery</h2>
            </div>
          </div>

          {/* Center: Pricing Cards */}
          <div className="flex gap-3">
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-amber-500/30 flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-600">
                <Building className="w-5 h-5" />
                <ArrowRight className="w-3 h-3" />
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Restaurant → Dorm</p>
                <p className="text-xl font-black text-amber-600">35 DH</p>
              </div>
            </div>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-orange-500/30 flex items-center gap-3">
              <div className="flex items-center gap-1 text-orange-600">
                <span className="text-lg">🚪</span>
                <ArrowRight className="w-3 h-3" />
                <DoorOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Gate → Dorm</p>
                <p className="text-xl font-black text-orange-600">20 DH</p>
              </div>
            </div>
          </div>

          {/* Right: CTA */}
          <Button 
            onClick={() => navigate('/auier-delivery')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-5 font-bold rounded-xl shadow-lg"
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Order Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AuierHighlightSection;
