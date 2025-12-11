import { useState, useEffect } from 'react';
import { Package, Star, Users, Bike, Quote } from 'lucide-react';
import AnimatedCounter from './AnimatedCounter';
import { useStatsData } from '@/hooks/useStatsData';

const testimonials = [
  { quote: "Best delivery service in Ifrane!", author: "Ahmed M." },
  { quote: "Fast & reliable every time", author: "Sara K." },
  { quote: "Love the campus delivery!", author: "Youssef B." },
];

const SocialProofStrip = () => {
  const { ordersDelivered, totalUsers, avgRating, activeRiders, isLoading } = useStatsData();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Package,
      value: ordersDelivered,
      label: 'Orders Delivered',
      suffix: '+',
      decimals: 0,
    },
    {
      icon: Star,
      value: avgRating,
      label: 'Customer Rating',
      suffix: '★',
      decimals: 1,
    },
    {
      icon: Users,
      value: totalUsers,
      label: 'Happy Customers',
      suffix: '+',
      decimals: 0,
    },
    {
      icon: Bike,
      value: activeRiders,
      label: 'Active Riders',
      suffix: '+',
      decimals: 0,
    },
  ];

  return (
    <section className="py-6 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-background/80 dark:bg-card/80 backdrop-blur-lg rounded-2xl border border-border/50 shadow-lg p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 flex-1">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 mb-2 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-foreground mb-0.5">
                    {isLoading ? (
                      <span className="animate-pulse">--</span>
                    ) : (
                      <AnimatedCounter
                        endValue={stat.value}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                        duration={2000 + index * 200}
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="lg:w-64 lg:border-l lg:pl-6 border-border/50">
              <div className="relative overflow-hidden h-16">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ${
                      index === currentTestimonial
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Quote className="w-4 h-4 text-primary/50 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground font-medium leading-tight">
                          {testimonial.quote}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          — {testimonial.author}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Dots indicator */}
              <div className="flex gap-1.5 justify-center lg:justify-start mt-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentTestimonial
                        ? 'bg-primary w-4'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofStrip;
