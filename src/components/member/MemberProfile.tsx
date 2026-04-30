import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Edit, User, Mail, Phone, Calendar, MapPin, Award, FileText, MessageSquare, CheckCircle, Camera, Save, X } from "lucide-react";
import MemberIdCard from "./MemberIdCard";
import { toast } from "sonner";

const LGAS = [
  "Barkin Ladi", "Bassa", "Bokkos", "Jos East", "Jos North", "Jos South",
  "Kanam", "Kanke", "Langtang North", "Langtang South", "Mangu", "Mikang",
  "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase",
];

const MemberProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showIdCard, setShowIdCard] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    dob: "",
    lga: "",
    ward: "",
  });

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.user_metadata?.phone || "";
  const dob = profile?.dob || user?.user_metadata?.dob || "";
  const lga = profile?.lga || user?.user_metadata?.lga || "—";
  const ward = profile?.ward || user?.user_metadata?.ward || "—";
  const interests = profile?.interests || user?.user_metadata?.interests || [];
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";
  const avatarUrl = profile?.avatar_url || "";

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile(data);
    });
  }, [user]);

  const startEditing = () => {
    setForm({
      full_name: profile?.full_name || user?.user_metadata?.full_name || "",
      email: profile?.email || user?.email || "",
      phone: profile?.phone || user?.user_metadata?.phone || "",
      dob: profile?.dob || user?.user_metadata?.dob || "",
      lga: profile?.lga || user?.user_metadata?.lga || "",
      ward: profile?.ward || user?.user_metadata?.ward || "",
    });
    setEditing(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      dob: form.dob,
      lga: form.lga,
      ward: form.ward,
    }).eq("user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated successfully");
      setProfile((prev: any) => ({ ...prev, ...form }));
      setEditing(false);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload photo");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrlWithCache = `${publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase.from("profiles")
      .update({ avatar_url: avatarUrlWithCache })
      .eq("user_id", user.id);

    if (updateError) {
      toast.error("Failed to save photo");
    } else {
      toast.success("Profile photo updated");
      setProfile((prev: any) => ({ ...prev, avatar_url: avatarUrlWithCache }));
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">View and manage your personal information and activity</p>
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-xl overflow-hidden p-5 sm:p-6 pb-16 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 w-20 h-20 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              disabled={uploading}
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            {uploading && (
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="text-white min-w-0 flex-1">
            <h3 className="font-black text-lg sm:text-xl truncate">{displayName}</h3>
            <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
              Member · {lga !== "—" ? `${lga} LGA` : "Plateau State"}{ward !== "—" ? ` · ${ward} Ward` : ""}
            </p>
          </div>

          {/* Actions */}
          <div className="absolute bottom-3 right-4 sm:static flex gap-2 sm:shrink-0">
            <Button size="sm" variant="secondary" className="gap-1 bg-emerald-600 text-white hover:bg-emerald-800 border-0" onClick={() => setShowIdCard(true)}>
              <CreditCard className="w-3.5 h-3.5" /> ID Card
            </Button>
            {!editing ? (
              <Button size="sm" variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/30 border-0" onClick={startEditing}>
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button size="sm" variant="secondary" className="gap-1 bg-amber-500 text-white hover:bg-amber-600 border-0" onClick={saveProfile}>
                  <Save className="w-3.5 h-3.5" /> Save
                </Button>
                <Button size="sm" variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/30 border-0" onClick={() => setEditing(false)}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Personal Information</h3>
            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Full Name</Label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Date of Birth</Label>
                  <Input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">LGA</Label>
                  <Select value={form.lga} onValueChange={(v) => setForm({ ...form, lga: v })}>
                    <SelectTrigger><SelectValue placeholder="Select LGA" /></SelectTrigger>
                    <SelectContent>
                      {LGAS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Ward</Label>
                  <Input value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: User, label: "Full Name", value: displayName },
                  { icon: Mail, label: "Email", value: email },
                  { icon: Phone, label: "Phone", value: phone || "—" },
                  { icon: Calendar, label: "Date of Birth", value: dob || "—" },
                  { icon: MapPin, label: "State", value: "Plateau State" },
                  { icon: MapPin, label: "LGA", value: lga },
                  { icon: MapPin, label: "Ward", value: ward },
                  { icon: Calendar, label: "Date Joined", value: joinedDate },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <f.icon className="w-4 h-4 text-gray-400 shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-medium">{f.label}</p>
                      <p className="text-sm font-bold text-gray-900">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {interests.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Skills & Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest: string) => (
                  <span key={interest} className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ✓ {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FileText, label: "Reports Submitted", value: "0" },
              { icon: Calendar, label: "Events Attended", value: "0" },
              { icon: MessageSquare, label: "Forum Posts", value: "0" },
              { icon: CheckCircle, label: "Verified Reports", value: "0" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <s.icon className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-2xl font-black text-gray-900">{s.value}</p>
                <p className="text-[10px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Account Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-emerald-600">Active</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-bold text-emerald-600">Member</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Verification</span><span className="font-bold text-emerald-600">✓ Verified</span></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-5 text-white">
            <h4 className="font-bold text-sm uppercase tracking-wide mb-1">Membership ID</h4>
            <p className="text-xs text-emerald-200 mb-3">Generate and download your official membership identification card</p>
            <Button size="sm" variant="secondary" className="w-full gap-2 bg-amber-500 text-white hover:bg-amber-600 border-0 font-bold" onClick={() => setShowIdCard(true)}>
              <CreditCard className="w-4 h-4" /> Generate ID Card
            </Button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Badges & Achievements</h4>
            <div className="space-y-3">
              {[
                { icon: Award, label: "Verified Member", desc: "Completed member verification" },
                { icon: MessageSquare, label: "Active Contributor", desc: "50+ forum contributions" },
                { icon: FileText, label: "First Responder", desc: "Submitted first report within 24h" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><b.icon className="w-4 h-4 text-amber-600" /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{b.label}</p>
                    <p className="text-[10px] text-gray-500">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <MemberIdCard profile={profile} open={showIdCard} onClose={() => setShowIdCard(false)} />
    </div>
  );
};

export default MemberProfile;
