import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Users, Shield, Radio, BarChart3, Calendar,
  FileText, MessageSquare, Image, Bell, Settings, ChevronLeft, LogOut,
} from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "users", label: "Users", icon: Users },
  { id: "agents", label: "Agents", icon: Shield },
  { id: "situation", label: "Situation Room", icon: Radio },
  { id: "election", label: "Election Collation", icon: BarChart3 },
  { id: "events", label: "Events & Activities", icon: Calendar },
  { id: "blog", label: "Blog & Articles", icon: FileText },
  { id: "forum", label: "Community Forum", icon: MessageSquare },
  { id: "media", label: "Media Library", icon: Image },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "kef-cares", label: "KEF-CARES", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
];

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`${collapsed ? "w-16" : "w-60"} min-h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Brand Logo */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link to="/"><img src="/brand-logo.png" alt="The Plateau Consensus" className="w-14 h-14 object-contain" /></Link>
          {!collapsed && (
            <div className="leading-tight">
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-wider">The Plateau</p>
              <p className="text-[13px] font-black text-gray-900 uppercase -mt-0.5">Consensus</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 border-l-[3px] border-emerald-600 pl-[9px]"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <item.icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400"}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <button
          onClick={async () => {
            await signOut();
            navigate("/admin/login");
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
