import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const PromoBanner = () => {
  return (
    <section className="px-4 py-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/restaurants">
          <div
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-primary p-5"
            style={{ boxShadow: "var(--shadow-float)" }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />

            <div className="relative z-10">
              <p className="text-white/80 text-xs font-medium tracking-wide uppercase mb-1">
                Limited offer
              </p>
              <h3 className="text-white text-xl font-black leading-tight mb-1">
                Free Delivery
              </h3>
              <p className="text-white/70 text-sm mb-3">
                On your first 3 orders. Use code <span className="font-bold text-accent">ATLAAS3</span>
              </p>
              <div className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground rounded-full px-4 py-2 text-sm font-bold">
                Order now <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </section>
  );
};

export default PromoBanner;
