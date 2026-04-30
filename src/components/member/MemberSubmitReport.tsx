import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Eye, CheckCircle } from "lucide-react";
import InecLocationPicker from "@/components/shared/InecLocationPicker";

const reportTypes = [
  { id: "incident", label: "Incident Report", desc: "Report security issues, violence, or threats", icon: AlertTriangle, color: "text-amber-600 bg-amber-50" },
  { id: "irregularity", label: "Electoral Irregularity", desc: "Ballot tampering, voter suppression, fraud", icon: Shield, color: "text-red-600 bg-red-50" },
  { id: "observation", label: "Field Observation", desc: "General observations and field notes", icon: Eye, color: "text-blue-600 bg-blue-50" },
  { id: "status", label: "Status Update", desc: "Routine progress or status updates", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
];

const severities = ["Low", "Medium", "High", "Critical"];

const MemberSubmitReport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("incident");
  const [severity, setSeverity] = useState("Medium");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lga, setLga] = useState(user?.user_metadata?.lga || "");
  const [ward, setWard] = useState(user?.user_metadata?.ward || "");
  const [pollingUnit, setPollingUnit] = useState("");
  const [loading, setLoading] = useState(false);

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";

  const handleSubmit = async () => {
    if (!title || !description || !user) return;
    setLoading(true);
    const { error } = await supabase.from("situation_updates").insert({
      title: `[${severity}] ${title}`,
      content: `Type: ${reportType}\nSeverity: ${severity}\nLocation: ${lga}, ${ward}, ${pollingUnit}\n\n${description}`,
      category: reportType === "incident" ? "Incident" : reportType === "irregularity" ? "Electoral" : "General",
      author_id: user.id,
      status: "Active",
    });
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Report submitted!", description: "Your report is under review." });
      setTitle("");
      setDescription("");
      setPollingUnit("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Submit Report</h2>
        <p className="text-sm text-gray-500">Submit field reports, incident observations, and status updates from your assigned area</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Report Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {reportTypes.map((rt) => (
                <button key={rt.id} onClick={() => setReportType(rt.id)} className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-all ${reportType === rt.id ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className={`w-10 h-10 rounded-lg ${rt.color} flex items-center justify-center`}>
                    <rt.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{rt.label}</p>
                    <p className="text-[11px] text-gray-500">{rt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">📍 Location Details</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">LGA</label>
                <Input value={lga} onChange={(e) => setLga(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Ward</label>
                <Input value={ward} onChange={(e) => setWard(e.target.value)} placeholder="e.g. Ward 5" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Polling Unit</label>
                <Input value={pollingUnit} onChange={(e) => setPollingUnit(e.target.value)} placeholder="e.g. PU-034" className="mt-1" />
              </div>
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-4">Report Details</h3>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Severity Level</label>
              <div className="flex gap-2">
                {severities.map(s => (
                  <button key={s} onClick={() => setSeverity(s)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${severity === s ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Report Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title describing the report..." />
            </div>
            <div className="mb-2">
              <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed information about the situation..." rows={6} />
              <p className="text-xs text-gray-400 mt-1">{description.length}/2000 characters</p>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-400">ⓘ All reports are reviewed by coordinators before verification</p>
            <div className="flex gap-2">
              <Button variant="outline">Save Draft</Button>
              <Button onClick={handleSubmit} disabled={loading || !title || !description} className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2">
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Reporting Guidelines</h4>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Be factual and specific in your observations</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Attach photographic evidence when possible</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Include exact location and polling unit ID</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Submit reports in real-time when possible</li>
              <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> Do not put yourself in danger to collect info</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Reporter Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-bold text-gray-900">{displayName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Assigned Area</span><span className="font-bold text-gray-900">{lga}, {ward}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-bold text-emerald-600">Member</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSubmitReport;
