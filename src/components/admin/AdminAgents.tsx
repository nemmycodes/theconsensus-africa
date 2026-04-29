import AdminHeader from "./AdminHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Plus, Eye, EyeOff, Loader2, Pencil, Trash2, UserMinus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AgentProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  lga: string | null;
  ward: string | null;
  dob: string | null;
  avatar_url: string | null;
  created_at: string;
}

const AdminAgents = () => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [downgradeConfirmOpen, setDowngradeConfirmOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    lga: "",
    ward: "",
  });
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    lga: "",
    ward: "",
    dob: "",
  });
  const { toast } = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    const { data: agentRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "agent");

    if (!agentRoles || agentRoles.length === 0) {
      setAgents([]);
      setLoading(false);
      return;
    }

    const agentIds = agentRoles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", agentIds)
      .order("created_at", { ascending: false });

    setAgents(profiles ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleCreate = async () => {
    if (!form.email || !form.password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const res = await supabase.functions.invoke("create-agent", {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone,
          lga: form.lga,
          ward: form.ward,
        },
      });

      const errorMsg = res.data?.error || res.error?.message;
      if (errorMsg) throw new Error(errorMsg);

      toast({ title: "Agent account created successfully" });
      setForm({ email: "", password: "", full_name: "", phone: "", lga: "", ward: "" });
      setDialogOpen(false);
      fetchAgents();
    } catch (err: any) {
      toast({ title: err.message || "Failed to create agent", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const openEditDialog = (agent: AgentProfile) => {
    setSelectedAgent(agent);
    setEditForm({
      full_name: agent.full_name || "",
      email: agent.email || "",
      phone: agent.phone || "",
      lga: agent.lga || "",
      ward: agent.ward || "",
      dob: agent.dob || "",
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedAgent) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name || null,
          email: editForm.email || null,
          phone: editForm.phone || null,
          lga: editForm.lga || null,
          ward: editForm.ward || null,
          dob: editForm.dob || null,
        })
        .eq("user_id", selectedAgent.user_id);

      if (error) throw error;
      toast({ title: "Agent profile updated" });
      setEditDialogOpen(false);
      fetchAgents();
    } catch (err: any) {
      toast({ title: err.message || "Failed to update agent", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAgent) return;
    setActionLoading(true);
    try {
      const res = await supabase.functions.invoke("manage-agent", {
        body: { action: "delete", user_id: selectedAgent.user_id },
      });
      const errorMsg = res.data?.error || res.error?.message;
      if (errorMsg) throw new Error(errorMsg);

      toast({ title: "Agent deleted successfully" });
      setDeleteConfirmOpen(false);
      setSelectedAgent(null);
      fetchAgents();
    } catch (err: any) {
      toast({ title: err.message || "Failed to delete agent", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!selectedAgent) return;
    setActionLoading(true);
    try {
      const res = await supabase.functions.invoke("manage-agent", {
        body: { action: "downgrade", user_id: selectedAgent.user_id },
      });
      const errorMsg = res.data?.error || res.error?.message;
      if (errorMsg) throw new Error(errorMsg);

      toast({ title: "Agent downgraded to regular user" });
      setDowngradeConfirmOpen(false);
      setSelectedAgent(null);
      fetchAgents();
    } catch (err: any) {
      toast({ title: err.message || "Failed to downgrade agent", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminHeader title="Agents" subtitle="Manage field agents and their activities" />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <Plus className="w-4 h-4" /> Create Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Agent Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Agent full name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" placeholder="agent@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Password *</Label>
                <div className="relative">
                  <Input type={showPassword ? "text" : "password"} placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <InecLocationPicker
                lgaName={form.lga}
                wardName={form.ward}
                onChange={({ lga, ward }) => setForm({ ...form, lga, ward })}
                labels={{ lga: "Assigned LGA", ward: "Assigned Ward" }}
              />
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {creating ? "Creating…" : "Create Agent Account"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{agents.length}</p>
            <p className="text-xs text-gray-500">Total Agents</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-gray-900">{agents.length}</p>
            <p className="text-xs text-gray-500">Active Agents</p>
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading agents…</div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Shield className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-500">No agents yet</p>
            <p className="text-sm mt-1">Click "Create Agent" to add your first field agent</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">LGA / Ward</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-right p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {getInitials(agent.full_name || "A")}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{agent.full_name || "Unnamed Agent"}</p>
                        {agent.phone && <p className="text-xs text-gray-400">{agent.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{agent.email || "—"}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {agent.lga || "—"} {agent.ward ? `/ ${agent.ward}` : ""}
                  </td>
                  <td className="p-4 text-sm text-gray-500">{formatDate(agent.created_at)}</td>
                  <td className="p-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(agent)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit Info
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setSelectedAgent(agent); setDowngradeConfirmOpen(true); }}>
                          <UserMinus className="w-4 h-4 mr-2" /> Downgrade to User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => { setSelectedAgent(agent); setDeleteConfirmOpen(true); }}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Agent — {selectedAgent?.full_name || "Agent"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Date of Birth</Label>
                <Input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>LGA</Label>
                <Input value={editForm.lga} onChange={(e) => setEditForm({ ...editForm, lga: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ward</Label>
                <Input value={editForm.ward} onChange={(e) => setEditForm({ ...editForm, ward: e.target.value })} />
              </div>
            </div>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleEditSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{selectedAgent?.full_name || "this agent"}</strong> and their account. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Downgrade Confirmation */}
      <AlertDialog open={downgradeConfirmOpen} onOpenChange={setDowngradeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Downgrade Agent</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the agent role from <strong>{selectedAgent?.full_name || "this agent"}</strong>, converting them to a regular user. They will lose access to agent features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDowngrade} disabled={actionLoading} className="bg-amber-600 hover:bg-amber-700 text-white">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Downgrade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminAgents;
