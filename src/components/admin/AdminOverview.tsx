import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Users, Shield, FileText, TrendingUp, AlertTriangle, Calendar, ArrowUp } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0, totalAgents: 0, totalReports: 0, totalPosts: 0, totalEvents: 0,
  });
  const [recentUsers, setRecentUsers] = useState<{ full_name: string | null; email: string | null; created_at: string }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, agents, updates, posts, events, recentProfiles] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "agent"),
        supabase.from("situation_updates").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({
        totalUsers: profiles.count ?? 0,
        totalAgents: agents.count ?? 0,
        totalReports: updates.count ?? 0,
        totalPosts: posts.count ?? 0,
        totalEvents: events.count ?? 0,
      });
      setRecentUsers(recentProfiles.data ?? []);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "TOTAL USERS", value: stats.totalUsers.toLocaleString(), icon: Users, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "ACTIVE AGENTS", value: stats.totalAgents.toString(), icon: Shield, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
    { label: "SITUATION REPORTS", value: stats.totalReports.toLocaleString(), icon: AlertTriangle, iconBg: "bg-red-50", iconColor: "text-red-500" },
    { label: "BLOG POSTS", value: stats.totalPosts.toLocaleString(), icon: FileText, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
    { label: "EVENTS", value: stats.totalEvents.toLocaleString(), icon: Calendar, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
  ];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Real-time monitoring of civic engagement across all regions"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              <card.icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Users */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Recent Signups</h3>
        {recentUsers.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">No recent signups yet</p>
        ) : (
          <div className="space-y-0">
            {recentUsers.map((user, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.full_name || "Unnamed"}</p>
                  <p className="text-xs text-gray-500">{user.email || "No email"}</p>
                </div>
                <span className="text-xs text-gray-400">{formatDate(user.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOverview;
