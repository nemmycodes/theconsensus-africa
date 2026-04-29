import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, User, Heart, MapPin, Mail, Users, GraduationCap, Briefcase, Palette, Globe, ShieldCheck, TrendingUp, MessageSquare, Award, Camera } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import joinusHero from "@/assets/joinus-hero.jpg";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const membershipTypes = [
  { icon: Users, title: "Gen Z & Young Millennials", description: "The vibrant heart of Africa's digital and social transformation." },
  { icon: GraduationCap, title: "Students", description: "Academic excellence meets practical leadership and civic engagement." },
  { icon: Briefcase, title: "Entrepreneurs", description: "Building the value creators and economic engines of the continent." },
  { icon: Award, title: "Professionals", description: "Industry experts driving governance, policy, and market intelligence." },
  { icon: Palette, title: "Creatives", description: "Visionary thinkers crafting the narrative of a new African era." },
  { icon: Globe, title: "Community Builders", description: "Social architects focused on sustainable impact and local growth." },
];

const benefits = [
  { icon: ShieldCheck, title: "Verified Network", description: "Access a verified economic and civic network of high-caliber individuals." },
  { icon: MessageSquare, title: "Community Discussions", description: "Engage in high-impact forums and local community deep-dives." },
  { icon: TrendingUp, title: "Leadership Ops", description: "Direct pathways to leadership and exclusive economic opportunities." },
  { icon: Globe, title: "Civic Intelligence", description: "Get data-driven insights and deep civic intelligence on African affairs." },
  { icon: Award, title: "Empowerment Ecosystem", description: "Long-term support for your personal and professional development journey." },
];

const impactRoles = [
  {
    title: "Volunteer",
    description: "Support ground campaigns and digital outreach. Perfect for those starting their civic journey.",
    features: ["Community outreach", "Digital advocacy", "Event support"],
    highlight: false,
  },
  {
    title: "Agent",
    description: "Lead local chapters and drive registration in your constituency. Direct party coordination.",
    features: ["Voting unit coordination", "Member verification", "Strategy meetings"],
    highlight: true,
  },
  {
    title: "Aspirant",
    description: "For those aspiring to elective positions under the Consensus party. Step forward to lead.",
    features: ["Candidate vetting", "Campaign support", "Policy alignment"],
    highlight: false,
  },
];

const LGA_OPTIONS = [
  "Jos North", "Jos South", "Jos East", "Barkin Ladi", "Bassa", "Bokkos",
  "Kanke", "Kanam", "Langtang North", "Langtang South", "Mangu", "Mikang",
  "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase",
];

const INTEREST_OPTIONS = [
  "Youth Empowerment", "Economic Development", "Education", "Healthcare",
  "Security & Peace", "Agriculture", "Infrastructure", "Governance",
  "Technology & Innovation", "Culture & Tourism",
];

