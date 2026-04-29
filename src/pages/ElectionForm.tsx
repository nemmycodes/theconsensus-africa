import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Building2, BarChart3, Vote, Upload, ShieldCheck, Search,
  Calculator, FileUp, MapPin, Calendar,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ElectionLocationFilter from "@/components/shared/ElectionLocationFilter";

const PARTIES = [
  { abbr: "A", name: "Accord" },
  { abbr: "AA", name: "Action Alliance" },
  { abbr: "AAC", name: "AAC" },
  { abbr: "ADC", name: "ADC" },
  { abbr: "ADP", name: "ADP" },
  { abbr: "APC", name: "APC" },
  { abbr: "APGA", name: "APGA" },
  { abbr: "APM", name: "APM" },
  { abbr: "APP", name: "APP" },
  { abbr: "BP", name: "Boot Party" },
  { abbr: "LP", name: "LP" },
  { abbr: "NNPP", name: "NNPP" },
  { abbr: "NRM", name: "NRM" },
  { abbr: "PDP", name: "PDP" },
  { abbr: "PRP", name: "PRP" },
  { abbr: "SDP", name: "SDP" },
  { abbr: "YPP", name: "YPP" },
  { abbr: "ZLP", name: "ZLP" },
];

const ELECTION_TYPES = [
  "Presidential", "Gubernatorial", "Senatorial", "House of Reps", "House of Assembly", "LGA Election", "Ward Council", "Party Primaries",
];

