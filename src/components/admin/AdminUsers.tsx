import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, UserPlus, MoreVertical, Filter, Users, Shield, Mail, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

const mockUsers = [
  { name: "Sarah Okonkwo", email: "sarah.o@consensus.org", role: "Election Coordinator", region: "Plateau North", status: "active", joined: "Nov 15, 2025" },
  { name: "John Danladi", email: "john.d@consensus.org", role: "Field Agent", region: "Jos North", status: "active", joined: "Dec 3, 2025" },
  { name: "Grace Ayuba", email: "grace.a@consensus.org", role: "Training Manager", region: "Plateau Central", status: "active", joined: "Oct 22, 2025" },
  { name: "Michael Gyang", email: "michael.g@consensus.org", role: "Content Manager", region: "Jos South", status: "active", joined: "Nov 8, 2025" },
  { name: "Blessing Pam", email: "blessing.p@consensus.org", role: "Field Agent", region: "Pankshin", status: "inactive", joined: "Sep 14, 2025" },
  { name: "David Gowon", email: "david.g@consensus.org", role: "Intelligence Officer", region: "Barkin Ladi", status: "active", joined: "Jan 5, 2026" },
  { name: "Ruth Choji", email: "ruth.c@consensus.org", role: "Communications Lead", region: "Plateau South", status: "active", joined: "Dec 18, 2025" },
  { name: "Emmanuel Yakubu", email: "emmanuel.y@consensus.org", role: "Field Agent", region: "Shendam", status: "active", joined: "Feb 1, 2026" },
];

const roleColors: Record<string, string> = {
  "Election Coordinator": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Field Agent": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Training Manager": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Content Manager": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Intelligence Officer": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Communications Lead": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const initialsColors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-amber-100 text-amber-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700"];

  return (
    <div>
      <AdminHeader title="Users" subtitle="Manage user accounts, roles, and permissions" />

      {/* Search + Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search users by name, email, or role..." className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400" />
        </div>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter
        </Button>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export
        </Button>
        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <UserPlus className="w-4 h-4" /> Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Users", value: "12,847", bg: "bg-emerald-50", color: "text-emerald-600" },
          { icon: CheckCircle, label: "Active Users", value: "11,234", bg: "bg-blue-50", color: "text-blue-600" },
          { icon: Mail, label: "Pending Verification", value: "1,613", bg: "bg-amber-50", color: "text-amber-600" },
          { icon: Shield, label: "Agents", value: "384", bg: "bg-emerald-50", color: "text-emerald-600" },
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

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Region</th>
              <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="text-center p-4 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${initialsColors[i % initialsColors.length]} flex items-center justify-center text-xs font-bold`}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium border ${roleColors[user.role] ?? "bg-gray-50 text-gray-600 border-gray-200"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-700">{user.region}</td>
                <td className="p-4">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${user.status === "active" ? "text-emerald-600" : "text-gray-400"}`}>
                    <span className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-gray-300"}`} />
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">{user.joined}</td>
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
          <p className="text-sm text-gray-500">Showing <span className="font-bold text-gray-900">8</span> of <span className="font-bold text-gray-900">8</span> users</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 bg-white">Previous</Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
