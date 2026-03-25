import { motion } from "framer-motion";
import { TrendingUp, BookOpen, Heart } from "lucide-react";

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
    icon: TrendingUp,
    title: "Economic Freedom",
    subtitle: "Empowering people to earn, grow, and become financially independent.",
    description:
      "We identify traders, farmers, artisans, professionals, and youth entrepreneurs through data, then support them with opportunities, skills, and economic programmes under KEF-CARES. We believe that when people have income and stability, they are less vulnerable and more in control of their future.",
  },
  {
    icon: BookOpen,
    title: "Civic Awareness",
    subtitle: "Building informed citizens who understand governance and their role in it.",
    description:
      "Impact through dialogue, education, and community engagement via forums, content, and digital platforms. We ensure that an informed citizen can make better decisions and cannot be easily misled or manipulated.",
  },
  {
    icon: Heart,
    title: "Resilience",
    subtitle: "Creating communities that can withstand challenges and grow sustainably.",
    description:
      "Strengthening local economies, supporting networks (farmers, traders, artisans), and using data to respond to real community needs. Support strong communities to adapt, survive, and continue to grow without dependency.",
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
            Our Mandate
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight">
            Driven by <span className="text-primary">Purpose</span>
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              variants={fadeInUp}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/40 transition-all duration-300 overflow-hidden"
            >
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
                <h3 className="text-xl font-bold mb-2">{pillar.title}</h3>
                <p className="text-sm font-semibold text-primary mb-3">{pillar.subtitle}</p>
                <p className="text-muted-foreground leading-relaxed text-sm">
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
