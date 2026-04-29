import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Upload, CheckCircle2, Clock, XCircle, Vote } from "lucide-react";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const POSITIONS = [
  "President", "Vice President", "Governor", "Deputy Governor",
  "Senator", "House of Representatives Member", "State House of Assembly Member",
  "Local Government Chairman", "Vice Chairman", "Councillor",
];

interface ExistingApp {
  id: string;
  status: string;
  created_at: string;
  position_aspired: string | null;
  review_notes: string | null;
}

const MemberApplyAspirant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<ExistingApp | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [pollingUnit, setPollingUnit] = useState("");
  const [position, setPosition] = useState(POSITIONS[0]);
  const [partyAffiliation, setPartyAffiliation] = useState("The Consensus");
  const [priorOffice, setPriorOffice] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [idType, setIdType] = useState("National ID (NIN)");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    supabase.from("agent_recruitment_applications")
      .select("id,status,created_at,position_aspired,review_notes")
      .eq("user_id", user.id)
      .eq("agent_type", "aspirant")
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setExisting(data as ExistingApp); });
    supabase.from("profiles").select("full_name,phone,lga,ward").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setLga(data.lga || "");
          setWard(data.ward || "");
        }
      });
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!fullName || !phone || !lga || !position || !manifesto || !signature) {
      toast({ title: "Missing fields", description: "Please complete the required fields.", variant: "destructive" });
      return;
    }
    if (!idFile) {
      toast({ title: "ID proof required", variant: "destructive" });
      return;
    }
    setLoading(true);

    const path = `${user.id}/aspirant-${Date.now()}-${idFile.name}`;
    const { error: upErr } = await supabase.storage.from("agent-recruitment-ids").upload(path, idFile, { upsert: false });
    if (upErr) {
      toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("agent_recruitment_applications").insert({
      user_id: user.id,
      full_name: fullName,
      email,
      phone,
      lga,
      ward: ward || "N/A",
      polling_unit: pollingUnit || "N/A",
      agent_type: "aspirant",
      position_aspired: position,
      party_affiliation: partyAffiliation,
      prior_office_held: priorOffice || null,
      manifesto_summary: manifesto,
      has_previous_experience: !!priorOffice,
      experience_details: priorOffice || null,
      attended_inec_training: false,
      available_voting_period: false,
      available_counting: false,
      id_proof_type: idType,
      id_proof_url: path,
      declaration_signature: signature,
      status: "pending",
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Aspirant application submitted", description: "Vetting committee will review and contact you." });
      const { data } = await supabase.from("agent_recruitment_applications")
        .select("id,status,created_at,position_aspired,review_notes")
        .eq("user_id", user.id).eq("agent_type", "aspirant")
        .order("created_at",{ascending:false}).limit(1).maybeSingle();
      if (data) setExisting(data as ExistingApp);
    }
  };

  if (existing) {
    const statusMap: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: "bg-orange-100 text-orange-700", label: "Under Vetting" },
      approved: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Not Cleared" },
    };
    const s = statusMap[existing.status] || statusMap.pending;
    const SIcon = s.icon;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <h2 className="text-2xl font-black">Aspirant Application</h2>
        </div>
        <Card className="p-8 text-center max-w-2xl">
          <SIcon className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <Badge className={`${s.color} mb-3 border-0`}>{s.label}</Badge>
          <h3 className="text-xl font-bold mb-2">Declared aspirant for {existing.position_aspired}</h3>
          <p className="text-sm text-muted-foreground">
            Submitted on {new Date(existing.created_at).toLocaleDateString()}.
          </p>
          {existing.review_notes && (
            <div className="mt-4 p-3 bg-muted rounded text-left text-sm">
              <strong>Vetting committee note:</strong> {existing.review_notes}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-emerald-600" />
        <div>
          <h2 className="text-2xl font-black">Aspirant Application</h2>
          <p className="text-sm text-muted-foreground">
            Declare your intent to contest an elective position under the Consensus banner. Our vetting committee will review.
          </p>
        </div>
      </div>

      <Card className="p-6 space-y-5">
        <h3 className="font-bold">Personal Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Full Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} disabled /></div>
          <div><Label>Phone *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </div>
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-bold flex items-center gap-2"><Vote className="w-4 h-4" /> Position Sought</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Position Aspired *</Label>
            <select value={position} onChange={e => setPosition(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <Label>Party Affiliation</Label>
            <Input value={partyAffiliation} onChange={e => setPartyAffiliation(e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Constituency / Catchment Area *</Label>
          <p className="text-xs text-muted-foreground mb-2">Select the LGA/Ward representing your aspired constituency.</p>
          <InecLocationPicker
            lgaName={lga}
            wardName={ward}
            puName={pollingUnit}
            showPU={false}
            required
            onChange={({ lga: l, ward: w, pu }) => { setLga(l); setWard(w); setPollingUnit(pu); }}
          />
        </div>
        <div>
          <Label>Prior Public Office or Leadership Role (optional)</Label>
          <Input value={priorOffice} onChange={e => setPriorOffice(e.target.value)}
            placeholder="e.g. Councillor 2019–2023; SUG President 2017" />
        </div>
        <div>
          <Label>Manifesto Summary *</Label>
          <Textarea rows={5} value={manifesto} onChange={e => setManifesto(e.target.value)}
            placeholder="In 3–6 sentences, describe what you intend to deliver if elected." />
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> ID Verification *</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>ID Type</Label>
            <select value={idType} onChange={e => setIdType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option>National ID (NIN)</option>
              <option>Voter's Card (PVC)</option>
              <option>International Passport</option>
              <option>Driver's License</option>
            </select>
          </div>
          <div>
            <Label>Upload ID (image/PDF, max 10MB)</Label>
            <Input type="file" accept="image/*,application/pdf"
              onChange={e => {
                const f = e.target.files?.[0]; if (!f) return;
                if (f.size > 10*1024*1024) { toast({title:"File too large",variant:"destructive"}); return; }
                setIdFile(f);
              }} />
            {idFile && <p className="text-xs text-emerald-600 mt-1">✓ {idFile.name}</p>}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Declaration *</h3>
        <p className="text-sm text-muted-foreground">
          I declare that I am of sound mind, free from disqualifying convictions, and committed to
          contesting this position under the values of The Consensus.
        </p>
        <div>
          <Label>Sign by typing your full name</Label>
          <Input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name as signature" />
        </div>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full md:w-auto">
        {loading ? "Submitting…" : "Submit Aspirant Application"}
      </Button>
    </div>
  );
};

export default MemberApplyAspirant;
