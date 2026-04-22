import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, FileDown, CheckCircle2, XCircle, Star, Loader2 } from "lucide-react";

type App = {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  lga: string;
  ward: string;
  polling_unit: string;
  agent_type: string;
  available_voting_period: boolean;
  available_counting: boolean;
  has_previous_experience: boolean;
  experience_details: string | null;
  attended_inec_training: boolean;
  training_date: string | null;
  id_proof_type: string | null;
  id_proof_url: string;
  declaration_signature: string;
  declaration_date: string;
  status: "pending" | "approved" | "rejected" | "shortlisted";
  review_notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  shortlisted: "bg-blue-100 text-blue-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

const AdminAgentRecruitment = () => {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<App | null>(null);
  const [idUrl, setIdUrl] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_recruitment_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setApps((data as App[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (a: App) => {
    setSelected(a);
    setNotes(a.review_notes || "");
    const { data } = await supabase.storage
      .from("agent-recruitment-ids")
      .createSignedUrl(a.id_proof_url, 3600);
    setIdUrl(data?.signedUrl || "");
  };

  const updateStatus = async (status: App["status"]) => {
    if (!selected) return;
    setUpdating(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("agent_recruitment_applications")
      .update({
        status,
        review_notes: notes || null,
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selected.id);
    setUpdating(false);
    if (error) return toast.error(error.message);
    toast.success(`Application ${status}`);
    setSelected(null);
    load();
  };

  const exportCsv = () => {
    const rows = filtered.map((a) => ({
      submitted: new Date(a.created_at).toISOString(),
      name: a.full_name, phone: a.phone, email: a.email,
      lga: a.lga, ward: a.ward, polling_unit: a.polling_unit,
      agent_type: a.agent_type,
      available_voting: a.available_voting_period,
      available_counting: a.available_counting,
      experience: a.has_previous_experience,
      inec_training: a.attended_inec_training,
      status: a.status,
    }));
    const headers = Object.keys(rows[0] || { name: "" });
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String((r as any)[h] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = `agent-applications-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);
  const counts = {
    all: apps.length,
    pending: apps.filter((a) => a.status === "pending").length,
    shortlisted: apps.filter((a) => a.status === "shortlisted").length,
    approved: apps.filter((a) => a.status === "approved").length,
    rejected: apps.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Recruitment</h1>
          <p className="text-sm text-gray-500">Polling unit agent applications submitted from the public form.</p>
        </div>
        <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><FileDown className="w-4 h-4 mr-2" /> Export CSV</Button>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({counts.shortlisted})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No applications.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Applicant</th>
                <th className="p-3">Polling Unit</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Submitted</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{a.full_name}</div>
                    <div className="text-xs text-gray-500">{a.email} · {a.phone}</div>
                  </td>
                  <td className="p-3 text-gray-700">
                    <div>{a.polling_unit}</div>
                    <div className="text-xs text-gray-500">{a.ward}, {a.lga}</div>
                  </td>
                  <td className="p-3">{a.agent_type}</td>
                  <td className="p-3"><Badge className={STATUS_COLORS[a.status]}>{a.status}</Badge></td>
                  <td className="p-3 text-gray-500 text-xs">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => openDetail(a)}><Eye className="w-4 h-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.full_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone" value={selected.phone} />
                  <Field label="Email" value={selected.email} />
                  <Field label="LGA" value={selected.lga} />
                  <Field label="Ward" value={selected.ward} />
                  <Field label="Polling Unit" value={selected.polling_unit} />
                  <Field label="Agent Type" value={selected.agent_type} />
                  <Field label="Available (voting)" value={selected.available_voting_period ? "Yes" : "No"} />
                  <Field label="Available (counting)" value={selected.available_counting ? "Yes" : "No"} />
                  <Field label="Previous experience" value={selected.has_previous_experience ? "Yes" : "No"} />
                  <Field label="INEC trained" value={selected.attended_inec_training ? `Yes${selected.training_date ? ` (${selected.training_date})` : ""}` : "No"} />
                  <Field label="ID Type" value={selected.id_proof_type || "—"} />
                  <Field label="Signed" value={`${selected.declaration_signature} on ${selected.declaration_date}`} />
                </div>
                {selected.experience_details && (
                  <div><div className="text-xs text-gray-500 mb-1">Experience details</div><div className="p-3 bg-gray-50 rounded">{selected.experience_details}</div></div>
                )}
                <div>
                  <div className="text-xs text-gray-500 mb-1">ID Proof</div>
                  {idUrl ? <a href={idUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline text-sm">Open ID document ↗</a> : <span className="text-gray-400">Loading…</span>}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Review notes</div>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button size="sm" variant="outline" onClick={() => updateStatus("shortlisted")} disabled={updating}><Star className="w-4 h-4 mr-1" /> Shortlist</Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateStatus("approved")} disabled={updating}><CheckCircle2 className="w-4 h-4 mr-1" /> Approve</Button>
                  <Button size="sm" variant="destructive" onClick={() => updateStatus("rejected")} disabled={updating}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div><div className="text-xs text-gray-500">{label}</div><div className="text-gray-900">{value}</div></div>
);

export default AdminAgentRecruitment;
