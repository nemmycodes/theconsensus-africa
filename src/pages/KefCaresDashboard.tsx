import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  LogOut, User, FileText, Bell, Edit, Save, X, Heart, Target, Home,
  Settings as SettingsIcon, Lock, Mail, Camera, MapPin, Briefcase,
  Calendar, Phone, Sparkles, ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import KefCaresFormFields from "@/components/kef-cares/KefCaresFormFields";

const MARITAL_STATUSES = ["Married", "Divorced", "Widow", "Single"];
const SOCIAL_STATUSES = ["Orphan", "Physically challenged", "Internally Displaced Person", "Homeless", "Working", "Not Working"];
const ECONOMIC_STATUSES = ["Employed", "Self-Employed", "Trader", "Farmer", "Artisan", "Professional", "Student", "Unemployed", "Creative Professional", "Athlete"];
const ECONOMIC_SECTORS = ["Agriculture", "Trading", "Small Business", "Technology", "Civil Service", "Education", "Professional Services", "Creative Industry", "Sports"];
const INCOME_RANGES = ["No Income", "₦1–₦50,000", "₦50,000–₦100,000", "₦100,000–₦300,000", "₦300,000+"];
const BUSINESS_TYPES = ["Trading", "Agriculture", "Food Processing", "Fashion", "Retail", "Technology", "Creative", "Professional Services"];

const KefCaresDashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "updates" | "settings">("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/kef-cares");
      return;
    }
    if (user) {
      ensureKefRole().then(() => fetchRegistration());
    }
  }, [user, authLoading]);

  // Self-assign kef_user role if missing (allowed by RLS for the user themself)
  const ensureKefRole = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "kef_user" });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      console.warn("kef_user role assign:", error.message);
    }
  };

  const fetchRegistration = async () => {
    if (!user) return;
    setLoadingData(true);
    // Look for a registration by user_id, or by email (in case it was created before sign-in)
    let { data } = await supabase
      .from("kef_cares_registrations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!data && user.email) {
      const linked = await supabase
        .from("kef_cares_registrations")
        .select("*")
        .eq("email", user.email)
        .is("user_id", null)
        .maybeSingle();
      if (linked.data) {
        await supabase.from("kef_cares_registrations")
          .update({ user_id: user.id })
          .eq("id", linked.data.id);
        data = { ...linked.data, user_id: user.id };
      }
    }

    if (data) {
      setRegistration(data);
      setForm(data);
    }
    setLoadingData(false);
  };

  const handleSave = async () => {
    if (!registration?.id) return;
    setSaving(true);
    const { error } = await supabase
      .from("kef_cares_registrations")
      .update({
        full_name: form.full_name,
        phone_number: form.phone_number,
        email: form.email,
        residential_address: form.residential_address,
        marital_status: form.marital_status,
        social_status: form.social_status,
        ward: form.ward,
        polling_unit: form.polling_unit,
        community: form.community,
        occupation: form.occupation,
        economic_status: form.economic_status,
        primary_economic_sector: form.primary_economic_sector,
        monthly_income_range: form.monthly_income_range,
        owns_business: form.owns_business,
        business_type: form.business_type,
      })
      .eq("id", registration.id);

    setSaving(false);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      setRegistration({ ...registration, ...form });
      setEditing(false);
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = registration?.full_name || user?.email?.split("@")[0] || "KEF User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button onClick={() => navigate("/")} className="text-emerald-600 hover:text-emerald-700 shrink-0">
            <Home className="w-5 h-5" />
          </button>
          <h1 className="text-sm sm:text-base md:text-lg font-black text-gray-900 truncate">KEF-CARES Dashboard</h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <span className="text-sm text-gray-600 hidden md:inline truncate max-w-[180px]">{displayName}</span>
          <Button variant="ghost" size="sm" className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3" onClick={() => signOut().then(() => navigate("/kef-cares"))}>
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Tabs (horizontally scrollable on mobile) */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 md:px-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {[
            { id: "overview" as const, label: "Overview", icon: FileText },
            { id: "profile" as const, label: "My Profile", icon: User },
            { id: "updates" as const, label: "Programme Updates", icon: Bell },
            { id: "settings" as const, label: "Account", icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        {activeTab === "overview" && (
          <OverviewTab
            registration={registration}
            user={user}
            onGoToProfile={() => setActiveTab("profile")}
          />
        )}
        {activeTab === "profile" && (
          !registration ? (
            <CompleteRegistrationInline user={user} onComplete={fetchRegistration} />
          ) : (
            <ProfileTab
              registration={registration}
              setRegistration={setRegistration}
              form={form}
              setForm={setForm}
              editing={editing}
              setEditing={setEditing}
              saving={saving}
              onSave={handleSave}
              user={user}
            />
          )
        )}
        {activeTab === "updates" && <UpdatesTab />}
        {activeTab === "settings" && <SettingsTab user={user} registration={registration} />}
      </div>
    </div>
  );
};

/* ─── Inline registration for users (e.g. Google sign-in) without a registration ─── */
const CompleteRegistrationInline = ({ user, onComplete }: { user: any; onComplete: () => void }) => {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({
    member_id: "", full_name: user?.user_metadata?.full_name || "", gender: "",
    date_of_birth: "", phone_number: "", whatsapp_active: false,
    email: user?.email || "", residential_address: "", lga: "", ward: "", polling_unit: "", community: "",
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
    setForm((prev: any) => ({
      ...prev,
      [field]: prev[field].includes(item) ? prev[field].filter((i: string) => i !== item) : [...prev[field], item]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.gender || !form.phone_number || !form.lga || !form.member_id || !form.marital_status || !form.social_status) {
      toast.error("Please fill all required fields (Member ID, Full Name, Gender, Phone, LGA, Marital, Social Status).");
      return;
    }
    if (!form.consent_given) {
      toast.error("You must consent to data collection to register.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("kef_cares_registrations").insert([{ ...form, user_id: user?.id }]);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Registration completed!");
      onComplete();
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-5 sm:p-6 text-white mb-6">
        <h2 className="text-lg sm:text-xl font-black mb-1">Complete your KEF-CARES registration</h2>
        <p className="text-emerald-100 text-xs sm:text-sm">
          Welcome{user?.email ? `, ${user.email}` : ""}! Fill the form below to activate your KEF-CARES profile.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <KefCaresFormFields form={form} setForm={setForm} toggleArrayItem={toggleArrayItem} />
          <Button type="submit" disabled={submitting} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-3 text-base sm:text-lg">
            {submitting ? "Submitting…" : "Submit Registration"}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

/* ─── OVERVIEW: personalised welcome + quick highlights ─── */
const OverviewTab = ({ registration, user, onGoToProfile }: { registration: any; user: any; onGoToProfile: () => void }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = registration?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      {/* Personalised hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-5 sm:p-8 text-white shadow-lg">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="absolute -left-8 bottom-0 w-32 h-32 rounded-full bg-emerald-300/10 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-100 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>{today}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black mb-2 leading-tight">
            {greeting}, {displayName.split(" ")[0]}!
          </h2>
          <p className="text-emerald-100 text-xs sm:text-base max-w-2xl">
            Welcome to your KEF-CARES dashboard — your hub for tracking your registration, programme updates, and community impact across Plateau State.
          </p>
        </div>
      </div>

      {!registration ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-amber-700" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-amber-900">Complete your profile</h3>
            <p className="text-xs sm:text-sm text-amber-800 mt-1">
              Fill in your KEF-CARES registration to unlock programme matching, opportunities, and your member ID.
            </p>
          </div>
          <Button onClick={onGoToProfile} className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
            Complete now
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: User, label: "Member ID", value: registration.member_id || "—", color: "bg-emerald-50 text-emerald-600" },
              { icon: MapPin, label: "LGA", value: registration.lga || "—", color: "bg-blue-50 text-blue-600" },
              { icon: Briefcase, label: "Status", value: registration.economic_status || "—", color: "bg-amber-50 text-amber-600" },
              { icon: Calendar, label: "Joined", value: new Date(registration.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }), color: "bg-purple-50 text-purple-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 hover:shadow-sm transition-shadow">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{s.label}</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" /> Your interests
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  registration.interest_entrepreneurship && "Entrepreneurship",
                  registration.interest_agricultural && "Agriculture",
                  registration.interest_trading && "Trading",
                  registration.interest_skills_training && "Skills Training",
                  registration.interest_economic_empowerment && "Economic Empowerment",
                  registration.interest_leadership && "Leadership",
                  registration.interest_professional_networking && "Networking",
                ].filter(Boolean).map((tag: any) => (
                  <span key={tag} className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">{tag}</span>
                ))}
                {![registration.interest_entrepreneurship, registration.interest_agricultural, registration.interest_trading, registration.interest_skills_training, registration.interest_economic_empowerment, registration.interest_leadership, registration.interest_professional_networking].some(Boolean) && (
                  <p className="text-xs text-gray-400">No interests selected yet.</p>
                )}
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Quick actions
              </h4>
              <div className="space-y-2">
                <Button onClick={onGoToProfile} variant="outline" className="w-full justify-start gap-2 text-sm">
                  <User className="w-4 h-4" /> View / edit my profile
                </Button>
                <Button onClick={() => window.location.href = "/discuss"} variant="outline" className="w-full justify-start gap-2 text-sm">
                  <FileText className="w-4 h-4" /> Visit community forum
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

/* ─── PROFILE: Facebook-style with cover, avatar upload, and details ─── */
const ProfileTab = ({ registration, setRegistration, form, setForm, editing, setEditing, saving, onSave, user }: any) => {
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);

  const uploadPhoto = async (file: File, kind: "avatar" | "cover") => {
    if (!user?.id) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setUploading(kind);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("kef-profile-photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setUploading(null);
      toast.error(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from("kef-profile-photos").getPublicUrl(path);
    const url = pub.publicUrl;
    const field = kind === "avatar" ? "avatar_url" : "cover_url";
    const { error: updErr } = await supabase
      .from("kef_cares_registrations")
      .update({ [field]: url })
      .eq("id", registration.id);
    setUploading(null);
    if (updErr) {
      toast.error(updErr.message);
      return;
    }
    setRegistration({ ...registration, [field]: url });
    setForm({ ...form, [field]: url });
    toast.success(`${kind === "avatar" ? "Profile picture" : "Cover photo"} updated`);
  };

  const handleBioSave = async (newBio: string) => {
    const { error } = await supabase
      .from("kef_cares_registrations")
      .update({ bio: newBio })
      .eq("id", registration.id);
    if (error) toast.error(error.message);
    else {
      setRegistration({ ...registration, bio: newBio });
      toast.success("Bio updated");
    }
  };

  const initials = (registration.full_name || "K U").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      {/* Cover + Avatar header (Facebook-style) */}
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <div className="relative h-40 sm:h-56 md:h-64 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 group">
          {registration.cover_url && (
            <img src={registration.cover_url} alt="Cover" className="w-full h-full object-cover" />
          )}
          <label className="absolute bottom-3 right-3 cursor-pointer bg-white/90 hover:bg-white text-gray-900 rounded-lg px-3 py-1.5 text-xs font-semibold shadow flex items-center gap-1.5 transition">
            <ImageIcon className="w-3.5 h-3.5" />
            {uploading === "cover" ? "Uploading…" : registration.cover_url ? "Change cover" : "Add cover"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "cover")}
              disabled={uploading !== null}
            />
          </label>
        </div>

        <div className="px-4 sm:px-6 pb-5 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:gap-5 -mt-12 sm:-mt-16">
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-emerald-100 ring-4 ring-white overflow-hidden flex items-center justify-center text-emerald-700 text-3xl font-black shadow-md">
                {registration.avatar_url ? (
                  <img src={registration.avatar_url} alt={registration.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <label className="absolute bottom-1 right-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-8 h-8 flex items-center justify-center shadow ring-2 ring-white transition">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0], "avatar")}
                  disabled={uploading !== null}
                />
              </label>
              {uploading === "avatar" && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 mt-3 sm:mt-0 sm:pb-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 truncate">{registration.full_name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-500 mt-1">
                {registration.member_id && <span className="font-semibold text-emerald-700">ID: {registration.member_id}</span>}
                {registration.lga && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {registration.lga}</span>}
                {registration.occupation && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {registration.occupation}</span>}
              </div>
            </div>

            <div className="mt-3 sm:mt-0 sm:pb-2 shrink-0">
              {!editing ? (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
                  <Edit className="w-3.5 h-3.5" /> Edit details
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={onSave} disabled={saving}>
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => { setEditing(false); setForm(registration); }}>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <BioBlock bio={registration.bio} onSave={handleBioSave} />
        </div>
      </div>

      {/* About card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">About</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <EditableField label="Full Name" value={form.full_name} editing={editing} onChange={(v: string) => setForm({ ...form, full_name: v })} icon={User} />
          <EditableField label="Phone Number" value={form.phone_number} editing={editing} onChange={(v: string) => setForm({ ...form, phone_number: v })} icon={Phone} />
          <EditableField label="Email" value={form.email} editing={editing} onChange={(v: string) => setForm({ ...form, email: v })} icon={Mail} />
          <EditableField label="Residential Address" value={form.residential_address} editing={editing} onChange={(v: string) => setForm({ ...form, residential_address: v })} icon={Home} />
          <EditableSelect label="Marital Status" value={form.marital_status} editing={editing} options={MARITAL_STATUSES} onChange={(v: string) => setForm({ ...form, marital_status: v })} />
          <EditableSelect label="Social Status" value={form.social_status} editing={editing} options={SOCIAL_STATUSES} onChange={(v: string) => setForm({ ...form, social_status: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" /> Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">LGA</p>
            <p className="text-sm font-bold text-gray-900">{registration.lga}</p>
          </div>
          <EditableField label="Ward" value={form.ward} editing={editing} onChange={(v: string) => setForm({ ...form, ward: v })} />
          <EditableField label="Polling Unit" value={form.polling_unit} editing={editing} onChange={(v: string) => setForm({ ...form, polling_unit: v })} />
          <EditableField label="Community" value={form.community} editing={editing} onChange={(v: string) => setForm({ ...form, community: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600" /> Employment & Economic
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <EditableSelect label="Economic Status" value={form.economic_status} editing={editing} options={ECONOMIC_STATUSES} onChange={(v: string) => setForm({ ...form, economic_status: v })} />
          <EditableField label="Occupation" value={form.occupation} editing={editing} onChange={(v: string) => setForm({ ...form, occupation: v })} />
          <EditableSelect label="Economic Sector" value={form.primary_economic_sector} editing={editing} options={ECONOMIC_SECTORS} onChange={(v: string) => setForm({ ...form, primary_economic_sector: v })} />
          <EditableSelect label="Monthly Income" value={form.monthly_income_range} editing={editing} options={INCOME_RANGES} onChange={(v: string) => setForm({ ...form, monthly_income_range: v })} />
          <EditableSelect label="Owns Business" value={form.owns_business} editing={editing} options={["Yes", "No", "Planning to Start"]} onChange={(v: string) => setForm({ ...form, owns_business: v })} />
          <EditableSelect label="Business Type" value={form.business_type} editing={editing} options={BUSINESS_TYPES} onChange={(v: string) => setForm({ ...form, business_type: v })} />
        </div>
      </div>
    </motion.div>
  );
};

const BioBlock = ({ bio, onSave }: { bio: string | null; onSave: (b: string) => void | Promise<void> }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(bio || "");
  useEffect(() => { setDraft(bio || ""); }, [bio]);
  return (
    <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-100">
      {!editing ? (
        <div className="flex items-start justify-between gap-3">
          <p className={`text-sm ${bio ? "text-gray-700" : "text-gray-400 italic"} whitespace-pre-wrap`}>
            {bio || "Add a short bio to tell others about yourself."}
          </p>
          <Button variant="ghost" size="sm" className="shrink-0 text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 -mr-2" onClick={() => setEditing(true)}>
            {bio ? "Edit" : "Add bio"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full text-sm rounded-lg border border-gray-200 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Tell people a bit about you…"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400">{draft.length}/300</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setDraft(bio || ""); }}>Cancel</Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={async () => { await onSave(draft.trim()); setEditing(false); }}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditableField = ({ label, value, editing, onChange, icon: Icon }: { label: string; value: string; editing: boolean; onChange: (v: string) => void; icon?: any }) => {
  if (editing) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">{label}</Label>
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  }
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
      <p className="text-sm font-bold text-gray-900 break-words">{value || "N/A"}</p>
    </div>
  );
};

const EditableSelect = ({ label, value, editing, options, onChange }: { label: string; value: string; editing: boolean; options: string[]; onChange: (v: string) => void }) => {
  if (editing) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs text-gray-500">{label}</Label>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder={`Select ${label}`} /></SelectTrigger>
          <SelectContent>
            {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
      <p className="text-sm font-bold text-gray-900 break-words">{value || "N/A"}</p>
    </div>
  );
};

/* ─── Programme updates pulled from admin-managed table ─── */
const UpdatesTab = () => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("kef_cares_program_updates")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (!active) return;
      setUpdates(data || []);
      setLoading(false);
    })();

    const channel = supabase
      .channel("kef-program-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "kef_cares_program_updates" }, () => {
        supabase
          .from("kef_cares_program_updates")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })
          .then(({ data }) => setUpdates(data || []));
      })
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-black text-gray-900">Programme Updates</h2>
      {loading ? (
        <div className="text-center py-8"><div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : updates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No programme updates yet. Check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900">{update.title}</h4>
                  {update.date_label && <p className="text-xs text-gray-500 mt-1">{update.date_label}</p>}
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{update.body}</p>
                </div>
                <Bell className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const SettingsTab = ({ user, registration }: { user: any; registration: any }) => {
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [updating, setUpdating] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);

  const handlePasswordUpdate = async () => {
    if (!newPwd || newPwd.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match");
      return;
    }
    setUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    setUpdating(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Password updated successfully");
      setNewPwd(""); setConfirmPwd("");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      <h2 className="text-base sm:text-lg font-black text-gray-900">Account Management</h2>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-600" /> Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Email</p>
            <p className="text-sm font-bold text-gray-900 break-all">{user?.email || "N/A"}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">Member ID</p>
            <p className="text-sm font-bold text-gray-900">{registration?.member_id || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" /> Change Password
        </h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">New Password</Label>
            <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="At least 6 characters" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Confirm New Password</Label>
            <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
          </div>
          <Button onClick={handlePasswordUpdate} disabled={updating} className="bg-emerald-600 hover:bg-emerald-700">
            {updating ? "Updating…" : "Update Password"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-600" /> Notification Preferences
        </h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="text-sm font-bold text-gray-900">Email notifications</p>
              <p className="text-xs text-gray-500">Receive programme updates by email</p>
            </div>
            <Checkbox checked={emailNotif} onCheckedChange={(v) => setEmailNotif(!!v)} />
          </label>
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="text-sm font-bold text-gray-900">SMS notifications</p>
              <p className="text-xs text-gray-500">Receive urgent alerts via SMS</p>
            </div>
            <Checkbox checked={smsNotif} onCheckedChange={(v) => setSmsNotif(!!v)} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-red-200 bg-red-50/30 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-red-900 uppercase tracking-wide mb-2">Danger Zone</h3>
        <p className="text-xs text-red-700 mb-4">Request data deletion or account removal.</p>
        <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" onClick={() => toast.info("Please contact support@plateauconsensus.org to request data deletion.")}>
          Request Account Deletion
        </Button>
      </div>
    </motion.div>
  );
};

export default KefCaresDashboard;
