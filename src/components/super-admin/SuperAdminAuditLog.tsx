import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileDown, Search, Activity } from "lucide-react";
import { toast } from "sonner";

const SuperAdminAuditLog = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    else setLogs(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = logs.filter(
    (l) =>
      !q ||
      l.action?.toLowerCase().includes(q.toLowerCase()) ||
      l.actor_email?.toLowerCase().includes(q.toLowerCase()) ||
      l.target_type?.toLowerCase().includes(q.toLowerCase()),
  );

  const exportCsv = () => {
    const headers = ["created_at", "actor_email", "action", "target_type", "target_id"];
    const csv = [headers.join(","), ...filtered.map((l) => headers.map((h) => `"${(l[h] ?? "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = `audit-log-${Date.now()}.csv`; a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Activity className="w-6 h-6 text-amber-400" /> Audit Log</h1>
          <p className="text-sm text-gray-400">Read-only trail of platform actions (last 500 entries)</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><FileDown className="w-4 h-4 mr-2" /> Export</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input className="pl-9 bg-white/5 border-white/10 text-white" placeholder="Search action / actor / target…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No log entries.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs uppercase text-gray-500">
              <tr><th className="p-3">When</th><th className="p-3">Actor</th><th className="p-3">Action</th><th className="p-3">Target</th></tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-white/5">
                  <td className="p-3 text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                  <td className="p-3 text-gray-200">{l.actor_email || l.actor_id?.slice(0, 8) || "system"}</td>
                  <td className="p-3"><Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{l.action}</Badge></td>
                  <td className="p-3 text-xs text-gray-400">{l.target_type || "—"}{l.target_id ? ` · ${l.target_id.slice(0, 8)}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SuperAdminAuditLog;
