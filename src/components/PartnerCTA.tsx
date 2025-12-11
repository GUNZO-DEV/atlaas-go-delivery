import { useNavigate } from 'react-router-dom';
import { Store, Bike, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const PartnerCTA = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-10 md:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('partner.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('partner.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant Partner */}
            <div 
              className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-4"
              onClick={() => navigate('/partner-restaurant')}
            >
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Store className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-0.5">{t('partner.restaurant')}</h3>
                <p className="text-sm text-muted-foreground truncate">10% commission • Fast payouts</p>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Rider Partner */}
            <div 
              className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center gap-4"
              onClick={() => navigate('/rider-auth')}
            >
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Bike className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg mb-0.5">{t('partner.rider')}</h3>
                <p className="text-sm text-muted-foreground truncate">Flexible hours • Great earnings</p>
              </div>
              <Button variant="ghost" size="icon" className="flex-shrink-0">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;
