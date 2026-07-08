import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SuperAdminHeader from "./SuperAdminHeader";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { Sparkles, Loader2, MapPin, Users, AlertTriangle, Globe, Smartphone, TrendingUp } from "lucide-react";

const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#06b6d4", "#ec4899", "#8b5cf6", "#22c55e"];

type EventRow = {
  id: string; visitor_id: string; user_id: string | null; path: string | null;
  referrer: string | null; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null;
  device_type: string | null; browser: string | null; os: string | null;
  country: string | null; city: string | null; region: string | null;
  latitude: number | null; longitude: number | null;
  ip_address: string | null; created_at: string;
};

type FailedRow = {
  id: string; email: string | null; error_message: string | null;
  country: string | null; city: string | null; latitude: number | null; longitude: number | null;
  device_type: string | null; browser: string | null; ip_address: string | null; created_at: string;
};

type SessionRow = {
  visitor_id: string; user_id: string | null; visit_count: number;
  last_country: string | null; last_city: string | null;
  last_latitude: number | null; last_longitude: number | null;
  last_device_type: string | null; last_browser: string | null; last_os: string | null;
  last_ip: string | null; first_referrer: string | null; first_utm_source: string | null;
  first_seen_at: string; last_seen_at: string;
};

const countTop = (arr: any[], key: string, n = 8) => {
  const c: Record<string, number> = {};
  for (const item of arr) {
    const v = item?.[key];
    if (!v) continue;
    c[v] = (c[v] || 0) + 1;
  }
  return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, n).map(([name, count]) => ({ name, count }));
};

