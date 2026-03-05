import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, User, Heart, MapPin, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

  // Step 0 - Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Step 1 - Personal
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");

  // Step 2 - Interests
  const [interests, setInterests] = useState<string[]>([]);

  // Step 3 - Location
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
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

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, dob, interests, lga, ward },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome!", description: "Check your email to confirm your account." });
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="text-center mb-8">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-heading font-black">Join the Movement</h1>
            <p className="text-muted-foreground mt-2">Become part of The Plateau Consensus</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>

          <Card className="border-border">
            <CardHeader>
              <CardTitle>{steps[step].label} Details</CardTitle>
              <CardDescription>
                {step === 0 && "Create your account credentials"}
                {step === 1 && "Tell us about yourself"}
                {step === 2 && "What areas interest you most?"}
                {step === 3 && "Where are you located in Plateau State?"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
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
                          className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                            interests.includes(interest)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card text-muted-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <>
                      <div className="space-y-2">
                        <Label>Local Government Area (LGA)</Label>
                        <select
                          value={lga}
                          onChange={(e) => setLga(e.target.value)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="">Select LGA</option>
                          {LGA_OPTIONS.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Ward (optional)</Label>
                        <Input placeholder="Your ward" value={ward} onChange={(e) => setWard(e.target.value)} />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 0}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
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
                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Onboarding;
