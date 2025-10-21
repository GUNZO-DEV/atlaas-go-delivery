import { ShoppingBag, Coffee, Package, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CustomerSection = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 bg-gradient-to-b from-secondary/20 to-background relative overflow-hidden">
      <div className="absolute inset-0 zellij-pattern opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 moroccan-underline inline-block">
            {t('customer.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-8">
            {t('customer.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Food */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-primary/20 h-full">
              <div className="bg-gradient-morocco text-white rounded-2xl p-6 mb-6 shadow-glow">
                <Coffee className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">{t('customer.food')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('customer.foodDesc')}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('customer.localRest')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('customer.fastFood')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('customer.souks')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Groceries */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-accent/20 h-full">
              <div className="bg-gradient-atlas text-white rounded-2xl p-6 mb-6 shadow-elevation">
                <ShoppingBag className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">{t('customer.groceries')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('customer.groceriesDesc')}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{t('customer.freshVeg')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{t('customer.meat')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span>{t('customer.spices')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shops */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-midnight/20 h-full">
              <div className="bg-midnight text-midnight-foreground rounded-2xl p-6 mb-6 shadow-elevation">
                <Package className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">{t('customer.shops')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('customer.shopsDesc')}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-midnight" />
                  <span>{t('customer.crafts')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-midnight" />
                  <span>{t('customer.electronics')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-midnight" />
                  <span>{t('customer.fashion')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pharmacies */}
          <div className="group relative">
            <div className="bg-card rounded-3xl p-8 shadow-warm hover-lift transition-all duration-300 border-2 border-transparent group-hover:border-primary/20 h-full">
              <div className="bg-gradient-sunset text-midnight rounded-2xl p-6 mb-6 shadow-glow">
                <Sparkles className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-center">{t('customer.health')}</h3>
              <p className="text-muted-foreground text-center mb-4">
                {t('customer.healthDesc')}
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('customer.pharmacies')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('customer.healthProducts')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>{t('customer.personalCare')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-card rounded-2xl p-8 shadow-elevation">
            <p className="text-2xl font-bold mb-2">
              {t('customer.oneApp')}
            </p>
            <p className="text-muted-foreground text-lg">
              {t('customer.downloadCTA')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerSection;
