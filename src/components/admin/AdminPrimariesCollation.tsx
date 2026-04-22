import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, CheckCircle2, XCircle, Loader2, FileText, Trophy, MapPin } from "lucide-react";

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
  not_verified: "bg-red-100 text-red-700",
};

const AdminPrimariesCollation = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);
  const [fileUrl, setFileUrl] = useState("");
  const [reason, setReason] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("primaries_collation")
      .select("*, primaries_contestants(*)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setList(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const open = async (p: any) => {
    setSelected(p);
    setReason(p.remarks || "");
    setFileUrl("");
    if (p.collation_form_url) {
      const { data } = await supabase.storage.from("primaries-collation").createSignedUrl(p.collation_form_url, 3600);
      setFileUrl(data?.signedUrl || "");
    }
  };

  const setStatus = async (status: "verified" | "not_verified") => {
    if (!selected) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("primaries_collation")
      .update({ status, verified_by: user?.id, verified_at: new Date().toISOString(), remarks: reason || null })
      .eq("id", selected.id);
    if (error) return toast.error(error.message);
    await supabase.from("audit_logs").insert({
      actor_id: user?.id, actor_email: user?.email,
      action: `primaries.${status}`, target_type: "primaries_collation", target_id: selected.id,
    });
    toast.success(`Marked ${status.replace("_", " ")}`);
    setSelected(null);
    load();
  };

  const filtered = filter === "all" ? list : list.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Primaries Collation</h1>
        <p className="text-sm text-gray-500">Review party primaries submissions and publish verified results.</p>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({list.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({list.filter((p) => p.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({list.filter((p) => p.status === "verified").length})</TabsTrigger>
          <TabsTrigger value="not_verified">Rejected ({list.filter((p) => p.status === "not_verified").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No entries.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3">Party / Position</th>
                <th className="p-3">Venue</th>
                <th className="p-3">Date</th>
                <th className="p-3">Votes</th>
                <th className="p-3">Status</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{p.political_party}</div>
                    <div className="text-xs text-gray-500">{p.position_contested}</div>
                  </td>
                  <td className="p-3">{p.venue} <div className="text-xs text-gray-500">{p.lga || "—"}</div></td>
                  <td className="p-3 text-xs">{p.election_date}</td>
                  <td className="p-3 font-mono">{p.total_votes}</td>
                  <td className="p-3"><Badge className={STATUS_COLOR[p.status]}>{p.status}</Badge></td>
                  <td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => open(p)}><Eye className="w-4 h-4" /></Button></td>
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
              <DialogHeader><DialogTitle>{selected.political_party} · {selected.position_contested}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Venue" value={selected.venue} />
                  <Field label="Date" value={selected.election_date} />
                  <Field label="LGA / Ward" value={`${selected.lga || "—"} · ${selected.ward || "—"}`} />
                  <Field label="Total Votes" value={String(selected.total_votes)} />
                  <Field label="Winner" value={selected.winner_name || "—"} />
                  <Field label="Runner-up" value={selected.runner_up_name || "—"} />
                </div>
                {(selected.latitude && selected.longitude) && (
                  <a className="text-xs text-emerald-700 inline-flex items-center gap-1" target="_blank" rel="noreferrer"
                    href={`https://maps.google.com/?q=${selected.latitude},${selected.longitude}`}>
                    <MapPin className="w-3 h-3" /> {selected.latitude}, {selected.longitude}
                  </a>
                )}

                <div className="bg-amber-50 p-3 rounded">
                  <div className="text-xs font-bold text-amber-700 mb-1">Lead EXCO Coordinator</div>
                  <div>{selected.exco_name} — {selected.exco_position}</div>
                  <div className="text-xs text-gray-600">{selected.exco_phone || "—"} · {selected.exco_date}</div>
                </div>

                <div>
                  <div className="text-xs font-bold mb-2">Contestants</div>
                  <div className="space-y-1">
                    {selected.primaries_contestants?.sort((a: any, b: any) => b.votes - a.votes).map((c: any) => (
                      <div key={c.id} className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                        <span>{c.full_name} <Badge variant="outline" className="ml-2 text-xs">{c.sex}</Badge></span>
                        <span className="font-mono font-semibold">{c.votes}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {fileUrl && <a href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-700 text-sm"><FileText className="w-4 h-4" /> Open collation form ↗</a>}

                <div>
                  <div className="text-xs font-bold mb-1">Remarks</div>
                  <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
                </div>

                <div className="flex gap-2 pt-3 border-t">
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setStatus("verified")}><CheckCircle2 className="w-4 h-4 mr-1" /> Verify & Publish</Button>
                  <Button variant="destructive" onClick={() => setStatus("not_verified")}><XCircle className="w-4 h-4 mr-1" /> Reject</Button>
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
  <div><div className="text-xs text-gray-500">{label}</div><div className="font-medium">{value}</div></div>
);

export default AdminPrimariesCollation;
