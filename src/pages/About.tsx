import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import aboutHero from "@/assets/about-hero.jpg";
import aboutWhoWeAreFallback from "@/assets/about-whoweare2.jpg";
import mentorKefasFallback from "@/assets/chief-kefas.png";
import youthEmpowerment from "@/assets/youth-empowerment-photo.jpg";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Target, Lightbulb, Eye, TrendingUp, BookOpen,
  Heart, Users, Briefcase, Globe, Award, ChevronDown, ArrowRight, Quote
} from "lucide-react";
import { useState } from "react";
import { useSiteContent } from "@/hooks/useSiteContent";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const drivenByPurpose = [
  {
    icon: TrendingUp,
    title: "Economic Freedom",
    subtitle: "Empowering people to earn, grow, and become financially independent.",
    description: "We identify traders, farmers, artisans, professionals, and youth entrepreneurs through data, then support them with opportunities, skills, and economic programmes under KEF-CARES. We believe that when people have income and stability, they are less vulnerable and more in control of their future.",
  },
  {
    icon: BookOpen,
    title: "Civic Awareness",
    subtitle: "Building informed citizens who understand governance and their role in it.",
    description: "Impact through dialogue, education, and community engagement via forums, content, and digital platforms. We ensure that an informed citizen can make better decisions and cannot be easily misled or manipulated.",
  },
  {
    icon: Heart,
    title: "Resilience",
    subtitle: "Creating communities that can withstand challenges and grow sustainably.",
    description: "Strengthening local economies, supporting networks (farmers, traders, artisans), and using data to respond to real community needs. Support strong communities to adapt, survive, and continue to grow without dependency.",
  },
];

const strategyItems = [
  { icon: Globe, title: "Digital Membership", description: "Secure, verified access to a structured civic network for all members." },
  { icon: Users, title: "Community Forums", description: "High-impact forums bringing community voices and insights directly to leadership." },
  { icon: TrendingUp, title: "AI-Driven Insights", description: "Community needs and data from the Impact Dashboard available for state coordinators." },
  { icon: ShieldCheck, title: "Civic Education", description: "Structured learning on governance, rights, and civic participation for all members." },
];

const centralZonePilot = {
  icon: Award,
  title: "Central Zone Pilot Initiative",
  description: "All youth community-based technology initiatives launching first in the Central Zone as a proof of concept.",
};

const values = [
  { icon: ShieldCheck, title: "Integrity", description: "Holding ourselves to the highest standards of ethical conduct and transparency." },
  { icon: Users, title: "Unity", description: "Bridging divides across ethnic, religious, and cultural lines for shared prosperity." },
  { icon: Lightbulb, title: "Innovation", description: "Leveraging technology and fresh thinking to transform governance and service." },
  { icon: Target, title: "Leadership", description: "Building competent, empathetic leaders for sustainable community development." },
];

const faqs = [
  { q: "What is The Consensus Movement?", a: "The Consensus is a non-partisan civic and economic empowerment movement organizing Gen Z and young Millennials in Plateau State into a structured community focused on economic freedom, political consciousness, and shared prosperity." },
  { q: "How can I join the movement?", a: "You can join by visiting our Join Us page and completing the registration process. Membership is open to Gen Z, young Millennials, students, entrepreneurs, professionals, creatives, and community builders." },
  { q: "Is The Consensus a political party?", a: "No. The Consensus is a civic movement that transcends traditional party lines. We focus on competence, integrity, and economic empowerment rather than partisan politics." },
  { q: "What is the Central Zone Pilot?", a: "The Central Zone Pilot is our initial deployment area in Plateau State where we are building and testing our digital community infrastructure before expanding statewide." },
];

