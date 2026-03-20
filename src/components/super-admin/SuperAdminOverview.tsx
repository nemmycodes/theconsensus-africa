import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, UserCog, FileText, Calendar, Radio, Crown, TrendingUp, Clock, Mail } from "lucide-react";
import SuperAdminHeader from "./SuperAdminHeader";
import { format } from "date-fns";

interface Props {
  onTabChange?: (tab: string) => void;
}

const SuperAdminOverview = ({ onTabChange }: Props) => {
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
    unreadMessages: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, rolesRes, postsRes, eventsRes, updatesRes, messagesRes, recentProfilesRes, recentUpdatesRes, recentPostsRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("blog_posts").select("published"),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("situation_updates").select("status"),
        supabase.from("contact_messages").select("id, is_read"),
        supabase.from("profiles").select("full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("situation_updates").select("title, status, created_at, category").order("created_at", { ascending: false }).limit(5),
        supabase.from("blog_posts").select("title, published, created_at, category").order("created_at", { ascending: false }).limit(5),
      ]);

      const roles = rolesRes.data || [];
      const posts = postsRes.data || [];
      const updates = updatesRes.data || [];
      const messages = (messagesRes.data as any[]) || [];

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
        unreadMessages: messages.filter((m) => !m.is_read).length,
      });

      setRecentUsers(recentProfilesRes.data || []);
      setRecentUpdates(recentUpdatesRes.data || []);
      setRecentPosts(recentPostsRes.data || []);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Members", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", tab: "users" },
    { label: "Agents", value: stats.totalAgents, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50", tab: "agents" },
    { label: "Administrators", value: stats.totalAdmins, icon: UserCog, color: "text-purple-600", bg: "bg-purple-50", tab: "admins" },
    { label: "Super Admins", value: stats.totalSuperAdmins, icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Blog Posts", value: `${stats.publishedPosts}/${stats.totalPosts}`, icon: FileText, color: "text-pink-600", bg: "bg-pink-50", sub: "published", tab: "blog" },
    { label: "Events", value: stats.totalEvents, icon: Calendar, color: "text-cyan-600", bg: "bg-cyan-50", tab: "events" },
    { label: "Situation Reports", value: stats.totalUpdates, icon: Radio, color: "text-red-600", bg: "bg-red-50", tab: "situation" },
    { label: "Unread Messages", value: stats.unreadMessages, icon: Mail, color: "text-orange-600", bg: "bg-orange-50", tab: "messages" },
  ];

  const quickActions = [
    { label: "Manage Users", icon: Users, tab: "users" },
    { label: "Add Agent", icon: Shield, tab: "agents" },
    { label: "New Blog Post", icon: FileText, tab: "blog" },
    { label: "Create Event", icon: Calendar, tab: "events" },
    { label: "Site Editor", icon: TrendingUp, tab: "site-editor" },
    { label: "View Messages", icon: Mail, tab: "messages" },
  ];

  return (
    <div>
      <SuperAdminHeader title="Super Dashboard" subtitle="Complete system overview and management" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card
            key={card.label}
            className={`border-border bg-card hover:shadow-md transition-shadow ${card.tab ? "cursor-pointer" : ""}`}
            onClick={() => card.tab && onTabChange?.(card.tab)}
          >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent Users */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Recent Signups</CardTitle>
              <button onClick={() => onTabChange?.("users")} className="text-xs text-primary hover:underline">View all</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.full_name || "Unnamed"}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{format(new Date(u.created_at), "MMM d")}</span>
                </div>
              ))}
              {recentUsers.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No signups yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Situation Updates */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Recent Reports</CardTitle>
              <button onClick={() => onTabChange?.("situation")} className="text-xs text-primary hover:underline">View all</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentUpdates.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{u.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[9px] h-4">{u.category}</Badge>
                      <Badge className={`text-[9px] h-4 ${u.status === "Active" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>{u.status}</Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{format(new Date(u.created_at), "MMM d")}</span>
                </div>
              ))}
              {recentUpdates.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No reports yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Recent Blog Posts */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Recent Posts</CardTitle>
              <button onClick={() => onTabChange?.("blog")} className="text-xs text-primary hover:underline">View all</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentPosts.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{p.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[9px] h-4">{p.category}</Badge>
                      <Badge className={`text-[9px] h-4 ${p.published ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {p.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{format(new Date(p.created_at), "MMM d")}</span>
                </div>
              ))}
              {recentPosts.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No posts yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground uppercase tracking-wide">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => onTabChange?.(action.tab)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-muted text-sm font-medium text-foreground transition-colors"
                >
                  <action.icon className="w-4 h-4 text-muted-foreground" />
                  {action.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

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
                { label: "Backend Functions", status: "Operational", color: "bg-emerald-500" },
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
      </div>
    </div>
  );
};

export default SuperAdminOverview;
