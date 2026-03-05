import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Plus, Clock, AlertTriangle, CheckCircle, Info, X,
  Flag, Share2, BarChart3, Shield,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import situationHero from "@/assets/situation-hero.jpg";

const statusIcons: Record<string, React.ReactNode> = {
  Active: <AlertTriangle className="h-4 w-4" />,
  Resolved: <CheckCircle className="h-4 w-4" />,
  Monitoring: <Clock className="h-4 w-4" />,
  Info: <Info className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  Active: "bg-destructive text-destructive-foreground",
  Resolved: "bg-primary text-primary-foreground",
  Monitoring: "bg-accent text-accent-foreground",
  Info: "bg-secondary text-secondary-foreground",
};

interface SituationUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  author_id: string;
  profiles?: { full_name: string | null } | null;
}

const pillars = [
  {
    icon: Flag,
    title: "Report",
    description: "Report civic and economic developments securely and anonymously.",
  },
  {
    icon: Share2,
    title: "Share",
    description: "Disseminate verified information to broader networks instantly.",
  },
  {
    icon: BarChart3,
    title: "Monitor",
    description: "Track real-time community realities through data visualization.",
  },
  {
    icon: Shield,
    title: "Accountability",
    description: "Strengthen institutional accountability through transparency.",
  },
];

const phases = [
  { number: "01", title: "Information creates", highlight: "awareness." },
  { number: "02", title: "Awareness creates", highlight: "organisation." },
  { number: "03", title: "Organisation creates", highlight: "power." },
];

const SituationRoom = () => {
  const { user, isAgent } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["General", "Security", "Infrastructure", "Political", "Social", "Economic"];
  const statuses = ["Active", "Resolved", "Monitoring", "Info"];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from("situation_updates")
      .select("*, profiles!situation_updates_author_id_fkey(full_name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUpdates(data as unknown as SituationUpdate[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("situation_updates").insert({
      title,
      content,
      category,
      status,
      author_id: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Update posted!" });
      setTitle(""); setContent("");
      setShowForm(false);
      fetchUpdates();
    }
    setLoading(false);
  };

  const filtered = filter === "All" ? updates : updates.filter((u) => u.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[520px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <img
          src={situationHero}
          alt="Situation Room"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-4"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Live Monitoring Active
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black uppercase tracking-tight mb-4">
            Situation Room
          </h1>
          <p className="text-muted-foreground text-base md:text-lg mb-8">
            Civic and Economic Intelligence Centre
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              className="font-bold"
              onClick={() => setShowUpdates(true)}
            >
              Enter Room
            </Button>
            <Button size="lg" variant="outline" className="font-bold">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Quote Section */}
      <section className="py-16 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl font-heading max-w-2xl mx-auto text-muted-foreground"
          >
            "The Situation Room serves as the civic and economic monitoring hub of{" "}
            <span className="text-primary font-bold">The Consensus</span>."
          </motion.p>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-bold tracking-widest text-primary uppercase">
              Key Capabilities
            </span>
            <h2 className="text-3xl md:text-4xl font-heading font-black mt-2 mb-10">
              Four Pillars of Intelligence
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full border-border hover:border-primary/30 transition-colors bg-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <pillar.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pillar.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Phases Section */}
      <section className="bg-card border-t border-b border-border">
        <div className="container mx-auto px-4 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Phases */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {phases.map((phase, i) => (
                <motion.div
                  key={phase.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <span className="text-xs font-bold tracking-widest text-primary uppercase">
                    Phase {phase.number}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-heading font-black mt-1">
                    {phase.title}
                    <br />
                    <span className="text-primary">{phase.highlight}</span>
                  </h3>
                </motion.div>
              ))}
            </motion.div>

            {/* Right — Dashboard mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-secondary rounded-xl p-6 space-y-4"
            >
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <span className="text-xs font-bold tracking-wider text-primary uppercase">Live Feed</span>
                </div>
                <p className="font-heading font-bold text-lg">Incoming Reports</p>
                <p className="text-xs text-primary">+12% vs avg</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">Network Status</span>
                </div>
                <p className="font-heading font-bold text-lg">Active Nodes</p>
                <p className="text-xs text-muted-foreground">Stable</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Updates</p>
                  <p className="font-heading font-bold text-2xl">{updates.length}</p>
                </div>
                <Activity className="h-8 w-8 text-primary/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Live Updates (shown after clicking "Enter Room") */}
      {showUpdates && (
        <section className="py-20 px-4 lg:px-8" id="updates">
          <div className="container mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl font-heading font-black">Live Updates</h2>
              <div className="flex flex-wrap gap-2">
                {["All", ...categories].map((cat) => (
                  <Button
                    key={cat}
                    variant={filter === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
              {isAgent && (
                <Button onClick={() => setShowForm(!showForm)} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Post Update
                </Button>
              )}
            </div>

            {/* Agent Create Form */}
            {showForm && isAgent && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8">
                <Card className="border-primary/30">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">New Situation Update</CardTitle>
                    <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                      <Textarea placeholder="Describe the situation..." value={content} onChange={(e) => setContent(e.target.value)} required rows={4} />
                      <div className="flex gap-4">
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Update"}</Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Updates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((update, i) => (
                <motion.div
                  key={update.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover:border-primary/30 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{update.category}</Badge>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[update.status] || statusColors.Info}`}>
                          {statusIcons[update.status] || statusIcons.Info}
                          {update.status}
                        </span>
                      </div>
                      <CardTitle className="text-lg leading-tight">{update.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{update.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(update.profiles as any)?.full_name || "Agent"}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(update.created_at), "MMM d, yyyy HH:mm")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-heading font-bold">No updates yet</p>
                <p className="text-sm">Check back soon for the latest developments.</p>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default SituationRoom;
