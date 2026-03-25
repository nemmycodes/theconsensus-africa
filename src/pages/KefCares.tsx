import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Heart, Users, Target, BookOpen } from "lucide-react";
import KefCaresFormFields from "@/components/kef-cares/KefCaresFormFields";

const KefCares = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white py-16">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <h1 className="text-3xl md:text-5xl font-black mb-4">KEF-CARES – JOIN US</h1>
              <p className="text-lg md:text-xl font-semibold text-emerald-200 mb-2">
                Kefiano Community Advancement, Resilience & Economic Support Initiative
              </p>
              <p className="text-emerald-300 text-sm md:text-base mb-8">Central Zone Pilot – Plateau State</p>
              <p className="text-emerald-100 mb-6">You need to sign in or create an account to access the KEF-CARES registration form.</p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-100 font-bold" onClick={() => navigate("/auth")}>
                  Sign In / Sign Up
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate("/")}>
                  Back to Home
                </Button>
              </div>
            </div>
          </section>

          {/* Purpose & Why Register - visible to all */}
          <section className="container mx-auto px-4 py-12 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">Purpose</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  KEF-CARES is an economic empowerment initiative aligned with the philosophy of The Consensus Movement: that strong communities are built when citizens—especially youths, traders, farmers, artisans, professionals, entrepreneurs, and creatives—are economically organised and empowered.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                  Through structured community registration across the Central Zone of Plateau State, KEF-CARES builds a data-driven understanding of economic activities, skills, and opportunities. This enables the initiative to design targeted programmes that strengthen livelihoods, expand entrepreneurship, support agriculture and trading networks, and increase the purchasing power of communities.
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
  }

  return <KefCaresAuthenticated />;
};

const KefCaresAuthenticated = () => {
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
    const { error } = await supabase.from("kef_cares_registrations").insert([form]);
    setSubmitting(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registration Successful!", description: "Thank you for registering with KEF-CARES." });
      setForm({
        member_id: "", full_name: "", gender: "", date_of_birth: "", phone_number: "", whatsapp_active: false,
        email: "", residential_address: "", lga: "", ward: "", polling_unit: "", community: "",
        marital_status: "", social_status: "",
        highest_qualification: "", field_of_study: "", education_status: "",
        economic_status: "", occupation: "", primary_economic_sector: "",
        monthly_income_range: "", owns_business: "", business_type: "",
        artisan_skills: [], creative_skills: [], professional_skills: [],
        sports_participation: false, sport_type: "",
        interest_entrepreneurship: false, interest_agricultural: false, interest_trading: false,
        interest_skills_training: false, interest_economic_empowerment: false,
        interest_leadership: false, interest_professional_networking: false,
        interested_in_volunteering: false, volunteer_role: "", volunteer_availability: "",
        consent_given: false,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white py-16">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-3xl md:text-5xl font-black mb-4">KEF-CARES – JOIN US</h1>
            <p className="text-lg md:text-xl font-semibold text-emerald-200 mb-2">
              Kefiano Community Advancement, Resilience & Economic Support Initiative
            </p>
            <p className="text-emerald-300 text-sm md:text-base mb-8">Central Zone Pilot – Plateau State</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
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
          </div>
        </section>

        {/* Purpose & Why Register */}
        <section className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">Purpose</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                KEF-CARES is an economic empowerment initiative aligned with the philosophy of The Consensus Movement: that strong communities are built when citizens—especially youths, traders, farmers, artisans, professionals, entrepreneurs, and creatives—are economically organised and empowered.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                Through structured community registration across the Central Zone of Plateau State, KEF-CARES builds a data-driven understanding of economic activities, skills, and opportunities. This enables the initiative to design targeted programmes that strengthen livelihoods, expand entrepreneurship, support agriculture and trading networks, and increase the purchasing power of communities.
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
              <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-3">Why Register?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registration helps create a verified community database that identifies skills, occupations, and economic needs across the Central Zone. This allows KEF-CARES to develop practical support programmes in areas such as entrepreneurship, agriculture, trading support, professional networking, vocational development, and youth empowerment.
              </p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-card rounded-xl border shadow-sm p-6 md:p-8">
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
