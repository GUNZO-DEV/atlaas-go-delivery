import { motion } from "framer-motion";

const SloganBanner = () => {
  return (
    <section className="px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <p className="text-2xl font-black text-foreground leading-tight">
          Darek, f'ay blassa
        </p>
        <p className="text-sm text-muted-foreground mt-1">Your home, anywhere 🇲🇦</p>
      </motion.div>
    </section>
  );
};

export default SloganBanner;
