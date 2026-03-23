import { useNavigate } from 'react-router-dom';
import { Store, Bike, ArrowRight, Percent, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

const PartnerCTA = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('partner.title')}</h2>
            <p className="text-muted-foreground text-sm">{t('partner.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant Partner */}
            <motion.div 
              className="bg-card rounded-2xl p-6 border hover:border-primary/30 transition-all duration-200 cursor-pointer group"
              onClick={() => navigate('/partner-restaurant')}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 12px 30px -8px hsl(var(--primary) / 0.15)" }}
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  className="p-3 bg-primary/10 rounded-xl flex-shrink-0 group-hover:bg-primary/15 transition-colors"
                  whileHover={{ rotate: 8, scale: 1.1 }}
                >
                  <Store className="w-7 h-7 text-primary" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{t('partner.restaurant')}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Reach more customers and grow your business</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Percent className="w-3 h-3 text-primary" />10% commission</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" />Fast payouts</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </motion.div>

            {/* Rider Partner */}
            <motion.div 
              className="bg-card rounded-2xl p-6 border hover:border-primary/30 transition-all duration-200 cursor-pointer group"
              onClick={() => navigate('/rider-auth')}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 12px 30px -8px hsl(var(--accent) / 0.15)" }}
            >
              <div className="flex items-start gap-4">
                <motion.div 
                  className="p-3 bg-accent/10 rounded-xl flex-shrink-0 group-hover:bg-accent/15 transition-colors"
                  whileHover={{ rotate: -8, scale: 1.1 }}
                >
                  <Bike className="w-7 h-7 text-accent" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{t('partner.rider')}</h3>
                  <p className="text-sm text-muted-foreground mb-3">Be your own boss with flexible hours</p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-accent" />Flexible hours</span>
                    <span>Weekly payouts</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerCTA;
