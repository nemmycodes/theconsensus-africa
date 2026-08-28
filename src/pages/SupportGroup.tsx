import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Users, ShieldCheck, CheckCircle2 } from "lucide-react";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const SupportGroup = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lga, setLga] = useState("");
  const [ward, setWard] = useState("");

  const [groupName, setGroupName] = useState("");
  const [objectives, setObjectives] = useState("");
  const [activeMembers, setActiveMembers] = useState("");
  const [motivation, setMotivation] = useState("");

  const [signature, setSignature] = useState("");
  const [declarationDate, setDeclarationDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = async () => {
    if (!fullName || !phone || !email || !lga || !groupName || !signature) {
      toast({
        title: "Missing fields",
        description: "Please complete the required fields and sign the declaration.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("volunteer_registrations" as any).insert({
      user_id: user?.id ?? null,
      full_name: fullName,
      phone,
      email,
      lga,
      ward: ward || null,
      support_group_name: groupName,
      support_group_objectives: objectives || null,
      support_group_active_members: activeMembers ? parseInt(activeMembers, 10) : null,
      availability_areas: [],
      skills: [],
      motivation: motivation || null,
      declaration_signature: signature,
      declaration_date: declarationDate,
      status: "pending",
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: "Submission failed", description: error.message, variant: "destructive" });
    } else {
      setSubmitted(true);
      toast({ title: "Support group registered", description: "Our coordination team will reach out shortly." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 pt-28 md:pt-32 pb-16 max-w-3xl">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-7 h-7 text-primary" />
            <h1 className="text-3xl md:text-4xl font-black">Register a Support Group</h1>
          </div>
          <p className="text-muted-foreground">
            Does your group support Chief Kefas Ropshik Wungak (Kefiano) for Governor of Plateau State in 2027? If yes,
            kindly fill in the form below for your support group to be officially recognised.
          </p>
        </header>

        {submitted ? (
          <Card className="p-10 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h2 className="text-xl font-bold mb-2">Thank you, {fullName.split(" ")[0]}</h2>
            <p className="text-sm text-muted-foreground">
              {groupName} has been submitted for review. Our coordination team will contact you on {phone}.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="font-bold">1. Group Coordinator</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label>Phone Number *</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Local Government / Ward *</Label>
                <InecLocationPicker
                  lgaName={lga}
                  wardName={ward}
                  puName=""
                  showPU={false}
                  required
                  onChange={({ lga: l, ward: w }) => {
                    setLga(l);
                    setWard(w);
                  }}
                />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="font-bold flex items-center gap-2">
                <Users className="w-4 h-4" /> 2. Support Group Details
              </h2>
              <div>
                <Label>Name of Support Group *</Label>
                <Input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Plateau Youth Vanguard for kefiano, Jos Women for kefiano…"
                />
              </div>
              <div>
                <Label>Objectives of the Group</Label>
                <Textarea
                  rows={4}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="What does your support group aim to achieve for the movement?"
                />
              </div>
              <div className="max-w-xs">
                <Label>Number of Active Members</Label>
                <Input
                  type="number"
                  min={0}
                  value={activeMembers}
                  onChange={(e) => setActiveMembers(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>
              <div>
                <Label>How will your group support the movement?</Label>
                <Textarea rows={3} value={motivation} onChange={(e) => setMotivation(e.target.value)} />
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h2 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Declaration *
              </h2>
              <p className="text-sm text-muted-foreground">
                I declare that the information provided is true and accurate, and that I am authorised to register this
                support group on behalf of its members.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Sign by typing your full name *</Label>
                  <Input
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your full name as signature"
                  />
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={declarationDate} onChange={(e) => setDeclarationDate(e.target.value)} />
                </div>
              </div>
            </Card>

            <Button onClick={handleSubmit} disabled={loading} size="lg" className="w-full md:w-auto">
              {loading ? "Submitting…" : "Submit Support Group"}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SupportGroup;
