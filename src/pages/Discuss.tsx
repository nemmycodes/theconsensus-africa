import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { TrendingUp, Briefcase, Landmark, Users, Heart, ArrowRight, MessageSquare, Radio, Play, Clock, Headphones } from "lucide-react";
import { useNavigate } from "react-router-dom";
import discussHero from "@/assets/discuss-hero.jpg";

const categories = [
  { icon: TrendingUp, title: "Economic Opportunities", description: "Vibrant discussions on job creation and emerging market trends." },
  { icon: Briefcase, title: "Entrepreneurship & Growth", description: "Strategies for building businesses and scaling sustainable wealth." },
  { icon: Landmark, title: "Public Policy & Governance", description: "Shaping the future through informed, data-driven policy debate." },
  { icon: Users, title: "Youth & Women Empowerment", description: "Amplifying voices for inclusive development and social equity." },
  { icon: Heart, title: "Community Solutions", description: "Collaborative, ground-up efforts for local socio-economic impact." },
];

const dialogues = [
  {
    title: "Digital literacy in rural education zones",
    author: "Sarah J.",
    replies: 42,
    time: "2 hrs ago",
    tag: "ECONOMIC",
  },
  {
    title: "Reforming local tax incentives for startups",
    author: "David K.",
    replies: 108,
    time: "15 mins ago",
    tag: "POLICY",
  },
];

const Discuss = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[400px] md:h-[450px] flex items-center justify-center overflow-hidden">
        <img src={discussHero} alt="Discuss" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center px-4"
        >
          <span className="text-xs font-bold tracking-widest text-primary uppercase">Community Forum</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight mt-3">DISCUSS</h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            The civic and economic dialogue hub of <span className="text-primary font-bold">The Consensus</span>. A space designed for structured debate and collective growth.
          </p>
        </motion.div>
      </section>

      {/* Structured Conversations */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black">Structured Conversations</h2>
              <p className="text-muted-foreground text-sm mt-1">Join a topic and contribute to the movement's policy shaping.</p>
            </div>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">View All <ArrowRight size={14} /></a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 transition-colors cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <cat.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-2">{cat.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Purpose Quote */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary rounded-2xl p-8 md:p-12 max-w-2xl flex gap-6 items-start"
          >
            <div className="w-12 h-12 rounded-lg bg-primary-foreground/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-widest text-primary-foreground/70 uppercase">Our Purpose</span>
              <p className="text-lg md:text-xl font-bold text-primary-foreground mt-2 leading-snug">
                "This platform enables young people to move from <span className="text-accent">isolation to organisation</span>. It transforms individual voices into collective influence."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Dialogue */}
      <section className="py-20 px-4 lg:px-8 bg-card">
        <div className="container mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-black">Live Dialogue</h2>
          </div>

          <div className="space-y-4">
            {dialogues.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-5 bg-secondary rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{d.author.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{d.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Started by {d.author} • {d.replies} replies • {d.time}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold tracking-wider bg-card text-foreground px-3 py-1 rounded border border-border uppercase">
                  {d.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background text-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-black text-primary leading-tight">
              DISCUSS. LEARN.<br />BUILD CONSENSUS.
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button size="lg" className="font-bold" onClick={() => navigate("/join")}>Join the Dialogue</Button>
              <Button size="lg" variant="outline" className="font-bold" onClick={() => navigate("/about")}>Read the Manifesto</Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">Join 12,000+ members organizing for change.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Discuss;
