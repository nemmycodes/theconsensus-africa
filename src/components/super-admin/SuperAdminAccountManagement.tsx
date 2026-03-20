import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SuperAdminHeader from "./SuperAdminHeader";
import { Search, Shield, UserCog, Crown, Users, Trash2, Plus } from "lucide-react";

interface UserWithRoles {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  lga: string | null;
  created_at: string;
  roles: string[];
}

interface Props {
  filter: "all" | "agents" | "admins";
}

const roleBadgeColors: Record<string, string> = {
  user: "bg-blue-50 text-blue-700 border-blue-200",
  agent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  super_admin: "bg-amber-50 text-amber-700 border-amber-200",
};

const SuperAdminAccountManagement = ({ filter }: Props) => {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const titles: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
    all: { title: "All Users", subtitle: "Manage all registered members and their roles", icon: Users },
    agents: { title: "Agent Management", subtitle: "Manage movement agents and field operatives", icon: Shield },
    admins: { title: "Administrator Management", subtitle: "Manage system administrators and super admins", icon: UserCog },
  };

  const fetchUsers = async () => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, email, phone, lga, created_at"),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    const profiles = profilesRes.data || [];
    const roles = rolesRes.data || [];

    const roleMap: Record<string, string[]> = {};
    roles.forEach((r) => {
      if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
      roleMap[r.user_id].push(r.role);
    });

    let combined: UserWithRoles[] = profiles.map((p) => ({
      ...p,
      roles: roleMap[p.user_id] || [],
    }));

    if (filter === "agents") {
      combined = combined.filter((u) => u.roles.includes("agent"));
    } else if (filter === "admins") {
      combined = combined.filter((u) => u.roles.includes("admin") || u.roles.includes("super_admin"));
    }

    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const toggleRole = async (userId: string, role: string, hasRole: boolean) => {
    if (hasRole) {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role as any);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: `${role} role removed` });
    } else {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: role as any });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: `${role} role assigned` });
    }
    fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this user? This cannot be undone.");
    if (!confirmed) return;

    // Delete roles first, then profile
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "User profile deleted" });
    fetchUsers();
  };

  const filtered = users.filter(
    (u) =>
      (u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.lga?.toLowerCase().includes(search.toLowerCase())) ?? true
  );

  const { title, subtitle } = titles[filter];

  return (
    <div>
      <SuperAdminHeader title={title} subtitle={subtitle} />

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">
              {filtered.length} {filter === "all" ? "users" : filter} found
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, LGA..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Name</TableHead>
                    <TableHead className="text-xs">Email</TableHead>
                    <TableHead className="text-xs">Phone</TableHead>
                    <TableHead className="text-xs">LGA</TableHead>
                    <TableHead className="text-xs">Roles</TableHead>
                    <TableHead className="text-xs">Joined</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.user_id}>
                      <TableCell className="font-medium text-sm">{user.full_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.phone || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.lga || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0
                            ? user.roles.map((role) => (
                                <Badge key={role} variant="outline" className={`text-[10px] ${roleBadgeColors[role] || ""}`}>
                                  {role}
                                </Badge>
                              ))
                            : <span className="text-xs text-muted-foreground">member</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {["agent", "admin", "super_admin"].map((role) => {
                            const hasRole = user.roles.includes(role);
                            return (
                              <Button
                                key={role}
                                size="sm"
                                variant={hasRole ? "default" : "outline"}
                                className={`text-[10px] h-7 px-2 ${hasRole ? "bg-amber-600 hover:bg-amber-700" : ""}`}
                                onClick={() => toggleRole(user.user_id, role, hasRole)}
                              >
                                {hasRole ? `- ${role.split("_").join(" ")}` : `+ ${role.split("_").join(" ")}`}
                              </Button>
                            );
                          })}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                            onClick={() => deleteUser(user.user_id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminAccountManagement;