const steps = [
  { label: "Account", icon: Mail },
  { label: "Personal", icon: User },
  { label: "Interests", icon: Heart },
  { label: "Location", icon: MapPin },
];

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const toggleInterest = (interest: string) => {
    setInterests((prev) => prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]);
  };

  const canProceed = () => {
    switch (step) {
      case 0: return email.length > 0 && password.length >= 6;
      case 1: return fullName.length > 0;
      case 2: return interests.length > 0;
      case 3: return lga.length > 0;
      default: return true;
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Profile picture must be less than 5MB.", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, dob, interests, lga, ward },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Upload avatar if provided
    if (avatarFile && data.user) {
      const ext = avatarFile.name.split(".").pop();
      const filePath = `${data.user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
        await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", data.user.id);
      }
    }

    toast({ title: "Welcome!", description: "Check your email to confirm your account." });
    navigate("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — clean, modern, mobile-first */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,22%,13%)] to-[hsl(145,40%,12%)]">
        {/* Decorative ambient layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.25)_0%,_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(50_90%_50%/0.12)_0%,_transparent_60%)]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary)/0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.4) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        <div className="relative z-10 container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-pulse-ring" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs sm:text-sm font-semibold text-primary tracking-wider uppercase">
                Become a Founding Member
              </span>
            </motion.div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight text-white leading-[0.95]">
              Join <span className="text-primary">Us</span>
            </h1>

            <p className="mt-3 text-base sm:text-lg font-medium text-primary/90 italic tracking-wide">
              Awaken. Unite. Lead.
            </p>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed">
              We are building a future defined by collective action, youth empowerment, and
              sustainable governance. Be the change Nigeria deserves.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="group gap-2 font-bold text-base btn-shine hover-glow w-full sm:w-auto tap-target shadow-lg shadow-primary/30"
                onClick={() => setShowForm(true)}
              >
                JOIN THE MOVEMENT
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hidden sm:inline-flex w-full sm:w-auto tap-target border-white/20 text-white hover:bg-white/10"
                onClick={() => {
                  document.getElementById("impact-roles")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explore Roles
              </Button>
            </div>

            {/* Mini stats / trust strip */}
            <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-8 max-w-md mx-auto">
              {[
                { num: "6+", label: "Member Tracks" },
                { num: "17", label: "LGAs Covered" },
                { num: "100%", label: "Non-partisan" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-2xl sm:text-3xl font-extrabold text-primary">
                    {s.num}
                  </div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-wider text-white/60 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Choose Your Impact */}
      <section id="impact-roles" className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black">Choose Your Impact</h2>
            <p className="text-muted-foreground mt-2">Every role matters in the Consensus movement.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {impactRoles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl p-8 border ${role.highlight ? "border-primary bg-card" : "border-border bg-card"} text-center relative`}
              >
                {role.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST ACTIVE
                  </span>
                )}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  {role.title === "Volunteer" && <Users className="w-7 h-7 text-primary" />}
                  {role.title === "Agent" && <Award className="w-7 h-7 text-primary" />}
                  {role.title === "Aspirant" && <ShieldCheck className="w-7 h-7 text-primary" />}
                </div>
                <h3 className="text-lg font-bold mb-3">{role.title}</h3>
                <p className="text-sm text-muted-foreground mb-6">{role.description}</p>
                <ul className="space-y-2 text-left mb-6">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={role.highlight ? "default" : "outline"}
                  className="w-full font-bold"
                  onClick={() => role.title === "Agent" ? navigate("/agent-login") : setShowForm(true)}
                >
                  Select {role.title.split(" ")[0]}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Open To */}
      <section className="py-20 px-4 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10">Membership is open to:</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {membershipTypes.map((type, i) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <type.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{type.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 lg:px-8 bg-card">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-xs font-bold tracking-widest text-primary uppercase">Why Join Us?</span>
              <h2 className="text-3xl md:text-4xl font-black mt-2 mb-4">Benefits of Joining</h2>
              <p className="text-muted-foreground mb-8">
                Unlock exclusive access to a long-term empowerment ecosystem designed for growth, collaboration, and impactful leadership.
              </p>
              <div className="p-5 bg-primary/10 border border-primary/20 rounded-xl">
                <p className="text-sm italic text-foreground">
                  "The Consensus isn't just a network, it's the intelligence layer for Africa's next generation of leaders."
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <b.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{b.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Take Your Place */}
      <section className="py-20 px-4 lg:px-8 bg-secondary text-center">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-black">Ready to take your place?</h2>
          <p className="text-muted-foreground mt-4">Join through the official portal:</p>
          <p className="text-primary font-bold mt-2 underline">www.theconsensus.africa</p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> Register</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> Connect</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> Grow</span>
            <span className="flex items-center gap-1.5"><Check size={14} className="text-primary" /> Lead</span>
          </div>
          <Button size="lg" className="mt-8 font-bold" onClick={() => setShowForm(true)}>Register Now</Button>
        </div>
      </section>

      {/* Registration Modal / Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black">Join the Movement</h2>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {steps.map((s, i) => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {step === 0 && (
                <>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  {/* Profile Photo Upload */}
                  <div className="flex flex-col items-center gap-3 mb-2">
                    <label className="relative cursor-pointer group">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-primary/20" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    <p className="text-xs text-muted-foreground">Upload profile photo (max 5MB)</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number (optional)</Label>
                    <Input placeholder="+234..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth (optional)</Label>
                    <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="bg-background" />
                  </div>
                </>
              )}
              {step === 2 && (
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${interests.includes(interest) ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/50"}`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              )}
              {step === 3 && (
                <InecLocationPicker
                  lgaName={lga}
                  wardName={ward}
                  required
                  onChange={({ lga: l, ward: w }) => { setLga(l); setWard(w); }}
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-8">
              <Button variant="ghost" onClick={() => step === 0 ? setShowForm(false) : setStep(step - 1)} className="gap-1">
                <ArrowLeft className="h-4 w-4" /> {step === 0 ? "Cancel" : "Back"}
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-1">
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={!canProceed() || loading} className="gap-1">
                  {loading ? "Creating..." : "Complete Signup"} <Check className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-6 text-center">
              <button onClick={() => { setShowForm(false); navigate("/auth"); }} className="text-sm text-muted-foreground hover:text-foreground">
                Already have an account? Sign in
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Onboarding;
