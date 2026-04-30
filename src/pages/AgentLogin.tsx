import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Lock, HelpCircle, ShieldCheck, ArrowRight } from "lucide-react";
import agentHero from "@/assets/agent-login-hero.jpg";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const AgentLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, isAgent } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && user && isAgent) {
      navigate("/agent", { replace: true });
    }
  }, [user, authLoading, isAgent, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Check agent role
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: hasRole } = await supabase.rpc("has_role", { _user_id: authUser.id, _role: "agent" });
      if (!hasRole) {
        await supabase.auth.signOut();
        toast({ title: "Access Denied", description: "This account is not registered as an agent. Contact your supervisor.", variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    toast({ title: "Welcome back, Agent" });
    navigate("/agent", { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={agentHero} alt="Polling station" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a0f] via-[#0a1a0f]/70 to-[#0a1a0f]/40" />

        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-14" />
        </div>

        {/* Badge */}
        <div className="absolute bottom-44 left-8 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified Agent Access
          </div>
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-16 left-8 right-8 z-10">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight">
            Guardians of<br />Democracy
          </h1>
          <p className="text-gray-300 mt-4 max-w-md text-sm leading-relaxed">
            Your vigilance ensures our future. Log in to access real-time collation tools and submit your unit reports securely.
          </p>
        </div>

        {/* Bottom links */}
        <div className="absolute bottom-6 left-8 z-10 flex items-center gap-6 text-xs text-gray-500">
          <span>© 2026 The Consensus</span>
          <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-1/2 bg-background flex flex-col">
        {/* Top bar */}
        <div className="flex justify-between items-center p-6 lg:p-8">
          <div className="lg:hidden">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-10" />
          </div>
          <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={() => navigate("/login")}>
            All Portals
          </Button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 xl:px-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            <h2 className="text-3xl font-black mb-2 text-foreground">Agent Portal</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Welcome Back, Agent. Please enter your secure credentials
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Agent Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your unique ID (e.g., AG-2024)"
                    className="h-12 bg-secondary border-border pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Enter your secure password"
                    className="h-12 bg-secondary border-border pl-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-widest uppercase text-sm gap-2"
              >
                <KeyRound className="h-4 w-4" />
                {loading ? "Verifying..." : "Secure Login"}
              </Button>
            </form>

            {/* Divider + Google */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <GoogleSignInButton label="Continue with Google" className="w-full" redirectTo={`${window.location.origin}/agent`} />

            {/* Trouble box */}
            <div className="mt-8 p-5 bg-card border border-border rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">Trouble logging in?</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    If you have lost your code, contact your district supervisor.
                  </p>
                  <button className="text-sm font-semibold text-primary hover:text-primary/80 mt-2 inline-flex items-center gap-1">
                    Forgot Code? <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Security badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="w-3.5 h-3.5" />
              End-to-end encrypted connection
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
