import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Shield, Users, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PRESET_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];

const impactItems = [
  { icon: Users, title: "Community Outreach", description: "Fund town halls and ward meetings across all 17 LGAs" },
  { icon: Zap, title: "Youth Empowerment", description: "Sponsor training programs and skill acquisition workshops" },
  { icon: Shield, title: "Security Initiatives", description: "Support peace-building and conflict resolution efforts" },
  { icon: Heart, title: "Welfare Support", description: "Provide humanitarian aid to vulnerable communities" },
];

const Donate = () => {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | "">("");
  const [customAmount, setCustomAmount] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedAmount = amount || (customAmount ? parseInt(customAmount) : 0);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAmount || selectedAmount < 100) {
      toast({ title: "Invalid amount", description: "Minimum donation is ₦100", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast({
      title: "Thank you for your generosity!",
      description: `Your donation of ₦${selectedAmount.toLocaleString()} has been received.`,
    });
    setAmount("");
    setCustomAmount("");
    setFullName("");
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">Support the Movement</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black mt-4 leading-tight">
              DONATE
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl">
              Your contribution fuels the movement for better governance, youth empowerment, and a prosperous Plateau State.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Donation Form + Impact */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-2xl">Make a Donation</CardTitle>
                  <CardDescription>Select an amount or enter a custom value</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDonate} className="space-y-6">
                    {/* Preset Amounts */}
                    <div>
                      <Label className="mb-3 block">Choose Amount (₦)</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {PRESET_AMOUNTS.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => { setAmount(preset); setCustomAmount(""); }}
                            className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                              amount === preset
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-card text-foreground border-border hover:border-primary/50"
                            }`}
                          >
                            ₦{preset.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                      <Label>Or Enter Custom Amount (₦)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 15000"
                        min={100}
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setAmount(""); }}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>

                    {selectedAmount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 rounded-lg bg-primary/10 border border-primary/20"
                      >
                        <p className="text-sm text-muted-foreground">You are donating</p>
                        <p className="text-3xl font-black text-primary">₦{selectedAmount.toLocaleString()}</p>
                      </motion.div>
                    )}

                    <Button type="submit" size="lg" className="w-full font-bold gap-2" disabled={loading || !selectedAmount}>
                      {loading ? "Processing..." : "Donate Now"} <Heart className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Impact Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <h2 className="text-2xl font-bold mb-4">Your Impact</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Every naira counts. Here's how your donations make a difference across Plateau State.
              </p>

              {impactItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl group hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Donate;
