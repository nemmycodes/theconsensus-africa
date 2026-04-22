import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Calendar, MapPin, Vote, Plus, Trash2, FileUp, Trophy, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PARTIES = [
  "Accord", "Action Alliance", "AAC", "ADC", "ADP", "APC", "APGA", "APM", "APP",
  "Boot Party", "LP", "NNPP", "NRM", "PDP", "PRP", "SDP", "YPP", "ZLP",
];

const POSITIONS = [
  "Presidential",
  "Governorship",
  "Senate",
  "House of Representatives",
  "House of Assembly",
  "Chairman",
  "Councillor / Ward Council",
];

interface Candidate {
  id: string;
  name: string;
  sex: string;
  votes: number;
  verified: boolean;
}

const ElectionPrimariesForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [party, setParty] = useState("");
  const [position, setPosition] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: crypto.randomUUID(), name: "", sex: "", votes: 0, verified: false },
  ]);
  const [observations, setObservations] = useState("");
  const [collationFile, setCollationFile] = useState<File | null>(null);
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const totalVotes = candidates.reduce((s, c) => s + (c.votes || 0), 0);
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];
  const runnerUp = sorted[1];

  const updateCandidate = (id: string, patch: Partial<Candidate>) => {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const addCandidate = () => {
    setCandidates((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", sex: "", votes: 0, verified: false },
    ]);
  };

  const removeCandidate = (id: string) => {
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLiveLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast({ title: "Location captured" });
      },
      () => toast({ title: "Unable to get location", variant: "destructive" }),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    if (!date || !venue || !party || !position) {
      toast({ title: "Missing fields", description: "Date, venue, party and position are required.", variant: "destructive" });
      return;
    }
    if (!candidates.length || candidates.some((c) => !c.name)) {
      toast({ title: "Add at least one candidate with a name", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    let ec8aUrl: string | null = null;
    if (collationFile) {
      const path = `${user.id}/primaries-${Date.now()}-${collationFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("election-evidence")
        .upload(path, collationFile, { upsert: false });
      if (!uploadErr) ec8aUrl = path;
    }

    const payload = {
      type: "party_primary",
      date,
      venue,
      party,
      position,
      candidates,
      winner: winner ? { name: winner.name, votes: winner.votes } : null,
      runner_up: runnerUp ? { name: runnerUp.name, votes: runnerUp.votes } : null,
      total_votes: totalVotes,
      observations,
      live_location: liveLocation,
      ec8a_url: ec8aUrl,
    };

    // 1. Save to situation_updates feed
    const { error: updateErr } = await supabase.from("situation_updates").insert({
      title: `Party Primary: ${party} – ${position}`,
      content: JSON.stringify(payload),
      category: "Political",
      status: "Active",
      author_id: user.id,
    });

    // 2. Insert one election_reports row per candidate so admin verification queue can act
    const reportRows = candidates
      .filter((c) => c.name)
      .map((c) => ({
        agent_id: user.id,
        election_type: "party_primary" as const,
        election_date: date,
        state: "Plateau",
        lga: venue,
        ward: party,
        polling_unit: position,
        party,
        candidate_name: c.name,
        votes_recorded: c.votes,
        total_votes_cast: totalVotes,
        ec8a_url: ec8aUrl,
        latitude: liveLocation?.lat ?? null,
        longitude: liveLocation?.lng ?? null,
        notes: observations || null,
        status: "pending" as const,
      }));

    const { error: reportsErr } = await supabase.from("election_reports").insert(reportRows);

    setSubmitting(false);

    if (updateErr || reportsErr) {
      toast({
        title: "Error submitting primary",
        description: (updateErr || reportsErr)?.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Primary election results submitted!", description: "Awaiting admin verification." });
    navigate("/agent");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-black">Party Primary Elections</h1>
            <p className="text-primary text-sm mt-1">
              Conduct and collate primary election results for any political party.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Basics */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">Primary Details</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input placeholder="e.g. Jos Township Stadium" value={venue} onChange={(e) => setVenue(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Political Party</Label>
                  <Select value={party} onValueChange={setParty}>
                    <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                    <SelectContent>
                      {PARTIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Position Contesting</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Candidates */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-heading font-bold">Candidate Vote Collation</h2>
                </div>
                <Button size="sm" variant="outline" onClick={addCandidate} className="gap-1">
                  <Plus className="w-4 h-4" /> Add Candidate
                </Button>
              </div>

              <div className="space-y-3">
                {candidates.map((c, i) => (
                  <div key={c.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3 rounded-lg border border-border bg-secondary/30">
                    <div className="md:col-span-4 space-y-1">
                      <Label className="text-xs">Candidate Name #{i + 1}</Label>
                      <Input value={c.name} onChange={(e) => updateCandidate(c.id, { name: e.target.value })} placeholder="Full name" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Sex</Label>
                      <Select value={c.sex} onValueChange={(v) => updateCandidate(c.id, { sex: v })}>
                        <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Label className="text-xs">Votes Won</Label>
                      <Input
                        type="number"
                        min={0}
                        value={c.votes}
                        onChange={(e) => updateCandidate(c.id, { votes: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="md:col-span-3 flex items-center gap-2 pb-2">
                      <input
                        type="checkbox"
                        checked={c.verified}
                        onChange={(e) => updateCandidate(c.id, { verified: e.target.checked })}
                        id={`v-${c.id}`}
                      />
                      <Label htmlFor={`v-${c.id}`} className="text-xs cursor-pointer">Verified candidate</Label>
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button size="icon" variant="ghost" onClick={() => removeCandidate(c.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-primary" />
                  <p className="text-sm font-bold">Total Votes Cast</p>
                </div>
                <span className="px-4 py-2 rounded-lg border-2 border-primary bg-background font-heading font-bold text-lg min-w-[60px] text-center">
                  {totalVotes}
                </span>
              </div>
            </section>

            {/* Winner / Runner-up */}
            {(winner?.name || runnerUp?.name) && (
              <section className="bg-card border border-border rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-heading font-bold">Result Summary</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="rounded-xl border-2 border-primary bg-primary/5 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Winner</p>
                    <p className="text-2xl font-black mt-1">{winner?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{winner?.votes || 0} votes</p>
                  </div>
                  <div className="rounded-xl border border-border bg-secondary/30 p-5">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Runner-up</p>
                    <p className="text-2xl font-black mt-1">{runnerUp?.name || "—"}</p>
                    <p className="text-sm text-muted-foreground mt-1">{runnerUp?.votes || 0} votes</p>
                  </div>
                </div>
              </section>
            )}

            {/* Upload */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <FileUp className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">Upload Primaries Collation Form</h2>
              </div>
              <label className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 p-8 text-center cursor-pointer block hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => setCollationFile(e.target.files?.[0] || null)}
                />
                {collationFile ? (
                  <p className="text-sm font-semibold text-primary">{collationFile.name}</p>
                ) : (
                  <>
                    <FileUp className="w-10 h-10 text-primary mx-auto mb-2" />
                    <p className="text-sm"><span className="text-primary font-semibold">Click to upload</span> JPG, PNG or PDF</p>
                  </>
                )}
              </label>
            </section>

            {/* Live Location */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">Live Location</h2>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={handleGetLocation} className="gap-2">
                  <MapPin className="h-4 w-4" /> {liveLocation ? "Update Location" : "Capture Location"}
                </Button>
                {liveLocation && (
                  <p className="text-sm text-primary font-medium">
                    📍 {liveLocation.lat.toFixed(5)}, {liveLocation.lng.toFixed(5)}
                  </p>
                )}
              </div>
            </section>

            {/* Observations */}
            <section className="bg-card border border-border rounded-xl p-6 md:p-8">
              <Label className="text-base font-bold">Observations / Co-signers</Label>
              <Textarea
                className="mt-3"
                rows={4}
                placeholder="Note co-signing party officials, irregularities, or remarks…"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
            </section>

            <div className="flex items-center justify-between gap-4 pb-8">
              <Button variant="outline" onClick={() => navigate("/election-form")}>
                ← Back to Election Form
              </Button>
              <Button onClick={handleSubmit} disabled={submitting} className="font-bold gap-2">
                {submitting ? "Submitting…" : "Submit Primary Results"} <FileUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ElectionPrimariesForm;
