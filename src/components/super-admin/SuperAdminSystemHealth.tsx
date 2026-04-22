import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Activity, Database, Loader2, RefreshCw, CheckCircle2, AlertCircle, Server } from "lucide-react";
import { toast } from "sonner";

const TABLES = [
  "profiles", "user_roles", "election_reports", "primaries_collation",
  "kef_cares_registrations", "events", "blog_posts", "contact_messages",
  "agent_recruitment_applications", "audit_logs",
];

const SuperAdminSystemHealth = () => {
  const [counts, setCounts] = useState<Record<string, number | null>>({});
  const [latency, setLatency] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [backupBusy, setBackupBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    const start = performance.now();
    const results: Record<string, number | null> = {};
    await Promise.all(
      TABLES.map(async (t) => {
        const { count, error } = await supabase.from(t as any).select("*", { count: "exact", head: true });
        results[t] = error ? null : count ?? 0;
      }),
    );
    setCounts(results);
    setLatency(Math.round(performance.now() - start));
    setLoading(false);
  };
  useEffect(() => { refresh(); }, []);

  const triggerBackup = async () => {
    setBackupBusy(true);
    try {
      const snapshot: any = {};
      for (const t of TABLES) {
        const { data } = await supabase.from(t as any).select("*").limit(1000);
        snapshot[t] = data || [];
      }
      const blob = new Blob([JSON.stringify({ taken_at: new Date().toISOString(), data: snapshot }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `backup-${Date.now()}.json`; a.click();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "system.backup", target_type: "snapshot" });
      toast.success("Backup downloaded");
    } catch (e: any) { toast.error(e.message); }
    finally { setBackupBusy(false); }
  };

  const totalRecords = Object.values(counts).reduce((s: number, n) => s + (n || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-start flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Server className="w-6 h-6 text-amber-400" /> System Health & Backups</h1>
          <p className="text-sm text-gray-400">Database vitals and one-click snapshot backups.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          <Button className="bg-amber-600 hover:bg-amber-700" onClick={triggerBackup} disabled={backupBusy}>
            {backupBusy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
            Download Backup
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} label="Backend" value="Healthy" />
        <Card icon={<Activity className="w-5 h-5 text-amber-400" />} label="Query latency" value={latency !== null ? `${latency} ms` : "—"} />
        <Card icon={<Database className="w-5 h-5 text-blue-400" />} label="Total records" value={loading ? "…" : totalRecords.toLocaleString()} />
        <Card icon={<Server className="w-5 h-5 text-purple-400" />} label="Tables monitored" value={String(TABLES.length)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10 text-sm font-semibold text-white">Table snapshot</div>
        {loading ? <div className="p-12 text-center"><Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" /></div> : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {TABLES.map((t) => (
                <tr key={t} className="hover:bg-white/5">
                  <td className="p-3 font-mono text-gray-300">{t}</td>
                  <td className="p-3 text-right">
                    {counts[t] === null ? <span className="text-red-400 inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> error</span> : <span className="text-amber-300 font-semibold">{counts[t]?.toLocaleString()}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Card = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">{icon}{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
  </div>
);

export default SuperAdminSystemHealth;
