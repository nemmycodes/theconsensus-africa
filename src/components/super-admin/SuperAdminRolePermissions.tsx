import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

const ROLES = ["super_admin", "admin", "agent", "kef_user", "user"] as const;
const PERMISSIONS = [
  { key: "users.manage", label: "Manage users" },
  { key: "agents.manage", label: "Manage agents" },
  { key: "election.verify", label: "Verify election reports" },
  { key: "primaries.verify", label: "Verify primaries collation" },
  { key: "blog.publish", label: "Publish blog posts" },
  { key: "events.manage", label: "Manage events" },
  { key: "broadcasts.send", label: "Send broadcasts" },
  { key: "feature_flags.manage", label: "Manage feature flags" },
  { key: "api_keys.manage", label: "Manage API keys" },
  { key: "site.edit", label: "Edit site CMS" },
];

const SuperAdminRolePermissions = () => {
  const [matrix, setMatrix] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const key = (role: string, perm: string) => `${role}::${perm}`;

  const load = async () => {
    const { data } = await supabase.from("role_permissions").select("*");
    const m: Record<string, boolean> = {};
    (data || []).forEach((r) => { m[key(r.role, r.permission)] = r.allowed; });
    setMatrix(m);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (role: string, perm: string, allowed: boolean) => {
    setMatrix((m) => ({ ...m, [key(role, perm)]: allowed }));
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("role_permissions")
      .upsert({ role: role as any, permission: perm, allowed, updated_by: user?.id, updated_at: new Date().toISOString() }, { onConflict: "role,permission" });
    if (error) { toast.error(error.message); load(); }
    else await supabase.from("audit_logs").insert({ actor_id: user?.id, actor_email: user?.email, action: "permissions.update", target_type: "role_permission", target_id: `${role}:${perm}`, metadata: { allowed } });
  };

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-6 h-6 text-amber-400 animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-amber-400" /> Role Permissions Matrix</h1>
        <p className="text-sm text-gray-400">Granular control over what each role can do.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              <th className="p-3 text-left text-xs uppercase text-gray-500">Permission</th>
              {ROLES.map((r) => <th key={r} className="p-3 text-center text-xs uppercase text-gray-400">{r.replace("_", " ")}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {PERMISSIONS.map((p) => (
              <tr key={p.key} className="hover:bg-white/5">
                <td className="p-3 text-gray-200">{p.label} <div className="text-[10px] text-gray-500 font-mono">{p.key}</div></td>
                {ROLES.map((r) => (
                  <td key={r} className="p-3 text-center">
                    <Switch checked={!!matrix[key(r, p.key)] || r === "super_admin"} disabled={r === "super_admin"} onCheckedChange={(v) => toggle(r, p.key, v)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">Super Admin is always granted all permissions and cannot be modified.</p>
    </div>
  );
};

export default SuperAdminRolePermissions;
