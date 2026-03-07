import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AgentRole {
  id: string;
  user_id: string;
  role: string;
  profile?: { full_name: string | null };
}

const AdminAgents = () => {
  const [agents, setAgents] = useState<AgentRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAgents = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("*").eq("role", "agent");
    if (roles && roles.length > 0) {
      const userIds = roles.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      setAgents(roles.map((r) => ({ ...r, profile: profileMap.get(r.user_id) ?? { full_name: null } })));
    } else {
      setAgents([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAgents(); }, []);

  const removeAgent = async (roleId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Agent Removed", description: "Agent role has been revoked." });
      fetchAgents();
    }
  };

  const filtered = agents.filter((a) =>
    (a.profile?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    a.user_id.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const header = "Name,User ID,Role\n";
    const rows = filtered.map((a) => `"${a.profile?.full_name ?? "N/A"}","${a.user_id}","${a.role}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agents_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Agent Management</h1>
          <p className="text-muted-foreground text-sm mt-1">{agents.length} registered agents</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search agents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left p-4">Agent</th>
              <th className="text-left p-4">User ID</th>
              <th className="text-left p-4">Role</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No agents found</td></tr>
            ) : (
              filtered.map((agent) => (
                <tr key={agent.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{agent.profile?.full_name ?? "Unnamed"}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-mono">{agent.user_id.slice(0, 12)}...</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-primary/15 text-primary text-xs font-bold rounded-full">AGENT</span>
                  </td>
                  <td className="p-4 text-right">
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 gap-1" onClick={() => removeAgent(agent.id)}>
                      <Trash2 className="w-3 h-3" /> Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAgents;
