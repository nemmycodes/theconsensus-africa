import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Search, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const SuperAdminImpersonation = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setActive(localStorage.getItem("impersonate_user_id"));
    (async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      setUsers(data || []); setLoading(false);
    })();
  }, []);

  const start = async (u: any) => {
    if (!confirm(`Start impersonating ${u.full_name || u.email}? Read-only support session.`)) return;
    localStorage.setItem("impersonate_user_id", u.user_id);
    localStorage.setItem("impersonate_user_label", u.full_name || u.email || u.user_id);
    setActive(u.user_id);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      actor_id: user?.id, actor_email: user?.email, action: "impersonation.start",
      target_type: "user", target_id: u.user_id, metadata: { label: u.full_name },
    });
    toast.success(`Impersonating ${u.full_name || u.email}`);
  };

  const stop = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "impersonation.stop", target_type: "user", target_id: active || "" });
    localStorage.removeItem("impersonate_user_id"); localStorage.removeItem("impersonate_user_label");
    setActive(null);
    toast.success("Impersonation ended");
  };

  const filtered = users.filter((u) => !q || (u.full_name || "").toLowerCase().includes(q.toLowerCase()) || (u.email || "").toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><UserCheck className="w-6 h-6 text-amber-400" /> Secure Impersonation</h1>
        <p className="text-sm text-gray-400">Step into a user's view (read-only support context). All sessions are audited.</p>
      </div>

      {active && (
        <div className="bg-amber-500/15 border border-amber-500/30 rounded-lg p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-amber-300"><AlertTriangle className="w-4 h-4" /> Active impersonation: <code className="text-xs">{localStorage.getItem("impersonate_user_label")}</code></div>
          <Button size="sm" variant="outline" onClick={stop}>End</Button>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input className="pl-9 bg-white/5 border-white/10 text-white" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? <Loader2 className="w-6 h-6 m-auto my-12 text-amber-400 animate-spin" /> : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 100).map((u) => (
                <tr key={u.id} className="hover:bg-white/5">
                  <td className="p-3 text-gray-200">
                    <div className="font-medium">{u.full_name || "—"}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => start(u)} disabled={active === u.user_id}>{active === u.user_id ? "Active" : "Impersonate"}</Button>
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

export default SuperAdminImpersonation;
