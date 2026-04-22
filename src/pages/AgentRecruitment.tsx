import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Upload } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name required").max(120),
  phone: z.string().trim().min(7, "Phone required").max(30),
  email: z.string().trim().email("Invalid email").max(255),
  lga: z.string().trim().min(1, "LGA required").max(80),
  ward: z.string().trim().min(1, "Ward required").max(80),
  polling_unit: z.string().trim().min(1, "Polling unit required").max(120),
  agent_type: z.string().min(1, "Select an agent type"),
  experience_details: z.string().max(1000).optional(),
  declaration_signature: z.string().trim().min(2, "Signature required").max(120),
  id_proof_type: z.string().min(1, "ID type required"),
});

const AGENT_TYPES = ["Presiding Officer", "Assistant Presiding Officer", "Poll Clerk", "Security Officer"];
const ID_TYPES = ["NIN", "Voter's Card", "Driver's License", "International Passport"];

const AgentRecruitment = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", lga: "", ward: "", polling_unit: "",
    agent_type: "", available_voting_period: false, available_counting: false,
    has_previous_experience: false, experience_details: "",
    attended_inec_training: false, training_date: "",
    id_proof_type: "", declaration_signature: "",
    declaration_date: new Date().toISOString().slice(0, 10),
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idFile) {
      toast.error("Please upload your ID proof");
      return;
    }
    if (idFile.size > 5 * 1024 * 1024) {
      toast.error("ID file must be under 5MB");
      return;
    }
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    try {
      const ext = idFile.name.split(".").pop() || "bin";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("agent-recruitment-ids")
        .upload(path, idFile, { contentType: idFile.type });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("agent_recruitment_applications").insert({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        lga: form.lga.trim(),
        ward: form.ward.trim(),
        polling_unit: form.polling_unit.trim(),
        agent_type: form.agent_type,
        available_voting_period: form.available_voting_period,
        available_counting: form.available_counting,
        has_previous_experience: form.has_previous_experience,
        experience_details: form.experience_details || null,
        attended_inec_training: form.attended_inec_training,
        training_date: form.training_date || null,
        id_proof_type: form.id_proof_type,
        id_proof_url: path,
        declaration_signature: form.declaration_signature.trim(),
        declaration_date: form.declaration_date,
      });
      if (insErr) throw insErr;

      setSubmitted(true);
      toast.success("Application submitted successfully");
    } catch (err: any) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 container mx-auto px-4 max-w-2xl text-center">
          <CheckCircle2 className="w-20 h-20 mx-auto text-emerald-600 mb-6" />
          <h1 className="text-4xl font-bold mb-3">Application Received</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for stepping forward to serve. Our team will review your application and contact you via email or phone.
          </p>
          <Button onClick={() => (window.location.href = "/")}>Return Home</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-28 pb-16 container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4" /> Polling Unit Agent Recruitment
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Serve Your Polling Unit</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Apply to safeguard the vote in your community. All fields are required unless marked optional.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border shadow-sm p-6 md:p-10 space-y-10">
          {/* 1. Personal Details */}
          <section className="space-y-5">
            <h2 className="text-xl font-bold border-b pb-2">1. Personal Details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required /></div>
              <div><Label>Phone Number *</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required /></div>
              <div><Label>Local Government *</Label><Input value={form.lga} onChange={(e) => update("lga", e.target.value)} required /></div>
              <div><Label>Ward *</Label><Input value={form.ward} onChange={(e) => update("ward", e.target.value)} required /></div>
              <div><Label>Polling Unit *</Label><Input value={form.polling_unit} onChange={(e) => update("polling_unit", e.target.value)} required /></div>
            </div>
          </section>

          {/* 2. Agent Type */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold border-b pb-2">2. Agent Type</h2>
            <RadioGroup value={form.agent_type} onValueChange={(v) => update("agent_type", v)} className="grid md:grid-cols-2 gap-3">
              {AGENT_TYPES.map((t) => (
                <label key={t} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${form.agent_type === t ? "border-emerald-600 bg-emerald-50" : "border-border hover:bg-muted/50"}`}>
                  <RadioGroupItem value={t} id={t} />
                  <span className="text-sm font-medium">{t}</span>
                </label>
              ))}
            </RadioGroup>
          </section>

          {/* 3. Availability */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold border-b pb-2">3. Availability</h2>
            {[
              { k: "available_voting_period", label: "Available for the entire voting period" },
              { k: "available_counting", label: "Available for counting and collation" },
            ].map(({ k, label }) => (
              <div key={k} className="flex items-center gap-6 py-1">
                <span className="text-sm flex-1">{label}</span>
                <RadioGroup value={String((form as any)[k])} onValueChange={(v) => update(k, v === "true")} className="flex gap-4">
                  <label className="flex items-center gap-1.5 text-sm"><RadioGroupItem value="true" /> Yes</label>
                  <label className="flex items-center gap-1.5 text-sm"><RadioGroupItem value="false" /> No</label>
                </RadioGroup>
              </div>
            ))}
          </section>

          {/* 4. Experience */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold border-b pb-2">4. Experience</h2>
            <div className="flex items-center gap-6 py-1">
              <span className="text-sm flex-1">Previous experience as a polling unit agent</span>
              <RadioGroup value={String(form.has_previous_experience)} onValueChange={(v) => update("has_previous_experience", v === "true")} className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm"><RadioGroupItem value="true" /> Yes</label>
                <label className="flex items-center gap-1.5 text-sm"><RadioGroupItem value="false" /> No</label>
              </RadioGroup>
            </div>
            {form.has_previous_experience && (
              <div><Label>Provide details</Label><Textarea rows={3} value={form.experience_details} onChange={(e) => update("experience_details", e.target.value)} maxLength={1000} /></div>
            )}
          </section>

          {/* 5. Training */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold border-b pb-2">5. Training</h2>
            <div className="flex items-center gap-6 py-1">
              <span className="text-sm flex-1">Attended INEC training</span>
              <RadioGroup value={String(form.attended_inec_training)} onValueChange={(v) => update("attended_inec_training", v === "true")} className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm"><RadioGroupItem value="true" /> Yes</label>
                <label className="flex items-center gap-1.5 text-sm"><RadioGroupItem value="false" /> No</label>
              </RadioGroup>
            </div>
            {form.attended_inec_training && (
              <div><Label>Date of training</Label><Input type="date" value={form.training_date} onChange={(e) => update("training_date", e.target.value)} /></div>
            )}
          </section>

          {/* 6. Identification */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b pb-2">6. Identification</h2>
            <div>
              <Label>ID Type *</Label>
              <Select value={form.id_proof_type} onValueChange={(v) => update("id_proof_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                <SelectContent>{ID_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Upload ID proof * <span className="text-xs text-muted-foreground">(max 5MB, image or PDF)</span></Label>
              <label className="mt-1 flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition">
                <Upload className="w-5 h-5 text-emerald-600" />
                <span className="text-sm flex-1 truncate">{idFile ? idFile.name : "Click to upload your ID document"}</span>
                <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
            </div>
          </section>

          {/* Declaration */}
          <section className="space-y-4 bg-muted/40 p-5 rounded-lg">
            <h2 className="text-xl font-bold">Declaration</h2>
            <p className="text-sm text-muted-foreground">
              I declare that the information provided is true and accurate. I understand that providing false information may lead to disqualification.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Signature (full name) *</Label><Input value={form.declaration_signature} onChange={(e) => update("declaration_signature", e.target.value)} required placeholder="Type your full name" /></div>
              <div><Label>Date *</Label><Input type="date" value={form.declaration_date} onChange={(e) => update("declaration_date", e.target.value)} required /></div>
            </div>
          </section>

          <Button type="submit" disabled={submitting} size="lg" className="w-full">
            {submitting ? "Submitting…" : "Submit Application"}
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default AgentRecruitment;
