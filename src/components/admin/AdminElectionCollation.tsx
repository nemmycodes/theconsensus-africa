import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { BarChart3, CheckCircle, Clock, AlertTriangle, Download, MapPin, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format } from "date-fns";

interface ElectionReport {
  id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  author_id: string;
  parsed?: {
    center: { centerName: string; agentCode: string; state: string; lga: string; electionType: string };
    voting: { ward: string; pollingUnit: string; registeredVoters: number; accreditedVoters: number; totalVotesCast: number };
    partyResults: Record<string, number>;
    totalPartyVotes: number;
    observations: string;
    signature: { name: string; date: string };
  };
}

const AdminElectionCollation = () => {
  const [reports, setReports] = useState<ElectionReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("situation_updates")
      .select("*")
      .eq("category", "Political")
      .order("created_at", { ascending: false });

    if (data) {
      const parsed = data.map((r) => {
        let parsedContent;
        try {
          parsedContent = JSON.parse(r.content);
        } catch {
          parsedContent = null;
        }
        return { ...r, parsed: parsedContent } as ElectionReport;
      }).filter((r) => r.parsed?.center); // Only include valid election reports
      setReports(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
    const channel = supabase
      .channel("election-collation")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => fetchReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Aggregate stats
  const totalReports = reports.length;
  const verifiedCount = reports.filter((r) => r.status === "Resolved").length;
  const pendingCount = reports.filter((r) => r.status === "Active").length;
  const disputedCount = reports.filter((r) => r.status === "Monitoring").length;

  // Aggregate party results across all reports
  const aggregatedPartyResults: Record<string, number> = {};
  let totalVotersRegistered = 0;
  let totalVotesCastAll = 0;

  reports.forEach((r) => {
    if (!r.parsed) return;
    totalVotersRegistered += r.parsed.voting.registeredVoters || 0;
    totalVotesCastAll += r.parsed.voting.totalVotesCast || 0;
    if (r.parsed.partyResults) {
      Object.entries(r.parsed.partyResults).forEach(([party, votes]) => {
        aggregatedPartyResults[party] = (aggregatedPartyResults[party] || 0) + (votes || 0);
      });
    }
  });

  // Top parties for pie chart (top 5 + others)
  const sortedParties = Object.entries(aggregatedPartyResults)
    .sort(([, a], [, b]) => b - a)
    .filter(([, v]) => v > 0);

  const COLORS = ["#16a34a", "#eab308", "#3b82f6", "#ef4444", "#8b5cf6", "#9ca3af"];
  const topParties = sortedParties.slice(0, 5);
  const othersTotal = sortedParties.slice(5).reduce((sum, [, v]) => sum + v, 0);
  const pieData = [
    ...topParties.map(([name, value], i) => ({ name, value, color: COLORS[i % COLORS.length] })),
    ...(othersTotal > 0 ? [{ name: "Others", value: othersTotal, color: COLORS[5] }] : []),
  ];

  // Bar data: votes per polling unit (from individual reports)
  const barData = reports.slice(0, 10).map((r) => ({
    name: r.parsed?.voting.pollingUnit || r.parsed?.center.centerName || "Unknown",
    votes: r.parsed?.voting.totalVotesCast || 0,
  }));

  // Ward-level grouping
  const wardMap: Record<string, { ward: string; lga: string; votes: number; registered: number; reports: number; verified: number }> = {};
  reports.forEach((r) => {
    if (!r.parsed) return;
    const ward = r.parsed.voting.ward || "Unknown";
    const lga = r.parsed.center.lga || "Unknown";
    const key = `${ward}-${lga}`;
    if (!wardMap[key]) wardMap[key] = { ward, lga, votes: 0, registered: 0, reports: 0, verified: 0 };
    wardMap[key].votes += r.parsed.voting.totalVotesCast || 0;
    wardMap[key].registered += r.parsed.voting.registeredVoters || 0;
    wardMap[key].reports += 1;
    if (r.status === "Resolved") wardMap[key].verified += 1;
  });
  const wardResults = Object.values(wardMap);

  // State-level grouping
  const stateMap: Record<string, { state: string; reports: number; verified: number; pending: number }> = {};
  reports.forEach((r) => {
    if (!r.parsed) return;
    const st = r.parsed.center.state || "Unknown";
    if (!stateMap[st]) stateMap[st] = { state: st, reports: 0, verified: 0, pending: 0 };
    stateMap[st].reports += 1;
    if (r.status === "Resolved") stateMap[st].verified += 1;
    else stateMap[st].pending += 1;
  });
  const stateResults = Object.values(stateMap);

  const overallTurnout = totalVotersRegistered > 0 ? ((totalVotesCastAll / totalVotersRegistered) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div>
        <AdminHeader title="Election Collation" subtitle="Results aggregation and verification from agent submissions" />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Election Collation"
        subtitle="Real-time results from agent and user submissions"
        liveBadge={totalReports > 0 ? { label: `${totalReports} REPORTS`, color: "bg-emerald-50 text-emerald-700 border-emerald-200" } : undefined}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL REPORTS", value: totalReports.toString(), icon: BarChart3, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "VERIFIED", value: verifiedCount.toString(), icon: CheckCircle, change: totalReports > 0 ? `${((verifiedCount / totalReports) * 100).toFixed(0)}%` : "0%", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "PENDING", value: pendingCount.toString(), icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "UNDER REVIEW", value: disputedCount.toString(), icon: AlertTriangle, bg: "bg-red-50", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                {s.change && <p className="text-xs text-emerald-600 font-bold mt-1">↑ {s.change}</p>}
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalReports === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Election Reports Yet</h3>
          <p className="text-sm text-gray-500">Reports submitted by agents via the Election Collation Form will appear here in real-time.</p>
        </div>
      ) : (
        <>
          {/* Collation Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Collation Summary</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-500">Total Registered: <strong className="text-gray-900">{totalVotersRegistered.toLocaleString()}</strong></span>
                <span className="text-gray-500">Total Votes Cast: <strong className="text-gray-900">{totalVotesCastAll.toLocaleString()}</strong></span>
                <span className="text-gray-500">Turnout: <strong className="text-emerald-600">{overallTurnout}%</strong></span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Polling Units Reported</p>
                <p className="text-xl font-black text-gray-900 mt-1">{totalReports}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Wards Covered</p>
                <p className="text-xl font-black text-gray-900 mt-1">{wardResults.length}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">States Covered</p>
                <p className="text-xl font-black text-gray-900 mt-1">{stateResults.length}</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          {(barData.length > 0 || pieData.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {barData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Votes by Polling Unit</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#666" }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 12, fill: "#666" }} />
                      <Tooltip />
                      <Bar dataKey="votes" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {pieData.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Aggregated Party Results</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value.toLocaleString()}`}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Ward-Level Results */}
          {wardResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Ward-Level Results</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {["Ward", "LGA", "Total Votes", "Registered", "Turnout", "Reports", "Status"].map((h) => (
                      <th key={h} className="text-left p-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wardResults.map((row, i) => {
                    const turnout = row.registered > 0 ? ((row.votes / row.registered) * 100).toFixed(0) : "0";
                    const allVerified = row.verified === row.reports;
                    return (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-3 text-sm font-semibold text-gray-900">{row.ward}</td>
                        <td className="p-3 text-sm text-gray-600">{row.lga}</td>
                        <td className="p-3 text-sm text-gray-900">{row.votes.toLocaleString()}</td>
                        <td className="p-3 text-sm text-gray-600">{row.registered.toLocaleString()}</td>
                        <td className="p-3 text-sm text-gray-900">{turnout}%</td>
                        <td className="p-3 text-sm text-gray-600">{row.reports}</td>
                        <td className="p-3">
                          <span className={`flex items-center gap-1 text-xs font-medium ${allVerified ? "text-emerald-600" : "text-amber-600"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${allVerified ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {allVerified ? "Verified" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* State Overview */}
          {stateResults.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">State-Level Overview</h3>
              <div className="grid grid-cols-3 gap-4">
                {stateResults.map((s) => (
                  <div key={s.state} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">State</p>
                        <p className="text-base font-bold text-gray-900">{s.state}</p>
                      </div>
                      <MapPin className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="space-y-1 mt-3">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Reports</span><span className="font-bold text-gray-900">{s.reports}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Verified</span><span className="font-bold text-emerald-600">{s.verified}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Pending</span><span className="font-bold text-amber-600">{s.pending}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual Reports */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Recent Submissions</h3>
            <div className="space-y-2">
              {reports.slice(0, 20).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${r.status === "Resolved" ? "bg-emerald-500" : r.status === "Monitoring" ? "bg-amber-500" : "bg-blue-500"}`} />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.parsed?.center.centerName || r.title}</p>
                      <p className="text-xs text-gray-500">
                        {r.parsed?.center.state} · {r.parsed?.center.lga} · {r.parsed?.voting.ward} · PU: {r.parsed?.voting.pollingUnit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{(r.parsed?.voting.totalVotesCast || 0).toLocaleString()} votes</p>
                    <p className="text-xs text-gray-500">{format(new Date(r.created_at), "MMM d, HH:mm")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminElectionCollation;
