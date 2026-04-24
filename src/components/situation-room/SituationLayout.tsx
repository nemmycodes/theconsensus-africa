import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Home, FileBarChart2, FileText, Users, Settings, LogOut, Bell,
  Radio, ShieldOff, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "/brand-logo.png";

export type SRTab = "home" | "collation" | "reports" | "users" | "settings";

const navItems: { key: SRTab; label: string; icon: typeof Home }[] = [
  { key: "home", label: "Home", icon: Home },
  { key: "collation", label: "Election Collation", icon: FileBarChart2 },
  { key: "reports", label: "Intelligence Reports", icon: FileText },
  { key: "users", label: "Users", icon: Users },
  { key: "settings", label: "Settings", icon: Settings },
];

const titleMap: Record<SRTab, string> = {
  home: "SITUATION ROOM",
  collation: "ELECTION COLLATION",
  reports: "INTELLIGENCE REPORTS",
  users: "USERS",
  settings: "SETTINGS",
};

interface Props {
  active: SRTab;
  onChange: (t: SRTab) => void;
  children: React.ReactNode;
}

const SituationLayout = ({ active, onChange, children }: Props) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [now, setNow] = useState(new Date());
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [alerts, setAlerts] = useState<string>(
    "Live monitoring active. Submit field intelligence promptly."
  );
  const [unread, setUnread] = useState(3);
  const sessionId = `SR-${new Date().getFullYear()}-${(user?.id?.slice(0, 5) || "ANON").toUpperCase()}`;

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      const { data } = await supabase
        .from("broadcasts")
        .select("title, body")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (data?.length) {
        setAlerts(data.map((d) => `${d.title}: ${d.body}`).join("  //  "));
        setUnread(data.length);
      }
    };
    fetchBroadcasts();
  }, []);

  const initials = (user?.email || "AD").slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await signOut();
    setConfirmLogout(false);
    navigate("/situation-room");
  };

  const sidebarBody = (onItemClick?: () => void) => (
    <div className="h-full flex flex-col bg-white">
      <button
        className="px-6 py-5 border-b border-border flex items-center gap-2"
        onClick={() => { navigate("/situation-room"); onItemClick?.(); }}
      >
        <img src={logo} alt="The Plateau Consensus" className="h-12 w-auto" />
      </button>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { onChange(item.key); onItemClick?.(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-3">
        <button
          onClick={() => { setConfirmLogout(true); onItemClick?.(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" /> Log Out
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">
              {user?.user_metadata?.full_name || "Operator"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "guest@situation"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(150,15%,97%)] text-foreground">
      <div className="flex">
        {/* Sidebar - desktop */}
        <aside className="hidden lg:flex w-60 min-h-screen border-r border-border flex-col sticky top-0 h-screen">
          {sidebarBody()}
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-border px-3 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <button className="lg:hidden p-1.5 rounded-md hover:bg-muted" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  {sidebarBody(() => {
                    // close handled by SheetContent overlay click; trigger close via Escape
                  })}
                </SheetContent>
              </Sheet>
              <h1 className="text-xs sm:text-sm font-black tracking-widest truncate">
                {titleMap[active]}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase px-3 py-1 rounded-full">
                <Radio className="h-3 w-3 animate-pulse" /> Voting Ongoing
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:block font-mono text-sm text-muted-foreground">
                {now.toISOString().substring(11, 19)} UTC
              </div>
              <div className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
              <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
            </div>
          </div>

          {/* Live Alert ticker */}
          <div className="bg-destructive/5 border-b border-destructive/20 px-3 sm:px-6 py-2 overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-destructive text-[10px] sm:text-xs font-bold whitespace-nowrap">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                LIVE ALERT
              </span>
              <div className="overflow-hidden flex-1">
                <p className="text-[10px] sm:text-xs text-destructive/90 whitespace-nowrap animate-[ticker_40s_linear_infinite]">
                  {alerts}
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-6 md:p-8">{children}</div>
        </main>
      </div>

      {/* End Session modal */}
      <Dialog open={confirmLogout} onOpenChange={setConfirmLogout}>
        <DialogContent className="max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center mb-2">
              <ShieldOff className="h-7 w-7 text-orange-500" />
            </div>
            <DialogTitle className="text-2xl">End Session?</DialogTitle>
            <DialogDescription>
              You are about to terminate your active Situation Room session. All
              unsaved work will be lost. This action is logged.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted rounded-lg p-4 text-sm space-y-2 my-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session ID</span>
              <span className="font-medium">{sessionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Since</span>
              <span className="font-medium">{now.toDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">Operator</span>
            </div>
          </div>
          <DialogFooter className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setConfirmLogout(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Confirm Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default SituationLayout;
