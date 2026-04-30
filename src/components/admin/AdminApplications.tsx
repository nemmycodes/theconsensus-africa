import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Award, ShieldCheck, Search, ExternalLink, CheckCircle2, XCircle, Clock, HeartHandshake, Users } from "lucide-react";

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
  portrait_photo_url: string | null;
  declaration_signature: string;
  status: string;
  review_notes: string | null;
  created_at: string;
}

interface VolunteerApp {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  lga: string;
  ward: string;
  availability_areas: string[];
  availability_other: string | null;
  availability_hours_per_week: number | null;
  skills: string[];
  skills_other: string | null;
  motivation: string | null;
  candidates_supporting: string | null;
  previous_experience: string | null;
  relevant_skills: string | null;
  declaration_signature: string | null;
  status: string;
  review_notes: string | null;
  created_at: string;
}

const AdminApplications = () => {
  const { toast } = useToast();
  const [apps, setApps] = useState<App[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApp[]>([]);
  const [filter, setFilter] = useState<"all" | "mobilization_agent" | "aspirant" | "volunteer">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<App | null>(null);
  const [selectedVol, setSelectedVol] = useState<VolunteerApp | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [idUrl, setIdUrl] = useState<string | null>(null);
  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);

  const fetchAll = async () => {
    const [agentsRes, volsRes] = await Promise.all([
      supabase.from("agent_recruitment_applications").select("*").order("created_at", { ascending: false }),
      supabase.from("volunteer_registrations").select("*").order("created_at", { ascending: false }),
    ]);
    setApps((agentsRes.data as App[]) || []);
    setVolunteers((volsRes.data as VolunteerApp[]) || []);
  };

  useEffect(() => {
    fetchAll();
    const channel = supabase.channel("admin-apps")
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_recruitment_applications" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "volunteer_registrations" }, fetchAll)
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
    if (app.portrait_photo_url) {
      const { data } = await supabase.storage.from("agent-recruitment-ids").createSignedUrl(app.portrait_photo_url, 3600);
      setPortraitUrl(data?.signedUrl || null);
    } else setPortraitUrl(null);
  };

  const openVolunteer = (v: VolunteerApp) => {
    setSelectedVol(v);
    setReviewNotes(v.review_notes || "");
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
      fetchAll();
    }
  };

  const decideVolunteer = async (status: "approved" | "rejected") => {
    if (!selectedVol) return;
    const { error } = await supabase.from("volunteer_registrations")
      .update({ status, review_notes: reviewNotes, reviewed_at: new Date().toISOString() } as any)
      .eq("id", selectedVol.id);
    if (error) toast({ title: "Update failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: `Volunteer ${status}` });
      setSelectedVol(null);
      fetchAll();
    }
  };

  const matchesSearch = (s: string) => !search || s.toLowerCase().includes(search.toLowerCase());

  const filteredAgents = apps.filter(a =>
    (filter === "all" || filter === "mobilization_agent" || filter === "aspirant") &&
    (filter === "all" || a.agent_type === filter) &&
    (statusFilter === "all" || a.status === statusFilter) &&
    matchesSearch([a.full_name, a.email, a.phone, a.lga, a.position_aspired].filter(Boolean).join(" "))
  );

  const filteredVolunteers = volunteers.filter(v =>
    (filter === "all" || filter === "volunteer") &&
    (statusFilter === "all" || v.status === statusFilter) &&
    matchesSearch([v.full_name, v.email, v.phone, v.lga].filter(Boolean).join(" "))
  );

  const counts = {
    agents: apps.filter(a => a.agent_type !== "aspirant").length,
    aspirants: apps.filter(a => a.agent_type === "aspirant").length,
    volunteers: volunteers.length,
    pending: apps.filter(a => a.status === "pending").length + volunteers.filter(v => v.status === "pending").length,
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <Badge className="bg-emerald-100 text-emerald-700 border-0"><CheckCircle2 className="w-3 h-3 mr-1"/>Approved</Badge>;
    if (s === "rejected") return <Badge className="bg-red-100 text-red-700 border-0"><XCircle className="w-3 h-3 mr-1"/>Rejected</Badge>;
    return <Badge className="bg-orange-100 text-orange-700 border-0"><Clock className="w-3 h-3 mr-1"/>Pending</Badge>;
  };

  const showAgents = filter === "all" || filter === "mobilization_agent" || filter === "aspirant";
  const showVolunteers = filter === "all" || filter === "volunteer";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black uppercase">Role Applications</h2>
        <p className="text-muted-foreground text-sm mt-1">Review Agent, Aspirant and Volunteer submissions from members.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><Award className="w-4 h-4 text-emerald-600"/><span className="text-xs uppercase text-muted-foreground">Agents</span></div><p className="text-2xl font-black mt-1">{counts.agents}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600"/><span className="text-xs uppercase text-muted-foreground">Aspirants</span></div><p className="text-2xl font-black mt-1">{counts.aspirants}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><HeartHandshake className="w-4 h-4 text-rose-600"/><span className="text-xs uppercase text-muted-foreground">Volunteers</span></div><p className="text-2xl font-black mt-1">{counts.volunteers}</p></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-600"/><span className="text-xs uppercase text-muted-foreground">Awaiting Review</span></div><p className="text-2xl font-black mt-1">{counts.pending}</p></Card>
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-1">
          {[["all","All"],["mobilization_agent","Agents"],["aspirant","Aspirants"],["volunteer","Volunteers"]].map(([v,l]) => (
            <Button key={v} size="sm" variant={filter===v?"default":"outline"} onClick={() => setFilter(v as any)}>{l}</Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {["all","pending","approved","rejected"].map(s => (
            <Button key={s} size="sm" variant={statusFilter===s?"default":"outline"} onClick={() => setStatusFilter(s)} className="capitalize">{s}</Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search name, email, LGA, position…" className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </Card>

      {showAgents && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/20 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
            <Award className="w-3.5 h-3.5"/> Agents & Aspirants ({filteredAgents.length})
          </div>
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
                {filteredAgents.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No applications match this filter.</td></tr>}
                {filteredAgents.map(a => (
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
      )}

      {showVolunteers && (
        <Card className="overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/20 text-xs uppercase font-bold tracking-wider flex items-center gap-2">
            <HeartHandshake className="w-3.5 h-3.5 text-rose-600"/> Volunteers ({filteredVolunteers.length})
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3">Volunteer</th>
                  <th className="text-left px-5 py-3">LGA / Ward</th>
                  <th className="text-left px-5 py-3">Hours/wk</th>
                  <th className="text-left px-5 py-3">Skills</th>
                  <th className="text-left px-5 py-3">Submitted</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No volunteer applications match this filter.</td></tr>}
                {filteredVolunteers.map(v => (
                  <tr key={v.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <p className="font-semibold">{v.full_name}</p>
                      <p className="text-xs text-muted-foreground">{v.email} · {v.phone}</p>
                    </td>
                    <td className="px-5 py-3 text-xs">{v.lga} / {v.ward || "—"}</td>
                    <td className="px-5 py-3 text-xs">{v.availability_hours_per_week ?? "—"}</td>
                    <td className="px-5 py-3 text-xs max-w-[200px] truncate">{(v.skills || []).slice(0, 3).join(", ") || "—"}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-3">{statusBadge(v.status)}</td>
                    <td className="px-5 py-3 text-right"><Button size="sm" variant="outline" onClick={() => openVolunteer(v)}>Review</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Agent / Aspirant detail dialog */}
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
                {portraitUrl && (
                  <div className="flex items-center gap-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <img
                      src={portraitUrl}
                      alt={`Portrait of ${selected.full_name}`}
                      className="w-24 h-24 rounded-lg object-cover border-2 border-emerald-300 shrink-0"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-emerald-700 font-bold">Applicant Portrait</p>
                      <p className="font-semibold text-base text-gray-900">{selected.full_name}</p>
                      <a href={portraitUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 inline-flex items-center gap-1 mt-1">
                        Open full size <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
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

      {/* Volunteer detail dialog */}
      <Dialog open={!!selectedVol} onOpenChange={() => setSelectedVol(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedVol && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-rose-600"/>
                  {selectedVol.full_name} — Volunteer
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><strong>Email:</strong> {selectedVol.email}</div>
                  <div><strong>Phone:</strong> {selectedVol.phone}</div>
                  <div><strong>LGA:</strong> {selectedVol.lga}</div>
                  <div><strong>Ward:</strong> {selectedVol.ward || "—"}</div>
                  <div><strong>Hours / week:</strong> {selectedVol.availability_hours_per_week ?? "—"}</div>
                  <div><strong>Submitted:</strong> {new Date(selectedVol.created_at).toLocaleDateString()}</div>
                </div>

                <div>
                  <strong>Availability areas:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedVol.availability_areas || []).map(a => (
                      <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                    ))}
                    {selectedVol.availability_other && <Badge variant="outline" className="text-xs">Other: {selectedVol.availability_other}</Badge>}
                    {(!selectedVol.availability_areas?.length && !selectedVol.availability_other) && <span className="text-muted-foreground">—</span>}
                  </div>
                </div>

                <div>
                  <strong>Skills:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(selectedVol.skills || []).map(s => (
                      <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                    ))}
                    {selectedVol.skills_other && <Badge variant="outline" className="text-xs">Other: {selectedVol.skills_other}</Badge>}
                    {(!selectedVol.skills?.length && !selectedVol.skills_other) && <span className="text-muted-foreground">—</span>}
                  </div>
                </div>

                {selectedVol.motivation && (
                  <div><strong>Motivation:</strong><p className="mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedVol.motivation}</p></div>
                )}
                {selectedVol.candidates_supporting && (
                  <div><strong>Candidates supporting:</strong><p className="mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedVol.candidates_supporting}</p></div>
                )}
                {selectedVol.previous_experience && (
                  <div><strong>Previous experience:</strong><p className="mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedVol.previous_experience}</p></div>
                )}
                {selectedVol.relevant_skills && (
                  <div><strong>Relevant skills:</strong><p className="mt-1 p-3 bg-muted rounded whitespace-pre-wrap">{selectedVol.relevant_skills}</p></div>
                )}
                {selectedVol.declaration_signature && (
                  <div><strong>Signature:</strong> <em>{selectedVol.declaration_signature}</em></div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-1">Review Notes</label>
                  <Textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={3} placeholder="Optional feedback to the volunteer…" />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => decideVolunteer("approved")} className="flex-1 bg-emerald-600 hover:bg-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1"/>Approve</Button>
                  <Button onClick={() => decideVolunteer("rejected")} variant="destructive" className="flex-1"><XCircle className="w-4 h-4 mr-1"/>Reject</Button>
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
