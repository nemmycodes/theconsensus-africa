import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Key, Plus, Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

const SuperAdminApiKeys = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    setKeys(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!label.trim()) return toast.error("Label required");
    const raw = `pck_${crypto.randomUUID().replace(/-/g, "")}`;
    const enc = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest("SHA-256", enc);
    const hash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("api_keys").insert({
      label: label.trim(), prefix: raw.slice(0, 10), key_hash: hash, created_by: user?.id,
    });
    if (error) return toast.error(error.message);
    await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "api_key.create", target_type: "api_key", metadata: { label } });
    setRevealed(raw); setLabel(""); load();
  };

  const revoke = async (id: string) => {
    if (!confirm("Revoke this key?")) return;
    await supabase.from("api_keys").update({ revoked: true }).eq("id", id);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "api_key.revoke", target_type: "api_key", target_id: id });
    toast.success("Revoked"); load();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Key className="w-6 h-6 text-amber-400" /> API Keys</h1>
          <p className="text-sm text-gray-400">Issue and revoke programmatic access keys.</p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Key</Button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? <div className="p-12 text-center"><Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" /></div> : keys.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No keys.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-gray-500">
              <tr><th className="p-3">Label</th><th className="p-3">Prefix</th><th className="p-3">Created</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-white/5">
                  <td className="p-3 text-gray-200">{k.label}</td>
                  <td className="p-3 font-mono text-xs text-gray-400">{k.prefix}…</td>
                  <td className="p-3 text-xs text-gray-500">{new Date(k.created_at).toLocaleDateString()}</td>
                  <td className="p-3"><Badge className={k.revoked ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"}>{k.revoked ? "Revoked" : "Active"}</Badge></td>
                  <td className="p-3 text-right">
                    {!k.revoked && <Button size="sm" variant="ghost" onClick={() => revoke(k.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setRevealed(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{revealed ? "Save your new key" : "Create API Key"}</DialogTitle></DialogHeader>
          {revealed ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">This is the only time the key is shown. Store it securely.</p>
              <div className="flex gap-2">
                <Input readOnly value={revealed} className="font-mono text-xs" />
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(revealed); toast.success("Copied"); }}><Copy className="w-4 h-4" /></Button>
              </div>
              <Button className="w-full" onClick={() => { setOpen(false); setRevealed(null); }}>Done</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input placeholder="Label (e.g., 'INEC sync bot')" value={label} onChange={(e) => setLabel(e.target.value)} />
              <Button className="w-full bg-amber-600 hover:bg-amber-700" onClick={generate}>Generate</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuperAdminApiKeys;
