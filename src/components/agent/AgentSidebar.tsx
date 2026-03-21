import { LayoutDashboard, FileText, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AgentSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "submissions", label: "Submissions", icon: FileText },
];

const AgentSidebar = ({ activeTab, onTabChange }: AgentSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string | null; lga: string | null; ward: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("full_name, lga, ward").eq("user_id", user.id).single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-[#0d1f15] text-white flex flex-col shrink-0 min-h-screen">
      {/* Logo */}
      <div className="p-6">
        <Link to="/"><img src="/brand-logo.png" alt="The Plateau Consensus" className="h-16" /></Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/30 flex items-center justify-center text-sm font-bold text-emerald-400">
            {profile?.full_name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{profile?.full_name || "Agent"}</p>
            <p className="text-xs text-gray-400 truncate">
              {profile?.lga ? `${profile.lga}${profile.ward ? ` - ${profile.ward}` : ""}` : "Field Agent"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AgentSidebar;
