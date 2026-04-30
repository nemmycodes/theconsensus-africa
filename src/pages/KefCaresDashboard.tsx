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

const OverviewTab = ({ registration }: { registration: any }) => {
  const stats = [
    { icon: User, label: "Member ID", value: registration.member_id || "N/A", color: "bg-emerald-50 text-emerald-600" },
    { icon: FileText, label: "LGA", value: registration.lga || "N/A", color: "bg-blue-50 text-blue-600" },
    { icon: Target, label: "Status", value: registration.economic_status || "N/A", color: "bg-amber-50 text-amber-600" },
    { icon: Heart, label: "Registered", value: new Date(registration.created_at).toLocaleDateString(), color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-5 sm:p-6 text-white">
        <h2 className="text-lg sm:text-xl font-black mb-1">Welcome, {registration.full_name}!</h2>
        <p className="text-emerald-200 text-xs sm:text-sm">Thank you for registering with KEF-CARES. Your data helps us build stronger communities.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{s.label}</p>
            <p className="text-xs sm:text-sm font-bold text-gray-900 mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Registration Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          {[
            ["Full Name", registration.full_name],
            ["Gender", registration.gender],
            ["Phone", registration.phone_number],
            ["Email", registration.email || "N/A"],
            ["LGA", registration.lga],
            ["Ward", registration.ward || "N/A"],
            ["Marital Status", registration.marital_status || "N/A"],
            ["Social Status", registration.social_status || "N/A"],
            ["Occupation", registration.occupation || "N/A"],
            ["Economic Status", registration.economic_status || "N/A"],
            ["Qualification", registration.highest_qualification || "N/A"],
            ["Income Range", registration.monthly_income_range || "N/A"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
                <p className="font-bold text-gray-900 break-words">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {registration.artisan_skills?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide mb-3">Artisan Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {registration.artisan_skills.map((s: string) => (
                <span key={s} className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">{s}</span>
              ))}
            </div>
          </div>
        )}
        {registration.professional_skills?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wide mb-3">Professional Skills</h4>
            <div className="flex flex-wrap gap-1.5">
              {registration.professional_skills.map((s: string) => (
                <span key={s} className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProfileTab = ({ registration, form, setForm, editing, setEditing, saving, onSave }: any) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base sm:text-lg font-black text-gray-900">My KEF-CARES Profile</h2>
        {!editing ? (
          <Button variant="outline" size="sm" className="gap-1 self-start" onClick={() => setEditing(true)}>
            <Edit className="w-3.5 h-3.5" /> Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={onSave} disabled={saving}>
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => { setEditing(false); setForm(registration); }}>
              <X className="w-3.5 h-3.5" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <EditableField label="Full Name" value={form.full_name} editing={editing} onChange={(v: string) => setForm({ ...form, full_name: v })} />
          <EditableField label="Phone Number" value={form.phone_number} editing={editing} onChange={(v: string) => setForm({ ...form, phone_number: v })} />
          <EditableField label="Email" value={form.email} editing={editing} onChange={(v: string) => setForm({ ...form, email: v })} />
          <EditableField label="Residential Address" value={form.residential_address} editing={editing} onChange={(v: string) => setForm({ ...form, residential_address: v })} />
          <EditableSelect label="Marital Status" value={form.marital_status} editing={editing} options={MARITAL_STATUSES} onChange={(v: string) => setForm({ ...form, marital_status: v })} />
          <EditableSelect label="Social Status" value={form.social_status} editing={editing} options={SOCIAL_STATUSES} onChange={(v: string) => setForm({ ...form, social_status: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Location</h3>
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
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Employment & Economic</h3>
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

const EditableField = ({ label, value, editing, onChange }: { label: string; value: string; editing: boolean; onChange: (v: string) => void }) => {
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
