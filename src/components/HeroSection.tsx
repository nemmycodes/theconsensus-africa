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
  { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.4 } },
  // Slide from right
  { initial: { opacity: 0, x: 60 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -60 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
  // Zoom
  { initial: { opacity: 0, scale: 1.1 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.97 }, transition: { duration: 0.45 } },
  // Slide up with rotate
  { initial: { opacity: 0, y: 40, rotate: -1.5 }, animate: { opacity: 1, y: 0, rotate: 0 }, exit: { opacity: 0, y: -30, rotate: 1.5 }, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
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
  const [slideIndex, setSlideIndex] = useState(0);
  const [mobilePortraitIn, setMobilePortraitIn] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % mentorSlides.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  // Swipe the mobile portrait in after 3 seconds
  useEffect(() => {
    const t = setTimeout(() => setMobilePortraitIn(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Use DB content or fallback to defaults
  const badge = content?.badge || "YOUR FUTURE IS TODAY";
  const heading = content?.heading || "EMPOWERING NIGERIA'S YOUTH FOR A NEW ERA OF LEADERSHIP";
  const highlightWord = content?.highlight_word || "YOUTH";
  const paragraph1 = content?.paragraph1 || "The Consensus is a non-partisan civic and economic empowerment movement organizing Gen Z and young Millennial into a structured community focused on increasing economic freedom, strengthening political consciousness, and building a future defined by competence, integrity, and shared prosperity.";
  const paragraph2 = content?.paragraph2 || "We believe that when young people are economically empowered, families are stabilized, mothers are strengthened, and communities move forward. The movement begins with the Central Zone of Plateau State, building a verified digital community and scalable infrastructure ready for statewide expansion.";
  const mentorName = content?.mentor_name || "Chief Kefas Ropshik Wungak";
  const tagline = content?.tagline || "Join the movement. Build your economic power. Shape the future.";
  const heroBg = content?.hero_bg_url || heroBgFallback;
  const cmsMentorImg = content?.mentor_img_url || mentorImgFallback;

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
    <section className="relative min-h-screen flex items-center pt-24 md:pt-28 pb-12 overflow-hidden">
      <div className="absolute inset-0">
        <motion.img
          src={heroBg}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        />
        {/* Mobile-only mentor portrait that swipes in from the right after 3s */}
        <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <motion.img
            src={mentorSlides[slideIndex]}
            alt={mentorName}
            initial={{ x: "100%", opacity: 0 }}
            animate={mobilePortraitIn ? { x: "0%", opacity: 1 } : { x: "100%", opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Layered overlays for depth & legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/70 to-background/95 md:bg-background/85 lg:bg-background/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--accent)/0.12),transparent_55%)]" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* Mobile portrait card — desktop only now (mobile gets the swipe-in BG instead) */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden"
          >
            <div />
          </motion.div>

          <div className="space-y-5 md:space-y-7 text-center lg:text-left">
            {/* Brand lockup — boosts logo prominence on the page itself (#9) */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse-ring" />
                <img
                  src="/brand-logo.png"
                  alt="The Plateau Consensus"
                  className="relative h-12 sm:h-14 md:h-16 w-auto drop-shadow-[0_4px_12px_hsl(var(--primary)/0.45)]"
                />
              </div>
              <div className="text-left">
                <p className="font-display font-extrabold text-base sm:text-lg leading-tight tracking-tight">
                  The Plateau <span className="text-primary">Consensus</span>
                </p>
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  A Movement for the Next Generation
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="inline-flex items-center gap-2 border border-primary/40 bg-primary/5 backdrop-blur-sm rounded-full px-4 py-1.5 mx-auto lg:mx-0"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-pulse-ring" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-primary tracking-wider uppercase">{badge}</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="font-display text-[2.25rem] leading-[1.05] sm:text-5xl md:text-6xl lg:text-[4.25rem] font-extrabold tracking-tight"
            >
              {renderHeading()}
            </motion.h1>

            {/* Single sharpened value-prop line (clarity over volume) */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="text-base sm:text-lg lg:text-xl text-foreground/90 font-medium max-w-xl mx-auto lg:mx-0"
            >
              A non-partisan movement organizing Gen Z and Millennials into a community
              built on <span className="text-primary font-semibold">economic freedom</span>,{" "}
              <span className="text-primary font-semibold">political consciousness</span>, and{" "}
              <span className="text-primary font-semibold">shared prosperity</span>.
            </motion.p>

            {/* Supporting paragraph — hidden on small screens to reduce noise */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={4}
              className="hidden md:block text-muted-foreground text-base lg:text-lg max-w-xl mx-auto lg:mx-0"
            >
              {paragraph2}
            </motion.p>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5} className="px-2 sm:px-0">
              <p className="text-foreground text-sm sm:text-base">
                <span className="font-bold">Lead Mentor:</span> {mentorName}
              </p>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">{tagline}</p>
            </motion.div>

            {/* CTAs — primary stands out, secondaries are quieter */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={6}
              className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center lg:justify-start pt-1"
            >
              <Button
                size="lg"
                className="group gap-2 font-bold text-base btn-shine hover-glow w-full sm:w-auto tap-target shadow-lg shadow-primary/30"
                onClick={() => navigate("/join")}
              >
                JOIN THE MOVEMENT{" "}
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hidden sm:inline-flex w-full sm:w-auto tap-target hover-lift border-primary/40 text-foreground hover:bg-primary/10"
                onClick={() => navigate("/situation-room")}
              >
                Situation Room
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="hidden sm:inline-flex w-full sm:w-auto tap-target hover-lift"
                onClick={() => navigate("/kef-cares")}
              >
                KEF-Cares
              </Button>
            </motion.div>

            {/* Trust strip — adds credibility under the fold-line */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={7}
              className="hidden sm:flex flex-wrap items-center gap-x-6 gap-y-2 justify-center lg:justify-start pt-3 text-xs sm:text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Non-partisan
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Verified community
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Plateau Central Zone
              </span>
            </motion.div>
          </div>

          {/* Desktop portrait */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex justify-end"
          >
            <div className="relative w-[460px] h-[560px] rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl bg-muted">
              <span className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-tr from-primary/40 via-accent/20 to-primary/40 blur-2xl opacity-50 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }} />
              <AnimatePresence mode="sync">
                {(() => {
                  const t = slideTransitions[slideIndex % slideTransitions.length];
                  return (
                    <motion.img
                      key={slideIndex}
                      src={mentorSlides[slideIndex]}
                      alt={mentorName}
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={t.initial}
                      animate={t.animate}
                      exit={t.exit}
                      transition={t.transition}
                    />
                  );
                })()}
              </AnimatePresence>
              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {mentorSlides.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Show slide ${i + 1}`}
                    onClick={() => setSlideIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === slideIndex ? "w-8 bg-primary" : "w-1.5 bg-white/50 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
              <link rel="preload" as="image" href={cmsMentorImg} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
