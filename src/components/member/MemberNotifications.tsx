import { useState } from "react";
import { Search, Bell, AlertTriangle, Calendar, MessageSquare, Radio, User, Mail, Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tabs = ["All", "Unread", "Announcements", "Events", "Forum", "Reports", "Account"];

const notifications = [
  { id: 1, icon: AlertTriangle, title: "New Announcement from TPC Leadership", desc: "The Plateau Consensus has released updated guidelines for the upcoming ward-level mobilization exercise.", time: "1h ago", category: "Announcement", urgent: true, unread: true, action: "Read Announcement" },
  { id: 2, icon: Calendar, title: "Event Reminder: Youth Civic Engagement Summit", desc: "The Youth Civic Engagement Summit at Jos North Regional Hall is in 7 days.", time: "3h ago", category: "Event", urgent: false, unread: true, action: "View Event" },
  { id: 3, icon: MessageSquare, title: "Reply to Your Forum Thread", desc: "Ruth Choji replied to your thread \"Voter Education Strategy for Rural Areas\"", time: "11h ago", category: "Forum", urgent: false, unread: true, action: "View Reply" },
  { id: 4, icon: Radio, title: "Situation Report Acknowledged", desc: "Your situation report \"Ballot Box Irregularity — PU 023\" has been reviewed and escalated.", time: "17h ago", category: "Report", urgent: true, unread: true, action: "View Report" },
  { id: 5, icon: AlertTriangle, title: "Training Module Available", desc: "A new training module \"Election Day Protocol & Safety\" is now available.", time: "1d ago", category: "Announcement", urgent: false, unread: false, action: "Start Training" },
  { id: 6, icon: MessageSquare, title: "Community Forum: Thread Pinned", desc: "Your thread \"Best Practices for Polling Unit Observation\" has been pinned by a moderator.", time: "1d ago", category: "Forum", urgent: false, unread: false, action: "View Thread" },
  { id: 7, icon: User, title: "Membership ID Card Generated", desc: "Your TPC Membership ID Card (TPC-2025-0847) has been generated.", time: "1d ago", category: "Account", urgent: false, unread: false, action: "View Profile" },
  { id: 8, icon: Calendar, title: "Event Registration Confirmed", desc: "You have successfully registered for \"Election Monitoring Training\" on March 18, 2026.", time: "2d ago", category: "Event", urgent: false, unread: false, action: "View Event" },
  { id: 9, icon: User, title: "Profile Update Successful", desc: "Your profile information has been updated successfully.", time: "2d ago", category: "Account", urgent: false, unread: false, action: "View Profile" },
  { id: 10, icon: Radio, title: "New Situation Room Alert", desc: "A high-priority incident has been logged in your ward (Ward 5, Jos North).", time: "2d ago", category: "Report", urgent: true, unread: false, action: "View Alert" },
];

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case "Announcement": return "bg-amber-100 text-amber-700";
    case "Event": return "bg-blue-100 text-blue-700";
    case "Forum": return "bg-emerald-100 text-emerald-700";
    case "Report": return "bg-red-100 text-red-700";
    case "Account": return "bg-purple-100 text-purple-700";
    default: return "bg-gray-100 text-gray-700";
  }
};

const getIconColor = (cat: string) => {
  switch (cat) {
    case "Announcement": return "text-amber-600 bg-amber-50";
    case "Event": return "text-blue-600 bg-blue-50";
    case "Forum": return "text-emerald-600 bg-emerald-50";
    case "Report": return "text-red-600 bg-red-50";
    case "Account": return "text-purple-600 bg-purple-50";
    default: return "text-gray-600 bg-gray-50";
  }
};

const MemberNotifications = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [showPreferences, setShowPreferences] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;
  const highPriority = notifications.filter(n => n.urgent).length;

  const filtered = notifications.filter(n => {
    if (activeTab === "Unread" && !n.unread) return false;
    if (!["All", "Unread"].includes(activeTab) && n.category !== activeTab.replace("s", "").replace("Report", "Report")) {
      const tabMap: Record<string, string> = { Announcements: "Announcement", Events: "Event", Forum: "Forum", Reports: "Report", Account: "Account" };
      if (n.category !== tabMap[activeTab]) return false;
    }
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = [
    { icon: Bell, label: "Total", value: notifications.length, color: "text-emerald-600 bg-emerald-50" },
    { icon: Bell, label: "Unread", value: unreadCount, color: "text-blue-600 bg-blue-50" },
    { icon: AlertTriangle, label: "High Priority", value: highPriority, color: "text-red-600 bg-red-50" },
    { icon: Bell, label: "Today", value: 2, color: "text-amber-600 bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500">Stay updated with announcements, events, and activity</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2"><Check className="w-4 h-4" /> Mark All Read</Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowPreferences(!showPreferences)}><Filter className="w-4 h-4" /> Preferences</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center mx-auto mb-2`}><s.icon className="w-5 h-5" /></div>
            <p className="text-2xl font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Preferences */}
      {showPreferences && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Notification Preferences</h3>
            <button onClick={() => setShowPreferences(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {["Announcement", "Event", "Forum", "Report", "Account", "Email Alerts"].map(p => (
              <div key={p} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-700">{p}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeTab === t ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t} {t === "Unread" && unreadCount > 0 && <span className="ml-1 bg-white/30 text-white px-1.5 rounded-full">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
      </div>

      <p className="text-xs text-gray-500">Showing {filtered.length} of {notifications.length} notifications</p>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map(n => (
          <div key={n.id} className={`bg-white rounded-xl border p-5 hover:border-emerald-200 transition-colors ${n.unread ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200"}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full ${getIconColor(n.category)} flex items-center justify-center shrink-0`}>
                <n.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-sm text-gray-900">{n.title}</h4>
                  {n.unread && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                  {n.urgent && <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">⚠ Urgent</span>}
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{n.time}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{n.desc}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getCategoryColor(n.category)}`}>{n.category}</span>
                  <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-0.5 rounded bg-emerald-50">{n.action}</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberNotifications;
