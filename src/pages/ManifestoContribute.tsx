import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle2, ScrollText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const INTERESTS = [
  "Governance & Leadership",
  "Economic Development",
  "Agriculture & Food Security",
  "Education",
  "Healthcare",
  "Technology & Digital Economy",
  "Natural Resources & Mining",
  "Infrastructure Development",
  "Security & Peacebuilding",
  "Youth & Sports Development",
  "Women & Social Inclusion",
  "Tourism & Creative Economy",
  "Environment & Sustainability",
  "Community Development",
  "Research & Policy Development",
  "Entrepreneurship & Innovation",
];

const ENGAGEMENT = [
  "Research & Policy Development",
  "Community Engagement",
  "Youth Mobilisation",
  "Innovation & Technology",
  "Data & Surveys",
  "Media & Communications",
  "Economic Development Initiatives",
  "Technical Advisory Support",
];

const QUALIFICATIONS = ["Secondary", "Diploma/NCE", "HND/Bachelor's", "Master's", "PhD", "Other"];
const AGE_RANGES = ["18–25", "26–35", "36–45", "46–55", "56+"];

const ManifestoContribute = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    whatsapp: "",
    email: "",
    gender: "",
    age_range: "",
    lga: "",
    ward: "",
    current_location: "",
    occupation: "",
    organisation: "",
    qualification: "",
    areas_of_interest: [] as string[],
    about: "",
    contribution: "",
    engagement_areas: [] as string[],
    declaration: false,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth?redirect=/manifesto/contribute", { replace: true });
    }
  }, [authLoading, user, navigate]);

  if (authLoading || !user) return null;

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (key: "areas_of_interest" | "engagement_areas", val: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.declaration) {
      toast.error("Please confirm the declaration to submit.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("manifesto_contributors").insert(form);
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl text-center">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl md:text-4xl font-black mb-4">Thank You for Contributing</h1>
            <p className="text-muted-foreground mb-8">
              Your submission to the Consensus Brain Trust has been received. Our team will be in touch.
            </p>
            <Button onClick={() => navigate("/manifesto")}>Back to Manifesto</Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-12 px-4 lg:px-8 bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <ScrollText className="w-3.5 h-3.5" /> The Consensus Brain Trust (CBT)
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">Manifesto Contributors Registration</h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Building a New Plateau Through Collective Intelligence. Join citizens, professionals, and innovators
              shaping a people-driven governance manifesto for Plateau State, coordinated under the mentorship of
              Chief Kefas Ropshik Wungak (Kefiano).
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 lg:px-8">
        <form onSubmit={handleSubmit} className="container mx-auto max-w-3xl space-y-10">
          {/* Personal */}
          <div className="space-y-6">
            <h2 className="text-xl font-black border-l-4 border-primary pl-4">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name *"><Input required value={form.full_name} onChange={(e) => set("full_name", e.target.value)} /></Field>
              <Field label="Phone Number *"><Input required value={form.phone} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="WhatsApp Number"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
              <Field label="Email Address *"><Input type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></Field>
            </div>
            <Field label="Gender">
              <RadioGroup value={form.gender} onValueChange={(v) => set("gender", v)} className="flex gap-6">
                {["Male", "Female"].map((g) => (
                  <div key={g} className="flex items-center gap-2">
                    <RadioGroupItem value={g} id={`g-${g}`} /><Label htmlFor={`g-${g}`}>{g}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Field>
            <Field label="Age Range">
              <RadioGroup value={form.age_range} onValueChange={(v) => set("age_range", v)} className="flex flex-wrap gap-4">
                {AGE_RANGES.map((a) => (
                  <div key={a} className="flex items-center gap-2">
                    <RadioGroupItem value={a} id={`a-${a}`} /><Label htmlFor={`a-${a}`}>{a}</Label>
                  </div>
                ))}
              </RadioGroup>
            </Field>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <h2 className="text-xl font-black border-l-4 border-primary pl-4">Location</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Local Government Area (LGA)"><Input value={form.lga} onChange={(e) => set("lga", e.target.value)} /></Field>
              <Field label="Ward (Optional)"><Input value={form.ward} onChange={(e) => set("ward", e.target.value)} /></Field>
              <Field label="Current Location" className="md:col-span-2"><Input value={form.current_location} onChange={(e) => set("current_location", e.target.value)} /></Field>
            </div>
          </div>

          {/* Professional */}
          <div className="space-y-6">
            <h2 className="text-xl font-black border-l-4 border-primary pl-4">Professional Profile</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Occupation / Profession"><Input value={form.occupation} onChange={(e) => set("occupation", e.target.value)} /></Field>
              <Field label="Organisation / Institution"><Input value={form.organisation} onChange={(e) => set("organisation", e.target.value)} /></Field>
            </div>
            <Field label="Highest Qualification">
              <Select value={form.qualification} onValueChange={(v) => set("qualification", v)}>
                <SelectTrigger><SelectValue placeholder="Select qualification" /></SelectTrigger>
                <SelectContent>{QUALIFICATIONS.map((q) => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>

          {/* Areas of interest */}
          <div className="space-y-4">
            <h2 className="text-xl font-black border-l-4 border-primary pl-4">Area of Interest</h2>
            <p className="text-sm text-muted-foreground">Select all that apply.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {INTERESTS.map((i) => (
                <label key={i} className="flex items-center gap-2 p-3 rounded-md border bg-card hover:bg-accent cursor-pointer">
                  <Checkbox checked={form.areas_of_interest.includes(i)} onCheckedChange={() => toggle("areas_of_interest", i)} />
                  <span className="text-sm">{i}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Contributor profile */}
          <div className="space-y-6">
            <h2 className="text-xl font-black border-l-4 border-primary pl-4">Contributor Profile</h2>
            <Field label="Briefly tell us about yourself (max 150 words)">
              <Textarea rows={5} maxLength={1200} value={form.about} onChange={(e) => set("about", e.target.value)} />
            </Field>
            <Field label="What skills, experience, ideas, or solutions can you contribute?">
              <Textarea rows={5} value={form.contribution} onChange={(e) => set("contribution", e.target.value)} />
            </Field>
          </div>

          {/* Engagement */}
          <div className="space-y-4">
            <h2 className="text-xl font-black border-l-4 border-primary pl-4">Youth & Community Engagement</h2>
            <p className="text-sm text-muted-foreground">Where would you like to engage?</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {ENGAGEMENT.map((i) => (
                <label key={i} className="flex items-center gap-2 p-3 rounded-md border bg-card hover:bg-accent cursor-pointer">
                  <Checkbox checked={form.engagement_areas.includes(i)} onCheckedChange={() => toggle("engagement_areas", i)} />
                  <span className="text-sm">{i}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Declaration */}
          <div className="space-y-4 p-6 rounded-xl border bg-primary/5">
            <h2 className="text-lg font-black">Declaration</h2>
            <p className="text-sm text-foreground/80">
              I confirm that the information provided is accurate and that I am willing to contribute positively
              towards the development of a practical, inclusive, and forward-looking manifesto for Plateau State.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox checked={form.declaration} onCheckedChange={(v) => set("declaration", !!v)} />
              <span className="font-medium">Yes, I confirm.</span>
            </label>
          </div>

          <Button type="submit" size="lg" className="w-full font-bold" disabled={loading}>
            {loading ? "Submitting..." : (<><Send className="w-4 h-4 mr-2" /> Submit Contribution</>)}
          </Button>

          <p className="text-center text-sm text-muted-foreground italic pt-2">
            Lead Mentor: Chief Kefas Ropshik Wungak (Kefiano) — Building Consensus. Inspiring Leadership. Transforming Plateau.
          </p>
        </form>
      </section>

      <Footer />
    </div>
  );
};

const Field = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-sm font-semibold">{label}</Label>
    {children}
  </div>
);

export default ManifestoContribute;
