import { Search, ShoppingBag, Bike } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: Search,
    title: "Browse & Choose",
    description: "Explore restaurants near you and add your favorites to cart.",
    step: "01",
  },
  {
    icon: ShoppingBag,
    title: "Place Your Order",
    description: "Confirm your order, choose payment, and sit back.",
    step: "02",
  },
  {
    icon: Bike,
    title: "Fast Delivery",
    description: "Track your rider in real-time as food arrives at your door.",
    step: "03",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const lineVariants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { delay: 0.6, duration: 0.8, ease: "easeOut" } },
};

const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">How It Works</h2>
          <p className="text-muted-foreground text-sm md:text-base">Three simple steps to get your food</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            <motion.div
              className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-border origin-left"
              variants={lineVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            />
            
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                custom={i}
                variants={stepVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                className="relative text-center group"
              >
                <motion.div
                  className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/5 border-2 border-primary/20 mb-5 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-300 relative z-10 bg-background"
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <step.icon className="w-10 h-10 text-primary" />
                  <motion.span
                    className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 + 0.3, type: "spring", stiffness: 300 }}
                  >
                    {step.step}
                  </motion.span>
                </motion.div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px] mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
