import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import {
  FileText, CheckCircle2, Clock, AlertTriangle, Users, MapPin,
  TrendingUp, Activity, Upload, Shield,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Stat = ({
  label, value, delta, icon: Icon, tone = "primary",
}: {
  label: string; value: string; delta?: string; icon: typeof FileText;
  tone?: "primary" | "warning" | "danger";
}) => {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-orange-100 text-orange-600",
    danger: "bg-destructive/10 text-destructive",
  }[tone];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneCls}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-black">{value}</span>
        {delta && (
          <span className="text-xs font-semibold text-primary flex items-center gap-0.5 mb-1">
            <TrendingUp className="h-3 w-3" /> {delta}
          </span>
        )}
      </div>
    </Card>
  );
};

interface ActivityItem {
  id: string;
  text: string;
  status: "Verified" | "Critical" | "Pending";
  when: string;
  icon: typeof Activity;
}

const SROverview = () => {
  const [stats, setStats] = useState({
    total: 0, verified: 0, pending: 0, critical: 0, agents: 0, regions: "0/17",
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [coverage, setCoverage] = useState({ pu: 0, ward: 0, lga: 0 });

  useEffect(() => {
    const load = async () => {
      const [reportsAll, reportsVerified, reportsPending, reportsCritical, agents, lgas] =
        await Promise.all([
          supabase.from("election_reports").select("id", { count: "exact", head: true }),
          supabase.from("election_reports").select("id", { count: "exact", head: true }).eq("status", "verified"),
          supabase.from("election_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("election_reports").select("id", { count: "exact", head: true }).eq("status", "flagged"),
          supabase.from("agent_locations").select("agent_id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("election_reports").select("lga"),
        ]);

      setStats({
        total: reportsAll.count || 0,
        verified: reportsVerified.count || 0,
        pending: reportsPending.count || 0,
        critical: reportsCritical.count || 0,
        agents: agents.count || 0,
        regions: `${new Set((lgas.data || []).map((r: { lga: string }) => r.lga)).size}/17`,
      });

      // Recent activity from situation_posts
      const { data: postRows } = await supabase
        .from("situation_posts")
        .select("id, content, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      setActivity(
        (postRows || []).map((p) => ({
          id: p.id,
          text: p.content.slice(0, 110),
          status: "Verified",
          when: formatDistanceToNow(new Date(p.created_at), { addSuffix: true }),
          icon: Activity,
        }))
      );

      // Coverage from primaries
      const [{ count: puCount }, { count: wardCount }, { count: lgaCount }] = await Promise.all([
        supabase.from("primaries_collation").select("id", { count: "exact", head: true }),
        supabase.from("primaries_collation").select("id", { count: "exact", head: true }).not("ward", "is", null),
        supabase.from("primaries_collation").select("id", { count: "exact", head: true }).not("lga", "is", null),
      ]);
      setCoverage({ pu: puCount || 0, ward: wardCount || 0, lga: lgaCount || 0 });
    };
    load().catch(() => {});
  }, []);

  const dots = [
    { x: 35, y: 45, tone: "danger" },
    { x: 22, y: 55, tone: "warning" },
    { x: 50, y: 50, tone: "primary" },
    { x: 65, y: 42, tone: "primary" },
    { x: 82, y: 35, tone: "primary" },
    { x: 78, y: 60, tone: "warning" },
    { x: 88, y: 65, tone: "primary" },
    { x: 55, y: 75, tone: "primary" },
    { x: 42, y: 80, tone: "primary" },
  ];
  const dotColor = (t: string) =>
    t === "danger" ? "bg-destructive" : t === "warning" ? "bg-orange-500" : "bg-primary";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black uppercase">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time monitoring of civic engagement across all regions.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Stat label="Total Reports" value={stats.total.toLocaleString()} delta="+12%" icon={FileText} />
        <Stat label="Verified Reports" value={stats.verified.toLocaleString()} delta="+8%" icon={CheckCircle2} />
        <Stat label="Pending Reports" value={stats.pending.toLocaleString()} delta="+3%" icon={Clock} tone="warning" />
        <Stat label="Critical Incidents" value={stats.critical.toLocaleString()} delta="+5%" icon={AlertTriangle} tone="danger" />
        <Stat label="Active Agents" value={stats.agents.toLocaleString()} delta="+2%" icon={Users} />
        <Stat label="Regions Reporting" value={stats.regions} delta="97%" icon={MapPin} />
      </div>

      {/* Map */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Live Operations Map
          </h3>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Active</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Warning</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Critical</span>
          </div>
        </div>
        <div
          className="relative rounded-lg h-72 border border-border overflow-hidden"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundColor: "hsl(150, 20%, 96%)",
          }}
        >
          {dots.map((d, i) => (
            <span
              key={i}
              className={`absolute h-3 w-3 rounded-full ${dotColor(d.tone)} ring-4 ring-white shadow`}
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            />
          ))}
          <div className="absolute bottom-3 left-3 bg-white/90 px-3 py-2 rounded-lg shadow-sm">
            <p className="text-[10px] tracking-widest font-semibold text-primary">PLATEAU STATE OPERATIONS</p>
            <p className="text-sm"><span className="font-bold text-primary">94%</span> coverage active</p>
          </div>
        </div>
      </Card>

      {/* Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Recent Field Activity</h3>
          <button className="text-xs text-primary font-semibold">View All</button>
        </div>
        <div className="divide-y divide-border">
          {activity.length === 0 && (
            <p className="text-sm text-muted-foreground py-6 text-center">No activity yet.</p>
          )}
          {activity.map((a, i) => {
            const tones = [
              { bg: "bg-primary/10", color: "text-primary", Icon: Users, status: "Verified", statusCls: "bg-primary/10 text-primary" },
              { bg: "bg-orange-100", color: "text-orange-600", Icon: AlertTriangle, status: "Critical", statusCls: "bg-destructive/10 text-destructive" },
              { bg: "bg-blue-100", color: "text-blue-600", Icon: Upload, status: "Pending", statusCls: "bg-orange-100 text-orange-600" },
              { bg: "bg-purple-100", color: "text-purple-600", Icon: Activity, status: "Verified", statusCls: "bg-primary/10 text-primary" },
              { bg: "bg-red-100", color: "text-red-600", Icon: Shield, status: "Critical", statusCls: "bg-destructive/10 text-destructive" },
            ];
            const t = tones[i % tones.length];
            return (
              <div key={a.id} className="py-3 flex items-start gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${t.bg} ${t.color}`}>
                  <t.Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{a.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{a.when}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.statusCls}`}>
                      {t.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card className="p-5">
          <h4 className="text-sm font-bold mb-4">Collation Progress</h4>
          {[
            { label: "Polling Units", val: coverage.pu, total: 3450 },
            { label: "Ward Level", val: coverage.ward, total: 348 },
            { label: "LGA Level", val: coverage.lga, total: 17 },
          ].map((b) => (
            <div key={b.label} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{b.label}</span>
                <span className="font-semibold">{b.val} / {b.total}</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min(100, (b.val / b.total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h4 className="text-sm font-bold mb-4">Agent Distribution</h4>
          {[
            { zone: "Plateau Central", active: 128, total: 142 },
            { zone: "Plateau North", active: 87, total: 98 },
            { zone: "Plateau South", active: 134, total: 144 },
          ].map((z) => (
            <div key={z.zone} className="flex justify-between py-2 text-sm">
              <span>{z.zone}</span>
              <span><span className="text-primary font-semibold">{z.active} active</span> <span className="text-muted-foreground">/ {z.total}</span></span>
            </div>
          ))}
        </Card>
        <Card className="p-5">
          <h4 className="text-sm font-bold mb-4">System Health</h4>
          {[
            { k: "Server Uptime", v: "99.97%" },
            { k: "Data Sync", v: "Real-time" },
            { k: "API Response", v: "124ms" },
            { k: "Active Sessions", v: String(stats.agents) },
          ].map((s) => (
            <div key={s.k} className="flex justify-between py-2 text-sm">
              <span className="text-muted-foreground">{s.k}</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> {s.v}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

export default SROverview;
