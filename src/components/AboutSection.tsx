import { motion } from "framer-motion";
import { Users, UserCheck, CalendarCheck, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import aboutMarket from "@/assets/about-market.jpg";
import aboutYouthCard from "@/assets/about-youth-card.jpg";

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

const stats = [
  { icon: Users, stat: "1.4M+", label: "Active Members" },
  { icon: UserCheck, stat: "1K+", label: "Certified Agents" },
  { icon: CalendarCheck, stat: "120+", label: "Planned Events" },
];

const checkpoints = [
  "Transparent Leadership Protocols",
  "Digital-First Political Engagement",
  "Economic Rejuvenation Roadmap",
];

const AboutSection = () => {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Stats Row */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6 mb-24"
        >
          {stats.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeInUp}
              className="bg-secondary rounded-xl p-6 flex items-center gap-4 group hover:bg-primary/10 transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black leading-none">{item.stat}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* About Content: Images + Text */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Images */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex gap-4 items-end"
          >
            <motion.div
              variants={fadeInUp}
              className="w-1/2 rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={aboutYouthCard}
                alt="Youth Empowerment"
                className="w-full h-[320px] md:h-[380px] object-cover"
              />
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="w-1/2 rounded-2xl overflow-hidden shadow-xl -mt-8"
            >
              <img
                src={aboutMarket}
                alt="Economic empowerment in action"
                className="w-full h-[280px] md:h-[340px] object-cover"
              />
            </motion.div>
          </motion.div>

          {/* Right: Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-6"
          >
            <motion.span
              variants={fadeInUp}
              className="text-sm font-semibold tracking-widest text-primary uppercase"
            >
              About The Movement
            </motion.span>

            <motion.h2
              variants={fadeInUp}
              className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight"
            >
              Unity for Progress,{" "}
              <br className="hidden md:block" />
              Vision for Prosperity
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-muted-foreground text-base lg:text-lg leading-relaxed"
            >
              The Consensus Party is more than just a political organization; it is a collaborative platform designed to amplify the voices of Nigeria's youth. We believe in transparency, digital governance, and economic empowerment.
            </motion.p>

            <motion.ul variants={fadeInUp} className="space-y-4">
              {checkpoints.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{item}</span>
                </li>
              ))}
            </motion.ul>

            <motion.div variants={fadeInUp}>
              <Button size="lg" className="font-semibold mt-2">
                Read Our Manifesto
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
