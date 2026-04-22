import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Search, Eye, Trash2, Download, Users } from "lucide-react";

interface Registration {
  id: string;
  created_at: string;
  full_name: string;
  gender: string;
  phone_number: string;
  email: string | null;
  lga: string;
  ward: string | null;
  community: string | null;
  economic_status: string | null;
  occupation: string | null;
  highest_qualification: string | null;
  consent_given: boolean;
  [key: string]: any;
}

const AdminKefCares = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("kef_cares_registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = registrations.filter(r =>
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    r.phone_number.includes(search) ||
    (r.lga || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this registration?")) return;
    const { error } = await supabase.from("kef_cares_registrations").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchData(); }
  };

  const exportCSV = () => {
    if (!registrations.length) return;
    // Export ALL fields collected
    const allKeys = Array.from(
      registrations.reduce((set, r) => {
        Object.keys(r).forEach((k) => set.add(k));
        return set;
      }, new Set<string>())
    );
    const headers = allKeys;
    const rows = registrations.map((r) =>
      headers.map((h) => {
        const v = r[h];
        if (v === null || v === undefined) return "";
        if (Array.isArray(v)) return v.join("; ");
        if (typeof v === "boolean") return v ? "Yes" : "No";
        if (h === "created_at") return new Date(v).toLocaleString();
        return String(v);
      })
    );
    const escape = (c: string) => `"${c.replace(/"/g, '""')}"`;
    const csv = [headers.map(escape), ...rows.map((r) => r.map(escape))].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "kef-cares-registrations.csv"; a.click();
  };

  const DetailRow = ({ label, value }: { label: string; value: any }) => {
    if (value === null || value === undefined || value === "" || value === false) return null;
    if (Array.isArray(value) && value.length === 0) return null;
    const display = Array.isArray(value) ? value.join(", ") : value === true ? "Yes" : String(value);
    return <div className="grid grid-cols-2 gap-2 py-1.5 border-b border-gray-100"><span className="text-sm font-medium text-gray-500">{label}</span><span className="text-sm">{display}</span></div>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6 text-emerald-600" /> KEF-CARES Registrations</h1>
          <p className="text-sm text-muted-foreground mt-1">Central Zone Pilot – {registrations.length} total registrations</p>
        </div>
        <Button variant="outline" onClick={exportCSV} className="gap-2"><Download className="w-4 h-4" /> Export CSV</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by name, phone, or LGA…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>LGA</TableHead>
                <TableHead>Marital</TableHead>
                <TableHead>Social</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-400">No registrations found</TableCell></TableRow>
              ) : filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.full_name}</TableCell>
                  <TableCell>{r.phone_number}</TableCell>
                  <TableCell>{r.lga}</TableCell>
                  <TableCell className="text-sm">{r.marital_status || <span className="text-gray-400">—</span>}</TableCell>
                  <TableCell className="text-sm">{r.social_status || <span className="text-gray-400">—</span>}</TableCell>
                  <TableCell><Badge variant={r.economic_status ? "default" : "secondary"}>{r.economic_status || "N/A"}</Badge></TableCell>
                  <TableCell className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => setSelected(r)}><Eye className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(r.id)}><Trash2 className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected?.full_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground mb-3">Registered {new Date(selected.created_at).toLocaleString()}</p>
              <h4 className="font-semibold text-sm text-emerald-700 mt-2">Personal</h4>
              <DetailRow label="Gender" value={selected.gender} />
              <DetailRow label="DOB" value={selected.date_of_birth} />
              <DetailRow label="Phone" value={selected.phone_number} />
              <DetailRow label="WhatsApp" value={selected.whatsapp_active} />
              <DetailRow label="Email" value={selected.email} />
              <DetailRow label="Address" value={selected.residential_address} />
              <h4 className="font-semibold text-sm text-emerald-700 mt-3">Location</h4>
              <DetailRow label="LGA" value={selected.lga} />
              <DetailRow label="Ward" value={selected.ward} />
              <DetailRow label="Polling Unit" value={selected.polling_unit} />
              <DetailRow label="Community" value={selected.community} />
              <h4 className="font-semibold text-sm text-emerald-700 mt-3">Education</h4>
              <DetailRow label="Qualification" value={selected.highest_qualification} />
              <DetailRow label="Field of Study" value={selected.field_of_study} />
              <DetailRow label="Status" value={selected.education_status} />
              <h4 className="font-semibold text-sm text-emerald-700 mt-3">Employment</h4>
              <DetailRow label="Economic Status" value={selected.economic_status} />
              <DetailRow label="Occupation" value={selected.occupation} />
              <DetailRow label="Sector" value={selected.primary_economic_sector} />
              <DetailRow label="Income" value={selected.monthly_income_range} />
              <DetailRow label="Owns Business" value={selected.owns_business} />
              <DetailRow label="Business Type" value={selected.business_type} />
              <h4 className="font-semibold text-sm text-emerald-700 mt-3">Skills</h4>
              <DetailRow label="Artisan" value={selected.artisan_skills} />
              <DetailRow label="Creative" value={selected.creative_skills} />
              <DetailRow label="Professional" value={selected.professional_skills} />
              <DetailRow label="Sports" value={selected.sports_participation} />
              <DetailRow label="Sport Type" value={selected.sport_type} />
              <h4 className="font-semibold text-sm text-emerald-700 mt-3">Programme Interest</h4>
              <DetailRow label="Entrepreneurship" value={selected.interest_entrepreneurship} />
              <DetailRow label="Agricultural" value={selected.interest_agricultural} />
              <DetailRow label="Trading" value={selected.interest_trading} />
              <DetailRow label="Skills Training" value={selected.interest_skills_training} />
              <DetailRow label="Economic Empowerment" value={selected.interest_economic_empowerment} />
              <DetailRow label="Leadership" value={selected.interest_leadership} />
              <DetailRow label="Networking" value={selected.interest_professional_networking} />
              <h4 className="font-semibold text-sm text-emerald-700 mt-3">Volunteer</h4>
              <DetailRow label="Interested" value={selected.interested_in_volunteering} />
              <DetailRow label="Role" value={selected.volunteer_role} />
              <DetailRow label="Availability" value={selected.volunteer_availability} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKefCares;
