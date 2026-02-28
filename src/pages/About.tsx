import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaBanner from "@/components/CtaBanner";
import aboutHero from "@/assets/about-hero.jpg";
import aboutWhoWeAre from "@/assets/about-whoweare.jpg";
import { Target, Eye, Lightbulb, ShieldCheck } from "lucide-react";

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
  visible: { transition: { staggerChildren: 0.15 } },
};

const values = [
  {
    icon: ShieldCheck,
    title: "Integrity",
    description: "We hold ourselves to the highest standards of honesty, transparency, and ethical conduct in all our actions.",
  },
  {
    icon: Target,
    title: "Competence",
    description: "We invest in skill-building, education, and mentorship to ensure our members are equipped to lead effectively.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We leverage technology and creative thinking to solve problems, build communities, and drive economic growth.",
  },
  {
    icon: Eye,
    title: "Accountability",
    description: "We demand transparency from our leaders and hold ourselves accountable to the communities we serve.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/70" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          >
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              Who We Are
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mt-4 leading-none tracking-tight">
              ABOUT US
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-6 max-w-xl leading-relaxed">
              We are a movement of young, progressive Nigerians committed to rewriting the narrative of our nation through integrity, technology, and collective action.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
              className="rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={aboutWhoWeAre}
                alt="Team discussion"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="space-y-6"
            >
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                Who We Are
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                The Consensus is not just an organization; it is a generational awakening. We are a youth-led civic and economic movement dedicated to organizing the energy, creativity, and potential of <span className="text-foreground font-semibold">Gen Z and Millennials in Plateau State</span>.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                We believe that political influence is downstream from economic power. By leveraging technology to organize, educate, and empower, we are building a formidable bloc capable of demanding accountability and driving sustainable development.
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                Our movement transcends traditional party lines, focusing instead on competence, integrity, and shared prosperity as the foundation for governance and community building.
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
            className="text-center mb-16"
          >
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              What We Stand For
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight">
              Our Core <span className="text-primary">Values</span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="bg-card border border-border rounded-2xl p-8 text-center group hover:border-primary/40 transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-3">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="text-center">
              <span className="text-sm font-semibold tracking-widest text-primary uppercase">
                Our Journey
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight">
                The Story So Far
              </h2>
            </motion.div>

            <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed text-center">
              The Plateau Consensus began as a conversation among young people in the Central Zone of Plateau State — a shared frustration with the status quo and a collective desire for something better.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed text-center">
              Under the mentorship of Chief Kefas Ropshik Wungak, what started as informal gatherings quickly grew into a structured, technology-driven movement. We built a verified digital community, established local chapters, and created pathways for youth participation in civic life.
            </motion.p>
            <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed text-center">
              Today, we are scaling statewide — with over 1.4 million active members, certified agents across all 17 local government areas, and a growing ecosystem of economic empowerment programs that are transforming lives across Plateau State.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  );
};

export default About;
