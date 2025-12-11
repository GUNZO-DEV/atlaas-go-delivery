import { Smartphone, MapPin, Package } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: Smartphone,
      step: '1',
      title: 'Choose',
      description: 'Browse restaurants & pick your favorites',
    },
    {
      icon: MapPin,
      step: '2',
      title: 'Order',
      description: 'Add to cart & confirm your delivery address',
    },
    {
      icon: Package,
      step: '3',
      title: 'Enjoy',
      description: 'Track your rider & receive your food hot',
    },
  ];

  return (
    <section className="py-10 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Order in 3 Simple Steps</h2>
          <p className="text-muted-foreground text-sm md:text-base">Fast, easy, delicious</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center group">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                )}
                
                {/* Step circle */}
                <div className="relative inline-flex items-center justify-center w-20 h-20 mb-4">
                  <div className="absolute inset-0 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors duration-300" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                    {step.step}
                  </div>
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
