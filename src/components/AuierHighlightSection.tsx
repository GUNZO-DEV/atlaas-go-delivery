import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building, DoorOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AuierDeliveryIcon from './AuierDeliveryIcon';

const AuierHighlightSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-orange-500/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 mb-4">
              <GraduationCap className="w-5 h-5 text-amber-600" />
              <span className="text-amber-700 dark:text-amber-400 font-bold text-sm">Students Only</span>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-4">
              <AuierDeliveryIcon className="w-16 h-auto" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-amber-600 dark:text-amber-500">
                Campus Delivery
              </h2>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Fast & affordable delivery for AUIER students. From restaurants or main gate straight to your dorm!
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            {/* Restaurant to Dorm */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-500/30 shadow-lg hover:shadow-xl hover:border-amber-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Building className="w-8 h-8 text-amber-600" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <DoorOpen className="w-8 h-8 text-amber-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Restaurant → Dorm</h3>
              <p className="text-muted-foreground text-sm mb-4">Full delivery from any restaurant in Ifrane</p>
              <div className="text-4xl font-black text-amber-600">
                35 <span className="text-lg font-bold">DH</span>
              </div>
            </div>

            {/* Main Gate to Dorm */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-orange-500/30 shadow-lg hover:shadow-xl hover:border-orange-500/50 transition-all duration-300">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <div className="w-8 h-8 flex items-center justify-center text-orange-600 font-bold text-sm">
                    🚪
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <DoorOpen className="w-8 h-8 text-orange-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Main Gate → Dorm</h3>
              <p className="text-muted-foreground text-sm mb-4">Pick up at gate, deliver to your door</p>
              <div className="text-4xl font-black text-orange-600">
                20 <span className="text-lg font-bold">DH</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/auier-delivery')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Order for Campus - From 20 DH
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuierHighlightSection;
