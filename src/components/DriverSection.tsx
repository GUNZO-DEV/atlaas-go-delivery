import { Button } from "@/components/ui/button";
import { Bike, Heart, DollarSign, Shield, Star } from "lucide-react";
import moroccanRider from "@/assets/moroccan-rider.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const DriverSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-background relative">
      <div className="absolute inset-0 bg-gradient-atlas opacity-5" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            {t('driver.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            {t('driver.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Benefits */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-xl p-3 mt-1">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t('driver.payments')}</h3>
                <p className="text-muted-foreground">
                  {t('driver.paymentsDesc')}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-accent text-accent-foreground rounded-xl p-3 mt-1">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t('driver.respect')}</h3>
                <p className="text-muted-foreground">
                  {t('driver.respectDesc')}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-midnight text-midnight-foreground rounded-xl p-3 mt-1">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t('driver.flexible')}</h3>
                <p className="text-muted-foreground">
                  {t('driver.flexibleDesc')}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-primary text-primary-foreground rounded-xl p-3 mt-1">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t('driver.safety')}</h3>
                <p className="text-muted-foreground">
                  {t('driver.safetyDesc')}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-warm hover-lift flex items-start gap-4">
              <div className="bg-accent text-accent-foreground rounded-xl p-3 mt-1">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">{t('driver.bonuses')}</h3>
                <p className="text-muted-foreground">
                  {t('driver.bonusesDesc')}
                </p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg font-semibold"
            >
              <Bike className="mr-2" />
              {t('driver.joinButton')}
            </Button>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-elevation hover-lift">
              <img 
                src={moroccanRider} 
                alt="ATLAAS GO Moroccan Delivery Rider" 
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/70 to-transparent" />
              
              {/* Overlay Stats */}
              <div className="absolute bottom-8 left-8 right-8 space-y-4">
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-white/80 mb-1">{t('driver.avgEarnings')}</div>
                  <div className="text-3xl font-bold text-white">3,500 MAD+</div>
                </div>
                <div className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-white/20">
                  <div className="text-sm text-white/80 mb-1">{t('driver.happyRiders')}</div>
                  <div className="text-3xl font-bold text-white">{t('driver.ridersCount')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DriverSection;
