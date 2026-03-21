import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Edit, User, Mail, Phone, Calendar, MapPin, Award, FileText, MessageSquare, CheckCircle } from "lucide-react";
import MemberIdCard from "./MemberIdCard";

const MemberProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [showIdCard, setShowIdCard] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";
  const email = profile?.email || user?.email || "";
  const phone = profile?.phone || user?.user_metadata?.phone || "";
  const dob = profile?.dob || user?.user_metadata?.dob || "";
  const lga = profile?.lga || user?.user_metadata?.lga || "—";
  const ward = profile?.ward || user?.user_metadata?.ward || "—";
  const interests = profile?.interests || user?.user_metadata?.interests || [];
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—";

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => { if (data) setProfile(data); });
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">View and manage your personal information and activity</p>
      </div>

      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-r from-emerald-700 to-emerald-500 rounded-xl overflow-hidden">
        <div className="absolute bottom-0 left-6 translate-y-1/2">
          <div className="w-20 h-20 rounded-full bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold border-4 border-white shadow-lg">
            {displayName[0]?.toUpperCase()}
          </div>
        </div>
        <div className="absolute bottom-3 left-28 text-white">
          <h3 className="font-black text-lg">{displayName}</h3>
          <p className="text-xs text-emerald-100">Member · {lga} LGA</p>
        </div>
        <div className="absolute bottom-3 right-4 flex gap-2">
          <Button size="sm" variant="secondary" className="gap-1 bg-emerald-600 text-white hover:bg-emerald-800 border-0" onClick={() => setShowIdCard(true)}>
            <CreditCard className="w-3.5 h-3.5" /> ID Card
          </Button>
          <Button size="sm" variant="secondary" className="gap-1 bg-white/20 text-white hover:bg-white/30 border-0">
            <Edit className="w-3.5 h-3.5" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Personal Information</h3>
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
          </div>

          {/* Interests */}
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

          {/* Activity Stats */}
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

      {/* ID Card Modal */}
      {showIdCard && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowIdCard(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-gray-900">Membership ID Card</h3>
                  <p className="text-xs text-gray-500">Your official TPC identification card</p>
                </div>
              </div>
              <button onClick={() => setShowIdCard(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Card */}
            <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-2xl p-6 text-white border-4 border-amber-400 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-emerald-200">The Plateau</p>
                  <p className="text-lg font-black uppercase">Consensus</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-emerald-200">Member Card</p>
                  <p className="text-sm font-bold">2025 - 2027</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">{displayName[0]?.toUpperCase()}</div>
                <div>
                  <p className="text-lg font-black">{displayName}</p>
                  <p className="text-xs text-emerald-200">Verified Member</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><p className="text-emerald-300 uppercase text-[10px]">Member ID</p><p className="font-bold">TPC-2025-0847</p></div>
                <div><p className="text-emerald-300 uppercase text-[10px]">LGA / Ward</p><p className="font-bold">{lga} / {ward}</p></div>
                <div><p className="text-emerald-300 uppercase text-[10px]">Date Issued</p><p className="font-bold">{joinedDate}</p></div>
                <div><p className="text-emerald-300 uppercase text-[10px]">Polling Unit</p><p className="font-bold">PU-034</p></div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-3">🔄 Click card to flip</p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <p className="flex items-center gap-1 text-xs text-emerald-600 font-medium">✓ Card verified and active</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1">🖨 Print</Button>
                <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700">⬇ Download</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;
