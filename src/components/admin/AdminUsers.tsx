import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Search, Download, UserPlus, MoreVertical, Filter, Users, Shield, CheckCircle,
  X, Trash2, Edit3, Eye, Phone, MapPin, Calendar, Heart, ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  dob: string | null;
  interests: string[] | null;
  lga: string | null;
  ward: string | null;
  created_at: string;
  roles: string[];
}

const LGA_OPTIONS = [
  "Jos North", "Jos South", "Jos East", "Barkin Ladi", "Bassa", "Bokkos",
  "Kanke", "Kanam", "Langtang North", "Langtang South", "Mangu", "Mikang",
  "Pankshin", "Qua'an Pan", "Riyom", "Shendam", "Wase",
];

const INTEREST_OPTIONS = [
  "Youth Empowerment", "Economic Development", "Education", "Healthcare",
  "Security & Peace", "Agriculture", "Infrastructure", "Governance",
  "Technology & Innovation", "Culture & Tourism",
];

const ROLE_OPTIONS = ["admin", "agent", "user"] as const;

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, agents: 0 });
  const { toast } = useToast();

  // Modal states
  const [viewUser, setViewUser] = useState<UserProfile | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "", email: "", phone: "", dob: "", lga: "", ward: "",
    interests: [] as string[], roles: [] as string[],
  });

  // Create form state
  const [createForm, setCreateForm] = useState({
    full_name: "", email: "", phone: "", dob: "", lga: "", ward: "",
    interests: [] as string[], role: "user",
  });

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

    const combined: UserProfile[] = profiles.map((p) => ({
      ...p,
      phone: (p as any).phone ?? null,
      dob: (p as any).dob ?? null,
      interests: (p as any).interests ?? null,
      lga: (p as any).lga ?? null,
      ward: (p as any).ward ?? null,
      roles: rolesMap[p.user_id] ?? ["user"],
    }));

    setUsers(combined);
    setStats({
      total: profiles.length,
      agents: roles.filter((r) => r.role === "agent").length,
    });
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (user: UserProfile) => {
    setEditForm({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      dob: user.dob || "",
      lga: user.lga || "",
      ward: user.ward || "",
      interests: user.interests || [],
      roles: user.roles,
    });
    setEditUser(user);
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name || null,
          email: editForm.email || null,
          phone: editForm.phone || null,
          dob: editForm.dob || null,
          lga: editForm.lga || null,
          ward: editForm.ward || null,
          interests: editForm.interests.length > 0 ? editForm.interests : null,
        } as any)
        .eq("id", editUser.id);

      if (profileError) throw profileError;

      // Sync roles: delete existing, insert new
      const currentRoles = editUser.roles;
      const newRoles = editForm.roles.filter(r => r !== "user"); // "user" is default, not stored

      // Delete roles not in new set
      for (const role of currentRoles) {
        if (role !== "user" && !newRoles.includes(role)) {
          await supabase.from("user_roles").delete()
            .eq("user_id", editUser.user_id)
            .eq("role", role as any);
        }
      }
      // Insert roles not in current set
      for (const role of newRoles) {
        if (!currentRoles.includes(role)) {
          await supabase.from("user_roles").insert({
            user_id: editUser.user_id,
            role: role as any,
          });
        }
      }

      toast({ title: "User updated", description: `${editForm.full_name} has been updated.` });
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      // Delete roles first
      await supabase.from("user_roles").delete().eq("user_id", deleteUser.user_id);
      // Delete profile
      const { error } = await supabase.from("profiles").delete().eq("id", deleteUser.id);
      if (error) throw error;

      toast({ title: "User deleted", description: `${deleteUser.full_name || "User"} has been removed.` });
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.full_name || !createForm.email) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Create a profile entry (admin-created, no auth account)
      const tempUserId = crypto.randomUUID();
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: tempUserId,
        full_name: createForm.full_name,
        email: createForm.email,
        phone: createForm.phone || null,
        dob: createForm.dob || null,
        lga: createForm.lga || null,
        ward: createForm.ward || null,
        interests: createForm.interests.length > 0 ? createForm.interests : null,
      } as any);

      if (profileError) throw profileError;

      // Add role if not default user
      if (createForm.role !== "user") {
        await supabase.from("user_roles").insert({
          user_id: tempUserId,
          role: createForm.role as any,
        });
      }

      toast({ title: "User created", description: `${createForm.full_name} has been added.` });
      setCreateOpen(false);
      setCreateForm({ full_name: "", email: "", phone: "", dob: "", lga: "", ward: "", interests: [], role: "user" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "Create failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleInterest = (interest: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(interest) ? list.filter(i => i !== interest) : [...list, interest]);
  };

  const toggleRole = (role: string) => {
    setEditForm(prev => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role],
    }));
  };

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
      (u.lga ?? "").toLowerCase().includes(q) ||
      u.roles.some((r) => r.toLowerCase().includes(q))
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div>
      <AdminHeader title="Users" subtitle="Manage user accounts, roles, and permissions" />

      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name, email, LGA, or role..."
            className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export
        </Button>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <UserPlus className="w-4 h-4" /> Add User
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
                  <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Location</th>
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
                      <p className="text-sm text-gray-700">{user.phone || "—"}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-700">{user.lga || "—"}</p>
                      {user.ward && <p className="text-xs text-gray-400">{user.ward}</p>}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => setViewUser(user)} className="gap-2 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(user)} className="gap-2 cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteUser(user)} className="gap-2 cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* View User Detail Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">User Profile</DialogTitle>
            <DialogDescription>Full onboarding details for this user.</DialogDescription>
          </DialogHeader>
          {viewUser && (
            <div className="space-y-1">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                <div className={`w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg font-bold`}>
                  {getInitials(viewUser.full_name || "U")}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{viewUser.full_name || "Unnamed"}</p>
                  <p className="text-sm text-gray-500">{viewUser.email}</p>
                  <div className="flex gap-1.5 mt-1">
                    {viewUser.roles.map(r => (
                      <span key={r} className={`px-2 py-0.5 rounded text-xs font-medium border ${roleColors[r]}`}>{r}</span>
                    ))}
                  </div>
                </div>
              </div>
              <InfoRow icon={Phone} label="Phone" value={viewUser.phone} />
              <InfoRow icon={Calendar} label="Date of Birth" value={viewUser.dob} />
              <InfoRow icon={MapPin} label="LGA" value={viewUser.lga} />
              <InfoRow icon={MapPin} label="Ward" value={viewUser.ward} />
              <InfoRow icon={Calendar} label="Joined" value={formatDate(viewUser.created_at)} />
              <div className="py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-gray-400" />
                  <p className="text-[11px] text-gray-400 uppercase tracking-wider">Interests</p>
                </div>
                {viewUser.interests && viewUser.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {viewUser.interests.map(i => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{i}</span>
                    ))}
                  </div>
                ) : <p className="text-sm text-gray-500">—</p>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Edit User</DialogTitle>
            <DialogDescription>Update profile and role information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Full Name</Label>
                <Input value={editForm.full_name} onChange={e => setEditForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Email</Label>
                <Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Phone</Label>
                <Input value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Date of Birth</Label>
                <Input type="date" value={editForm.dob} onChange={e => setEditForm(p => ({ ...p, dob: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">LGA</Label>
                <select value={editForm.lga} onChange={e => setEditForm(p => ({ ...p, lga: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="">Select LGA</option>
                  {LGA_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Ward</Label>
                <Input value={editForm.ward} onChange={e => setEditForm(p => ({ ...p, ward: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Roles</Label>
              <div className="flex gap-2">
                {ROLE_OPTIONS.map(role => (
                  <button key={role} type="button" onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${editForm.roles.includes(role) ? roleColors[role] : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Interests</Label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map(interest => (
                  <button key={interest} type="button"
                    onClick={() => toggleInterest(interest, editForm.interests, (v) => setEditForm(p => ({ ...p, interests: v })))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${editForm.interests.includes(interest) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-red-600">Delete User</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete <strong>{deleteUser?.full_name || "this user"}</strong>? Their profile and role assignments will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={saving}>{saving ? "Deleting…" : "Delete User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Add New User</DialogTitle>
            <DialogDescription>Manually create a user profile.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Full Name *</Label>
                <Input value={createForm.full_name} onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Email *</Label>
                <Input type="email" value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Phone</Label>
                <Input value={createForm.phone} onChange={e => setCreateForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Date of Birth</Label>
                <Input type="date" value={createForm.dob} onChange={e => setCreateForm(p => ({ ...p, dob: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">LGA</Label>
                <select value={createForm.lga} onChange={e => setCreateForm(p => ({ ...p, lga: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <option value="">Select LGA</option>
                  {LGA_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-600">Ward</Label>
                <Input value={createForm.ward} onChange={e => setCreateForm(p => ({ ...p, ward: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Role</Label>
              <div className="flex gap-2">
                {ROLE_OPTIONS.map(role => (
                  <button key={role} type="button" onClick={() => setCreateForm(p => ({ ...p, role }))}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${createForm.role === role ? roleColors[role] : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-600">Interests</Label>
              <div className="flex flex-wrap gap-1.5">
                {INTEREST_OPTIONS.map(interest => (
                  <button key={interest} type="button"
                    onClick={() => toggleInterest(interest, createForm.interests, (v) => setCreateForm(p => ({ ...p, interests: v })))}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${createForm.interests.includes(interest) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-400 border-gray-200"}`}>
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating…" : "Create User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
