import AdminHeader from "./AdminHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users } from "lucide-react";

interface AgentProfile {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

const AdminAgents = () => {
  const [agents, setAgents] = useState<AgentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      // Get all agent role entries
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
    fetchAgents();
  }, []);

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div>
      <AdminHeader title="Agents" subtitle="Manage field agents and their activities" />

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
            <p className="text-sm mt-1">Assign the "agent" role to users from the Users tab</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Agent</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, i) => (
                <tr key={agent.user_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {getInitials(agent.full_name || "A")}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{agent.full_name || "Unnamed Agent"}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{agent.email || "—"}</td>
                  <td className="p-4 text-sm text-gray-500">{formatDate(agent.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAgents;
