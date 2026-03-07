import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Radio, AlertTriangle, CheckCircle, Clock, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface SituationUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  author_id: string;
}

const statusConfig: Record<string, { color: string; iconBg: string; iconColor: string; icon: typeof AlertTriangle }> = {
  Active: { color: "bg-red-50 border-red-100", iconBg: "bg-red-100", iconColor: "text-red-500", icon: AlertTriangle },
  Resolved: { color: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", icon: CheckCircle },
  Monitoring: { color: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", icon: Clock },
  Info: { color: "bg-blue-50 border-blue-100", iconBg: "bg-blue-100", iconColor: "text-blue-600", icon: Radio },
};

const categories = ["General", "Security", "Infrastructure", "Political", "Social", "Economic"];
const statuses = ["Active", "Resolved", "Monitoring", "Info"];
const filterTabs = ["All", "Active", "Resolved", "Monitoring"];

const AdminSituationRoom = () => {
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<SituationUpdate | null>(null);
  const [form, setForm] = useState({ title: "", content: "", category: "General", status: "Active" });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUpdates = async () => {
    setLoading(true);
    const { data } = await supabase.from("situation_updates").select("*").order("created_at", { ascending: false });
    if (data) setUpdates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUpdates();
    const channel = supabase
      .channel("situation-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => fetchUpdates())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreate = () => {
    setEditingUpdate(null);
    setForm({ title: "", content: "", category: "General", status: "Active" });
    setDialogOpen(true);
  };

  const openEdit = (update: SituationUpdate) => {
    setEditingUpdate(update);
    setForm({ title: update.title, content: update.content, category: update.category, status: update.status });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { title: form.title.trim(), content: form.content.trim(), category: form.category, status: form.status };
    if (editingUpdate) {
      const { error } = await supabase.from("situation_updates").update(payload).eq("id", editingUpdate.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Update modified" });
    } else {
      const { error } = await supabase.from("situation_updates").insert({ ...payload, author_id: user?.id || "" });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Update posted" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchUpdates();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("situation_updates").delete().eq("id", id);
    fetchUpdates();
  };

  const filtered = activeFilter === "All" ? updates : updates.filter((u) => u.status === activeFilter);
  const activeCount = updates.filter((u) => u.status === "Active").length;
  const resolvedCount = updates.filter((u) => u.status === "Resolved").length;

  return (
    <div>
      <AdminHeader
        title="Situation Room"
        subtitle="Real-time monitoring and incident response"
        liveBadge={{ label: "LIVE MONITORING", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "TOTAL REPORTS", value: updates.length.toString(), icon: Radio, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "ACTIVE INCIDENTS", value: activeCount.toString(), icon: AlertTriangle, bg: "bg-red-50", color: "text-red-500" },
          { label: "RESOLVED", value: resolvedCount.toString(), icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "RESPONSE TIME", value: "8.5", suffix: "min", icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}{s.suffix && <span className="text-lg ml-1">{s.suffix}</span>}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          {filterTabs.map((tab) => (
            <button key={tab} onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeFilter === tab ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" /> New Report
        </Button>
      </div>

      {/* Reports Feed */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading reports...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No reports found.</p>
        ) : (
          filtered.map((update) => {
            const config = statusConfig[update.status] || statusConfig.Info;
            const Icon = config.icon;
            return (
              <div key={update.id} className={`${config.color} border rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${config.iconColor} ${config.iconBg}`}>{update.status}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">{update.category}</span>
                      <span className="text-xs text-gray-500">{format(new Date(update.created_at), "HH:mm:ss")}</span>
                      <div className="ml-auto flex gap-1">
                        <button onClick={() => openEdit(update)} className="px-2 py-1 bg-white text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 border border-gray-200">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDelete(update.id)} className="px-2 py-1 bg-white text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 border border-gray-200">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{update.title}</h4>
                    <p className="text-sm text-gray-700 mb-1">{update.content}</p>
                    <span className="text-xs text-gray-500">{format(new Date(update.created_at), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingUpdate ? "Edit Report" : "New Situation Report"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-700">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
            <div><Label className="text-gray-700">Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="bg-white border-gray-200 text-gray-900" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-700">Category</Label><select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div><Label className="text-gray-700">Status</Label><select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? "Saving..." : editingUpdate ? "Update Report" : "Submit Report"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSituationRoom;
