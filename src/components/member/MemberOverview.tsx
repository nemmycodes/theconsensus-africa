import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Calendar, MessageSquare, TrendingUp, MapPin, Upload, ClipboardList, UserCog, Download, AlertTriangle, Shield, Bell as BellIcon, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const MemberOverview = ({ onTabChange }: { onTabChange: (tab: string) => void }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [situationStats, setSituationStats] = useState({ total: 0, verified: 0, pending: 0, critical: 0 });

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";
  const memberEmail = user?.email || "";
  const lga = user?.user_metadata?.lga || profile?.lga || "—";
  const ward = user?.user_metadata?.ward || profile?.ward || "—";
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => { if (data) setProfile(data); });
    supabase.from("events").select("*").order("event_date", { ascending: true }).limit(3).then(({ data }) => { if (data) setEvents(data); });
    supabase.from("situation_updates").select("id, status").then(({ data }) => {
      if (data) {
        setSituationStats({
          total: data.length,
          verified: data.filter(d => d.status === "Verified").length,
          pending: data.filter(d => d.status === "Active").length,
          critical: data.filter(d => d.status === "Critical" || d.status === "Escalated").length,
        });
      }
    });
  }, [user]);

  const statCards = [
    { icon: FileText, label: "Reports Submitted", value: "0", trend: "+0%", color: "bg-amber-50 text-amber-600" },
    { icon: Calendar, label: "Events Registered", value: String(events.length), trend: "+3", color: "bg-emerald-50 text-emerald-600" },
    { icon: MessageSquare, label: "Forum Contributions", value: "0", trend: "+0", color: "bg-blue-50 text-blue-600" },
  ];

  const situationCards = [
    { label: "Total Reports", value: situationStats.total, trend: "+15.3%", color: "text-gray-900" },
    { label: "Verified Reports", value: situationStats.verified, trend: "+8.7%", color: "text-emerald-600" },
    { label: "Pending Reports", value: situationStats.pending, trend: "-3.2%", color: "text-amber-600" },
    { label: "Critical Incidents", value: situationStats.critical, trend: "+12.1%", color: "text-red-600" },
  ];

  const quickActions = [
    { icon: FileText, label: "Submit Report", action: () => onTabChange("report") },
    { icon: Upload, label: "Upload Form", action: () => onTabChange("report") },
    { icon: Calendar, label: "Register Event", action: () => onTabChange("events") },
    { icon: ClipboardList, label: "Create Post", action: () => onTabChange("forum") },
    { icon: UserCog, label: "Update Profile", action: () => onTabChange("profile") },
    { icon: Download, label: "Get Certificate", action: () => onTabChange("profile") },
  ];

  const alerts = [
    { icon: Shield, title: "Security Alert", desc: "Suspicious activity reported near polling unit PU-045", time: "10 minutes ago", color: "border-l-red-500 bg-red-50" },
    { icon: AlertTriangle, title: "Incident Warning", desc: "Low voter turnout detected in Ward 7, Riyom", time: "25 minutes ago", color: "border-l-amber-500 bg-amber-50" },
    { icon: BellIcon, title: "Announcement", desc: "You have been mentioned in forum thread: \"Community Best Practices\"", time: "1 hour ago", color: "border-l-emerald-500 bg-emerald-50" },
    { icon: Info, title: "Event Update", desc: "Youth Civic Engagement Summit location changed", time: "2 hours ago", color: "border-l-blue-500 bg-blue-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={displayName} className="w-16 h-16 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {displayName[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-black text-gray-900">{displayName}</h2>
            <p className="text-sm text-gray-500">✉ {memberEmail}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              ○ Member
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div><span className="text-gray-400">📍</span> Plateau State<br /><span className="text-xs text-gray-400">{lga} LGA / {ward}</span></div>
            <div><span className="text-gray-400">🆔</span> TPC-2025<br /><span className="text-xs text-gray-400">Joined: {joinedDate}</span></div>
          </div>
          <Button variant="outline" size="sm" className="text-amber-600 border-amber-300 hover:bg-amber-50" onClick={() => onTabChange("profile")}>
            Complete Profile
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.trend}
              </p>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Situation Room Overview */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-3">Situation Room Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {situationCards.map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              <p className="text-[10px] text-emerald-600 mt-1">📈 {s.trend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Recent Field Activity</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p className="text-gray-400 italic">No recent field activity yet. Submit your first report!</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4">Alerts & Notifications</h3>
          <div className="space-y-3">
            {alerts.map((a, i) => (
              <div key={i} className={`border-l-4 ${a.color} rounded-r-lg p-3`}>
                <p className="font-bold text-sm text-gray-900">{a.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{a.desc}</p>
                <p className="text-[10px] text-gray-400 mt-1">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-3">Upcoming Events</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {events.length > 0 ? events.map((ev) => (
            <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <Calendar className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="font-bold text-sm text-gray-900">{ev.title}</h4>
              <p className="text-xs text-gray-500 mt-1">📅 {new Date(ev.event_date).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">📍 {ev.location || "TBD"}</p>
              <Button size="sm" className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold">RSVP</Button>
            </div>
          )) : (
            <p className="text-sm text-gray-400 col-span-3">No upcoming events.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-black text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickActions.map((qa) => (
            <button key={qa.label} onClick={qa.action} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col items-center gap-2 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <qa.icon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-[11px] font-medium text-gray-700 text-center">{qa.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberOverview;
