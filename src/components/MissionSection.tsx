import { motion } from "framer-motion";
import { DollarSign, BookOpen, Vote, Handshake } from "lucide-react";

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
    transition: { staggerChildren: 0.12 },
  },
};

const pillars = [
  {
    icon: DollarSign,
    title: "Economic Freedom",
    description:
      "Equipping young people with skills, micro-grants, and entrepreneurial support to build sustainable livelihoods and financial independence.",
  },
  {
    icon: BookOpen,
    title: "Political Consciousness",
    description:
      "Educating the next generation on governance, their civic rights, and the power of informed participation in Nigeria's democratic process.",
  },
  {
    icon: Vote,
    title: "Leadership Development",
    description:
      "Identifying and mentoring emerging leaders within the community, building a pipeline of competent, integrity-driven public servants.",
  },
  {
    icon: Handshake,
    title: "Community Solidarity",
    description:
      "Strengthening social bonds across ethnic and religious lines, fostering unity and collective action for the common good of Plateau State.",
  },
];

const MissionSection = () => {
  return (
    <section className="py-24 bg-background relative">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            Our Mission
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight">
            Four Pillars of <span className="text-primary">Change</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 gap-6 lg:gap-8"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              variants={fadeInUp}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-300 overflow-hidden"
            >
              {/* Accent glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                    <pillar.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground tracking-widest">
                    PILLAR {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-3">{pillar.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default MissionSection;
