import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Users, Target, BookOpen, ArrowRight, LogIn, UserPlus, Eye, EyeOff } from "lucide-react";
import KefCaresFormFields from "@/components/kef-cares/KefCaresFormFields";
import { motion } from "framer-motion";

type View = "landing" | "login" | "register";

const KEF_SEO = {
  title: "KEF-CARES – Join the Kefiano Community Initiative | The Plateau Consensus",
  description:
    "KEF-CARES: Kefiano Community Advancement, Resilience & Economic Support Initiative. Join the Central Zone Pilot empowering Plateau State youth through skills, mentorship and economic opportunity.",
  url: "https://theconsensus.africa/kef-cares",
  image: "https://theconsensus.africa/assets/mentor-1-DTnKDAHX.jpeg",
};

const upsertMeta = (key: "name" | "property", value: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel: string, href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const KefCares = () => {
  const { user, loading: authLoading, isKefUser, rolesLoading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("landing");

  // SEO metadata
  useEffect(() => {
    const previousTitle = document.title;
    document.title = KEF_SEO.title;
    upsertMeta("name", "description", KEF_SEO.description);
    upsertLink("canonical", KEF_SEO.url);

    // Open Graph
    upsertMeta("property", "og:title", KEF_SEO.title);
    upsertMeta("property", "og:description", KEF_SEO.description);
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:url", KEF_SEO.url);
    upsertMeta("property", "og:image", KEF_SEO.image);
    upsertMeta("property", "og:image:alt", "KEF-CARES — Kefiano Community Initiative");
    upsertMeta("property", "og:site_name", "The Plateau Consensus");

    // Twitter Card
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", KEF_SEO.title);
    upsertMeta("name", "twitter:description", KEF_SEO.description);
    upsertMeta("name", "twitter:image", KEF_SEO.image);

    return () => {
      document.title = previousTitle;
    };
  }, []);

  // If logged in as kef_user, redirect to dashboard
  useEffect(() => {
    if (!authLoading && !rolesLoading && user && isKefUser) {
      navigate("/kef-cares/dashboard");
    }
  }, [authLoading, rolesLoading, user, isKefUser, navigate]);

  if (view === "login") return <KefCaresLogin onBack={() => setView("landing")} />;
  if (view === "register") {
    if (user) return <KefCaresRegistrationForm />;
    return <KefCaresSignup onBack={() => setView("landing")} />;
  }

  return <KefCaresLanding onLogin={() => setView("login")} onRegister={() => setView("register")} />;
};

/* ─── Landing page with two buttons ─── */
const KefCaresLanding = ({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white py-20">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-3xl md:text-5xl font-black mb-4">KEF-CARES – JOIN US</h1>
              <p className="text-lg md:text-xl font-semibold text-emerald-200 mb-2">
                Kefiano Community Advancement, Resilience & Economic Support Initiative
              </p>
              <p className="text-emerald-300 text-sm md:text-base mb-10">Central Zone Pilot – Plateau State</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
                {[
                  { icon: Heart, label: "Empowerment" },
                  { icon: Users, label: "Community" },
                  { icon: Target, label: "Resilience" },
                  { icon: BookOpen, label: "Education" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 bg-white/10 rounded-lg p-3">
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button size="lg" className="flex-1 gap-2 bg-white text-emerald-900 hover:bg-emerald-100 font-bold text-base h-14" onClick={onLogin}>
                  <LogIn className="w-5 h-5" /> Login
                </Button>
                <Button size="lg" className="flex-1 gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base h-14" onClick={onRegister}>
                  <UserPlus className="w-5 h-5" /> Create Account
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">Purpose</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                KEF-CARES is an economic empowerment initiative aligned with the philosophy of The Consensus Movement: that strong communities are built when citizens—especially youths, traders, farmers, artisans, professionals, entrepreneurs, and creatives—are economically organised and empowered.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                Through structured community registration across the Central Zone of Plateau State, KEF-CARES builds a data-driven understanding of economic activities, skills, and opportunities.
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">Why Register?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registration helps create a verified community database that identifies skills, occupations, and economic needs across the Central Zone. This allows KEF-CARES to develop practical support programmes in areas such as entrepreneurship, agriculture, trading support, professional networking, vocational development, and youth empowerment.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

/* ─── Login form ─── */
const KefCaresLogin = ({ onBack }: { onBack: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      // Check if user has kef_user role
      const { data: hasRole } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "kef_user" });
      if (hasRole) {
        navigate("/kef-cares/dashboard");
      } else {
        toast({ title: "Access denied", description: "This account is not registered with KEF-CARES. Please create a KEF-CARES account.", variant: "destructive" });
        await supabase.auth.signOut();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white py-10">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <h1 className="text-2xl md:text-3xl font-black mb-2">KEF-CARES Login</h1>
            <p className="text-emerald-300 text-sm">Sign in to access your KEF-CARES dashboard</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-12 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold">
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

/* ─── Signup + Registration Form ─── */
const KefCaresSignup = ({ onBack }: { onBack: () => void }) => {
  const [step, setStep] = useState<"account" | "form">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setLoading(false);
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      return;
    }
    if (data.user) {
      // Assign kef_user role via edge function (bypasses RLS using service role)
      const { error: roleErr } = await supabase.functions.invoke("assign-kef-role");
      setLoading(false);
      if (roleErr) {
        toast({
          title: "Account created, but role assignment failed",
          description: roleErr.message + " — please contact support.",
          variant: "destructive",
        });
        return;
      }
      setUserId(data.user.id);
      toast({ title: "Account created!", description: "Now complete your KEF-CARES registration form." });
      setStep("form");
    } else {
      setLoading(false);
    }
  };

  if (step === "form") {
    return <KefCaresRegistrationForm userId={userId} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white py-10">
          <div className="container mx-auto px-4 text-center max-w-lg">
            <h1 className="text-2xl md:text-3xl font-black mb-2">Create KEF-CARES Account</h1>
            <p className="text-emerald-300 text-sm">Create your account first, then complete the registration form</p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12 max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <p className="font-bold text-sm">Create Account</p>
                <p className="text-xs text-muted-foreground">Set up your email and password</p>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <Label>Email Address *</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-12" placeholder="your@email.com" />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-12 pr-12" placeholder="Min. 6 characters" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-2">
                {loading ? "Creating account..." : <>Create Account <ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={onBack} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

/* ─── Registration Form (shown after signup) ─── */
const KefCaresRegistrationForm = ({ userId }: { userId?: string | null }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    member_id: "", full_name: "", gender: "", date_of_birth: "", phone_number: "", whatsapp_active: false,
    email: "", residential_address: "", lga: "", ward: "", polling_unit: "", community: "",
    marital_status: "", social_status: "",
    highest_qualification: "", field_of_study: "", education_status: "",
    economic_status: "", occupation: "", primary_economic_sector: "",
    monthly_income_range: "", owns_business: "", business_type: "",
    artisan_skills: [] as string[], creative_skills: [] as string[], professional_skills: [] as string[],
    sports_participation: false, sport_type: "",
    interest_entrepreneurship: false, interest_agricultural: false, interest_trading: false,
    interest_skills_training: false, interest_economic_empowerment: false,
    interest_leadership: false, interest_professional_networking: false,
    interested_in_volunteering: false, volunteer_role: "", volunteer_availability: "",
    consent_given: false,
  });

  const toggleArrayItem = (field: "artisan_skills" | "creative_skills" | "professional_skills", item: string) => {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.gender || !form.phone_number || !form.lga || !form.member_id || !form.marital_status || !form.social_status) {
      toast({ title: "Missing required fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!form.consent_given) {
      toast({ title: "Consent required", description: "You must consent to data collection to register.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const actualUserId = userId || user?.id;
    const { error } = await supabase.from("kef_cares_registrations").insert([{
      ...form,
      user_id: actualUserId,
    }]);
    setSubmitting(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registration Successful!", description: "Welcome to KEF-CARES! Redirecting to your dashboard..." });
      setTimeout(() => navigate("/kef-cares/dashboard"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white py-12">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-black mb-4">KEF-CARES – JOIN US</h1>
            <p className="text-lg md:text-xl font-semibold text-emerald-200 mb-2">
              Kefiano Community Advancement, Resilience & Economic Support Initiative
            </p>
            <p className="text-emerald-300 text-sm md:text-base">Central Zone Pilot – Plateau State</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">2</div>
              <p className="text-sm text-muted-foreground">Account created — now complete your registration</p>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center">KEF-CARES Registration Form</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <KefCaresFormFields form={form} setForm={setForm} toggleArrayItem={toggleArrayItem} />
              <Button type="submit" disabled={submitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 text-lg">
                {submitting ? "Submitting…" : "Submit Registration"}
              </Button>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default KefCares;