const About = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { content: aboutData } = useSiteContent("about_who_we_are");
  const { content: leaderData } = useSiteContent("leader");

  const aboutWhoWeAre = aboutData?.image_url || aboutWhoWeAreFallback;
  const mentorKefas = leaderData?.image_url || mentorKefasFallback;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative h-[50vh] min-h-[350px] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img src={aboutHero} alt="About us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-background/40" />
        </div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-sm font-semibold tracking-widest text-primary-foreground/80 uppercase">Who We Are</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mt-4 leading-none tracking-tight text-primary-foreground">ABOUT US</h1>
            <p className="text-primary-foreground/80 text-base md:text-lg mt-4 max-w-xl leading-relaxed">
              We are a movement of young, progressive Nigerians committed to rewriting the narrative of our nation through integrity, technology, and collective action.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden shadow-xl">
              <img src={aboutWhoWeAre} alt="Team discussion" className="w-full h-[400px] md:h-[500px] object-cover" />
            </motion.div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">{aboutData?.heading || "Who We Are"}</motion.h2>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                {aboutData?.paragraph1 || <>The Consensus is not just an organization; it is a generational awakening. We are a youth-led civic and economic movement dedicated to organizing the energy, creativity, and potential of <span className="text-foreground font-semibold">Gen Z and Millennials in Plateau State</span>.</>}
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                {aboutData?.paragraph2 || "We believe that political influence is downstream from economic power. By leveraging technology to organize, educate, and empower, we are building a formidable bloc capable of demanding accountability and driving sustainable development."}
              </motion.p>
              <motion.p variants={fadeInUp} className="text-muted-foreground text-base lg:text-lg leading-relaxed">
                {aboutData?.paragraph3 || "Our movement transcends traditional party lines, focusing instead on a shared vision of prosperity, integrity, and modern governance for our people."}
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Leadership & Mentorship */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black">Leadership & Mentorship</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">Guided by wisdom, driven by youth. Our leadership structure combines experience with energy.</p>
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden shadow-xl">
              <img src={mentorKefas} alt="Chief Kefas Ropshik" className="w-full h-[400px] object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">{leaderData?.title_label || "Chief / Consensus Movement Leader"}</span>
              <h3 className="text-2xl md:text-3xl font-black">{leaderData?.name || "Chief Kefas Ropshik"}</h3>
              <p className="text-muted-foreground leading-relaxed">
                "{leaderData?.quote || "If our leadership is not about the next election, it's about the next generation. We are building roads under whose shade we may not sit, but our children will flourish."}"
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {leaderData?.bio || "As the Lead Mentor of The Consensus Movement, Chief Kefas provides the philosophical compass and strategic direction needed to navigate complex political landscapes. His role is centered on mentoring young leaders, building capacity around integrity, and bridging the gap between established leadership and youth-led innovation."}
              </p>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-2xl font-black text-primary">{leaderData?.years_in_leadership || "20+"}</p>
                  <p className="text-xs text-muted-foreground">Years in Leadership</p>
                </div>
                <div>
                  <p className="text-2xl font-black text-primary">{leaderData?.mentees_active || "1000+"}</p>
                  <p className="text-xs text-muted-foreground">Mentees Active</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mandate – Driven by Purpose */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'hsl(145, 63%, 20%)' }}>
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: 'hsl(145, 63%, 60%)' }}>Our Mandate</span>
            <h2 className="text-3xl md:text-4xl font-black mt-4 text-primary-foreground">Driven by Purpose</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {drivenByPurpose.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl p-6 border transition-colors"
                style={{ background: 'hsl(145, 63%, 16%)', borderColor: 'hsl(145, 63%, 28%)' }}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(145, 63%, 42%)' }}>
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-primary-foreground text-center">{item.title}</h3>
                <p className="text-sm font-semibold mb-3 text-center" style={{ color: 'hsl(145, 50%, 80%)' }}>{item.subtitle}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(145, 30%, 70%)' }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Strategy */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black">Our Strategy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We are building the economic engine of the youth. We serve as the project platform for our movement. The platform facilitates organization at scale.
              </p>
              <Button className="gap-2 font-semibold">
                Explore the Platform <ArrowRight size={16} />
              </Button>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {strategyItems.map((item) => (
                  <div key={item.title} className="flex flex-col gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-4 p-4 rounded-xl border transition-colors" style={{ background: 'hsl(145, 63%, 20%)', borderColor: 'hsl(145, 63%, 30%)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'hsl(145, 63%, 42%)' }}>
                  <centralZonePilot.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-primary-foreground">{centralZonePilot.title}</h4>
                  <p className="text-xs mt-1" style={{ color: 'hsl(145, 30%, 70%)' }}>{centralZonePilot.description}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex justify-center mb-6">
              <Quote className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-snug">
              "When a young person is economically empowered, a household is stable. When a household is stable, a mother is at peace. When mothers are at peace, the community thrives."
            </h2>
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="w-12 h-px bg-primary" />
              <span className="text-sm font-bold tracking-widest text-primary uppercase">The Consensus Belief</span>
              <div className="w-12 h-px bg-primary" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-card rounded-2xl p-8 border border-border">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-black mb-3">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To build a modern democratic structure that empowers every Nigerian citizen, regardless of tribe or creed, through merit-based leadership, sustainable economic policies, and active youth-led governance.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="rounded-2xl p-8" style={{ background: 'hsl(145, 63%, 42%)' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: 'hsl(145, 63%, 52%)' }}>
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-black mb-3 text-primary-foreground">Our Vision</h3>
              <p className="leading-relaxed" style={{ color: 'hsl(145, 50%, 90%)' }}>
                A Nigeria that leads the African continent in innovation, social justice, and economic stability — where the youth are the architects of their own future and drivers of Plateau State's prosperity.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black">Core Values</h2>
            <p className="text-muted-foreground mt-4">The pillars that guide our movement and our promise to the nation.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-background rounded-xl p-6 border border-border text-center hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Youth Image */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img src={youthEmpowerment} alt="Youth empowerment" className="w-full h-[400px] object-cover rounded-2xl shadow-xl" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-black">Empowering the Next Generation</h2>
              <p className="text-muted-foreground leading-relaxed">
                We invest in the economic empowerment, political education, and personal development of young people across Plateau State. Through structured programmes, digital tools, and community networks, we are creating pathways for youth to lead, earn, and thrive.
              </p>
              <Button className="gap-2 font-semibold" onClick={() => window.location.href = '/join'}>
                Join the Movement <ArrowRight size={16} />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <span className="font-bold text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
