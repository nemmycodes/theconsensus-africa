import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, UserCog, FileText, Calendar, Radio, Crown, TrendingUp } from "lucide-react";
import SuperAdminHeader from "./SuperAdminHeader";

const SuperAdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalAdmins: 0,
    totalSuperAdmins: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalEvents: 0,
    totalUpdates: 0,
    activeUpdates: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, rolesRes, postsRes, eventsRes, updatesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("blog_posts").select("published"),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("situation_updates").select("status"),
      ]);

      const roles = rolesRes.data || [];
      const posts = postsRes.data || [];
      const updates = updatesRes.data || [];

      setStats({
        totalUsers: profilesRes.count || 0,
        totalAgents: roles.filter((r) => r.role === "agent").length,
        totalAdmins: roles.filter((r) => r.role === "admin").length,
        totalSuperAdmins: roles.filter((r) => r.role === "super_admin").length,
        totalPosts: posts.length,
        publishedPosts: posts.filter((p) => p.published).length,
        totalEvents: eventsRes.count || 0,
        totalUpdates: updates.length,
        activeUpdates: updates.filter((u) => u.status === "Active").length,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Members", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Agents", value: stats.totalAgents, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Administrators", value: stats.totalAdmins, icon: UserCog, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Super Admins", value: stats.totalSuperAdmins, icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Blog Posts", value: `${stats.publishedPosts}/${stats.totalPosts}`, icon: FileText, color: "text-pink-600", bg: "bg-pink-50", sub: "published" },
    { label: "Events", value: stats.totalEvents, icon: Calendar, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "Situation Updates", value: stats.totalUpdates, icon: Radio, color: "text-red-600", bg: "bg-red-50" },
    { label: "Active Reports", value: stats.activeUpdates, icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div>
      <SuperAdminHeader title="Super Dashboard" subtitle="Complete system overview and management" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.label} className="border-border bg-card hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-black text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground font-medium mt-1">{card.label}</p>
              {card.sub && <p className="text-[10px] text-muted-foreground">{card.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Database", status: "Operational", color: "bg-emerald-500" },
                { label: "Authentication", status: "Operational", color: "bg-emerald-500" },
                { label: "Storage", status: "Operational", color: "bg-emerald-500" },
                { label: "Edge Functions", status: "Operational", color: "bg-emerald-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-xs font-medium text-foreground">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Create User", icon: Users },
                { label: "Add Agent", icon: Shield },
                { label: "New Post", icon: FileText },
                { label: "New Event", icon: Calendar },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  {action.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminOverview;
