import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
  Crown, LayoutDashboard, Users, Shield, UserCog, BarChart3,
  Globe, Radio, Calendar, FileText, MessageSquare, Image,
  Bell, Settings, ChevronLeft, LogOut, Database, Activity,
  PenTool, Mail, Trophy, Server, Key, Megaphone, Flag, UserCheck, ShieldCheck,
} from "lucide-react";

interface SuperAdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuGroups = [
  {
    label: "Core",
    items: [
      { id: "overview", label: "Dashboard", icon: LayoutDashboard },
      { id: "analytics", label: "Analytics & Stats", icon: BarChart3 },
      { id: "activity", label: "Activity Log", icon: Activity },
      { id: "audit-log", label: "Audit Log", icon: ShieldCheck },
    ],
  },
  {
    label: "Governance",
    items: [
      { id: "permissions", label: "Role Permissions", icon: Shield },
      { id: "broadcasts", label: "Broadcast Center", icon: Megaphone },
      { id: "feature-flags", label: "Feature Flags", icon: Flag },
      { id: "impersonation", label: "Impersonation", icon: UserCheck },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { id: "system-health", label: "System Health", icon: Server },
      { id: "api-keys", label: "API Keys", icon: Key },
    ],
  },
  {
    label: "Account Management",
    items: [
      { id: "users", label: "All Users", icon: Users },
      { id: "agents", label: "Agents", icon: Shield },
      { id: "admins", label: "Administrators", icon: UserCog },
    ],
  },
  {
    label: "Content & Data",
    items: [
      { id: "site-editor", label: "Site Editor", icon: PenTool },
      { id: "website", label: "Content Manager", icon: Globe },
      { id: "messages", label: "Contact Messages", icon: Mail },
      { id: "situation", label: "Situation Room", icon: Radio },
      { id: "election", label: "Election Data", icon: Database },
      { id: "primaries", label: "Primaries", icon: Trophy },
      { id: "events", label: "Events", icon: Calendar },
      { id: "blog", label: "Blog Posts", icon: FileText },
      { id: "forum", label: "Forum", icon: MessageSquare },
      { id: "media", label: "Media Library", icon: Image },
      { id: "kef-cares", label: "KEF-CARES", icon: Users },
    ],
  },
  {
    label: "System",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "settings", label: "System Settings", icon: Settings },
    ],
  },
];

const SuperAdminSidebar = ({ activeTab, onTabChange }: SuperAdminSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} min-h-screen bg-[#050a15] border-r border-amber-900/20 flex flex-col transition-all duration-300`}>
      {/* Brand */}
      <div className="p-4 border-b border-amber-900/20">
        <div className="flex items-center gap-3">
          <Link to="/" className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-amber-400" />
          </Link>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Super Admin</p>
              <p className="text-[12px] font-black text-white uppercase -mt-0.5">Control Center</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 overflow-y-auto space-y-4">
        {menuGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-amber-500/15 text-amber-400 border-l-[3px] border-amber-500 pl-[9px]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? "text-amber-400" : "text-gray-500"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-amber-900/20 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={async () => {
            await signOut();
            navigate("/super-admin/login");
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default SuperAdminSidebar;
