import { Package, Star, Users, Bike } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { useStatsData } from '@/hooks/useStatsData';

const SocialProofStrip = () => {
  const { ordersDelivered, totalUsers, avgRating, activeRiders, isLoading } = useStatsData();

  const stats = [
    {
      icon: Package,
      value: ordersDelivered,
      label: 'Orders Delivered',
      suffix: '+',
      decimals: 0,
      delay: 0,
    },
    {
      icon: Star,
      value: avgRating,
      label: 'Customer Rating',
      suffix: '★',
      decimals: 1,
      delay: 200,
    },
    {
      icon: Users,
      value: totalUsers,
      label: 'Happy Customers',
      suffix: '+',
      decimals: 0,
      delay: 400,
    },
    {
      icon: Bike,
      value: activeRiders,
      label: 'Active Riders',
      suffix: '+',
      decimals: 0,
      delay: 600,
    },
  ];

  return (
    <section className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-background/80 dark:bg-card/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center group"
                style={{ animationDelay: `${stat.delay}ms` }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {isLoading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    <AnimatedCounter
                      endValue={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals}
                      duration={2000 + stat.delay}
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofStrip;
