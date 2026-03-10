import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building, DoorOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AuierHighlightSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left - Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/25 rounded-full px-4 py-1.5 mb-4">
                <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-700 dark:text-amber-400 font-semibold text-xs">AUIER Students</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Campus Delivery
              </h2>
              
              <p className="text-muted-foreground text-sm md:text-base mb-6 max-w-md">
                Fast & affordable delivery straight to your dorm. Order from any restaurant in Ifrane.
              </p>

              <Button 
                onClick={() => navigate('/auier-delivery')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-md"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Order for Campus
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            {/* Right - Pricing */}
            <div className="flex gap-4">
              <div className="bg-card rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all w-[180px] text-center">
                <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <ArrowRight className="w-3 h-3" />
                  <DoorOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Restaurant → Dorm</h3>
                <div className="text-3xl font-black text-amber-600">
                  35 <span className="text-sm font-bold">DH</span>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all w-[180px] text-center">
                <div className="flex items-center justify-center gap-2 mb-3 text-muted-foreground">
                  <span className="text-base">🚪</span>
                  <ArrowRight className="w-3 h-3" />
                  <DoorOpen className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold mb-1">Gate → Dorm</h3>
                <div className="text-3xl font-black text-orange-600">
                  20 <span className="text-sm font-bold">DH</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuierHighlightSection;
