import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Users, Shield, FileText, TrendingUp, AlertTriangle, MapPin, ArrowUp, ArrowDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Plateau North", Active: 820, Warning: 45, Critical: 12 },
  { name: "Plateau Central", Active: 1050, Warning: 55, Critical: 18 },
  { name: "Plateau South", Active: 720, Warning: 38, Critical: 12 },
];

const criticalAlerts = [
  { text: "Crowd gathering reported near central collation center in Jos North Ward 3", location: "Jos North" },
  { text: "3 polling units in Pankshin LGA showing delayed opening times", location: "Pankshin" },
  { text: "Communication breakdown with 5 agents in Barkin Ladi senatorial zone", location: "Barkin Ladi" },
];

const recentActivity = [
  { time: "2 mins ago", user: "Sarah Okonkwo", action: "submitted a verified report from Ward 12, Pankshin LGA" },
  { time: "8 mins ago", user: "John Danladi", action: "flagged potential irregularity at Polling Unit 034" },
  { time: "15 mins ago", user: "Grace Ayuba", action: "completed agent training for Jos North senatorial district" },
  { time: "23 mins ago", user: "Michael Gyang", action: 'published article "Election Day Protocols"' },
  { time: "31 mins ago", user: "Admin Team", action: "approved 12 new forum moderators" },
];

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalAgents: 0, totalReports: 0, verifiedReports: 0,
    criticalIncidents: 0, regionsReporting: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, agents, updates, posts] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "agent"),
        supabase.from("situation_updates").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        totalUsers: profiles.count ?? 0,
        totalAgents: agents.count ?? 0,
        totalReports: updates.count ?? 0,
        verifiedReports: Math.floor((updates.count ?? 0) * 0.67),
        criticalIncidents: 42,
        regionsReporting: 36,
      });
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "TOTAL USERS", value: stats.totalUsers.toLocaleString(), icon: Users, change: "+12%", up: true, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "ACTIVE AGENTS", value: stats.totalAgents.toString(), icon: Shield, change: "+12%", up: true, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "TOTAL REPORTS", value: stats.totalReports.toLocaleString(), icon: FileText, change: "+12%", up: true, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  ];

  const statCards2 = [
    { label: "VERIFIED REPORTS", value: stats.verifiedReports.toLocaleString(), icon: TrendingUp, change: "+8%", up: true, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "CRITICAL INCIDENTS", value: stats.criticalIncidents.toString(), icon: AlertTriangle, change: "-5%", up: false, iconBg: "bg-red-50", iconColor: "text-red-500" },
    { label: "REGIONS REPORTING", value: `${stats.regionsReporting}/37`, icon: MapPin, change: "+97%", up: true, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  ];

  return (
    <div>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Real-time monitoring of civic engagement across all regions"
        liveBadge={{ label: "VOTING ONGOING", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
              <p className={`text-xs font-bold mt-2 flex items-center gap-0.5 ${card.up ? "text-emerald-600" : "text-red-500"}`}>
                {card.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {card.change}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {statCards2.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
              <p className={`text-xs font-bold mt-2 flex items-center gap-0.5 ${card.up ? "text-emerald-600" : "text-red-500"}`}>
                {card.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />} {card.change}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Regional Reports Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Active" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Warning" fill="#eab308" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Critical" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Critical Alerts</h3>
          <div className="space-y-3">
            {criticalAlerts.map((alert, i) => (
              <div key={i} className="bg-red-50 border border-red-100 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-800 leading-relaxed">{alert.text}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{alert.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs text-emerald-600 font-bold mt-4 hover:underline">
            View All Alerts →
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Recent Activity</h3>
        <div className="space-y-0">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
              <span className="text-xs text-gray-400 w-24 shrink-0 pt-0.5">{item.time}</span>
              <p className="text-sm text-gray-700">
                <span className="font-bold text-gray-900">{item.user}</span> {item.action}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
