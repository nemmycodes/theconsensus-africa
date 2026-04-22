import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Trophy, Medal, MapPin, Upload, Plus, Trash2, FileText,
  CheckCircle2, AlertCircle, Loader2, Crosshair,
} from "lucide-react";

const PARTIES = ["APC", "PDP", "LP", "NNPP", "APGA", "ADC", "SDP", "YPP", "PRP", "Other"];
const POSITIONS = [
  "Presidential", "Vice Presidential", "Gubernatorial", "Deputy Governor",
  "Senator", "House of Representatives", "House of Assembly",
  "Chairman", "Vice Chairman", "Councillor", "Ward Officer",
];

type Contestant = { full_name: string; sex: "Male" | "Female" | "Other"; votes: number };

const PrimariesCollation = () => {
  const { user, isAdmin, isAgent, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const canSubmit = !!user && (isAgent || isAdmin || isSuperAdmin);

  const [tab, setTab] = useState<"public" | "submit">("public");
  const [verifiedList, setVerifiedList] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form state
  const [form, setForm] = useState({
    political_party: "", position_contested: "",
    election_date: new Date().toISOString().slice(0, 10),
    venue: "", lga: "", ward: "",
    latitude: "" as string, longitude: "" as string,
    exco_name: "", exco_position: "", exco_phone: "",
    exco_date: new Date().toISOString().slice(0, 10),
    winner_name: "", runner_up_name: "", remarks: "",
  });
  const [contestants, setContestants] = useState<Contestant[]>([
    { full_name: "", sex: "Male", votes: 0 },
    { full_name: "", sex: "Male", votes: 0 },
  ]);
  const [collationFile, setCollationFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalVotes = useMemo(
    () => contestants.reduce((s, c) => s + (Number(c.votes) || 0), 0),
    [contestants],
  );

  const loadVerified = async () => {
    setLoadingList(true);
    const { data } = await supabase
      .from("primaries_collation")
      .select("*, primaries_contestants(*)")
      .eq("status", "verified")
      .order("election_date", { ascending: false });
    setVerifiedList(data || []);
    setLoadingList(false);
  };

  useEffect(() => { loadVerified(); }, []);

  const captureLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm((f) => ({ ...f, latitude: p.coords.latitude.toFixed(6), longitude: p.coords.longitude.toFixed(6) }));
        toast.success("Live location captured");
      },
      () => toast.error("Could not capture location"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const updateContestant = (i: number, k: keyof Contestant, v: any) => {
    setContestants((prev) => prev.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)));
  };

  const addContestant = () => setContestants((p) => [...p, { full_name: "", sex: "Male", votes: 0 }]);
  const removeContestant = (i: number) => setContestants((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    if (!form.political_party || !form.position_contested || !form.venue || !form.exco_name || !form.exco_position) {
      return toast.error("Fill all required fields");
    }
    const validContestants = contestants.filter((c) => c.full_name.trim());
    if (validContestants.length < 2) return toast.error("Add at least 2 contestants");

    setSubmitting(true);
    try {
      let formUrl: string | null = null;
      if (collationFile) {
        if (collationFile.size > 10 * 1024 * 1024) throw new Error("File must be under 10MB");
        const ext = collationFile.name.split(".").pop() || "bin";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("primaries-collation")
          .upload(path, collationFile, { contentType: collationFile.type });
        if (upErr) throw upErr;
        formUrl = path;
      }

      const { data: created, error: insErr } = await supabase
        .from("primaries_collation")
        .insert({
          political_party: form.political_party,
          position_contested: form.position_contested,
          election_date: form.election_date,
          venue: form.venue,
          lga: form.lga || null,
          ward: form.ward || null,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
          exco_name: form.exco_name,
          exco_position: form.exco_position,
          exco_phone: form.exco_phone || null,
          exco_date: form.exco_date,
          collation_form_url: formUrl,
          total_votes: totalVotes,
          winner_name: form.winner_name || null,
          runner_up_name: form.runner_up_name || null,
          remarks: form.remarks || null,
          submitted_by: user.id,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      const { error: cErr } = await supabase.from("primaries_contestants").insert(
        validContestants.map((c) => ({
          primaries_id: created.id,
          full_name: c.full_name.trim(),
          sex: c.sex,
          votes: Number(c.votes) || 0,
        })),
      );
      if (cErr) throw cErr;

      await supabase.from("audit_logs").insert({
        actor_id: user.id, actor_email: user.email,
        action: "primaries.submit", target_type: "primaries_collation", target_id: created.id,
        metadata: { party: form.political_party, position: form.position_contested },
      });

      toast.success("Primaries collation submitted for verification");
      setTab("public");
      loadVerified();
      // reset form
      setForm({ ...form, winner_name: "", runner_up_name: "", remarks: "" });
      setContestants([{ full_name: "", sex: "Male", votes: 0 }, { full_name: "", sex: "Male", votes: 0 }]);
      setCollationFile(null);
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 container mx-auto px-4 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
            <Trophy className="w-4 h-4" /> Party Primaries Collation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Live Primaries Results</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verified collation of party primaries across Plateau State. All entries are reviewed by administrators before public release.
          </p>
        </motion.div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="space-y-6">
          <TabsList className="mx-auto grid grid-cols-2 max-w-md">
            <TabsTrigger value="public">Verified Results ({verifiedList.length})</TabsTrigger>
            <TabsTrigger value="submit">Submit Collation</TabsTrigger>
          </TabsList>

          <TabsContent value="public" className="space-y-4">
            {loadingList ? (
              <div className="py-16 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>
            ) : verifiedList.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">No verified primaries collations yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {verifiedList.map((p) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-border p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-emerald-100 text-emerald-700">{p.political_party}</Badge>
                          <Badge variant="outline">{p.position_contested}</Badge>
                        </div>
                        <h3 className="font-bold mt-2">{p.venue}</h3>
                        <p className="text-xs text-muted-foreground">{p.election_date} · {p.lga || "—"}</p>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    {p.winner_name && (
                      <div className="flex items-center gap-2 text-sm mb-1"><Trophy className="w-4 h-4 text-amber-500" /> <strong>Winner:</strong> {p.winner_name}</div>
                    )}
                    {p.runner_up_name && (
                      <div className="flex items-center gap-2 text-sm mb-2"><Medal className="w-4 h-4 text-gray-500" /> <strong>Runner-up:</strong> {p.runner_up_name}</div>
                    )}
                    <div className="text-sm text-muted-foreground mb-2">Total votes: <strong className="text-foreground">{p.total_votes}</strong></div>
                    {p.primaries_contestants?.length > 0 && (
                      <div className="space-y-1 mt-3 pt-3 border-t">
                        {p.primaries_contestants
                          .sort((a: any, b: any) => b.votes - a.votes)
                          .map((c: any) => (
                            <div key={c.id} className="flex justify-between text-xs">
                              <span>{c.full_name} <span className="text-muted-foreground">({c.sex})</span></span>
                              <span className="font-mono">{c.votes}</span>
                            </div>
                          ))}
                      </div>
                    )}
                    {p.remarks && <p className="text-xs italic text-muted-foreground mt-3">"{p.remarks}"</p>}
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submit">
            {!canSubmit ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
                <AlertCircle className="w-10 h-10 text-amber-600 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Restricted Access</h3>
                <p className="text-sm text-muted-foreground mb-4">Only verified Agents and Administrators can submit primaries collation.</p>
                <Button onClick={() => navigate("/login")}>Log in</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 md:p-8 space-y-8 shadow-sm">
                {/* Primary details */}
                <section className="space-y-4">
                  <h2 className="text-lg font-bold border-b pb-2">Primary Election Details</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Political Party *</Label>
                      <Select value={form.political_party} onValueChange={(v) => setForm({ ...form, political_party: v })}>
                        <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                        <SelectContent>{PARTIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Position Contested *</Label>
                      <Select value={form.position_contested} onValueChange={(v) => setForm({ ...form, position_contested: v })}>
                        <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                        <SelectContent>{POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Date *</Label><Input type="date" value={form.election_date} onChange={(e) => setForm({ ...form, election_date: e.target.value })} /></div>
                    <div><Label>Venue *</Label><Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
                    <div><Label>LGA</Label><Input value={form.lga} onChange={(e) => setForm({ ...form, lga: e.target.value })} /></div>
                    <div><Label>Ward</Label><Input value={form.ward} onChange={(e) => setForm({ ...form, ward: e.target.value })} /></div>
                  </div>
                </section>

                {/* Live location */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold border-b pb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Live Location</h2>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[140px]"><Label>Latitude</Label><Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
                    <div className="flex-1 min-w-[140px]"><Label>Longitude</Label><Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
                    <Button type="button" variant="outline" onClick={captureLocation}><Crosshair className="w-4 h-4 mr-2" /> Capture GPS</Button>
                  </div>
                </section>

                {/* Contestants */}
                <section className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-lg font-bold">Contestants & Votes</h2>
                    <Button type="button" size="sm" variant="outline" onClick={addContestant}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                    {contestants.map((c, i) => (
                      <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 bg-muted/40 rounded-lg">
                        <div className="col-span-12 md:col-span-5"><Label className="text-xs">Name</Label><Input value={c.full_name} onChange={(e) => updateContestant(i, "full_name", e.target.value)} /></div>
                        <div className="col-span-5 md:col-span-3"><Label className="text-xs">Sex</Label>
                          <Select value={c.sex} onValueChange={(v) => updateContestant(i, "sex", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-5 md:col-span-3"><Label className="text-xs">Votes</Label><Input type="number" min={0} value={c.votes} onChange={(e) => updateContestant(i, "votes", Number(e.target.value))} /></div>
                        <div className="col-span-2 md:col-span-1">
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeContestant(i)} disabled={contestants.length <= 2}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-right text-sm">Total Votes: <strong className="text-emerald-700 text-lg">{totalVotes}</strong></div>
                </section>

                {/* Winner / runner-up / remarks */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold border-b pb-2">Outcome</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Winner</Label><Input value={form.winner_name} onChange={(e) => setForm({ ...form, winner_name: e.target.value })} placeholder="Name of winner" /></div>
                    <div><Label>Runner-up</Label><Input value={form.runner_up_name} onChange={(e) => setForm({ ...form, runner_up_name: e.target.value })} placeholder="Name of runner-up" /></div>
                  </div>
                  <div><Label>Remarks</Label><Textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
                </section>

                {/* Lead party EXCO */}
                <section className="space-y-3">
                  <h2 className="text-lg font-bold border-b pb-2">Lead Party EXCO Coordinator</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label>Name *</Label><Input value={form.exco_name} onChange={(e) => setForm({ ...form, exco_name: e.target.value })} /></div>
                    <div><Label>Position *</Label><Input value={form.exco_position} onChange={(e) => setForm({ ...form, exco_position: e.target.value })} /></div>
                    <div><Label>Phone</Label><Input value={form.exco_phone} onChange={(e) => setForm({ ...form, exco_phone: e.target.value })} /></div>
                    <div><Label>Date</Label><Input type="date" value={form.exco_date} onChange={(e) => setForm({ ...form, exco_date: e.target.value })} /></div>
                  </div>
                </section>

                {/* Upload */}
                <section className="space-y-2">
                  <h2 className="text-lg font-bold border-b pb-2">Upload Collation Form</h2>
                  <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm flex-1 truncate">{collationFile ? collationFile.name : "Click to upload signed collation form (PDF/image, max 10MB)"}</span>
                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setCollationFile(e.target.files?.[0] || null)} />
                  </label>
                </section>

                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  {submitting ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</>) : (<><FileText className="w-4 h-4 mr-2" /> Submit for Verification</>)}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default PrimariesCollation;
