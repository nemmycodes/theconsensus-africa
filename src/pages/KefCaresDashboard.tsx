import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LogOut, User, FileText, Bell, Edit, Save, X, Heart, Users, Target, BookOpen, Home } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LGAS = ["Pankshin", "Mangu", "Bokkos", "Kanam", "Kanke"];
const MARITAL_STATUSES = ["Married", "Divorced", "Widow", "Single"];
const SOCIAL_STATUSES = ["Orphan", "Physically challenged", "Internally Displaced Person", "Homeless", "Working", "Not Working"];
const QUALIFICATIONS = ["No Formal Education", "Primary School", "Secondary School", "Diploma", "NCE", "HND", "Bachelor's Degree", "Postgraduate"];
const EDUCATION_STATUSES = ["Student", "Graduate", "Out of School"];
const ECONOMIC_STATUSES = ["Employed", "Self-Employed", "Trader", "Farmer", "Artisan", "Professional", "Student", "Unemployed", "Creative Professional", "Athlete"];
const ECONOMIC_SECTORS = ["Agriculture", "Trading", "Small Business", "Technology", "Civil Service", "Education", "Professional Services", "Creative Industry", "Sports"];
const INCOME_RANGES = ["No Income", "₦1–₦50,000", "₦50,000–₦100,000", "₦100,000–₦300,000", "₦300,000+"];
const BUSINESS_TYPES = ["Trading", "Agriculture", "Food Processing", "Fashion", "Retail", "Technology", "Creative", "Professional Services"];

const KefCaresDashboard = () => {
  const { user, loading: authLoading, isKefUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "profile" | "updates">("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/kef-cares");
      return;
    }
    if (user) {
      fetchRegistration();
    }
  }, [user, authLoading]);

  const fetchRegistration = async () => {
    if (!user) return;
    setLoadingData(true);
    const { data } = await supabase
      .from("kef_cares_registrations")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
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
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-emerald-600 hover:text-emerald-700">
            <Home className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-black text-gray-900">KEF-CARES Dashboard</h1>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden md:inline">{displayName}</span>
          <Button variant="ghost" size="sm" className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => signOut().then(() => navigate("/kef-cares"))}>
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6">
        <div className="flex gap-1">
          {[
            { id: "overview" as const, label: "Overview", icon: FileText },
            { id: "profile" as const, label: "My Profile", icon: User },
            { id: "updates" as const, label: "Programme Updates", icon: Bell },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        {!registration ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Registration Found</h3>
            <p className="text-sm text-gray-500 mb-4">You haven't completed your KEF-CARES registration yet.</p>
            <Button onClick={() => navigate("/kef-cares")} className="bg-emerald-600 hover:bg-emerald-700">
              Complete Registration
            </Button>
          </div>
        ) : (
          <>
            {activeTab === "overview" && <OverviewTab registration={registration} />}
            {activeTab === "profile" && (
              <ProfileTab
                registration={registration}
                form={form}
                setForm={setForm}
                editing={editing}
                setEditing={setEditing}
                saving={saving}
                onSave={handleSave}
              />
            )}
            {activeTab === "updates" && <UpdatesTab />}
          </>
        )}
      </div>
    </div>
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
        <h2 className="text-xl font-black mb-1">Welcome, {registration.full_name}!</h2>
        <p className="text-emerald-200 text-sm">Thank you for registering with KEF-CARES. Your data helps us build stronger communities.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider">{s.label}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Registration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-medium">{label}</p>
                <p className="font-bold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900">My KEF-CARES Profile</h2>
        {!editing ? (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setEditing(true)}>
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

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EditableField label="Full Name" value={form.full_name} editing={editing} onChange={(v: string) => setForm({ ...form, full_name: v })} />
          <EditableField label="Phone Number" value={form.phone_number} editing={editing} onChange={(v: string) => setForm({ ...form, phone_number: v })} />
          <EditableField label="Email" value={form.email} editing={editing} onChange={(v: string) => setForm({ ...form, email: v })} />
          <EditableField label="Residential Address" value={form.residential_address} editing={editing} onChange={(v: string) => setForm({ ...form, residential_address: v })} />
          <EditableSelect label="Marital Status" value={form.marital_status} editing={editing} options={MARITAL_STATUSES} onChange={(v: string) => setForm({ ...form, marital_status: v })} />
          <EditableSelect label="Social Status" value={form.social_status} editing={editing} options={SOCIAL_STATUSES} onChange={(v: string) => setForm({ ...form, social_status: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-[10px] text-gray-400 uppercase font-medium">LGA</p>
            <p className="text-sm font-bold text-gray-900">{registration.lga}</p>
          </div>
          <EditableField label="Ward" value={form.ward} editing={editing} onChange={(v: string) => setForm({ ...form, ward: v })} />
          <EditableField label="Polling Unit" value={form.polling_unit} editing={editing} onChange={(v: string) => setForm({ ...form, polling_unit: v })} />
          <EditableField label="Community" value={form.community} editing={editing} onChange={(v: string) => setForm({ ...form, community: v })} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Employment & Economic</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      <p className="text-sm font-bold text-gray-900">{value || "N/A"}</p>
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
      <p className="text-sm font-bold text-gray-900">{value || "N/A"}</p>
    </div>
  );
};

const UpdatesTab = () => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <h2 className="text-lg font-black text-gray-900">Programme Updates</h2>
    <div className="space-y-4">
      {[
        { title: "KEF-CARES Central Zone Pilot Launched", date: "March 2026", desc: "The Central Zone pilot programme has officially commenced. Registration is now open for residents of Pankshin, Mangu, Bokkos, Kanam, and Kanke LGAs." },
        { title: "Skills Training Programme Coming Soon", date: "Q2 2026", desc: "KEF-CARES will be rolling out targeted skills training programmes based on registration data analysis. Stay tuned for announcements." },
        { title: "Agricultural Support Initiative", date: "Q3 2026", desc: "Partnerships with local agricultural agencies are being finalized to provide farming support and resources to registered farmers." },
      ].map((update) => (
        <div key={update.title} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-bold text-sm text-gray-900">{update.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{update.date}</p>
              <p className="text-sm text-gray-600 mt-2">{update.desc}</p>
            </div>
            <Bell className="w-4 h-4 text-emerald-500 shrink-0 mt-1" />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export default KefCaresDashboard;
