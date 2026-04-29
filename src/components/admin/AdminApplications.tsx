import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Award, ShieldCheck, Search, ExternalLink, CheckCircle2, XCircle, Clock } from "lucide-react";

interface App {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  agent_type: string;
  lga: string;
  ward: string;
  polling_unit: string;
  position_aspired: string | null;
  party_affiliation: string | null;
  manifesto_summary: string | null;
  prior_office_held: string | null;
  experience_details: string | null;
  has_previous_experience: boolean;
  attended_inec_training: boolean;
  available_voting_period: boolean;
  available_counting: boolean;
  id_proof_type: string | null;
  id_proof_url: string;
  declaration_signature: string;
  status: string;
  review_notes: string | null;
  created_at: string;
}

const AdminApplications = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [filter, setFilter] = useState<"all" | "mobilization_agent" | "aspirant">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<App | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [idUrl, setIdUrl] = useState<string | null>(null);

  const fetch = async () => {
    const { data } = await supabase.from("agent_recruitment_applications")
      .select("*").order("created_at", { ascending: false });
    setApps((data as App[]) || []);
  };

  useEffect(() => {
    fetch();
    const channel = supabase.channel("admin-apps")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_recruitment_applications" }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openDetail = async (app: App) => {
    setSelected(app);
    setReviewNotes(app.review_notes || "");
    if (app.id_proof_url) {
      const { data } = await supabase.storage.from("agent-recruitment-ids").createSignedUrl(app.id_proof_url, 3600);
      setIdUrl(data?.signedUrl || null);
    } else setIdUrl(null);
  };

  const decide = async (status: "approved" | "rejected") => {
    if (!selected) return;
    const { error } = await supabase.from("agent_recruitment_applications")
      .update({ status, review_notes: reviewNotes, reviewed_at: new Date().toISOString() } as any)
      .eq("id", selected.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Application ${status}` });
      setSelected(null);
      fetch();
    }
  };

  const filtered = apps.filter(a =>
    (filter === "all" || a.agent_type === filter) &&
    (statusFilter === "all" || a.status === statusFilter) &&
    (!search || [a.full_name, a.email, a.phone, a.lga, a.position_aspired]
      .filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase()))
  );

  const counts = {
    agents: apps.filter(a => a.agent_type !== "aspirant").length,
    aspirants: apps.filter(a => a.agent_type === "aspirant").length,
    pending: apps.filter(a => a.status === "pending").length,
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-emerald-100 text-emerald-700 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/>Approved</Badge>;
    if (s === "rejected") return <Badge className="bg-red-100 text-red-700 border-0"><XCircle className="w-3 h-3 mr-1"/>Rejected</Badge>;
    return <Badge className="bg-orange-100 text-orange-700 border-0"><Clock className="w-3 h-3 mr-1"/>Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black uppercase">Role Applications</h2>
        <p className="text-muted-foreground text-sm mt-1">Review Mobilization Agent and Aspirant submissions from members.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600"/><span className="text-xs uppercase text-muted-foreground">Agent Apps</span></div><p className="text-2xl font-black mt-1">{counts.agents}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600"/><span className="text-xs uppercase text-muted-foreground">Aspirants</span></div><p className="text-2xl font-black mt-1">{counts.aspirants}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-600"/><span className="text-xs uppercase text-muted-foreground">Awaiting Review</span></div><p className="text-2xl font-black mt-1">{counts.pending}</p></Card>
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {[["all","All"],["mobilization_agent","Agents"],["aspirant","Aspirants"]].map(([v,l]) => (
            <Button key={v} size="sm" variant={filter===v?"default":"outline"} onClick={() => setFilter(v as any)}>{l}</Button>
          ))}
        </div>
        <div className="flex gap-1">
          {["all","pending","approved","rejected"].map(s => (
            <Button key={s} size="sm" variant={statusFilter===s?"default":"outline"} onClick={() => setStatusFilter(s)} className="capitalize">{s}</Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, LGA, position…" className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Applicant</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">Position / PU</th>
                <th className="text-left px-5 py-3">LGA / Ward</th>
                <th className="text-left px-5 py-3">Submitted</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No applications match this filter.</td></tr>}
              {filtered.map(a => (
                <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <p className="font-semibold">{a.full_name}</p>
                    <p className="text-xs text-muted-foreground">{a.email} · {a.phone}</p>
                  </td>
                  <td className="px-5 py-3">
                    {a.agent_type === "aspirant"
                      ? <Badge className="bg-purple-100 text-purple-700 border-0"><ShieldCheck className="w-3 h-3 mr-1"/>Aspirant</Badge>
                      : <Badge className="bg-blue-100 text-blue-700 border-0"><Award className="w-3 h-3 mr-1"/>Agent</Badge>}
                  </td>
                  <td className="px-5 py-3 text-xs">{a.agent_type === "aspirant" ? a.position_aspired : a.polling_unit}</td>
                  <td className="px-5 py-3 text-xs">{a.lga} / {a.ward}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3">{statusBadge(a.status)}</td>
                  <td className="px-5 py-3 text-right"><Button size="sm" variant="outline" onClick={() => openDetail(a)}>Review</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.agent_type === "aspirant" ? <ShieldCheck className="w-5 h-5"/> : <Award className="w-5 h-5"/>}
                  {selected.full_name} — {selected.agent_type === "aspirant" ? "Aspirant" : "Mobilization Agent"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><strong>Email:</strong> {selected.email}</div>
                  <div><strong>Phone:</strong> {selected.phone}</div>
                  <div><strong>LGA:</strong> {selected.lga}</div>
                  <div><strong>Ward:</strong> {selected.ward}</div>
                  {selected.agent_type === "aspirant" ? (
                    <>
                      <div><strong>Position:</strong> {selected.position_aspired}</div>
                      <div><strong>Party:</strong> {selected.party_affiliation}</div>
                    </>
                  ) : (
                    <>
                      <div><strong>Polling Unit:</strong> {selected.polling_unit}</div>
                      <div><strong>Prior experience:</strong> {selected.has_previous_experience ? "Yes" : "No"}</div>
                      <div><strong>INEC training:</strong> {selected.attended_inec_training ? "Yes" : "No"}</div>
                      <div><strong>Avail voting:</strong> {selected.available_voting_period ? "Yes" : "No"}</div>
                      <div><strong>Avail counting:</strong> {selected.available_counting ? "Yes" : "No"}</div>
                    </>
                  )}
                </div>

                {selected.manifesto_summary && (
                  <div><strong>Manifesto:</strong><p className="mt-1 p-3 bg-muted rounded">{selected.manifesto_summary}</p></div>
                )}
                {selected.prior_office_held && (
                  <div><strong>Prior office:</strong> {selected.prior_office_held}</div>
                )}
                {selected.experience_details && selected.agent_type !== "aspirant" && (
                  <div><strong>Experience details:</strong><p className="mt-1 p-3 bg-muted rounded">{selected.experience_details}</p></div>
                )}

                <div>
                  <strong>ID Document ({selected.id_proof_type}):</strong>{" "}
                  {idUrl
                    ? <a href={idUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 inline-flex items-center gap-1">View ID <ExternalLink className="w-3 h-3"/></a>
                    : <span className="text-muted-foreground">No file</span>}
                </div>

                <div><strong>Signature:</strong> <em>{selected.declaration_signature}</em></div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Review Notes</label>
                  <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3} placeholder="Optional feedback to the applicant…" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => decide("approved")} className="flex-1 bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1"/>Approve</Button>
                  <Button onClick={() => decide("rejected")} variant="destructive" className="flex-1"><XCircle className="w-4 h-4 mr-1"/>Reject</Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApplications;
