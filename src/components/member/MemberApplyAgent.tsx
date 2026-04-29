import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Award, ShieldCheck, Upload, CheckCircle2, Clock, XCircle } from "lucide-react";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const AGENT_ROLES = [
  "Presiding Officer",
  "Assistant Presiding Officer",
  "Poll Clerk",
  "Security Officer",
];

interface ExistingApp {
  id: string;
  status: string;
  agent_type: string;
  created_at: string;
  review_notes: string | null;
}

const MemberApplyAgent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<ExistingApp | null>(null);

  // form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [pollingUnit, setPollingUnit] = useState("");
  const [agentRole, setAgentRole] = useState(AGENT_ROLES[0]);
  const [hasExperience, setHasExperience] = useState(false);
  const [experienceDetails, setExperienceDetails] = useState("");
  const [attendedTraining, setAttendedTraining] = useState(false);
  const [trainingDate, setTrainingDate] = useState("");
  const [availableVoting, setAvailableVoting] = useState(false);
  const [availableCounting, setAvailableCounting] = useState(false);
  const [idType, setIdType] = useState("National ID (NIN)");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [signature, setSignature] = useState("");

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    supabase.from("agent_recruitment_applications")
      .select("id,status,agent_type,created_at,review_notes")
      .eq("user_id", user.id)
      .in("agent_type", ["mobilization_agent", "field_agent", "polling_unit_agent"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
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
    if (!fullName || !phone || !lga || !ward || !pollingUnit || !signature) {
      toast({ title: "Missing fields", description: "Please complete all required fields and sign the declaration.", variant: "destructive" });
      return;
    }
    if (!idFile) {
      toast({ title: "ID proof required", description: "Please upload a valid ID document.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const path = `${user.id}/agent-${Date.now()}-${idFile.name}`;
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
      ward,
      polling_unit: pollingUnit,
      agent_type: "polling_unit_agent",
      agent_sub_role: agentRole,
      has_previous_experience: hasExperience,
      experience_details: hasExperience ? experienceDetails : null,
      attended_inec_training: attendedTraining,
      training_date: attendedTraining && trainingDate ? trainingDate : null,
      available_voting_period: availableVoting,
      available_counting: availableCounting,
      id_proof_type: idType,
      id_proof_url: path,
      declaration_signature: signature,
      status: "pending",
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application submitted", description: "Admin will review and contact you shortly." });
      const { data } = await supabase.from("agent_recruitment_applications")
        .select("id,status,agent_type,created_at,review_notes")
        .eq("user_id", user.id).in("agent_type", ["mobilization_agent","field_agent","polling_unit_agent"])
        .order("created_at",{ascending:false}).limit(1).maybeSingle();
      if (data) setExisting(data as ExistingApp);
    }
  };

  if (existing) {
    const statusMap: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: "bg-orange-100 text-orange-700", label: "Under Review" },
      approved: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Approved" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Rejected" },
    };
    const s = statusMap[existing.status] || statusMap.pending;
    const SIcon = s.icon;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-7 h-7 text-emerald-600" />
          <h2 className="text-2xl font-black">Polling Unit Agent Application</h2>
        </div>
        <Card className="p-8 text-center max-w-2xl">
          <SIcon className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <Badge className={`${s.color} mb-3 border-0`}>{s.label}</Badge>
          <h3 className="text-xl font-bold mb-2">Your application is on file</h3>
          <p className="text-sm text-muted-foreground">
            Submitted on {new Date(existing.created_at).toLocaleDateString()}.
            {existing.status === "pending" && " Our admin team will review your details and reach out via email."}
          </p>
          {existing.review_notes && (
            <div className="mt-4 p-3 bg-muted rounded text-left text-sm">
              <strong>Admin notes:</strong> {existing.review_notes}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Award className="w-7 h-7 text-emerald-600" />
        <div>
          <h2 className="text-2xl font-black">Polling Unit Agent Recruitment</h2>
          <p className="text-sm text-muted-foreground">
            Apply to serve at your polling unit on election day under the Consensus.
          </p>
        </div>
      </div>

      {/* 1. Personal Details */}
      <Card className="p-6 space-y-5">
        <h3 className="font-bold">1. Personal Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div><Label>Email</Label><Input value={email} disabled /></div>
          <div><Label>Phone Number *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </div>
        <div>
          <Label>Local Government / Ward / Polling Unit *</Label>
          <p className="text-xs text-muted-foreground mb-2">Select the polling unit you can cover on election day.</p>
          <InecLocationPicker
            lgaName={lga}
            wardName={ward}
            puName={pollingUnit}
            showPU
            required
            onChange={({ lga: l, ward: w, pu }) => { setLga(l); setWard(w); setPollingUnit(pu); }}
          />
        </div>
      </Card>

      {/* 2. Agent Type */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">2. Agent Type *</h3>
        <div className="grid md:grid-cols-2 gap-2">
          {AGENT_ROLES.map(r => (
            <label key={r} className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer ${agentRole === r ? "border-emerald-600 bg-emerald-50" : "border-input"}`}>
              <input type="radio" name="agent-role" value={r} checked={agentRole === r} onChange={() => setAgentRole(r)} />
              <span className="text-sm">{r}</span>
            </label>
          ))}
        </div>
      </Card>

      {/* 3. Availability */}
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">3. Availability</h3>
        <div className="flex items-center gap-2">
          <Checkbox checked={availableVoting} onCheckedChange={v => setAvailableVoting(!!v)} id="av" />
          <Label htmlFor="av">Available for the entire voting period</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox checked={availableCounting} onCheckedChange={v => setAvailableCounting(!!v)} id="ac" />
          <Label htmlFor="ac">Available for counting and collation</Label>
        </div>
      </Card>

      {/* 4. Experience */}
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">4. Experience</h3>
        <div className="flex items-start gap-2">
          <Checkbox checked={hasExperience} onCheckedChange={v => setHasExperience(!!v)} id="exp" className="mt-1" />
          <div className="flex-1">
            <Label htmlFor="exp">I have previous experience as a polling unit agent</Label>
            {hasExperience && (
              <Textarea
                placeholder="If yes, provide details…"
                value={experienceDetails}
                onChange={e => setExperienceDetails(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
      </Card>

      {/* 5. Training */}
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">5. Training</h3>
        <div className="flex items-center gap-2">
          <Checkbox checked={attendedTraining} onCheckedChange={v => setAttendedTraining(!!v)} id="tr" />
          <Label htmlFor="tr">I have attended INEC training</Label>
        </div>
        {attendedTraining && (
          <div className="max-w-xs">
            <Label>Date of training</Label>
            <Input type="date" value={trainingDate} onChange={e => setTrainingDate(e.target.value)} />
          </div>
        )}
      </Card>

      {/* 6. Identification */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> 6. Identification *</h3>
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
            <Label>Upload ID proof (image/PDF, max 10MB)</Label>
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

      {/* Declaration */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Declaration *</h3>
        <p className="text-sm text-muted-foreground">
          I declare that the information provided is true and accurate. I understand that providing
          false information may lead to disqualification.
        </p>
        <div>
          <Label>Sign by typing your full name</Label>
          <Input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name as signature" />
        </div>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full md:w-auto">
        {loading ? "Submitting…" : "Submit Application"}
      </Button>
    </div>
  );
};

export default MemberApplyAgent;
