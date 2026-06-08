import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Crown, Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SuperAdminHeaderProps {
  title: string;
  subtitle: string;
}

const SuperAdminHeader = ({ title, subtitle }: SuperAdminHeaderProps) => {
  const { user, signOut } = useAuth();
  const [time, setTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 md:px-6 py-3 md:py-4">
      <div className="pl-12 md:pl-0">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-amber-500 shrink-0" />
          <h1 className="text-base md:text-xl font-black text-foreground uppercase tracking-tight truncate">{title}</h1>
        </div>
        <p className="text-muted-foreground text-xs md:text-sm mt-0.5 line-clamp-2">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search anything..."
            className="w-64 pl-9 h-9 bg-muted/50 border-border text-sm"
          />
        </div>

        <span className="text-[10px] md:text-xs text-muted-foreground font-mono">
          {time.toISOString().slice(11, 19)} UTC
        </span>

        <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted relative">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted"
          >
            <div className="w-9 h-9 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">
              {(user?.email?.[0] ?? "S").toUpperCase() + (user?.email?.[1] ?? "A").toUpperCase()}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-foreground">Super Admin</p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{user?.email}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-popover border border-border rounded-xl shadow-lg z-50 py-2">
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-bold text-foreground">Super Administrator</p>
                <p className="text-xs text-muted-foreground">Full System Access</p>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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

export default SuperAdminHeader;
