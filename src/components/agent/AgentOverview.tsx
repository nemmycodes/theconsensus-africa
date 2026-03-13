import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, FileText, CheckCircle, AlertTriangle, Plus, Eye, Edit, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PollingUnit {
  id: string;
  code: string;
  location: string;
  ward: string;
  status: "Pending" | "Verified" | "Flagged" | "Not Started";
}

const AgentOverview = ({ onTabChange }: { onTabChange: (tab: string) => void }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; ward: string | null } | null>(null);
  const [stats, setStats] = useState({ pending: 0, verified: 0, flagged: 0 });
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, ward").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));

    // Fetch situation updates by this agent as proxy for submissions
    supabase.from("situation_updates").select("status").eq("author_id", user.id)
      .then(({ data }) => {
        if (data) {
          setStats({
            pending: data.filter(d => d.status === "Active").length,
            verified: data.filter(d => d.status === "Resolved").length,
            flagged: data.filter(d => d.status === "Critical").length,
          });
        }
      });
  }, [user]);

  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  // Mock polling units for display (matches Figma)
  const pollingUnits: PollingUnit[] = [
    { id: "1", code: "PU-001", location: "City Hall Main Entrance", ward: profile?.ward || "Ward 4", status: "Pending" },
    { id: "2", code: "PU-002", location: "Community Primary School", ward: profile?.ward || "Ward 4", status: "Verified" },
    { id: "3", code: "PU-003", location: "Market Square South", ward: profile?.ward || "Ward 4", status: "Flagged" },
    { id: "4", code: "PU-004", location: "Library Annex", ward: profile?.ward || "Ward 4", status: "Not Started" },
  ];

  const statusColors: Record<string, string> = {
    Pending: "bg-amber-500/20 text-amber-400",
    Verified: "bg-emerald-500/20 text-emerald-400",
    Flagged: "bg-red-500/20 text-red-400",
    "Not Started": "bg-gray-500/20 text-gray-400",
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Election Phase: Collation</p>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, Agent. Here is your current status for{" "}
            <span className="text-emerald-600 font-semibold">{profile?.ward || "your ward"}</span>.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1f15] text-white text-sm">
          <Clock className="w-4 h-4" />
          {dateStr} · {timeStr}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d1f15] rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-amber-500/30" />
          </div>
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" /> Pending Submissions
          </p>
          <p className="text-4xl font-black mt-2">{stats.pending || 12}</p>
          <p className="text-xs text-amber-400 mt-1">↑ 2 waiting for verification</p>
        </div>
        <div className="bg-[#0d1f15] rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-500/30" />
          </div>
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Verified Results
          </p>
          <p className="text-4xl font-black mt-2">{stats.verified || 45}</p>
          <p className="text-xs text-emerald-400 mt-1">↗ +15 verified today</p>
        </div>
        <div className="bg-[#0d1f15] rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500/30" />
          </div>
          <p className="text-xs font-semibold text-gray-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" /> Flagged Incidents
          </p>
          <p className="text-4xl font-black mt-2">{stats.flagged || 2}</p>
          <p className="text-xs text-red-400 mt-1">‼ 1 critical issue</p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Polling Units Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-gray-900">Assigned Polling Units</h2>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</button>
          </div>
          <div className="bg-[#0d1f15] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Unit Code</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Ward</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pollingUnits.map((pu) => (
                  <tr key={pu.id} className="text-white text-sm">
                    <td className="px-6 py-4 font-mono font-bold">{pu.code}</td>
                    <td className="px-6 py-4">{pu.location}</td>
                    <td className="px-6 py-4 text-gray-400">{pu.ward}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[pu.status]}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {pu.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {pu.status === "Pending" || pu.status === "Not Started" ? (
                        <button className="text-emerald-400 hover:text-emerald-300"><Edit className="w-4 h-4" /></button>
                      ) : (
                        <button className="text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="text-lg font-black text-gray-900 mb-2">Quick Actions</h3>
            <p className="text-xs text-gray-500 mb-4">Manage election data and report issues directly from here.</p>
            <div className="space-y-3">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
                onClick={() => navigate("/election-form")}
              >
                <Plus className="w-4 h-4" /> New Election Collation
              </Button>
              <Button
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 font-bold gap-2"
                onClick={() => onTabChange("submissions")}
              >
                <AlertTriangle className="w-4 h-4" /> Report Incident
              </Button>
            </div>
          </div>

          {/* Reminder */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-700 leading-relaxed">
                Ensure all result sheets are signed by the polling officer before uploading. Unsigned sheets may be rejected during verification.
              </p>
            </div>
          </div>

          {/* Map placeholder */}
          <div className="bg-[#0d1f15] rounded-xl h-40 flex items-end p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.3) 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }} />
            <div className="relative flex items-center gap-2 text-white text-sm font-semibold">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Zone B Map View
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOverview;
