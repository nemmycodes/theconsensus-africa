import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Heart, Shield, ArrowRight, Monitor, BookOpen, Users, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import donateHero from "@/assets/donate-hero.jpg";

const PRESET_AMOUNTS = [5000, 10000, 50000, 100000];

const impactItems = [
  { icon: Monitor, title: "Technology Infrastructure", description: "Building the digital platform and AI tools to connect youth with opportunities." },
  { icon: Heart, title: "Empowerment Programmes", description: "Direct funding and micro-grants for youth-led economic initiatives." },
  { icon: BookOpen, title: "Civic Education", description: "Comprehensive training for informed political participation and leadership." },
  { icon: Users, title: "Community Expansion", description: "Scaling the movement beyond the Central Zone Pilot to all regions." },
];

const stats = [
  { value: "5,000+", label: "Donors" },
  { value: "₦50M+", label: "Raised" },
  { value: "12", label: "Communities" },
  { value: "100%", label: "Transparency" },
];

const Donate = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState<"one-time" | "monthly">("one-time");
  const [loading, setLoading] = useState(false);

  const selectedAmount = amount || (customAmount ? parseInt(customAmount) : 0);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmount || selectedAmount < 100) {
      toast({ title: "Invalid amount", description: "Minimum donation is ₦100", variant: "destructive" });
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast({ title: "Thank you!", description: `Your donation of ₦${selectedAmount.toLocaleString()} has been received.` });
    setAmount("");
    setCustomAmount("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero + Donation Form */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <img src={donateHero} alt="Donate" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10 py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
                DONATE<span className="text-primary">.</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Support Economic Empowerment for Plateau's Future.
              </p>
              <div className="w-16 h-px bg-border" />
              <p className="text-muted-foreground">
                The Consensus is supported by individuals and partners committed to building the economic future of Plateau youths and women.
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Shield size={14} className="text-primary" /> Secure Donation</span>
                <span className="flex items-center gap-1.5"><Sparkles size={14} className="text-primary" /> Impact Driven</span>
              </div>
            </motion.div>

            {/* Right - Donation Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-2 mb-6">
                  <Heart className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">Make a contribution</h3>
                </div>

                {/* One-time / Monthly toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg mb-6">
                  <button
                    onClick={() => setDonationType("one-time")}
                    className={`py-2 rounded-md text-sm font-medium transition-colors ${donationType === "one-time" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  >
                    One-time
                  </button>
                  <button
                    onClick={() => setDonationType("monthly")}
                    className={`py-2 rounded-md text-sm font-medium transition-colors ${donationType === "monthly" ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                  >
                    Monthly
                  </button>
                </div>

                <form onSubmit={handleDonate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => { setAmount(preset); setCustomAmount(""); }}
                        className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                          amount === preset
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-card text-foreground border-border hover:border-primary/50"
                        }`}
                      >
                        ₦{preset.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card">
                    <span className="text-sm text-muted-foreground">₦</span>
                    <input
                      type="number"
                      placeholder="Custom Amount"
                      min={100}
                      value={customAmount}
                      onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    <span className="text-xs text-muted-foreground">NGN</span>
                  </div>

                  <Button type="submit" size="lg" className="w-full font-bold gap-2" disabled={loading || !selectedAmount}>
                    {loading ? "Processing..." : "Donate Now"} <ArrowRight size={14} />
                  </Button>

                  <p className="text-xs text-muted-foreground text-center pt-1">Secured by Paystack</p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Where Your Money Goes */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black">Where Your Money Goes</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Every Naira contributes directly to sustainable development goals in Plateau State, ensuring transparency and measurable impact.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactItems.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary rounded-xl p-6 border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-black text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Donate;
