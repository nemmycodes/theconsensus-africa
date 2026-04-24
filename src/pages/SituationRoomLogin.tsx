import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Shield, Radio, Lock } from "lucide-react";
import logo from "/brand-logo.png";

type RoleChoice = "member" | "agent" | "admin";

const SR_ROLE_KEY = "sr_self_role";

const SituationRoomLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleChoice | "">("");
  const [submitting, setSubmitting] = useState(false);

  // If already signed in AND already declared a SR role this session, skip
  useEffect(() => {
    if (user && sessionStorage.getItem(SR_ROLE_KEY)) {
      navigate("/situation-room/feed", { replace: true });
    }
  }, [user, navigate]);

  const enforceRoleAccess = async (userId: string, choice: RoleChoice) => {
    if (choice === "member") return true; // any logged-in user
    const target = choice === "admin" ? "admin" : "agent";
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: target as "admin" | "agent",
    });
    if (error) return false;
    // Allow super_admin to enter as admin too
    if (choice === "admin" && !data) {
      const sa = await supabase.rpc("has_role", {
        _user_id: userId,
        _role: "super_admin",
      });
      return !!sa.data;
    }
    return !!data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ title: "Select your role", description: "Tell us what best describes you.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      let activeUserId = user?.id;

      if (!activeUserId) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.user) {
          toast({ title: "Login failed", description: error?.message || "Invalid credentials", variant: "destructive" });
          setSubmitting(false);
          return;
        }
        activeUserId = data.user.id;
      }

      const ok = await enforceRoleAccess(activeUserId!, role);
      if (!ok) {
        toast({
          title: "Access denied",
          description: `Your account does not have ${role} privileges for the Situation Room.`,
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      sessionStorage.setItem(SR_ROLE_KEY, role);
      toast({ title: "Welcome to the Situation Room" });
      navigate("/situation-room/feed", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative bg-[hsl(150,40%,12%)] text-white p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary))_0%,transparent_50%)]" />
        <div className="relative z-10">
          <img src={logo} alt="The Plateau Consensus" className="h-14 w-auto bg-white/95 rounded-lg p-2" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Live Operations</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-heading font-black leading-tight">
            Situation Room<br />
            <span className="text-emerald-400">Command Access</span>
          </h1>
          <p className="text-white/70 max-w-md">
            Restricted civic & electoral intelligence environment. Authenticate
            and identify your operating role to proceed.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4 max-w-md">
            {[
              { icon: Radio, label: "Live Feed" },
              { icon: Shield, label: "Verified" },
              { icon: Lock, label: "Encrypted" },
            ].map((b) => (
              <div key={b.label} className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
                <b.icon className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                <p className="text-[10px] uppercase tracking-wider text-white/70">{b.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} The Plateau Consensus
        </p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src={logo} alt="logo" className="h-10 w-auto" />
            <span className="font-black tracking-widest text-sm">SITUATION ROOM</span>
          </div>

          <h2 className="text-3xl font-heading font-black">Sign in to continue</h2>
          <p className="text-muted-foreground mt-2 mb-8 text-sm">
            Enter your credentials and select the role that best describes you.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sr-email">Email</Label>
              <Input
                id="sr-email"
                type="email"
                autoComplete="email"
                required={!user}
                disabled={!!user}
                value={user?.email || email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sr-password">Password</Label>
              <Input
                id="sr-password"
                type="password"
                autoComplete="current-password"
                required={!user}
                disabled={!!user}
                value={user ? "••••••••" : password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {user && (
                <p className="text-xs text-muted-foreground">
                  Signed in as {user.email}. Choose your role to continue.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sr-role">What best describes you?</Label>
              <Select value={role} onValueChange={(v) => setRole(v as RoleChoice)}>
                <SelectTrigger id="sr-role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="agent">Agent</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Agent & Admin roles require pre-assigned privileges.
              </p>
            </div>

            <Button type="submit" className="w-full font-bold" disabled={submitting}>
              {submitting ? "Verifying…" : "Enter Situation Room"}
            </Button>

            <div className="flex items-center justify-between text-sm pt-2">
              <button
                type="button"
                onClick={() => navigate("/situation-room")}
                className="text-muted-foreground hover:text-foreground"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SituationRoomLogin;
