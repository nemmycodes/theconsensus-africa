import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Flag, Share2, BarChart3, Shield, MessagesSquare, Megaphone, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import situationHero from "@/assets/situation-hero.jpg";
import SituationFeed from "@/components/situation/SituationFeed";
import SituationChat from "@/components/situation/SituationChat";
import SituationBroadcasts from "@/components/situation/SituationBroadcasts";

const pillars = [
  {
    key: "report",
    icon: Flag,
    title: "Report",
    description: "Raise civic, security and economic incidents from your ward as they happen.",
    prompt: "Report room — describe what happened, where, and when.",
  },
  {
    key: "share",
    icon: Share2,
    title: "Share",
    description: "Push verified information out to the wider network so it travels fast and clean.",
    prompt: "Share room — circulate verified information, links and clarifications.",
  },
  {
    key: "monitor",
    icon: BarChart3,
    title: "Monitor",
    description: "Track unfolding situations together and keep a running watch on the ground.",
    prompt: "Monitor room — track developing situations and post follow-ups.",
  },
  {
    key: "accountability",
    icon: Shield,
    title: "Accountability",
    description: "Follow up on promises, projects and institutions until answers come back.",
    prompt: "Accountability room — demand and record follow-through from institutions.",
  },
] as const;

const phases = [
  { number: "01", title: "Information creates", highlight: "awareness." },
  { number: "02", title: "Awareness creates", highlight: "organisation." },
  { number: "03", title: "Organisation creates", highlight: "power." },
];

const SituationRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [channel, setChannel] = useState<string>("general");

  const activePillar = pillars.find((p) => p.key === channel);
  const chatTitle = activePillar ? `${activePillar.title} Room` : "General Room";
  const chatDescription = activePillar ? activePillar.prompt : "Open floor — members, agents and admins talking in real time.";

  const scrollToHub = () => document.getElementById("hub")?.scrollIntoView({ behavior: "smooth" });

  const openChannel = (key: string) => {
    setChannel(key);
    scrollToHub();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-[520px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <img src={situationHero} alt="Situation Room" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-4"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">The Room Is Live</span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black uppercase tracking-tight mb-4">
            Situation Room
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-2xl mx-auto">
            The people's discussion hub — members, agents and admins post, comment, chat and broadcast together.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="font-bold gap-2" onClick={scrollToHub}>
              <MessagesSquare className="h-4 w-4" /> Enter the Conversation
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                className="font-bold"
                onClick={() => navigate("/auth?redirect=/situation-room")}
              >
                Sign in to post
              </Button>
            )}
          </div>
        </motion.div>
      </section>

      {/* Quote */}
      <section className="py-14 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl font-heading max-w-2xl mx-auto text-muted-foreground"
          >
            "The Situation Room is where the people of Plateau talk to each other —{" "}
            <span className="text-primary font-bold">report, share, monitor, hold to account</span>."
          </motion.p>
        </div>
      </section>

      {/* Four Pillars — interactive */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-bold tracking-widest text-primary uppercase">Key Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mt-2 mb-2">Four Pillars of Intelligence</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl">
              Each pillar is a live room. Pick one to jump straight into that conversation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card
                  onClick={() => openChannel(pillar.key)}
                  className={`h-full cursor-pointer bg-card transition-all hover:-translate-y-1 hover:border-primary/50 ${
                    channel === pillar.key ? "border-primary shadow-lg shadow-primary/10" : "border-border"
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <pillar.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary uppercase tracking-wider">
                      Open room
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Hub */}
      <section id="hub" className="py-16 px-4 lg:px-8 bg-secondary/30 border-y border-border scroll-mt-24">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-primary uppercase">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Community Hub
              </span>
              <h2 className="text-3xl md:text-4xl font-heading font-black mt-2">Talk, Post & Broadcast</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                Everyone with an account — members, agents, admins — shares the same floor here.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4 text-primary" /> Open to all account holders
            </div>
          </div>

          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto">
              <TabsTrigger value="chat" className="gap-2">
                <MessagesSquare className="h-4 w-4" /> Live Chat
              </TabsTrigger>
              <TabsTrigger value="discussion" className="gap-2">
                <Flag className="h-4 w-4" /> Discussion Feed
              </TabsTrigger>
              <TabsTrigger value="broadcasts" className="gap-2">
                <Megaphone className="h-4 w-4" /> Broadcasts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={channel === "general" ? "default" : "outline"}
                  className="rounded-full text-xs font-bold"
                  onClick={() => setChannel("general")}
                >
                  # General
                </Button>
                {pillars.map((p) => (
                  <Button
                    key={p.key}
                    size="sm"
                    variant={channel === p.key ? "default" : "outline"}
                    className="rounded-full text-xs font-bold"
                    onClick={() => setChannel(p.key)}
                  >
                    # {p.title}
                  </Button>
                ))}
              </div>
              <SituationChat channel={channel} title={chatTitle} description={chatDescription} />
              <p className="text-xs text-muted-foreground">
                Tip: flip the broadcast switch to pin a message to the Broadcasts board so everyone in the room sees it.
              </p>
            </TabsContent>

            <TabsContent value="discussion">
              <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                <SituationFeed />
              </div>
            </TabsContent>

            <TabsContent value="broadcasts">
              <div className="rounded-xl border border-border bg-card p-4 md:p-6">
                <h3 className="font-heading font-black text-xl mb-1">Public Broadcasts</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Messages any account holder has pushed to the whole room.
                </p>
                <SituationBroadcasts />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Phases */}
      <section className="bg-card">
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="grid lg:grid-cols-3 gap-10">
            {phases.map((phase, i) => (
              <motion.div
                key={phase.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <span className="text-xs font-bold tracking-widest text-primary uppercase">Phase {phase.number}</span>
                <h3 className="text-2xl md:text-3xl font-heading font-black mt-1">
                  {phase.title}
                  <br />
                  <span className="text-primary">{phase.highlight}</span>
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SituationRoom;
