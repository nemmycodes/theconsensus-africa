import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface Profile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  lga: string | null;
  ward: string | null;
  avatar_url: string | null;
}

const SRUsers = () => {
  const [rows, setRows] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, lga, ward, avatar_url")
        .limit(200);
      setRows((profs as Profile[]) || []);

      const { data: r } = await supabase.from("user_roles").select("user_id, role");
      const map: Record<string, string[]> = {};
      (r || []).forEach((row) => {
        const arr = map[row.user_id] || [];
        arr.push(row.role);
        map[row.user_id] = arr;
      });
      setRoles(map);
    })();
  }, []);

  const filtered = rows.filter(
    (r) => !search || `${r.full_name ?? ""} ${r.email ?? ""} ${r.lga ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor: Record<string, string> = {
    super_admin: "bg-destructive/10 text-destructive",
    admin: "bg-orange-100 text-orange-600",
    agent: "bg-blue-100 text-blue-600",
    kef_user: "bg-purple-100 text-purple-600",
    user: "bg-primary/10 text-primary",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black uppercase">Users</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Directory of operators, agents, and members in the Situation Room.
        </p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, or LGA…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Email</th>
                <th className="text-left px-5 py-3">LGA</th>
                <th className="text-left px-5 py-3">Ward</th>
                <th className="text-left px-5 py-3">Roles</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-10 text-muted-foreground">No users found.</td></tr>
              )}
              {filtered.map((u) => {
                const initials = (u.full_name || u.email || "?").slice(0, 2).toUpperCase();
                const userRoles = roles[u.user_id] || ["user"];
                return (
                  <tr key={u.user_id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                          {initials}
                        </div>
                        <span className="font-medium">{u.full_name || "Unnamed"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-5 py-3">{u.lga || "—"}</td>
                    <td className="px-5 py-3">{u.ward || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {userRoles.map((r) => (
                          <Badge key={r} variant="secondary" className={roleColor[r] || "bg-muted"}>
                            {r}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SRUsers;
