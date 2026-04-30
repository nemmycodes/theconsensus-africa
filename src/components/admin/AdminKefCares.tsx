import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Search, Eye, Trash2, Download, Users, Bell, Plus, Edit3 } from "lucide-react";

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

interface ProgramUpdate {
  id: string;
  title: string;
  body: string;
  date_label: string | null;
  published: boolean;
  created_at: string;
}

const AdminKefCares = () => {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-emerald-600" /> KEF-CARES Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Central Zone Pilot — manage registrations and programme updates.</p>
      </div>
      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="registrations" className="gap-2"><Users className="w-4 h-4" /> Registrations</TabsTrigger>
          <TabsTrigger value="updates" className="gap-2"><Bell className="w-4 h-4" /> Programme Updates</TabsTrigger>
        </TabsList>
        <TabsContent value="registrations"><RegistrationsView /></TabsContent>
        <TabsContent value="updates"><UpdatesManager /></TabsContent>
      </Tabs>
    </div>
  );
};

const RegistrationsView = () => {
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">{registrations.length} total registrations</p>
        <Button variant="outline" onClick={exportCSV} className="gap-2 self-start sm:self-auto"><Download className="w-4 h-4" /> Export CSV</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by name, phone, or LGA…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
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
              <DetailRow label="Marital Status" value={selected.marital_status} />
              <DetailRow label="Social Status" value={selected.social_status} />
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

/* ─── Programme Updates Manager ─── */
const UpdatesManager = () => {
  const [updates, setUpdates] = useState<ProgramUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProgramUpdate | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", date_label: "", published: true });
  const [saving, setSaving] = useState(false);

  const fetchUpdates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("kef_cares_program_updates")
      .select("*")
      .order("created_at", { ascending: false });
    setUpdates((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchUpdates(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ title: "", body: "", date_label: "", published: true });
    setShowDialog(true);
  };

  const openEdit = (u: ProgramUpdate) => {
    setEditing(u);
    setForm({ title: u.title, body: u.body, date_label: u.date_label || "", published: u.published });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.body) {
      toast({ title: "Title and body required", variant: "destructive" });
      return;
    }
    setSaving(true);
    let error;
    if (editing) {
      ({ error } = await supabase.from("kef_cares_program_updates").update(form).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("kef_cares_program_updates").insert([form]));
    }
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: editing ? "Update saved" : "Update published" });
      setShowDialog(false);
      fetchUpdates();
    }
  };

  const togglePublished = async (u: ProgramUpdate) => {
    const { error } = await supabase
      .from("kef_cares_program_updates")
      .update({ published: !u.published })
      .eq("id", u.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchUpdates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this programme update?")) return;
    const { error } = await supabase.from("kef_cares_program_updates").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Deleted" }); fetchUpdates(); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">{updates.length} programme updates — visible to KEF-CARES users.</p>
        <Button onClick={openNew} className="gap-2 bg-emerald-600 hover:bg-emerald-700 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Update
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : updates.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No programme updates yet. Create the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map(u => (
            <div key={u.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm">{u.title}</h4>
                    {u.published
                      ? <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Published</Badge>
                      : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                  </div>
                  {u.date_label && <p className="text-xs text-gray-500 mt-1">{u.date_label}</p>}
                  <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{u.body}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-2 mr-2">
                    <Switch checked={u.published} onCheckedChange={() => togglePublished(u)} />
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Edit3 className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500" onClick={() => handleDelete(u.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Programme Update</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Date Label (e.g. "March 2026", "Q3 2026")</Label>
              <Input value={form.date_label} onChange={(e) => setForm({ ...form, date_label: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <Textarea rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
              Published (visible to users)
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKefCares;
