import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Megaphone, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AUDIENCES = ["all", "members", "agents", "admins", "kef_users"];
const SEVERITIES = ["info", "warning", "critical"];

const SuperAdminBroadcasts = () => {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", body: "", audience: "all", severity: "info" });
  const [sending, setSending] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("broadcasts").select("*").order("created_at", { ascending: false });
    setList(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!form.title || !form.body) return toast.error("Title and body required");
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("broadcasts").insert({ ...form, created_by: user?.id });
    setSending(false);
    if (error) return toast.error(error.message);
    await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "broadcast.send", target_type: "broadcast", metadata: { audience: form.audience } });
    toast.success("Broadcast sent");
    setForm({ title: "", body: "", audience: "all", severity: "info" });
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("broadcasts").update({ active }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("broadcasts").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Megaphone className="w-6 h-6 text-amber-400" /> Broadcast Center</h1>
        <p className="text-sm text-gray-400">Send platform-wide announcements to specific audiences.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-5 space-y-3">
        <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10 text-white" />
        <Textarea rows={3} placeholder="Message" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="bg-white/5 border-white/10 text-white" />
        <div className="grid grid-cols-2 gap-2">
          <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{SEVERITIES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button onClick={send} disabled={sending} className="w-full bg-amber-600 hover:bg-amber-700">
          {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Send Broadcast
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Sent Broadcasts</h3>
        {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-400" /> : list.length === 0 ? (
          <p className="text-gray-500 text-sm">No broadcasts.</p>
        ) : list.map((b) => (
          <div key={b.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex gap-2 items-center mb-1">
                  <strong className="text-white">{b.title}</strong>
                  <Badge variant="outline" className="text-xs">{b.audience}</Badge>
                  <Badge className={`text-xs ${b.severity === "critical" ? "bg-red-500/20 text-red-300" : b.severity === "warning" ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"}`}>{b.severity}</Badge>
                </div>
                <p className="text-sm text-gray-300">{b.body}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(b.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={b.active} onCheckedChange={(v) => toggle(b.id, v)} />
                <Button size="icon" variant="ghost" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminBroadcasts;