const ElectionForm = () => {
  const { user, isAgent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Election Date
  const [electionDate, setElectionDate] = useState("");

  // Live Location
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Section 1
  const [centerName, setCenterName] = useState("");
  const [agentCode, setAgentCode] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [electionType, setElectionType] = useState("Presidential");

  // Section 2
  const [ward, setWard] = useState("");
  const [pollingUnit, setPollingUnit] = useState("");
  const [registeredVoters, setRegisteredVoters] = useState(0);
  const [accreditedVoters, setAccreditedVoters] = useState(0);
  const [totalVotesCast, setTotalVotesCast] = useState(0);

  // Section 3
  const [partyResults, setPartyResults] = useState<Record<string, number>>(
    Object.fromEntries(PARTIES.map((p) => [p.abbr, 0]))
  );
  const [partySearch, setPartySearch] = useState("");

  // Section 5
  const [observations, setObservations] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [signatureDate, setSignatureDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [ec8aFile, setEc8aFile] = useState<File | null>(null);
  const [ec8aPreview, setEc8aPreview] = useState<string | null>(null);

  const handleEc8aChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload JPG, PNG, or PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum file size is 10MB.", variant: "destructive" });
      return;
    }
    setEc8aFile(file);
    if (file.type.startsWith("image/")) {
      setEc8aPreview(URL.createObjectURL(file));
    } else {
      setEc8aPreview(null);
    }
  };

  const totalPartyVotes = Object.values(partyResults).reduce((sum, v) => sum + (v || 0), 0);

  const filteredParties = partySearch
    ? PARTIES.filter(
        (p) =>
          p.name.toLowerCase().includes(partySearch.toLowerCase()) ||
          p.abbr.toLowerCase().includes(partySearch.toLowerCase())
      )
    : PARTIES;

  const updatePartyVotes = (abbr: string, value: string) => {
    const num = parseInt(value) || 0;
    setPartyResults((prev) => ({ ...prev, [abbr]: num }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }
    setLoading(true);

    // 1. Upload EC8-A if present
    let ec8aUrl: string | null = null;
    if (ec8aFile) {
      const path = `${user.id}/ec8a-${Date.now()}-${ec8aFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("election-evidence")
        .upload(path, ec8aFile, { upsert: false });
      if (!uploadErr) ec8aUrl = path;
    }

    // 2. Save full report into situation_updates feed (legacy)
    const reportContent = JSON.stringify({
      electionDate,
      liveLocation,
      center: { centerName, agentCode, state, lga, electionType },
      voting: { ward, pollingUnit, registeredVoters, accreditedVoters, totalVotesCast },
      partyResults,
      totalPartyVotes,
      observations,
      signature: { name: signatureName, date: signatureDate },
      ec8aUrl,
    });

    const { error } = await supabase.from("situation_updates").insert({
      title: `Election Report: ${centerName || pollingUnit || "Unnamed Center"}`,
      content: reportContent,
      category: "Political",
      status: "Active",
      author_id: user.id,
    });

    // 3. Insert one election_reports row per party so the admin verification queue picks them up
    const electionTypeMap: Record<string, string> = {
      "Presidential": "presidential",
      "Gubernatorial": "gubernatorial",
      "Senatorial": "senate",
      "House of Reps": "house_of_reps",
      "House of Assembly": "house_of_assembly",
      "LGA Election": "chairman",
      "Ward Council": "councillor",
      "Party Primaries": "party_primary",
    };
    const dbElectionType = electionTypeMap[electionType] || "presidential";
    const reportRows = Object.entries(partyResults)
      .filter(([, votes]) => (votes || 0) > 0)
      .map(([abbr, votes]) => ({
        agent_id: user.id,
        election_type: dbElectionType as any,
        election_date: electionDate || new Date().toISOString().slice(0, 10),
        state: state || "Plateau",
        lga: lga || "Unknown",
        ward: ward || "Unknown",
        polling_unit: pollingUnit || "Unknown",
        party: abbr,
        votes_recorded: votes,
        total_votes_cast: totalVotesCast,
        registered_voters: registeredVoters,
        ec8a_url: ec8aUrl,
        latitude: liveLocation?.lat ?? null,
        longitude: liveLocation?.lng ?? null,
        notes: observations || null,
        status: "pending" as const,
      }));

    let reportsErr: any = null;
    if (reportRows.length > 0) {
      const { error: rErr } = await supabase.from("election_reports").insert(reportRows);
      reportsErr = rErr;
    }

    if (error || reportsErr) {
      toast({ title: "Error submitting report", description: (error || reportsErr)?.message, variant: "destructive" });
    } else {
      toast({ title: "Report submitted successfully!", description: "Awaiting admin verification." });
      navigate("/agent");
    }
    setLoading(false);
  };

  const handleSaveDraft = () => {
    toast({ title: "Draft saved", description: "Your report has been saved locally." });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationLoading(false);
        toast({ title: "Location captured", description: `Lat: ${position.coords.latitude.toFixed(5)}, Lng: ${position.coords.longitude.toFixed(5)}` });
      },
      (err) => {
        setLocationError("Unable to get location. Please enable GPS.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-heading font-black">
              Election Collation Form
            </h1>
            <p className="text-primary text-sm mt-1">
              Official reporting portal for designated agents. Ensure all data corresponds with physical EC8 forms.
            </p>
          </motion.div>

          <div className="space-y-8">
            {/* Election Date */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">Election Date</h2>
              </div>
              <Input
                type="date"
                value={electionDate}
                onChange={(e) => setElectionDate(e.target.value)}
                className="max-w-xs"
              />
            </motion.section>

            {/* Section 1: Center & Agent Details */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">1. Center & Agent Details</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Center Name</Label>
                  <Input
                    placeholder="e.g. Lagos Mainland Collation Center"
                    value={centerName}
                    onChange={(e) => setCenterName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Agent Code</Label>
                  <Input
                    placeholder="AGT-LAG-0042"
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    className="bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select State</option>
                    {NIGERIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-1">
                  {/* LGA picker integrated below alongside Ward + PU */}
                </div>
              </div>

              <div className="mt-5">
                <InecLocationPicker
                  lgaName={lga}
                  wardName={ward}
                  puName={pollingUnit}
                  showPU
                  required
                  onChange={({ lga: l, ward: w, pu }) => {
                    setLga(l);
                    setWard(w);
                    setPollingUnit(pu);
                  }}
                />
              </div>

              <div className="mt-5">
                <Label className="mb-3 block">Election Type</Label>
                <div className="flex flex-wrap gap-4">
                  {ELECTION_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          electionType === type
                            ? "border-primary bg-primary"
                            : "border-border"
                        }`}
                        onClick={() => {
                          setElectionType(type);
                          if (type === "Party Primaries") {
                            navigate("/election-form/primaries");
                          }
                        }}
                      >
                        {electionType === type && (
                          <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                        )}
                      </div>
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Section 2: Voting Statistics */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">2. Voting Statistics</h2>
              </div>

              <p className="text-xs text-muted-foreground mb-5">Ward: <strong>{ward || "—"}</strong> · PU: <strong>{pollingUnit || "—"}</strong> (set in Section 1)</p>
              <div className="grid md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label>Registered Voters</Label>
                  <Input
                    type="number"
                    min={0}
                    value={registeredVoters}
                    onChange={(e) => setRegisteredVoters(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Accredited Voters</Label>
                  <Input
                    type="number"
                    min={0}
                    value={accreditedVoters}
                    onChange={(e) => setAccreditedVoters(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Votes Cast</Label>
                  <Input
                    type="number"
                    min={0}
                    value={totalVotesCast}
                    onChange={(e) => setTotalVotesCast(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </motion.section>

            {/* Section 3: Party Results */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-heading font-bold">3. Party Results</h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search party..."
                    value={partySearch}
                    onChange={(e) => setPartySearch(e.target.value)}
                    className="pl-9 w-48"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredParties.map((party) => (
                  <div
                    key={party.abbr}
                    className="flex items-center gap-3 p-2 rounded-lg border border-border hover:border-primary/20 transition-colors"
                  >
                    <span className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold shrink-0">
                      {party.abbr}
                    </span>
                    <span className="text-sm font-medium flex-1 truncate">{party.name}</span>
                    <Input
                      type="number"
                      min={0}
                      value={partyResults[party.abbr] || 0}
                      onChange={(e) => updatePartyVotes(party.abbr, e.target.value)}
                      className="w-20 text-center h-9"
                    />
                  </div>
                ))}
              </div>

              {/* Total Calculator */}
              <div className="mt-6 flex items-center justify-between bg-primary/10 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-sm">Total Votes Calculator</p>
                    <p className="text-xs text-muted-foreground">Automatic sum of all party results above</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-primary">Total:</span>
                  <span className="px-4 py-2 rounded-lg border-2 border-primary bg-background font-heading font-bold text-lg min-w-[60px] text-center">
                    {totalPartyVotes}
                  </span>
                </div>
              </div>
            </motion.section>

            {/* Section 4: EC8-A Upload */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <Upload className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">4. EC8-A Upload</h2>
              </div>

              <label className="border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 p-12 text-center cursor-pointer block hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={handleEc8aChange}
                />
                {ec8aFile ? (
                  <div>
                    {ec8aPreview ? (
                      <img src={ec8aPreview} alt="EC8-A Preview" className="max-h-40 mx-auto mb-3 rounded-lg" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <FileUp className="h-7 w-7 text-primary" />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-primary">{ec8aFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Click to change file</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <FileUp className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-sm">
                      <span className="text-primary font-semibold">Click to upload</span>
                      {" "}or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">EC8-A Form (JPG, PNG or PDF)</p>
                  </>
                )}
              </label>
            </motion.section>

            {/* Live Location */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">Live Location</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Capture your current GPS location to verify your presence at the collation center.
              </p>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGetLocation}
                  disabled={locationLoading}
                  className="gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  {locationLoading ? "Getting location..." : liveLocation ? "Update Location" : "Capture Location"}
                </Button>
                {liveLocation && (
                  <div className="text-sm text-primary font-medium">
                    📍 Lat: {liveLocation.lat.toFixed(5)}, Lng: {liveLocation.lng.toFixed(5)}
                  </div>
                )}
              </div>
              {locationError && <p className="text-sm text-destructive mt-2">{locationError}</p>}
            </motion.section>

            {/* Section 5: Observations & Verification */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-2 mb-6">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-heading font-bold">5. Observations & Verification</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Observations / Irregularities</Label>
                  <Textarea
                    placeholder="Describe any issues observed during the collation process..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Digital Signature (Full Name)</Label>
                    <Input
                      placeholder="Enter your full name to sign"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={signatureDate}
                      onChange={(e) => setSignatureDate(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Submit Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8"
            >
              <p className="text-xs text-muted-foreground">
                By submitting, I certify that the data provided is accurate and verifiable.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleSaveDraft} className="font-semibold">
                  Save Draft
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="font-bold gap-2"
                >
                  {loading ? "Submitting..." : "Submit Report"} <FileUp className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ElectionForm;
