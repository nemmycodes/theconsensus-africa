import { motion } from "framer-motion";
import { Heart, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import donateHero from "@/assets/donate-hero.jpg";

const Donate = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <img src={donateHero} alt="Donate" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/85" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-2xl mx-auto px-4"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Heart className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            DONATE<span className="text-primary">.</span>
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold text-sm mb-6">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>

          <p className="text-lg text-muted-foreground mb-4">
            We're setting up a secure and transparent donation system to support economic empowerment for Plateau's future.
          </p>
          <p className="text-muted-foreground">
            Check back soon — your generosity will make a difference.
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Donate;