const SuperAdminAnalytics = () => {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [failed, setFailed] = useState<FailedRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<string>("");
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [e, f, s] = await Promise.all([
        supabase.from("analytics_events").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(5000),
        supabase.from("failed_signups").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("visitor_sessions").select("*").order("last_seen_at", { ascending: false }).limit(2000),
      ]);
      setEvents((e.data as any) || []);
      setFailed((f.data as any) || []);
      setSessions((s.data as any) || []);
      setLoading(false);
    };
    load();
  }, []);

  const generateInsights = async () => {
    setInsightsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analytics-insights");
      if (error) throw error;
      setInsights((data as any)?.summary || "No insights available.");
    } catch (e: any) {
      setInsights(`Error generating insights: ${e.message}`);
    } finally {
      setInsightsLoading(false);
    }
  };

  // Aggregates
  const totalVisits = events.length;
  const uniqueVisitors = new Set(events.map(e => e.visitor_id)).size;
  const registeredUsers = new Set(events.filter(e => e.user_id).map(e => e.user_id)).size;
  const failedCount = failed.length;

  // Time series (30 days)
  const dayMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }
  events.forEach(e => {
    const day = e.created_at.slice(0, 10);
    if (dayMap[day] !== undefined) dayMap[day]++;
  });
  const trend = Object.entries(dayMap).map(([date, count]) => ({ date: date.slice(5), count }));

  const topPaths = countTop(events, "path");
  const topCountries = countTop(events, "country");
  const topCities = countTop(events, "city");
  const topReferrers = countTop(events.map(e => ({ ...e, ref: cleanRef(e.referrer) })), "ref");
  const topUtm = countTop(events, "utm_source");
  const deviceBreakdown = countTop(events, "device_type");
  const browserBreakdown = countTop(events, "browser");
  const failedReasons = countTop(failed, "error_message");

  // Points with coords (visitors + failed)
  const visitorPoints = sessions
    .filter(s => s.last_latitude && s.last_longitude)
    .map(s => ({
      lat: s.last_latitude!, lng: s.last_longitude!,
      title: `${s.last_city || "?"}, ${s.last_country || "?"}`,
      subtitle: `${s.visit_count} visits · ${s.last_device_type || "?"} · ${s.last_browser || "?"}`,
      type: "visitor" as const,
    }));
  const failedPoints = failed
    .filter(f => f.latitude && f.longitude)
    .map(f => ({
      lat: f.latitude!, lng: f.longitude!,
      title: `Failed: ${f.email || "?"}`,
      subtitle: `${f.city || "?"}, ${f.country || "?"} — ${f.error_message || ""}`,
      type: "failed" as const,
    }));
  const mapPoints = [...visitorPoints, ...failedPoints];

  return (
    <div>
      <SuperAdminHeader title="Intelligent Analytics" subtitle="Real-time visitor insights, geolocation & AI recommendations" />

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Kpi icon={TrendingUp} label="Total Pageviews (30d)" value={totalVisits} color="text-amber-500" />
        <Kpi icon={Users} label="Unique Visitors" value={uniqueVisitors} color="text-emerald-500" />
        <Kpi icon={Globe} label="Registered Users" value={registeredUsers} color="text-indigo-500" />
        <Kpi icon={AlertTriangle} label="Failed Signups" value={failedCount} color="text-red-500" />
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="map">Location Map</TabsTrigger>
          <TabsTrigger value="failed">Failed Signups</TabsTrigger>
          <TabsTrigger value="ai">AI Insights</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wide">Traffic Trend (30 Days)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <ChartCard title="Top Pages"><BarChart data={topPaths}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={10} interval={0} angle={-20} textAnchor="end" height={70} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} /></BarChart></ChartCard>

            <ChartCard title="Devices"><PieChart><Pie data={deviceBreakdown} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, count }) => `${name}: ${count}`}>{deviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ChartCard>

            <ChartCard title="Browsers"><BarChart data={browserBreakdown}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} /></BarChart></ChartCard>

            <ChartCard title="Top Referrers"><BarChart data={topReferrers} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" fontSize={11} allowDecimals={false} /><YAxis dataKey="name" type="category" fontSize={10} width={120} /><Tooltip /><Bar dataKey="count" fill="#ec4899" radius={[0,4,4,0]} /></BarChart></ChartCard>

            <ChartCard title="UTM Sources"><BarChart data={topUtm}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#06b6d4" radius={[4,4,0,0]} /></BarChart></ChartCard>

            <ChartCard title="Top Countries"><BarChart data={topCountries}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} /></BarChart></ChartCard>
          </div>
        </TabsContent>

        {/* VISITORS TABLE */}
        <TabsContent value="visitors">
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wide">Recent Visitors ({sessions.length})</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                    <th className="py-2 pr-3">Visitor</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Device</th>
                    <th className="py-2 pr-3">IP</th>
                    <th className="py-2 pr-3">Source</th>
                    <th className="py-2 pr-3">Visits</th>
                    <th className="py-2 pr-3">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 100).map(s => (
                    <tr key={s.visitor_id} className="border-b border-border/50 hover:bg-muted/40">
                      <td className="py-2 pr-3 font-mono text-xs">{s.visitor_id.slice(0, 10)}…{s.user_id ? <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-600 rounded">USER</span> : null}</td>
                      <td className="py-2 pr-3">{s.last_city || "—"}, {s.last_country || "—"}</td>
                      <td className="py-2 pr-3">{s.last_device_type || "?"} · {s.last_browser || "?"} · {s.last_os || "?"}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{s.last_ip || "—"}</td>
                      <td className="py-2 pr-3">{s.first_utm_source || cleanRef(s.first_referrer) || "direct"}</td>
                      <td className="py-2 pr-3">{s.visit_count}</td>
                      <td className="py-2 pr-3 text-xs">{new Date(s.last_seen_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {sessions.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-muted-foreground">No visitors tracked yet</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MAP */}
        <TabsContent value="map">
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2"><MapPin className="w-4 h-4" /> Visitor Locations ({mapPoints.length})</CardTitle></CardHeader>
            <CardContent>
              <VisitorMap points={mapPoints} />
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Visitor</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Failed signup</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAILED SIGNUPS */}
        <TabsContent value="failed">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard title="Failure Reasons"><BarChart data={failedReasons} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" fontSize={11} allowDecimals={false} /><YAxis dataKey="name" type="category" fontSize={10} width={150} /><Tooltip /><Bar dataKey="count" fill="#ef4444" radius={[0,4,4,0]} /></BarChart></ChartCard>
            <ChartCard title="Failed Signups by Country"><BarChart data={countTop(failed, "country")}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#f59e0b" radius={[4,4,0,0]} /></BarChart></ChartCard>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-sm font-bold uppercase tracking-wide">Failed Signup Attempts</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground border-b">
                    <th className="py-2 pr-3">Email</th>
                    <th className="py-2 pr-3">Reason</th>
                    <th className="py-2 pr-3">Location</th>
                    <th className="py-2 pr-3">Device</th>
                    <th className="py-2 pr-3">IP</th>
                    <th className="py-2 pr-3">When</th>
                  </tr>
                </thead>
                <tbody>
                  {failed.map(f => (
                    <tr key={f.id} className="border-b border-border/50 hover:bg-muted/40">
                      <td className="py-2 pr-3">{f.email || "—"}</td>
                      <td className="py-2 pr-3 text-red-600 text-xs">{f.error_message || "?"}</td>
                      <td className="py-2 pr-3">{f.city || "—"}, {f.country || "—"}</td>
                      <td className="py-2 pr-3">{f.device_type || "?"} · {f.browser || "?"}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{f.ip_address || "—"}</td>
                      <td className="py-2 pr-3 text-xs">{new Date(f.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                  {failed.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No failed signup attempts logged</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI INSIGHTS */}
        <TabsContent value="ai">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI-Generated Insights
              </CardTitle>
              <Button onClick={generateInsights} disabled={insightsLoading} size="sm">
                {insightsLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing…</> : "Generate Brief"}
              </Button>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">{insights}</div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click <b>Generate Brief</b> to run Lovable AI over the past 7 days of visitor data. It will summarize who's visiting, how they got here, signup issues, and give recommendations.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helpers ---------------------------------------------

function cleanRef(r: string | null): string | null {
  if (!r) return null;
  try { return new URL(r).hostname; } catch { return r; }
}

const Kpi = ({ icon: Icon, label, value, color }: any) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-3xl font-black mt-1">{value.toLocaleString()}</p>
      </div>
      <Icon className={`w-8 h-8 ${color}`} />
    </CardContent>
  </Card>
);

const ChartCard = ({ title, children }: { title: string; children: any }) => (
  <Card>
    <CardHeader className="pb-2"><CardTitle className="text-sm font-bold uppercase tracking-wide">{title}</CardTitle></CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={250}>{children}</ResponsiveContainer>
    </CardContent>
  </Card>
);

// Google Map ------------------------------------------

const VisitorMap = ({ points }: { points: Array<{ lat: number; lng: number; title: string; subtitle: string; type: "visitor" | "failed" }> }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markers = useRef<any[]>([]);

  useEffect(() => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) return;

    const init = () => {
      if (!mapRef.current || !(window as any).google?.maps) return;
      mapInstance.current = new (window as any).google.maps.Map(mapRef.current, {
        center: { lat: 9.0765, lng: 8.6753 }, // Nigeria
        zoom: 3,
        mapTypeControl: false,
        streetViewControl: false,
      });
      renderMarkers();
    };
    (window as any).__initVisitorMap = init;

    if ((window as any).google?.maps) {
      init();
    } else {
      const scriptId = "gmaps-visitor-map";
      if (!document.getElementById(scriptId)) {
        const s = document.createElement("script");
        s.id = scriptId;
        s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initVisitorMap${channel ? `&channel=${channel}` : ""}`;
        s.async = true;
        document.head.appendChild(s);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMarkers = () => {
    if (!mapInstance.current || !(window as any).google?.maps) return;
    markers.current.forEach(m => m.setMap(null));
    markers.current = [];
    const g = (window as any).google.maps;
    const info = new g.InfoWindow();
    points.forEach(p => {
      const marker = new g.Marker({
        position: { lat: p.lat, lng: p.lng },
        map: mapInstance.current,
        icon: {
          path: g.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: p.type === "failed" ? "#ef4444" : "#10b981",
          fillOpacity: 0.85,
          strokeColor: "#fff",
          strokeWeight: 1.5,
        },
      });
      marker.addListener("click", () => {
        info.setContent(`<div style="font-family:sans-serif;font-size:12px"><b>${p.title}</b><br/>${p.subtitle}</div>`);
        info.open(mapInstance.current, marker);
      });
      markers.current.push(marker);
    });
  };

  useEffect(() => { renderMarkers(); /* eslint-disable-next-line */ }, [points]);

  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  if (!key) {
    return <div className="h-[500px] flex items-center justify-center bg-muted rounded-md text-sm text-muted-foreground">Google Maps key not configured</div>;
  }
  return <div ref={mapRef} className="w-full h-[500px] rounded-md border" />;
};

export default SuperAdminAnalytics;
