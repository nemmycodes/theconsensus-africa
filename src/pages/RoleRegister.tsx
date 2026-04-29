import { useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft, ArrowRight, Check, ShieldCheck, Upload,
  Award, HeartHandshake, Vote, Mail,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

type Role = "volunteer" | "agent" | "aspirant";

const ROLE_META: Record<Role, { title: string; subtitle: string; icon: any; sections: number }> = {
  volunteer: {
    title: "Volunteer Registration",
    subtitle: "Plateau Consensus Movement Volunteer Form",
    icon: HeartHandshake,
    sections: 5,
  },
  agent: {
    title: "Polling Unit Agent Recruitment",
    subtitle: "Apply to serve at your polling unit on election day",
    icon: Award,
    sections: 6,
  },
  aspirant: {
    title: "Elective Office Nomination",
    subtitle: "Declare intent to contest under the Consensus banner",
    icon: ShieldCheck,
    sections: 7,
  },
};

const AGENT_ROLES = [
  "Presiding Officer",
  "Assistant Presiding Officer",
  "Poll Clerk",
  "Security Officer",
];

const LEVELS = ["Local Government", "State", "Federal"];

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

const RoleRegister = () => {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validRole: Role | null =
    role === "volunteer" || role === "agent" || role === "aspirant" ? role : null;

  const [stage, setStage] = useState<"form" | "account">("form");
  const [loading, setLoading] = useState(false);

  // Common
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailContact, setEmailContact] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");
  const [pollingUnit, setPollingUnit] = useState("");
  const [signature, setSignature] = useState("");

  // Volunteer
  const [availability, setAvailability] = useState<string[]>([]);
  const [availabilityOther, setAvailabilityOther] = useState("");
  const [hours, setHours] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillsOther, setSkillsOther] = useState("");
  const [motivation, setMotivation] = useState("");
  const [candidates, setCandidates] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");
  const [relevantSkills, setRelevantSkills] = useState("");

  // Agent
  const [agentRole, setAgentRole] = useState(AGENT_ROLES[0]);
  const [hasExperience, setHasExperience] = useState(false);
  const [experienceDetails, setExperienceDetails] = useState("");
  const [attendedTraining, setAttendedTraining] = useState(false);
  const [trainingDate, setTrainingDate] = useState("");
  const [availableVoting, setAvailableVoting] = useState(false);
  const [availableCounting, setAvailableCounting] = useState(false);
  const [idType, setIdType] = useState("National ID (NIN)");
  const [idFile, setIdFile] = useState<File | null>(null);

  // Aspirant
  const [office, setOffice] = useState("");
  const [level, setLevel] = useState(LEVELS[0]);
  const [party, setParty] = useState("The Consensus");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");
  const [pob, setPob] = useState("");
  const [stateOrigin, setStateOrigin] = useState("");
  const [qualification, setQualification] = useState("");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState("");
  const [membershipNumber, setMembershipNumber] = useState("");
  const [priorOffice, setPriorOffice] = useState("");
  const [otherExperience, setOtherExperience] = useState("");
  const [manifesto, setManifesto] = useState("");

  // Account
  const [accountEmail, setAccountEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!validRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-2xl font-black mb-4">Unknown role</h1>
          <Link to="/join" className="text-primary underline">Back to Join page</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const meta = ROLE_META[validRole];

  const toggle = (list: string[], setList: (v: string[]) => void, id: string) =>
    setList(list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const validateForm = (): string | null => {
    if (!fullName) return "Please enter your full name.";
    if (!phone) return "Please enter a phone number.";
    if (!lga) return "Please select your Local Government.";
    if (!signature) return "Please sign the declaration by typing your full name.";

    if (validRole === "agent") {
      if (!ward || !pollingUnit) return "Please select Ward and Polling Unit.";
      if (!idFile) return "Please upload an ID proof.";
    }
    if (validRole === "aspirant") {
      if (!office) return "Please enter the elective office.";
      if (!manifesto) return "Please provide a manifesto summary.";
      const wc = manifesto.trim().split(/\s+/).filter(Boolean).length;
      if (wc > 500) return `Manifesto exceeds 500 words (currently ${wc}).`;
      if (!idFile) return "Please upload an ID proof.";
    }
    if (validRole === "volunteer") {
      if (!emailContact) return "Please enter your contact email.";
    }
    return null;
  };

  const handleProceedToAccount = () => {
    const err = validateForm();
    if (err) {
      toast({ title: "Please complete the form", description: err, variant: "destructive" });
      return;
    }
    // Pre-fill account email from contact email if volunteer
    if (validRole === "volunteer" && emailContact) setAccountEmail(prev => prev || emailContact);
    setStage("account");
  };

  const handleCreateAccount = async () => {
    if (!accountEmail || password.length < 6) {
      toast({ title: "Account details required", description: "Email and password (min 6 chars) are required.", variant: "destructive" });
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: accountEmail,
      password,
      options: {
        data: { full_name: fullName, phone, lga, ward },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error || !data.user) {
      toast({ title: "Signup failed", description: error?.message || "Unable to create account.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const userId = data.user.id;
    const contactEmail = emailContact || accountEmail;

    try {
      if (validRole === "volunteer") {
        const finalAvailability = [...availability, ...(availabilityOther ? ["other"] : [])];
        const finalSkills = [...skills, ...(skillsOther ? ["other"] : [])];
        const { error: insErr } = await supabase.from("volunteer_registrations" as any).insert({
          user_id: userId,
          full_name: fullName,
          phone,
          email: contactEmail,
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
          declaration_date: new Date().toISOString().slice(0, 10),
          status: "pending",
        } as any);
        if (insErr) throw insErr;
      } else if (validRole === "agent") {
        const path = `${userId}/agent-${Date.now()}-${idFile!.name}`;
        const { error: upErr } = await supabase.storage.from("agent-recruitment-ids").upload(path, idFile!, { upsert: false });
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("agent_recruitment_applications").insert({
          user_id: userId,
          full_name: fullName,
          email: contactEmail,
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
        if (insErr) throw insErr;
      } else if (validRole === "aspirant") {
        const path = `${userId}/aspirant-${Date.now()}-${idFile!.name}`;
        const { error: upErr } = await supabase.storage.from("agent-recruitment-ids").upload(path, idFile!, { upsert: false });
        if (upErr) throw upErr;
        const { error: insErr } = await supabase.from("agent_recruitment_applications").insert({
          user_id: userId,
          full_name: fullName,
          email: contactEmail,
          phone,
          address,
          lga,
          ward: ward || "N/A",
          polling_unit: pollingUnit || "N/A",
          agent_type: "aspirant",
          position_aspired: office,
          aspirant_level: level,
          party_affiliation: party,
          party_membership_number: membershipNumber || null,
          date_of_birth: dob || null,
          place_of_birth: pob || null,
          state_of_origin: stateOrigin || null,
          highest_qualification: qualification || null,
          institution: institution || null,
          qualification_year: year ? parseInt(year, 10) : null,
          prior_office_held: priorOffice || null,
          manifesto_summary: manifesto,
          has_previous_experience: !!priorOffice,
          experience_details: otherExperience || priorOffice || null,
          attended_inec_training: false,
          available_voting_period: false,
          available_counting: false,
          id_proof_type: idType,
          id_proof_url: path,
          declaration_signature: signature,
          status: "pending",
        } as any);
        if (insErr) throw insErr;
      }

      toast({
        title: "Account created & application submitted",
        description: "Check your email to confirm your account. You can track your application from your dashboard.",
      });
      navigate("/dashboard");
    } catch (e: any) {
      toast({
        title: "Account created — application save failed",
        description: e?.message || "You can resubmit your application from your dashboard.",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-28 pb-10 bg-gradient-to-br from-[hsl(220,20%,10%)] via-[hsl(220,22%,13%)] to-[hsl(145,40%,12%)]">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate("/join")} className="text-white/70 hover:text-white text-sm flex items-center gap-1 mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to roles
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white">{meta.title}</h1>
              <p className="text-white/70 text-sm mt-1">{meta.subtitle}</p>
            </div>
          </div>

          {/* 2-stage indicator */}
          <div className="mt-6 flex items-center gap-3 text-xs text-white/80">
            <div className={`flex items-center gap-2 ${stage === "form" ? "text-primary font-bold" : ""}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${stage === "form" ? "bg-primary text-primary-foreground" : "bg-white/20"}`}>1</span>
              Fill the form
            </div>
            <div className="w-8 h-px bg-white/30" />
            <div className={`flex items-center gap-2 ${stage === "account" ? "text-primary font-bold" : ""}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${stage === "account" ? "bg-primary text-primary-foreground" : "bg-white/20"}`}>2</span>
              Create your account
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto max-w-3xl space-y-6"
        >
          {stage === "form" && validRole === "volunteer" && (
            <>
              <Card className="p-6 space-y-4">
                <h3 className="font-bold">1. Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                  <div><Label>Email *</Label><Input type="email" value={emailContact} onChange={e => setEmailContact(e.target.value)} /></div>
                  <div><Label>Phone Number *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                </div>
                <div>
                  <Label>Local Government / Ward *</Label>
                  <InecLocationPicker
                    lgaName={lga} wardName={ward} puName="" showPU={false} required
                    onChange={({ lga: l, ward: w }) => { setLga(l); setWard(w); }}
                  />
                </div>
              </Card>

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
                  <div><Label>Other (specify)</Label><Input value={availabilityOther} onChange={e => setAvailabilityOther(e.target.value)} /></div>
                </div>
                <div className="max-w-xs">
                  <Label>Availability hours per week</Label>
                  <Input type="number" min={0} value={hours} onChange={e => setHours(e.target.value)} />
                </div>
              </Card>

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
                  <div><Label>Other (specify)</Label><Input value={skillsOther} onChange={e => setSkillsOther(e.target.value)} /></div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">4. Interest</h3>
                <div><Label>Why do you want to volunteer?</Label><Textarea rows={3} value={motivation} onChange={e => setMotivation(e.target.value)} /></div>
                <div><Label>Which candidate(s) are you interested in supporting?</Label><Textarea rows={2} value={candidates} onChange={e => setCandidates(e.target.value)} /></div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">5. Experience</h3>
                <div><Label>Previous volunteer experience</Label><Textarea rows={3} value={previousExperience} onChange={e => setPreviousExperience(e.target.value)} /></div>
                <div><Label>Relevant skills or training</Label><Textarea rows={3} value={relevantSkills} onChange={e => setRelevantSkills(e.target.value)} /></div>
              </Card>
            </>
          )}

          {stage === "form" && validRole === "agent" && (
            <>
              <Card className="p-6 space-y-4">
                <h3 className="font-bold">1. Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" value={emailContact} onChange={e => setEmailContact(e.target.value)} /></div>
                  <div><Label>Phone Number *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                </div>
                <div>
                  <Label>Local Government / Ward / Polling Unit *</Label>
                  <InecLocationPicker
                    lgaName={lga} wardName={ward} puName={pollingUnit} showPU required
                    onChange={({ lga: l, ward: w, pu }) => { setLga(l); setWard(w); setPollingUnit(pu); }}
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">2. Agent Type *</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {AGENT_ROLES.map(r => (
                    <label key={r} className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer ${agentRole === r ? "border-primary bg-primary/5" : "border-input"}`}>
                      <input type="radio" name="agent-role" value={r} checked={agentRole === r} onChange={() => setAgentRole(r)} />
                      <span className="text-sm">{r}</span>
                    </label>
                  ))}
                </div>
              </Card>

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

              <Card className="p-6 space-y-3">
                <h3 className="font-bold">4. Experience</h3>
                <div className="flex items-start gap-2">
                  <Checkbox checked={hasExperience} onCheckedChange={v => setHasExperience(!!v)} id="exp" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="exp">I have previous experience as a polling unit agent</Label>
                    {hasExperience && (
                      <Textarea placeholder="If yes, provide details…" value={experienceDetails} onChange={e => setExperienceDetails(e.target.value)} className="mt-2" />
                    )}
                  </div>
                </div>
              </Card>

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
            </>
          )}

          {stage === "form" && validRole === "aspirant" && (
            <>
              <Card className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Vote className="w-4 h-4" /> 1. Office Sought</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Elective Office *</Label><Input value={office} onChange={e => setOffice(e.target.value)} placeholder="e.g. Governor, Senator, Councillor" /></div>
                  <div>
                    <Label>Level *</Label>
                    <select value={level} onChange={e => setLevel(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                  <div><Label>Party *</Label><Input value={party} onChange={e => setParty(e.target.value)} /></div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">2. Candidate Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Name *</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                  <div><Label>Email</Label><Input type="email" value={emailContact} onChange={e => setEmailContact(e.target.value)} /></div>
                  <div><Label>Phone Number *</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                </div>
                <div><Label>Address</Label><Textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} /></div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">3. Personal Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Date of Birth</Label><Input type="date" value={dob} onChange={e => setDob(e.target.value)} /></div>
                  <div><Label>Place of Birth</Label><Input value={pob} onChange={e => setPob(e.target.value)} /></div>
                  <div><Label>State of Origin</Label><Input value={stateOrigin} onChange={e => setStateOrigin(e.target.value)} /></div>
                </div>
                <div>
                  <Label>Local Government / Ward *</Label>
                  <InecLocationPicker
                    lgaName={lga} wardName={ward} puName={pollingUnit} showPU={false} required
                    onChange={({ lga: l, ward: w, pu }) => { setLga(l); setWard(w); setPollingUnit(pu); }}
                  />
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">4. Education</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div><Label>Highest Qualification</Label><Input value={qualification} onChange={e => setQualification(e.target.value)} placeholder="e.g. B.Sc, M.Sc" /></div>
                  <div><Label>Institution</Label><Input value={institution} onChange={e => setInstitution(e.target.value)} /></div>
                  <div><Label>Year</Label><Input type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2018" /></div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">5. Party Membership</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><Label>Party</Label><Input value={party} onChange={e => setParty(e.target.value)} /></div>
                  <div><Label>Membership Number</Label><Input value={membershipNumber} onChange={e => setMembershipNumber(e.target.value)} /></div>
                </div>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold">6. Previous Experience</h3>
                <div><Label>Previous elective offices held</Label><Input value={priorOffice} onChange={e => setPriorOffice(e.target.value)} placeholder="e.g. Councillor 2019–2023" /></div>
                <div><Label>Other relevant experience</Label><Textarea value={otherExperience} onChange={e => setOtherExperience(e.target.value)} rows={3} /></div>
              </Card>

              <Card className="p-6 space-y-3">
                <h3 className="font-bold">7. Manifesto *</h3>
                <p className="text-xs text-muted-foreground">Brief manifesto, max 500 words.</p>
                <Textarea rows={6} value={manifesto} onChange={e => setManifesto(e.target.value)} placeholder="Outline your priorities and what you intend to deliver if elected." />
                <p className="text-xs text-muted-foreground text-right">{manifesto.trim().split(/\s+/).filter(Boolean).length} / 500 words</p>
              </Card>

              <Card className="p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> ID Verification *</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>ID Type</Label>
                    <select value={idType} onChange={e => setIdType(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            </>
          )}

          {/* Declaration (always shown in form stage) */}
          {stage === "form" && (
            <Card className="p-6 space-y-3">
              <h3 className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Declaration *</h3>
              <p className="text-sm text-muted-foreground">
                I declare that the information provided is true and accurate. I understand that
                providing false information may lead to disqualification.
              </p>
              <div>
                <Label>Sign by typing your full name *</Label>
                <Input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Type your full name as signature" />
              </div>
            </Card>
          )}

          {stage === "form" && (
            <div className="flex justify-end">
              <Button size="lg" onClick={handleProceedToAccount} className="gap-2 font-bold">
                Continue to Create Account <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {stage === "account" && (
            <Card className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Create your account</h3>
                  <p className="text-xs text-muted-foreground">Last step — your form has been captured. Set your login credentials to submit.</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={accountEmail} onChange={e => setAccountEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div>
                  <Label>Password *</Label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" minLength={6} />
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
                Submitting as: <strong>{fullName || "—"}</strong> · {phone || "no phone"} · {lga || "no LGA"}
                {validRole === "agent" && ward && pollingUnit && <> · {ward} / {pollingUnit}</>}
                {validRole === "aspirant" && office && <> · Aspiring for <strong>{office}</strong> ({level})</>}
              </div>

              <div className="flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStage("form")} className="gap-1">
                  <ArrowLeft className="w-4 h-4" /> Back to form
                </Button>
                <Button size="lg" onClick={handleCreateAccount} disabled={loading} className="gap-2 font-bold">
                  {loading ? "Creating account…" : "Create Account & Submit"} <Check className="w-4 h-4" />
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account? <Link to="/auth" className="text-primary underline">Sign in</Link>
              </div>
            </Card>
          )}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default RoleRegister;
