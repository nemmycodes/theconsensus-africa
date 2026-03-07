import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, Shield, MapPin, Calendar, FileText, TrendingUp } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    activeLocations: 0,
    totalEvents: 0,
    totalUpdates: 0,
    totalPosts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [profiles, agents, locations, events, updates, posts] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("id", { count: "exact", head: true }).eq("role", "agent"),
        supabase.from("agent_locations").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("situation_updates").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: profiles.count ?? 0,
        totalAgents: agents.count ?? 0,
        activeLocations: locations.count ?? 0,
        totalEvents: events.count ?? 0,
        totalUpdates: updates.count ?? 0,
        totalPosts: posts.count ?? 0,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400" },
    { label: "Registered Agents", value: stats.totalAgents, icon: Shield, color: "text-primary" },
    { label: "Active Locations", value: stats.activeLocations, icon: MapPin, color: "text-orange-400" },
    { label: "Events", value: stats.totalEvents, icon: Calendar, color: "text-purple-400" },
    { label: "Situation Updates", value: stats.totalUpdates, icon: FileText, color: "text-yellow-400" },
    { label: "Blog Posts", value: stats.totalPosts, icon: TrendingUp, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor the Consensus Movement at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-black">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
