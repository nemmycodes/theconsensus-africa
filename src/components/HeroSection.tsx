import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import heroBgFallback from "@/assets/hero-bg.jpg";
import mentorImgFallback from "@/assets/mentor-portrait.png";
import mentor1 from "@/assets/mentor-1.jpeg";
import mentor2 from "@/assets/mentor-2.jpeg";
import mentor3 from "@/assets/mentor-3.jpeg";
import mentor4 from "@/assets/mentor-4.jpeg";
import { useSiteContent } from "@/hooks/useSiteContent";

const mentorSlides = [mentor1, mentor2, mentor3, mentor4];

const slideTransitions = [
  // Fade
  { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.9 } },
  // Slide from right
  { initial: { opacity: 0, x: 80 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -80 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
  // Zoom
  { initial: { opacity: 0, scale: 1.15 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, transition: { duration: 1 } },
  // Slide up with rotate
  { initial: { opacity: 0, y: 60, rotate: -2 }, animate: { opacity: 1, y: 0, rotate: 0 }, exit: { opacity: 0, y: -40, rotate: 2 }, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const } },
];

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
  const navigate = useNavigate();
  const { content } = useSiteContent("hero");

  // Use DB content or fallback to defaults
  const badge = content?.badge || "YOUR FUTURE IS TODAY";
  const heading = content?.heading || "EMPOWERING NIGERIA'S YOUTH FOR A NEW ERA OF LEADERSHIP";
  const highlightWord = content?.highlight_word || "YOUTH";
  const paragraph1 = content?.paragraph1 || "The Consensus is a non-partisan civic and economic empowerment movement organizing Gen Z and young Millennial into a structured community focused on increasing economic freedom, strengthening political consciousness, and building a future defined by competence, integrity, and shared prosperity.";
  const paragraph2 = content?.paragraph2 || "We believe that when young people are economically empowered, families are stabilized, mothers are strengthened, and communities move forward. The movement begins with the Central Zone of Plateau State, building a verified digital community and scalable infrastructure ready for statewide expansion.";
  const mentorName = content?.mentor_name || "Chief Kefas Ropshik Wungak";
  const tagline = content?.tagline || "Join the movement. Build your economic power. Shape the future.";
  const heroBg = content?.hero_bg_url || heroBgFallback;
  const mentorImg = content?.mentor_img_url || mentorImgFallback;

  // Split heading around highlight word
  const renderHeading = () => {
    const idx = heading.toUpperCase().indexOf(highlightWord.toUpperCase());
    if (idx === -1) return heading;
    const before = heading.slice(0, idx);
    const word = heading.slice(idx, idx + highlightWord.length);
    const after = heading.slice(idx + highlightWord.length);
    return (
      <>
        {before}<span className="text-primary">{word}</span>{after}
      </>
    );
  };

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
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
          <div className="space-y-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 border border-primary/40 rounded-full px-4 py-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">{badge}</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
            >
              {renderHeading()}
            </motion.h1>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="space-y-4 text-muted-foreground text-base lg:text-lg max-w-xl"
            >
              <p>{paragraph1}</p>
              <p>{paragraph2}</p>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <p className="text-foreground">
                <span className="font-bold">Lead Mentor:</span> {mentorName}
              </p>
              <p className="text-muted-foreground text-sm mt-1">{tagline}</p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="flex flex-wrap gap-3"
            >
              <Button size="lg" className="gap-2 font-semibold" onClick={() => navigate("/join")}>
                JOIN US <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/situation-room")}>Situation Room</Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/kef-cares")}>KEF-Cares</Button>
            </motion.div>
          </div>

          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex justify-end"
          >
            <div className="relative w-[460px] h-[560px] rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
              <img
                src={mentorImg}
                alt={mentorName}
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
