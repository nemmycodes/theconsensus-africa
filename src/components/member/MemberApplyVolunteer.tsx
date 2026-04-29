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
import { HeartHandshake, ShieldCheck, CheckCircle2, Clock, XCircle } from "lucide-react";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const AVAILABILITY_AREAS = [
  { id: "campaign_events", label: "Campaign events" },
  { id: "door_to_door", label: "Door-to-door campaigns" },
  { id: "social_media", label: "Social media promotion" },
];

const SKILL_OPTIONS = [
  { id: "social_media", label: "Social media management" },
  { id: "public_speaking", label: "Public speaking" },
  { id: "graphic_design", label: "Graphic design" },
  { id: "writing", label: "Writing / journalism" },
];

interface ExistingReg {
  id: string;
  status: string;
  created_at: string;
  review_notes: string | null;
}

const MemberApplyVolunteer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [existing, setExisting] = useState<ExistingReg | null>(null);

  // 1. Personal
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");

  // 2. Availability
  const [availability, setAvailability] = useState<string[]>([]);
  const [availabilityOther, setAvailabilityOther] = useState("");
  const [hours, setHours] = useState<string>("");

  // 3. Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsOther, setSkillsOther] = useState("");

  // 4. Interest
  const [motivation, setMotivation] = useState("");
  const [candidates, setCandidates] = useState("");

  // 5. Experience
  const [previousExperience, setPreviousExperience] = useState("");
  const [relevantSkills, setRelevantSkills] = useState("");

  // Declaration
  const [signature, setSignature] = useState("");
  const [declarationDate, setDeclarationDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    supabase.from("volunteer_registrations" as any)
      .select("id,status,created_at,review_notes")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setExisting(data as unknown as ExistingReg); });
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

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) =>
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!fullName || !phone || !email || !lga || !signature) {
      toast({ title: "Missing fields", description: "Please complete the required fields and sign the declaration.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const finalAvailability = [...availability, ...(availabilityOther ? ["other"] : [])];
    const finalSkills = [...skills, ...(skillsOther ? ["other"] : [])];

    const { error } = await supabase.from("volunteer_registrations" as any).insert({
      user_id: user.id,
      full_name: fullName,
      phone,
      email,
      lga,
      ward: ward || null,
      availability_areas: finalAvailability,
      availability_other: availabilityOther || null,
      availability_hours_per_week: hours ? parseInt(hours, 10) : null,
      skills: finalSkills,
      skills_other: skillsOther || null,
      motivation: motivation || null,
      candidates_supporting: candidates || null,
      previous_experience: previousExperience || null,
      relevant_skills: relevantSkills || null,
      declaration_signature: signature,
      declaration_date: declarationDate,
      status: "pending",
    } as any);

    setLoading(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Volunteer registration submitted", description: "Welcome to the movement! We'll be in touch." });
      const { data } = await supabase.from("volunteer_registrations" as any)
        .select("id,status,created_at,review_notes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) setExisting(data as unknown as ExistingReg);
    }
  };

  if (existing) {
    const statusMap: Record<string, { icon: any; color: string; label: string }> = {
      pending: { icon: Clock, color: "bg-orange-100 text-orange-700", label: "Received" },
      approved: { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700", label: "Active Volunteer" },
      rejected: { icon: XCircle, color: "bg-red-100 text-red-700", label: "Not Onboarded" },
    };
    const s = statusMap[existing.status] || statusMap.pending;
    const SIcon = s.icon;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <HeartHandshake className="w-7 h-7 text-emerald-600" />
          <h2 className="text-2xl font-black">Volunteer Registration</h2>
        </div>
        <Card className="p-8 text-center max-w-2xl">
          <SIcon className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
          <Badge className={`${s.color} mb-3 border-0`}>{s.label}</Badge>
          <h3 className="text-xl font-bold mb-2">Thank you for volunteering</h3>
          <p className="text-sm text-muted-foreground">
            Submitted on {new Date(existing.created_at).toLocaleDateString()}. Our coordination team will reach out with next steps.
          </p>
          {existing.review_notes && (
            <div className="mt-4 p-3 bg-muted rounded text-left text-sm">
              <strong>Coordinator note:</strong> {existing.review_notes}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <HeartHandshake className="w-7 h-7 text-emerald-600" />
        <div>
          <h2 className="text-2xl font-black">Plateau Consensus Movement Volunteer</h2>
          <p className="text-sm text-muted-foreground">
            Lend your time and skills to promote the movement and our endorsed candidates.
          </p>
        </div>
      </div>

      {/* 1. Personal Details */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">1. Personal Details</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div><Label>Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
          <div><Label>Email *</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><Label>Phone Number *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </div>
        <div>
          <Label>Local Government / Ward *</Label>
          <InecLocationPicker
            lgaName={lga}
            wardName={ward}
            puName=""
            showPU={false}
            required
            onChange={({ lga: l, ward: w }) => { setLga(l); setWard(w); }}
          />
        </div>
      </Card>

      {/* 2. Availability */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">2. Availability</h3>
        <p className="text-sm text-muted-foreground">Available for:</p>
        <div className="space-y-2">
          {AVAILABILITY_AREAS.map(a => (
            <div key={a.id} className="flex items-center gap-2">
              <Checkbox id={`av-${a.id}`} checked={availability.includes(a.id)}
                onCheckedChange={() => toggle(availability, setAvailability, a.id)} />
              <Label htmlFor={`av-${a.id}`}>{a.label}</Label>
            </div>
          ))}
          <div>
            <Label>Other (specify)</Label>
            <Input value={availabilityOther} onChange={e => setAvailabilityOther(e.target.value)} />
          </div>
        </div>
        <div className="max-w-xs">
          <Label>Availability hours per week</Label>
          <Input type="number" min={0} value={hours} onChange={e => setHours(e.target.value)} />
        </div>
      </Card>

      {/* 3. Skills */}
      <Card className="p-6 space-y-3">
        <h3 className="font-bold">3. Skills</h3>
        <div className="space-y-2">
          {SKILL_OPTIONS.map(s => (
            <div key={s.id} className="flex items-center gap-2">
              <Checkbox id={`sk-${s.id}`} checked={skills.includes(s.id)}
                onCheckedChange={() => toggle(skills, setSkills, s.id)} />
              <Label htmlFor={`sk-${s.id}`}>{s.label}</Label>
            </div>
          ))}
          <div>
            <Label>Other (specify)</Label>
            <Input value={skillsOther} onChange={e => setSkillsOther(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* 4. Interest */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">4. Interest</h3>
        <div>
          <Label>Why do you want to volunteer?</Label>
          <Textarea rows={3} value={motivation} onChange={e => setMotivation(e.target.value)} />
        </div>
        <div>
          <Label>Which candidate(s) are you interested in supporting?</Label>
          <Textarea rows={2} value={candidates} onChange={e => setCandidates(e.target.value)} />
        </div>
      </Card>

      {/* 5. Experience */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold">5. Experience</h3>
        <div>
          <Label>Previous volunteer experience</Label>
          <Textarea rows={3} value={previousExperience} onChange={e => setPreviousExperience(e.target.value)} />
        </div>
        <div>
          <Label>Relevant skills or training</Label>
          <Textarea rows={3} value={relevantSkills} onChange={e => setRelevantSkills(e.target.value)} />
        </div>
      </Card>

      {/* Declaration */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Declaration *</h3>
        <p className="text-sm text-muted-foreground">
          I declare that the information provided is true and accurate. I understand that my role
          as a volunteer is crucial in promoting the Plateau Consensus Movement and supporting our
          endorsed candidates.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Sign by typing your full name *</Label>
            <Input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name as signature" />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={declarationDate} onChange={e => setDeclarationDate(e.target.value)} />
          </div>
        </div>
      </Card>

      <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full md:w-auto">
        {loading ? "Submitting…" : "Submit Volunteer Registration"}
      </Button>
    </div>
  );
};

export default MemberApplyVolunteer;
