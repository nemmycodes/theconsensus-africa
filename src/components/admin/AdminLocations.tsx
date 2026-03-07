import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, RefreshCw, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentLocation {
  id: string;
  agent_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  status: string;
  note: string | null;
  updated_at: string;
  profile?: { full_name: string | null };
}

const AdminLocations = () => {
  const [locations, setLocations] = useState<AgentLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    const { data } = await supabase.from("agent_locations").select("*").order("updated_at", { ascending: false });
    if (data && data.length > 0) {
      const agentIds = [...new Set(data.map((l) => l.agent_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", agentIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      setLocations(data.map((l) => ({ ...l, profile: profileMap.get(l.agent_id) })));
    } else {
      setLocations([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLocations(); }, []);

  // Realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("agent-locations-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_locations" }, () => fetchLocations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const statusColor = (s: string) => s === "active" ? "text-primary" : s === "idle" ? "text-yellow-400" : "text-muted-foreground";

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Agent Live Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time tracking of field agents</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchLocations}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Map placeholder */}
      <div className="bg-card border border-border rounded-xl h-72 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAyMCAwIEwgMCAwIDAgMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <div className="text-center z-10">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-sm font-bold">Live Map View</p>
          <p className="text-xs text-muted-foreground">{locations.filter((l) => l.status === "active").length} agents currently active</p>
        </div>
        {/* Plot dots for active agents */}
        {locations.filter((l) => l.status === "active").map((loc, i) => (
          <div
            key={loc.id}
            className="absolute w-3 h-3 bg-primary rounded-full animate-pulse"
            style={{
              left: `${20 + (i * 15) % 60}%`,
              top: `${20 + (i * 20) % 50}%`,
            }}
            title={`${loc.profile?.full_name ?? "Agent"} - ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`}
          />
        ))}
      </div>

      {/* Agent list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-4">Agent</th>
              <th className="text-left p-4">Coordinates</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Last Update</th>
              <th className="text-left p-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : locations.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No agent locations recorded yet.</td></tr>
            ) : (
              locations.map((loc) => (
                <tr key={loc.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Circle className={`w-2 h-2 fill-current ${statusColor(loc.status)}`} />
                      <span className="font-medium text-sm">{loc.profile?.full_name ?? loc.agent_id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs font-mono text-muted-foreground">
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold uppercase ${statusColor(loc.status)}`}>{loc.status}</span>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground">{timeSince(loc.updated_at)}</td>
                  <td className="p-4 text-xs text-muted-foreground truncate max-w-[200px]">{loc.note ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLocations;
