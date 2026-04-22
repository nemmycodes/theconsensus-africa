import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Flag, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SuperAdminFeatureFlags = () => {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ flag_key: "", description: "", audience: "all" });

  const load = async () => {
    const { data } = await supabase.from("feature_flags").select("*").order("flag_key");
    setFlags(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.flag_key.trim()) return toast.error("Key required");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("feature_flags").insert({ ...form, updated_by: user?.id });
    if (error) return toast.error(error.message);
    await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "feature_flag.create", target_type: "feature_flag", target_id: form.flag_key });
    setOpen(false); setForm({ flag_key: "", description: "", audience: "all" }); load();
  };

  const toggle = async (f: any, enabled: boolean) => {
    await supabase.from("feature_flags").update({ enabled }).eq("id", f.id);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "feature_flag.toggle", target_type: "feature_flag", target_id: f.flag_key, metadata: { enabled } });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete flag?")) return;
    await supabase.from("feature_flags").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Flag className="w-6 h-6 text-amber-400" /> Feature Flags</h1>
          <p className="text-sm text-gray-400">Toggle experimental or seasonal features without redeploying.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Flag</Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? <Loader2 className="w-6 h-6 m-auto my-12 text-amber-400 animate-spin" /> : flags.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No flags defined.</div>
        ) : flags.map((f) => (
          <div key={f.id} className="p-4 border-b border-white/5 last:border-b-0 flex justify-between items-center hover:bg-white/5">
            <div className="flex-1">
              <div className="flex gap-2 items-center"><code className="text-amber-300">{f.flag_key}</code><span className="text-xs text-gray-500">→ {f.audience}</span></div>
              {f.description && <p className="text-xs text-gray-400 mt-1">{f.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={f.enabled} onCheckedChange={(v) => toggle(f, v)} />
              <Button size="icon" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Feature Flag</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="flag_key (e.g. enable_donations)" value={form.flag_key} onChange={(e) => setForm({ ...form, flag_key: e.target.value })} />
            <Input placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Audience (all, members, beta…)" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
            <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={create}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminFeatureFlags;
