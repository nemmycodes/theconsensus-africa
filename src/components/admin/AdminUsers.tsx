import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, UserPlus, MoreVertical, Filter, Users, Shield, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserWithRole {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  roles: string[];
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, agents: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("*"),
      ]);

      const profiles = profilesRes.data ?? [];
      const roles = rolesRes.data ?? [];

      const rolesMap: Record<string, string[]> = {};
      roles.forEach((r) => {
        if (!rolesMap[r.user_id]) rolesMap[r.user_id] = [];
        rolesMap[r.user_id].push(r.role);
      });

      const combined: UserWithRole[] = profiles.map((p) => ({
        ...p,
        roles: rolesMap[p.user_id] ?? ["user"],
      }));

      setUsers(combined);
      setStats({
        total: profiles.length,
        agents: roles.filter((r) => r.role === "agent").length,
      });
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const initialsColors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
  ];

  const roleColors: Record<string, string> = {
    admin: "bg-red-50 text-red-700 border-red-200",
    agent: "bg-blue-50 text-blue-700 border-blue-200",
    user: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (u.full_name ?? "").toLowerCase().includes(q) ||
      (u.email ?? "").toLowerCase().includes(q) ||
      u.roles.some((r) => r.toLowerCase().includes(q))
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <AdminHeader title="Users" subtitle="Manage user accounts, roles, and permissions" />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search users by name, email, or role..."
            className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter
        </Button>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Users", value: stats.total.toString(), bg: "bg-emerald-50", color: "text-emerald-600" },
          { icon: Shield, label: "Agents", value: stats.agents.toString(), bg: "bg-blue-50", color: "text-blue-600" },
          { icon: CheckCircle, label: "Active", value: stats.total.toString(), bg: "bg-amber-50", color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading users…</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No users found</div>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Roles</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="text-center p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, i) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${initialsColors[i % initialsColors.length]} flex items-center justify-center text-xs font-bold`}>
                          {getInitials(user.full_name || "U")}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.full_name || "Unnamed"}</p>
                          <p className="text-xs text-gray-500">{user.email || "No email"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {user.roles.map((role) => (
                          <span key={role} className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${roleColors[role] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{formatDate(user.created_at)}</td>
                    <td className="p-4 text-center">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-900">{filteredUsers.length}</span> of <span className="font-bold text-gray-900">{users.length}</span> users
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
