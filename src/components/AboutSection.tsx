import { motion } from "framer-motion";
import { Users, Heart, Shield, TrendingUp } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const AboutSection = () => {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Subtle accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.span
            variants={fadeInUp}
            className="text-sm font-semibold tracking-widest text-primary uppercase"
          >
            About Us
          </motion.span>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight"
          >
            Building a Movement for{" "}
            <span className="text-primary">Shared Prosperity</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-muted-foreground text-lg mt-6 leading-relaxed"
          >
            The Plateau Consensus is more than a political initiative — it's a generational movement. We are organizing young Nigerians across Plateau State into a verified, structured digital community designed to amplify their voices, build economic resilience, and create pathways to genuine leadership.
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { icon: Users, stat: "10,000+", label: "Community Members" },
            { icon: Heart, stat: "17", label: "Local Government Areas" },
            { icon: Shield, stat: "100%", label: "Verified Members" },
            { icon: TrendingUp, stat: "₦50M+", label: "Economic Impact Goal" },
          ].map((item) => (
            <motion.div
              key={item.label}
              variants={fadeInUp}
              className="bg-secondary rounded-xl p-6 text-center group hover:bg-primary/10 transition-colors duration-300"
            >
              <item.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-2xl md:text-3xl font-black">{item.stat}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
