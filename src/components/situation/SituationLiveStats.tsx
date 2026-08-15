import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Activity, Radio, Users, MapPin } from "lucide-react";

interface Stats {
  updates: number;
  posts: number;
  agentsOnline: number;
  reports: number;
}

const SituationLiveStats = () => {
  const [stats, setStats] = useState<Stats>({ updates: 0, posts: 0, agentsOnline: 0, reports: 0 });
  const [pulse, setPulse] = useState(0);

  const load = async () => {
    const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
    const [updates, posts, agents, reports] = await Promise.all([
      supabase.from("situation_updates").select("id", { count: "exact", head: true }),
      supabase.from("situation_posts").select("id", { count: "exact", head: true }),
      supabase.from("agent_locations").select("id", { count: "exact", head: true }).gte("updated_at", since),
      supabase.from("election_reports").select("id", { count: "exact", head: true }),
    ]);
    setStats({
      updates: updates.count ?? 0,
      posts: posts.count ?? 0,
      agentsOnline: agents.count ?? 0,
      reports: reports.count ?? 0,
    });
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("situation-live-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => {
        setPulse((p) => p + 1);
        load();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_posts" }, () => {
        setPulse((p) => p + 1);
        load();
      })
      .subscribe();
    const interval = setInterval(load, 60000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const items = [
    { label: "Situation Updates", value: stats.updates, icon: Radio },
    { label: "Field Posts", value: stats.posts, icon: Activity },
    { label: "Agents Active (24h)", value: stats.agentsOnline, icon: Users },
    { label: "Collated Reports", value: stats.reports, icon: MapPin },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <item.icon className="h-5 w-5 text-primary" />
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <motion.p
            key={`${item.label}-${item.value}-${pulse}`}
            initial={{ scale: 1.15, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="font-heading font-black text-3xl"
          >
            {item.value}
          </motion.p>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default SituationLiveStats;
