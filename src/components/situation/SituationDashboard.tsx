import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
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

// Simulated map markers across Plateau State
const mapMarkers = [
  { lat: 9.9, lng: 8.89, status: "active", label: "Jos South" },
  { lat: 9.95, lng: 8.85, status: "critical", label: "Jos North" },
  { lat: 9.7, lng: 8.5, status: "warning", label: "Barkin Ladi" },
  { lat: 9.6, lng: 9.1, status: "active", label: "Pankshin" },
  { lat: 9.4, lng: 8.7, status: "active", label: "Shendam" },
  { lat: 9.85, lng: 8.95, status: "active", label: "Bassa" },
  { lat: 9.75, lng: 9.2, status: "warning", label: "Kanke" },
  { lat: 9.5, lng: 8.9, status: "active", label: "Langtang North" },
  { lat: 9.3, lng: 9.0, status: "active", label: "Wase" },
  { lat: 9.65, lng: 8.6, status: "active", label: "Riyom" },
  { lat: 9.55, lng: 9.15, status: "active", label: "Mikang" },
  { lat: 9.45, lng: 8.55, status: "active", label: "Qua'an Pan" },
];

const markerColors: Record<string, string> = {
  active: "#22c55e",
  warning: "#f59e0b",
  critical: "#ef4444",
};

const activityItems = [
  { icon: Users, text: "Agent Michael verified 15 new polling unit results.", time: "2 mins ago", badge: "Verified", badgeColor: "bg-emerald-500/20 text-emerald-400" },
  { icon: AlertTriangle, text: "Incident report flagged: Logistics delay reported at Collection Center B.", time: "14 mins ago", badge: "Critical", badgeColor: "bg-red-500/20 text-red-400" },
  { icon: Upload, text: "Sarah J. uploaded Form EC8A for collation verification.", time: "23 mins ago", badge: "Pending", badgeColor: "bg-amber-500/20 text-amber-400" },
  { icon: TrendingUp, text: "Voter turnout stats updated. 78% turnout recorded.", time: "45 mins ago", badge: "Verified", badgeColor: "bg-emerald-500/20 text-emerald-400" },
  { icon: Shield, text: "Security alert: Unauthorized personnel detected near collation center.", time: "1 hour ago", badge: "Critical", badgeColor: "bg-red-500/20 text-red-400" },
];

const SituationDashboard = () => {
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    supabase.from("situation_updates").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUpdates(data);
    });

    const channel = supabase.channel("situation-dashboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => {
        supabase.from("situation_updates").select("*").order("created_at", { ascending: false }).then(({ data }) => {
          if (data) setUpdates(data);
        });
      }).subscribe();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timer);
    };
  }, []);

  const stats = useMemo(() => {
    const total = updates.length;
    const verified = updates.filter(u => u.status === "Resolved").length;
    const pending = updates.filter(u => u.status === "Monitoring" || u.status === "Info").length;
    const critical = updates.filter(u => u.status === "Active").length;
    return [
      { label: "TOTAL REPORTS", value: total.toLocaleString(), trend: "+12%", icon: FileText, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: "VERIFIED REPORTS", value: verified.toLocaleString(), trend: "+8%", icon: CheckCircle, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: "PENDING REPORTS", value: pending.toLocaleString(), trend: "+3%", icon: Clock, iconBg: "bg-accent/10", iconColor: "text-accent" },
      { label: "CRITICAL INCIDENTS", value: critical.toLocaleString(), trend: "+5%", icon: AlertTriangle, iconBg: "bg-destructive/10", iconColor: "text-destructive" },
      { label: "ACTIVE AGENTS", value: "384", trend: "+2%", icon: Users, iconBg: "bg-primary/10", iconColor: "text-primary" },
      { label: "REGIONS REPORTING", value: "36/37", trend: "97%", icon: MapPin, iconBg: "bg-primary/10", iconColor: "text-primary" },
    ];
  }, [updates]);

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
          <div className="h-[400px]">
            <MapContainer
              center={[9.6, 8.9]}
              zoom={8}
              className="h-full w-full"
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              {mapMarkers.map((m, i) => (
                <CircleMarker
                  key={i}
                  center={[m.lat, m.lng]}
                  radius={8}
                  pathOptions={{
                    color: markerColors[m.status],
                    fillColor: markerColors[m.status],
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Tooltip>{m.label} — {m.status}</Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
          <div className="px-5 py-3 border-t border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Plateau State Operations</p>
            <p className="text-sm"><span className="text-primary font-bold">94%</span> coverage active</p>
          </div>
        </div>

        {/* Recent Field Activity */}
        <div className="bg-card border border-border rounded-xl">
          <div className="px-5 py-4 flex items-center justify-between border-b border-border">
            <h3 className="font-heading font-bold text-lg">Recent Field Activity</h3>
            <button className="text-xs text-primary font-bold hover:underline">View All</button>
          </div>
          <div className="divide-y divide-border">
            {activityItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="px-5 py-4 flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  item.badge === "Critical" ? "bg-destructive/10" :
                  item.badge === "Pending" ? "bg-accent/10" : "bg-primary/10"
                }`}>
                  <item.icon className={`w-5 h-5 ${
                    item.badge === "Critical" ? "text-destructive" :
                    item.badge === "Pending" ? "text-accent" : "text-primary"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{item.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>{item.badge}</span>
                  </div>
                </div>
              </motion.div>
            ))}
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
