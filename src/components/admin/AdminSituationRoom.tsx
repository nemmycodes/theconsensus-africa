import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Radio, AlertTriangle, CheckCircle, Clock, Plus, Edit, Trash2,
  ShieldCheck, Flag, XCircle, MapPin, FileText, Download,
} from "lucide-react";
import { format } from "date-fns";

interface SituationUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  author_id: string;
}

interface ElectionReport {
  id: string;
  agent_id: string;
  election_type: string;
  election_date: string;
  state: string;
  senatorial_zone: string | null;
  lga: string;
  ward: string;
  polling_unit: string;
  party: string | null;
  candidate_name: string | null;
  votes_recorded: number;
  total_votes_cast: number | null;
  registered_voters: number | null;
  ec8a_url: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  status: "pending" | "flagged" | "verified" | "rejected";
  rejection_reason: string | null;
  flagged_reason: string | null;
  created_at: string;
}

interface ElectionSubmissionGroup {
  key: string;
  reports: ElectionReport[];
  primary: ElectionReport;
  totalPartyVotes: number;
}

const statusConfig: Record<string, { color: string; iconBg: string; iconColor: string; icon: typeof AlertTriangle }> = {
  Active: { color: "bg-red-50 border-red-100", iconBg: "bg-red-100", iconColor: "text-red-500", icon: AlertTriangle },
  Resolved: { color: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", icon: CheckCircle },
  Monitoring: { color: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", icon: Clock },
  Info: { color: "bg-blue-50 border-blue-100", iconBg: "bg-blue-100", iconColor: "text-blue-600", icon: Radio },
};

const categories = ["General", "Security", "Infrastructure", "Political", "Social", "Economic"];
const statuses = ["Active", "Resolved", "Monitoring", "Info"];
const filterTabs = ["All", "Active", "Resolved", "Monitoring"];

const AdminSituationRoom = () => {
  const [view, setView] = useState<"reports" | "verification">("verification");

  // -------- Existing situation_updates state --------
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<SituationUpdate | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "General", status: "Active" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // -------- Election reports verification state --------
  const [electionReports, setElectionReports] = useState<ElectionReport[]>([]);
  const [verificationFilter, setVerificationFilter] = useState<"pending" | "flagged" | "verified" | "rejected" | "all">("pending");
  const [actionDialog, setActionDialog] = useState<{ report: ElectionReport; action: "flag" | "reject" } | null>(null);
  const [actionReason, setActionReason] = useState("");

  const fetchUpdates = async () => {
    setLoading(true);
    const { data } = await supabase.from("situation_updates").select("*").order("created_at", { ascending: false });
    if (data) setUpdates(data);
    setLoading(false);
  };

  const fetchElectionReports = async () => {
    const { data } = await supabase
      .from("election_reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setElectionReports(data as ElectionReport[]);
  };

  useEffect(() => {
    fetchUpdates();
    fetchElectionReports();
    const channel = supabase
      .channel("situation-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => fetchUpdates())
      .on("postgres_changes", { event: "*", schema: "public", table: "election_reports" }, () => fetchElectionReports())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // -------- Existing handlers --------
  const openCreate = () => {
    setEditingUpdate(null);
    setForm({ title: "", content: "", category: "General", status: "Active" });
    setDialogOpen(true);
  };

  const openEdit = (update: SituationUpdate) => {
    setEditingUpdate(update);
    setForm({ title: update.title, content: update.content, category: update.category, status: update.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { title: form.title.trim(), content: form.content.trim(), category: form.category, status: form.status };
    if (editingUpdate) {
      const { error } = await supabase.from("situation_updates").update(payload).eq("id", editingUpdate.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Update modified" });
    } else {
      const { error } = await supabase.from("situation_updates").insert({ ...payload, author_id: user?.id || "" });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Update posted" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchUpdates();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("situation_updates").delete().eq("id", id);
    fetchUpdates();
  };

  // -------- Verification handlers --------
  const verifyReport = async (id: string) => {
    const { error } = await supabase
      .from("election_reports")
      .update({ status: "verified", verified_by: user?.id, verified_at: new Date().toISOString(), rejection_reason: null, flagged_reason: null })
      .eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Report verified", description: "Now visible on the public Enter Room dashboard." });
    fetchElectionReports();
  };

  const submitFlagOrReject = async () => {
    if (!actionDialog) return;
    if (!actionReason.trim()) {
      toast({ title: "Reason required", variant: "destructive" });
      return;
    }
    const update = actionDialog.action === "flag"
      ? { status: "flagged" as const, flagged_reason: actionReason.trim() }
      : { status: "rejected" as const, rejection_reason: actionReason.trim() };
    const { error } = await supabase.from("election_reports").update(update).eq("id", actionDialog.report.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: actionDialog.action === "flag" ? "Report flagged for review" : "Report rejected" });
    setActionDialog(null);
    setActionReason("");
    fetchElectionReports();
  };

  const viewEc8a = async (path: string) => {
    if (/^https?:\/\//i.test(path)) {
      window.open(path, "_blank", "noopener,noreferrer");
      return;
    }
    const { data, error } = await supabase.storage.from("election-evidence").createSignedUrl(path, 3600);
    if (error || !data?.signedUrl) {
      toast({ title: "Could not open EC8-A", description: error?.message || "File not found", variant: "destructive" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  const downloadSubmission = (group: ElectionSubmissionGroup) => {
    const r = group.primary;
    const rows = [
      ["Field", "Value"],
      ["Submission ID", group.key],
      ["Status", r.status],
      ["Election Type", r.election_type.replace(/_/g, " ")],
      ["Election Date", r.election_date],
      ["State", r.state],
      ["Senatorial Zone", r.senatorial_zone || ""],
      ["LGA", r.lga],
      ["Ward", r.ward],
      ["Polling Unit", r.polling_unit],
      ["Registered Voters", r.registered_voters ?? ""],
      ["Total Votes Cast", r.total_votes_cast ?? ""],
      ["Total Party Votes", group.totalPartyVotes],
      ["Latitude", r.latitude ?? ""],
      ["Longitude", r.longitude ?? ""],
      ["Notes", r.notes || ""],
      ["EC8-A File", r.ec8a_url || ""],
      ["Submitted", r.created_at],
      [],
      ["Party", "Candidate", "Votes"],
      ...group.reports.map((item) => [item.party || "", item.candidate_name || "", item.votes_recorded]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `election-submission-${r.polling_unit.replace(/[^a-z0-9]+/gi, "-")}-${new Date(r.created_at).getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------- Derived data --------
  const filtered = activeFilter === "All" ? updates : updates.filter((u) => u.status === activeFilter);
  const activeCount = updates.filter((u) => u.status === "Active").length;
  const resolvedCount = updates.filter((u) => u.status === "Resolved").length;

  const filteredReports = verificationFilter === "all"
    ? electionReports
    : electionReports.filter((r) => r.status === verificationFilter);

  const reportCounts = {
    pending: electionReports.filter((r) => r.status === "pending").length,
    flagged: electionReports.filter((r) => r.status === "flagged").length,
    verified: electionReports.filter((r) => r.status === "verified").length,
    rejected: electionReports.filter((r) => r.status === "rejected").length,
  };

  const groupedReports = filteredReports.reduce((acc, report) => {
    const key = [
      report.agent_id,
      report.election_type,
      report.election_date,
      report.state,
      report.lga,
      report.ward,
      report.polling_unit,
      report.created_at,
    ].join("|");
    if (!acc[key]) acc[key] = { key, reports: [], primary: report, totalPartyVotes: 0 };
    acc[key].reports.push(report);
    acc[key].totalPartyVotes += report.votes_recorded || 0;
    return acc;
  }, {} as Record<string, ElectionSubmissionGroup>);
  const submissionGroups = Object.values(groupedReports);

  // State-level overview for verified results
  const stateOverview = electionReports
    .filter((r) => r.status === "verified")
    .reduce((acc, r) => {
      if (!acc[r.state]) acc[r.state] = { reports: 0, votes: 0, lgas: new Set<string>(), wards: new Set<string>() };
      acc[r.state].reports += 1;
      acc[r.state].votes += r.votes_recorded || 0;
      acc[r.state].lgas.add(r.lga);
      acc[r.state].wards.add(r.ward);
      return acc;
    }, {} as Record<string, { reports: number; votes: number; lgas: Set<string>; wards: Set<string> }>);

  return (
    <div>
      <AdminHeader
        title="Situation Room"
        subtitle="Verify agent submissions and manage public Enter Room feed"
        liveBadge={{ label: "LIVE MONITORING", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* View toggle */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setView("verification")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            view === "verification"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4 inline mr-2" />
          Election Reports — Verification Queue
          {reportCounts.pending > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-black">
              {reportCounts.pending}
            </span>
          )}
        </button>
        <button
          onClick={() => setView("reports")}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            view === "reports"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <Radio className="w-4 h-4 inline mr-2" />
          Situation Updates
        </button>
      </div>

      {view === "verification" && (
        <>
          {/* Verification stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: "PENDING", value: reportCounts.pending, icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
              { label: "FLAGGED", value: reportCounts.flagged, icon: Flag, bg: "bg-orange-50", color: "text-orange-600" },
              { label: "VERIFIED (LIVE)", value: reportCounts.verified, icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
              { label: "REJECTED", value: reportCounts.rejected, icon: XCircle, bg: "bg-red-50", color: "text-red-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* State-level overview (verified only) */}
          {Object.keys(stateOverview).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-700">State-Level Overview (Verified Only)</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(stateOverview).map(([state, agg]) => (
                  <div key={state} className="bg-emerald-50/40 border border-emerald-100 rounded-lg p-4">
                    <p className="text-xs font-bold text-emerald-700 uppercase">{state}</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{agg.votes.toLocaleString()} <span className="text-xs font-medium text-gray-500">votes</span></p>
                    <div className="flex gap-3 text-[11px] text-gray-600 mt-1">
                      <span>{agg.reports} reports</span>
                      <span>{agg.lgas.size} LGAs</span>
                      <span>{agg.wards.size} wards</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification filter */}
          <div className="flex gap-2 mb-4">
            {(["pending", "flagged", "verified", "rejected", "all"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setVerificationFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
                  verificationFilter === tab ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Reports list */}
          <div className="space-y-3">
            {submissionGroups.length === 0 ? (
              <p className="text-center text-gray-500 py-12 border border-dashed border-gray-200 rounded-xl">
                No {verificationFilter === "all" ? "" : verificationFilter} election reports yet.
              </p>
            ) : (
              submissionGroups.map((group) => {
                const r = group.primary;
                return (
                <div key={group.key} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          {r.election_type.replace(/_/g, " ")}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                          {r.state}
                        </span>
                        <span className="text-xs text-gray-500">
                          {r.lga} → {r.ward} → <span className="font-mono font-bold">{r.polling_unit}</span>
                        </span>
                        {r.status === "pending" && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">PENDING</span>}
                        {r.status === "flagged" && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-700">FLAGGED</span>}
                        {r.status === "verified" && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">VERIFIED</span>}
                        {r.status === "rejected" && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">REJECTED</span>}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700 mb-3">
                        <div><span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">Date</span>{format(new Date(r.election_date), "MMM d, yyyy")}</div>
                        <div><span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">Registered Voters</span>{r.registered_voters?.toLocaleString() || "—"}</div>
                        <div><span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">Total Votes Cast</span>{r.total_votes_cast?.toLocaleString() || "—"}</div>
                        <div><span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold block">Party Votes</span><span className="font-bold">{group.totalPartyVotes.toLocaleString()}</span></div>
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-100 mb-3">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50 text-[10px] uppercase tracking-wider text-gray-500">
                            <tr>
                              <th className="text-left px-3 py-2">Party</th>
                              <th className="text-left px-3 py-2">Candidate</th>
                              <th className="text-right px-3 py-2">Votes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.reports.map((item) => (
                              <tr key={item.id} className="border-t border-gray-100">
                                <td className="px-3 py-2 font-bold text-gray-800">{item.party || "—"}</td>
                                <td className="px-3 py-2 text-gray-600">{item.candidate_name || "—"}</td>
                                <td className="px-3 py-2 text-right font-black text-gray-900">{item.votes_recorded.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {r.notes && <p className="text-xs text-gray-600 mb-2 italic">"{r.notes}"</p>}

                      {r.flagged_reason && (
                        <p className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded mb-1">
                          🏴 Flagged: {r.flagged_reason}
                        </p>
                      )}
                      {r.rejection_reason && (
                        <p className="text-xs text-red-700 bg-red-50 px-2 py-1 rounded mb-1">
                          ✕ Rejected: {r.rejection_reason}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                        {r.ec8a_url && (
                          <button
                            type="button"
                            onClick={() => viewEc8a(r.ec8a_url!)}
                            className="text-emerald-700 hover:underline flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> View EC8-A
                          </button>
                        )}
                        <button type="button" onClick={() => downloadSubmission(group)} className="text-emerald-700 hover:underline flex items-center gap-1">
                          <Download className="w-3 h-3" /> Download details
                        </button>
                        {r.latitude && r.longitude && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                          </span>
                        )}
                        <span>Submitted {format(new Date(r.created_at), "MMM d, HH:mm")}</span>
                      </div>
                    </div>

                    {(r.status === "pending" || r.status === "flagged") && (
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button size="sm" onClick={() => group.reports.forEach((item) => verifyReport(item.id))} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 h-8">
                          <CheckCircle className="w-3.5 h-3.5" /> Verify
                        </Button>
                        {r.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => { setActionDialog({ report: r, action: "flag" }); setActionReason(""); }} className="border-orange-300 text-orange-700 hover:bg-orange-50 gap-1 h-8">
                            <Flag className="w-3.5 h-3.5" /> Flag
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => { setActionDialog({ report: r, action: "reject" }); setActionReason(""); }} className="border-red-300 text-red-600 hover:bg-red-50 gap-1 h-8">
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        </>
      )}

      {view === "reports" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[
              { label: "TOTAL REPORTS", value: updates.length.toString(), icon: Radio, bg: "bg-emerald-50", color: "text-emerald-600" },
              { label: "ACTIVE INCIDENTS", value: activeCount.toString(), icon: AlertTriangle, bg: "bg-red-50", color: "text-red-500" },
              { label: "RESOLVED", value: resolvedCount.toString(), icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
              { label: "RESPONSE TIME", value: "8.5", suffix: "min", icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{s.value}{s.suffix && <span className="text-lg ml-1">{s.suffix}</span>}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filter + Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              {filterTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeFilter === tab ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4" /> New Report
            </Button>
          </div>

          {/* Reports Feed */}
          <div className="space-y-3">
            {loading ? (
              <p className="text-center text-gray-500 py-12">Loading reports...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No reports found.</p>
            ) : (
              filtered.map((update) => {
                const config = statusConfig[update.status] || statusConfig.Info;
                const Icon = config.icon;
                return (
                  <div key={update.id} className={`${config.color} border rounded-xl p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${config.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.iconColor} ${config.iconBg}`}>{update.status}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{update.category}</span>
                          <span className="text-xs text-gray-500">{format(new Date(update.created_at), "HH:mm:ss")}</span>
                          <div className="ml-auto flex gap-1">
                            <button onClick={() => openEdit(update)} className="px-2 py-1 bg-white text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 border border-gray-200">
                              <Edit className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleDelete(update.id)} className="px-2 py-1 bg-white text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 border border-gray-200">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{update.title}</h4>
                        <p className="text-sm text-gray-700 mb-1">{update.content}</p>
                        <span className="text-xs text-gray-500">{format(new Date(update.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="bg-white border-gray-200 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gray-900">{editingUpdate ? "Edit Report" : "New Situation Report"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label className="text-gray-700">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
                <div><Label className="text-gray-700">Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="bg-white border-gray-200 text-gray-900" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-gray-700">Category</Label><select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
                  <div><Label className="text-gray-700">Status</Label><select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? "Saving..." : editingUpdate ? "Update Report" : "Submit Report"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* Flag/Reject reason dialog */}
      <Dialog open={!!actionDialog} onOpenChange={(o) => { if (!o) { setActionDialog(null); setActionReason(""); } }}>
        <DialogContent className="bg-white border-gray-200 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">
              {actionDialog?.action === "flag" ? "Flag Report for Review" : "Reject Report"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              {actionDialog?.action === "flag"
                ? "Flag this submission for supervisor review. The agent can revise and resubmit."
                : "Permanently reject this submission. Provide a clear reason for the agent."}
            </p>
            <div>
              <Label className="text-gray-700">Reason</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionDialog?.action === "flag" ? "e.g. EC8-A signature unclear, please re-upload" : "e.g. Vote count exceeds registered voters"}
                rows={3}
                className="bg-white border-gray-200 text-gray-900 mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setActionDialog(null); setActionReason(""); }} className="flex-1">Cancel</Button>
              <Button
                onClick={submitFlagOrReject}
                className={`flex-1 text-white ${actionDialog?.action === "flag" ? "bg-orange-600 hover:bg-orange-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {actionDialog?.action === "flag" ? "Flag Report" : "Reject Report"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSituationRoom;
