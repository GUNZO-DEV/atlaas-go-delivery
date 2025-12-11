import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building, DoorOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuierDeliveryIcon from './AuierDeliveryIcon';

const AuierHighlightSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-10 md:py-14 bg-gradient-to-br from-amber-500/15 via-orange-400/10 to-amber-600/15 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 mb-4 animate-pulse">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">Exclusive for AUIER Students</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-3">
              <AuierDeliveryIcon className="w-14 h-auto" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Campus Delivery
              </h2>
            </div>
            
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Fast & affordable delivery straight to your dorm room!
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-amber-500/40 shadow-lg shadow-amber-500/10 hover:shadow-xl hover:border-amber-500/60 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-500/15 rounded-xl">
                  <Building className="w-6 h-6 text-amber-600" />
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="p-2.5 bg-amber-500/15 rounded-xl">
                  <DoorOpen className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">Restaurant → Dorm</h3>
              <p className="text-muted-foreground text-sm mb-2">Full delivery from any restaurant</p>
              <div className="text-3xl font-black text-amber-600">
                35 <span className="text-base font-bold">DH</span>
              </div>
            </div>

            <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/40 shadow-lg shadow-orange-500/10 hover:shadow-xl hover:border-orange-500/60 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-orange-500/15 rounded-xl">
                  <span className="text-xl">🚪</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <div className="p-2.5 bg-orange-500/15 rounded-xl">
                  <DoorOpen className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">Main Gate → Dorm</h3>
              <p className="text-muted-foreground text-sm mb-2">Pick up at gate, deliver to door</p>
              <div className="text-3xl font-black text-orange-600">
                20 <span className="text-base font-bold">DH</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/auier-delivery')}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all duration-300 animate-pulse"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Order for Campus
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuierHighlightSection;
