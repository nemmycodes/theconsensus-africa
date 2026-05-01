import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Radio, AlertTriangle, CheckCircle, Clock, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const filters = ["All", "Incident", "Verified", "Delay"];

const MemberSituationRoom = ({ onTabChange }: { onTabChange: (tab: string) => void }) => {
  const [updates, setUpdates] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

  useEffect(() => {
    supabase.from("situation_updates").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setUpdates(data);
    });

    const channel = supabase.channel("member-situation").on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => {
      supabase.from("situation_updates").select("*").order("created_at", { ascending: false }).then(({ data }) => { if (data) setUpdates(data); });
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = [
    { label: "Total Reports", value: updates.length, trend: "+15.3%", icon: "📄" },
    { label: "Verified", value: updates.filter(u => u.status === "Verified").length, trend: "+8.7%", icon: "✅" },
    { label: "Pending", value: updates.filter(u => u.status === "Active").length, trend: "-3.2%", icon: "⏳" },
    { label: "Critical", value: updates.filter(u => u.status === "Critical" || u.status === "Escalated").length, trend: "+12.1%", icon: "⚠️" },
  ];

  const filtered = updates.filter(u => {
    if (activeFilter !== "All") {
      if (activeFilter === "Incident" && u.category !== "Incident") return false;
      if (activeFilter === "Verified" && u.status !== "Verified") return false;
      if (activeFilter === "Delay" && u.category !== "Delay") return false;
    }
    if (search && !u.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Verified": return "text-emerald-600 bg-emerald-50";
      case "Critical": case "Escalated": return "text-red-600 bg-red-50";
      default: return "text-amber-600 bg-amber-50";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Incident": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "Verified": return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  if (selectedUpdate) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedUpdate(null)} className="gap-2">← Back to Feed</Button>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(selectedUpdate.status)}`}>{selectedUpdate.status}</span>
            <span className="text-xs text-gray-400">{new Date(selectedUpdate.created_at).toLocaleString()}</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">{selectedUpdate.title}</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{selectedUpdate.content}</p>
          {selectedUpdate.attachment_url && (
            <a href={selectedUpdate.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-100">
              📎 View Attachment
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            Situation Room <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">● Live</span>
          </h2>
          <p className="text-sm text-gray-500">Real-time monitoring of field reports and incidents across Plateau State</p>
        </div>
        <Button onClick={() => onTabChange("report")} className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2">
          📋 Submit Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <span className="text-xl">{s.icon}</span>
            <div>
              <p className="text-xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
            <span className="text-[10px] text-emerald-600 ml-auto">📈 {s.trend}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Reports Feed */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 uppercase text-sm tracking-wide">Live Reports Feed</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeFilter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {f}
              </button>
            ))}
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {filtered.length > 0 ? filtered.map((u) => (
              <div key={u.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  {getCategoryIcon(u.category)}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(u.status)}`}>{u.status}</span>
                  <span className="text-[10px] text-gray-400 ml-auto">{new Date(u.created_at).toLocaleTimeString()} UTC</span>
                  <button onClick={() => setSelectedUpdate(u)} className="text-xs text-emerald-600 font-bold border border-emerald-200 rounded px-2 py-0.5 hover:bg-emerald-50">View</button>
                </div>
                <p className="text-sm font-medium text-gray-900">{u.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{u.content}</p>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-8">No reports found.</p>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Regional Overview</h4>
            {["Plateau North", "Plateau Central", "Plateau South"].map((region) => (
              <div key={region} className="py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-gray-800">{region}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Reports: <strong>{Math.floor(Math.random() * 500)}</strong></span>
                  <span>Coverage: <strong>{85 + Math.floor(Math.random() * 15)}%</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Active Alerts</h4>
            <div className="space-y-2">
              <div className="border-l-4 border-red-500 pl-3 py-1"><p className="text-xs text-gray-700">High alert: Multiple incidents in Jos South</p></div>
              <div className="border-l-4 border-amber-500 pl-3 py-1"><p className="text-xs text-gray-700">Card reader failures in 3 polling units</p></div>
              <div className="border-l-4 border-blue-500 pl-3 py-1"><p className="text-xs text-gray-700">Reminder: Submit end-of-day report</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSituationRoom;
