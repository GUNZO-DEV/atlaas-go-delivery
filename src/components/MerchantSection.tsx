import { Button } from "@/components/ui/button";
import { TrendingUp, Percent, BarChart3, Wallet } from "lucide-react";
import moroccanFood from "@/assets/moroccan-food.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const MerchantSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            {t('merchant.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            {t('merchant.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden shadow-elevation hover-lift">
              <img 
                src={moroccanFood} 
                alt="Moroccan Restaurant Food" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <p className="text-sm font-semibold mb-1">{t('merchant.traditional')}</p>
                <p className="text-3xl font-bold">{t('merchant.soukSuccess')}</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift border-2 border-primary/20 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-xl p-4">
                  <Percent className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-primary">{t('merchant.commission')}</h3>
                  <p className="text-muted-foreground text-lg">
                    {t('merchant.commissionDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-accent-foreground rounded-xl p-4">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{t('merchant.dashboard')}</h3>
                  <p className="text-muted-foreground text-lg">
                    {t('merchant.dashboardDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-midnight text-midnight-foreground rounded-xl p-4">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{t('merchant.payouts')}</h3>
                  <p className="text-muted-foreground text-lg">
                    {t('merchant.payoutsDesc')}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-warm hover-lift transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground rounded-xl p-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3">{t('merchant.grow')}</h3>
                  <p className="text-muted-foreground text-lg">
                    {t('merchant.growDesc')}
                  </p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary-glow text-white py-6 text-lg font-semibold shadow-glow"
            >
              {t('merchant.joinButton')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MerchantSection;
