import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import mentorImg from "@/assets/mentor-portrait.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0, 0, 0.2, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay: 0.4, ease: [0, 0, 0.2, 1] as const },
  },
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt="Nigerian youth community"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 border border-primary/40 rounded-full px-4 py-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">
                YOUR FUTURE IS TODAY
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
            >
              EMPOWERING NIGERIA'S{" "}
              <span className="text-primary">YOUTH</span> FOR A NEW ERA OF LEADERSHIP
            </motion.h1>

            {/* Description */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="space-y-4 text-muted-foreground text-base lg:text-lg max-w-xl"
            >
              <p>
                The Consensus is a non-partisan civic and economic empowerment movement organizing Gen Z and young Millennial into a structured community focused on increasing economic freedom, strengthening political consciousness, and building a future defined by competence, integrity, and shared prosperity.
              </p>
              <p>
                We believe that when young people are economically empowered, families are stabilized, mothers are strengthened, and communities move forward. The movement begins with the Central Zone of Plateau State, building a verified digital community and scalable infrastructure ready for statewide expansion.
              </p>
            </motion.div>

            {/* Mentor */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <p className="text-foreground">
                <span className="font-bold">Lead Mentor:</span> Chief Kefas Ropshik Wungak
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Join the movement. Build your economic power. Shape the future.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex flex-wrap gap-3"
            >
              <Button size="lg" className="gap-2 font-semibold">
                JOIN US <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="secondary">
                Discuss
              </Button>
              <Button size="lg" variant="secondary">
                Situation Room
              </Button>
              <Button size="lg" variant="secondary">
                Donate
              </Button>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex justify-end"
          >
            <div className="relative w-[460px] h-[560px] rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
              <img
                src={mentorImg}
                alt="Chief Kefas Ropshik Wungak"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
