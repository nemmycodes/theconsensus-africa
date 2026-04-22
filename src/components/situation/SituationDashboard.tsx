import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText, CheckCircle, Clock, AlertTriangle, Users, MapPin,
  Activity, Eye, Upload, Shield, TrendingUp,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface SituationUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  author_id: string;
}

interface VerifiedReport {
  id: string;
  state: string;
  lga: string;
  ward: string;
  polling_unit: string;
  party: string | null;
  candidate_name: string | null;
  votes_recorded: number;
  election_type: string;
  election_date: string;
}

const markerColors: Record<string, string> = {
  active: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

const SituationDashboard = () => {
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [verifiedReports, setVerifiedReports] = useState<VerifiedReport[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    supabase.from("situation_updates").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUpdates(data);
    });
    supabase.from("election_reports")
      .select("id, state, lga, ward, polling_unit, party, candidate_name, votes_recorded, election_type, election_date")
      .eq("status", "verified")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setVerifiedReports(data as VerifiedReport[]); });

    const channel = supabase.channel("situation-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => {
        supabase.from("situation_updates").select("*").order("created_at", { ascending: false }).then(({ data }) => {
          if (data) setUpdates(data);
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "election_reports" }, () => {
        supabase.from("election_reports")
          .select("id, state, lga, ward, polling_unit, party, candidate_name, votes_recorded, election_type, election_date")
          .eq("status", "verified")
          .order("created_at", { ascending: false })
          .then(({ data }) => { if (data) setVerifiedReports(data as VerifiedReport[]); });
      }).subscribe();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { supabase.removeChannel(channel); clearInterval(timer); };
  }, []);

  const stateOverview = useMemo(() => {
    const map: Record<string, { votes: number; reports: number; lgas: Set<string>; wards: Set<string> }> = {};
    verifiedReports.forEach((r) => {
      if (!map[r.state]) map[r.state] = { votes: 0, reports: 0, lgas: new Set(), wards: new Set() };
      map[r.state].votes += r.votes_recorded || 0;
      map[r.state].reports += 1;
      map[r.state].lgas.add(r.lga);
      map[r.state].wards.add(r.ward);
    });
    return map;
  }, [verifiedReports]);

  const totalVerifiedVotes = verifiedReports.reduce((s, r) => s + (r.votes_recorded || 0), 0);

  const stats = useMemo(() => {
    const total = verifiedReports.length + updates.length;
    const verified = verifiedReports.length;
    const pending = updates.filter(u => u.status === "Monitoring" || u.status === "Info").length;
    const critical = updates.filter(u => u.status === "Active").length;
    return [
      { label: "TOTAL REPORTS", value: total.toLocaleString(), trend: "live", icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: "VERIFIED REPORTS", value: verified.toLocaleString(), trend: "live", icon: CheckCircle, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: "PENDING REPORTS", value: pending.toLocaleString(), trend: "+3%", icon: Clock, iconBg: "bg-accent/10", iconColor: "text-accent" },
      { label: "CRITICAL INCIDENTS", value: critical.toLocaleString(), trend: "+5%", icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
      { label: "TOTAL VERIFIED VOTES", value: totalVerifiedVotes.toLocaleString(), trend: "live", icon: TrendingUp, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: "STATES REPORTING", value: `${Object.keys(stateOverview).length}`, trend: "live", icon: MapPin, iconBg: "bg-primary/10", iconColor: "text-primary" },
    ];
  }, [updates, verifiedReports, totalVerifiedVotes, stateOverview]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-heading font-black uppercase tracking-tight">Situation Room</h1>
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> VOTING ONGOING
          </span>
        </div>
        <span className="text-sm text-muted-foreground font-mono">
          {format(currentTime, "HH:mm:ss")} UTC
        </span>
      </div>

      {/* Live Alert Marquee */}
      <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-2 overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-destructive text-xs font-bold shrink-0">
            <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" /> LIVE ALERT
          </span>
          <div className="overflow-hidden whitespace-nowrap">
            <motion.p
              animate={{ x: ["100%", "-100%"] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="text-xs text-destructive/80 inline-block"
            >
              Critical update from Jos North Ward 3: Crowd gathering reported near central collation center. Security personnel dispatched. // New verified member report from Plateau South region.
            </motion.p>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Dashboard Title */}
        <div>
          <h2 className="text-3xl md:text-4xl font-heading font-black uppercase tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time monitoring of civic engagement across all regions
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider leading-tight">{s.label}</p>
                <div className={`w-8 h-8 rounded-lg ${s.iconBg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-4 h-4 ${s.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-xs text-primary mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {s.trend}
              </p>
            </div>
          ))}
        </div>

        {/* State-Level Overview (verified election reports only) */}
        {Object.keys(stateOverview).length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-heading font-bold text-lg">State-Level Overview</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded">Verified Only</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(stateOverview).map(([state, agg]) => (
                <div key={state} className="bg-secondary/50 border border-border rounded-lg p-4">
                  <p className="text-xs font-bold text-primary uppercase">{state}</p>
                  <p className="text-2xl font-black mt-1">
                    {agg.votes.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">votes</span>
                  </p>
                  <div className="flex gap-3 text-[11px] text-muted-foreground mt-1">
                    <span>{agg.reports} reports</span>
                    <span>{agg.lgas.size} LGAs</span>
                    <span>{agg.wards.size} wards</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Operations Map */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-bold text-lg">Live Operations Map</h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Active</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Warning</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
            </div>
          </div>
          <div className="h-[400px] bg-secondary/50 relative overflow-hidden">
            {/* Custom SVG Map */}
            <svg viewBox="0 0 500 400" className="w-full h-full">
              {/* Grid lines */}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 40} x2="500" y2={i * 40} stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              ))}
              {Array.from({ length: 13 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="400" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
              ))}
              {/* Map markers from real verified reports (one per LGA) */}
              {Array.from(new Set(verifiedReports.map(r => r.lga))).slice(0, 30).map((lga, i) => {
                // Pseudo-random but stable position based on LGA name
                const hash = lga.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
                const x = 60 + ((hash * 37) % 380);
                const y = 60 + ((hash * 53) % 280);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="12" fill={markerColors.active} opacity="0.15">
                      <animate attributeName="r" values="12;18;12" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle cx={x} cy={y} r="6" fill={markerColors.active} opacity="0.8" />
                    <title>{lga} — verified</title>
                  </g>
                );
              })}
              {verifiedReports.length === 0 && (
                <text x="250" y="200" textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
                  Awaiting verified field reports
                </text>
              )}
            </svg>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Plateau State Operations</p>
            <p className="text-sm">
              <span className="text-primary font-bold">{verifiedReports.length}</span> verified reports across{" "}
              <span className="text-primary font-bold">{Object.keys(stateOverview).length}</span> states
            </p>
          </div>
        </div>

        {/* Recent Field Activity */}
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <h3 className="font-heading font-bold text-lg">Recent Field Activity</h3>
            <button className="text-xs text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border">
            {updates.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                No field activity yet. Updates will appear here once agents submit reports.
              </div>
            ) : updates.slice(0, 8).map((u, i) => {
              const badge = u.status === "Active" ? "Critical" : u.status === "Resolved" ? "Verified" : "Pending";
              const badgeColor =
                badge === "Critical" ? "bg-destructive/20 text-destructive" :
                badge === "Pending" ? "bg-accent/20 text-accent" :
                "bg-primary/20 text-primary";
              const Icon = badge === "Critical" ? AlertTriangle : badge === "Pending" ? Clock : CheckCircle;
              return (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-5 py-4 flex items-center gap-4"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    badge === "Critical" ? "bg-destructive/10" :
                    badge === "Pending" ? "bg-accent/10" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      badge === "Critical" ? "text-destructive" :
                      badge === "Pending" ? "text-accent" : "text-primary"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{u.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Collation Progress */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Collation Progress</h4>
              <Eye className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[
                { label: "Polling Units", current: 2890, total: 3450 },
                { label: "Ward Level", current: 234, total: 348 },
                { label: "LGA Level", current: 7, total: 17 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-bold text-primary">{item.current.toLocaleString()} / {item.total.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(item.current / item.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Agent Distribution</h4>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-4">
              {[
                { zone: "Central Zone", active: 128, total: 142 },
                { zone: "Northern Zone", active: 87, total: 98 },
                { zone: "Southern Zone", active: 134, total: 144 },
              ].map((item) => (
                <div key={item.zone} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.zone}</span>
                  <div className="text-sm">
                    <span className="font-bold text-primary">{item.active} active</span>
                    <span className="text-muted-foreground ml-1">/ {item.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System Health</h4>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="space-y-3">
              {[
                { label: "Server Uptime", value: "99.97%", color: "text-primary" },
                { label: "Data Sync", value: "Real-time", color: "text-destructive" },
                { label: "API Response", value: "124ms", color: "text-primary" },
                { label: "Active Sessions", value: "47", color: "text-primary" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${item.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.color === "text-destructive" ? "bg-destructive" : "bg-primary"}`} />
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SituationDashboard;
