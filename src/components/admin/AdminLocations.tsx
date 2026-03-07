import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, RefreshCw, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons for leaflet + bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(34,197,94,0.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const idleIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#eab308;border:3px solid #fff;border-radius:50%;box-shadow:0 0 8px rgba(234,179,8,0.6);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

const offlineIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;background:#6b7280;border:3px solid #fff;border-radius:50%;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

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

  useEffect(() => {
    const channel = supabase
      .channel("agent-locations-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_locations" }, () => fetchLocations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const statusColor = (s: string) => s === "active" ? "text-primary" : s === "idle" ? "text-yellow-400" : "text-muted-foreground";

  const getIcon = (status: string) => status === "active" ? activeIcon : status === "idle" ? idleIcon : offlineIcon;

  const timeSince = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  // Default center: Nigeria (Plateau State)
  const center: [number, number] = locations.length > 0
    ? [locations[0].latitude, locations[0].longitude]
    : [9.2182, 9.5176];

  const activeCount = locations.filter((l) => l.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Agent Live Locations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time tracking of field agents · {activeCount} active, {locations.length} total
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchLocations}>
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-primary" /> Active</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400" /> Idle</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-muted-foreground" /> Offline</span>
      </div>

      {/* Map */}
      <div className="bg-card border border-border rounded-xl overflow-hidden" style={{ height: 450 }}>
        <MapContainer
          center={center}
          zoom={locations.length > 0 ? 10 : 7}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {locations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]} icon={getIcon(loc.status)}>
              <Popup>
                <div className="text-xs space-y-1 min-w-[160px]">
                  <p className="font-bold text-sm">{loc.profile?.full_name ?? "Agent"}</p>
                  <p>Status: <strong className="capitalize">{loc.status}</strong></p>
                  <p className="font-mono">{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</p>
                  {loc.accuracy && <p>Accuracy: ±{loc.accuracy.toFixed(0)}m</p>}
                  {loc.note && <p>Note: {loc.note}</p>}
                  <p className="text-gray-400">{timeSince(loc.updated_at)}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Agent list table */}
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
