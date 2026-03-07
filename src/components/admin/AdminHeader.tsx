import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Moon, Bell, ChevronDown, LogOut } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  subtitle: string;
  liveBadge?: { label: string; color: string };
}

const AdminHeader = ({ title, subtitle, liveBadge }: AdminHeaderProps) => {
  const { user, signOut } = useAuth();
  const [time, setTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const utcTime = time.toISOString().slice(11, 19);

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-tight">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {liveBadge && (
          <span className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${liveBadge.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {liveBadge.label}
          </span>
        )}

        <span className="text-xs text-gray-500 font-mono">{utcTime} UTC</span>

        <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
          <Moon className="w-4 h-4" />
        </button>

        <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* Admin Avatar */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
              {(user?.email?.[0] ?? "A").toUpperCase() + (user?.email?.[1] ?? "D").toUpperCase()}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-gray-900">Administrator</p>
              <p className="text-[10px] text-gray-500 truncate max-w-[140px]">{user?.email ?? "admin@consensus.org"}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">Administrator</p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
