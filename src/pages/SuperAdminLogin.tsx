import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Crown, Eye, EyeOff, Lock } from "lucide-react";

const SuperAdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Welcome, Super Administrator" });
      navigate("/super-admin", { replace: true });
    } catch {
      toast({
        title: "Login error",
        description: "Something went wrong while signing in.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050a15] flex items-center justify-center px-4">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,215,0,0.15) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600/20 border border-amber-500/30 mb-4">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-10" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Super Admin Portal
          </h1>
          <p className="text-sm text-gray-400 mt-1">Highest level access — Super Administrators only</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <Lock className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-xs text-red-300">Restricted — Super Admin credentials required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="superadmin@example.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 bg-white/5 border-white/10 text-white pr-12 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold tracking-widest uppercase text-sm"
            >
              {loading ? "Verifying..." : "Sign In as Super Admin"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Not a super admin?{" "}
          <button onClick={() => navigate("/admin/login")} className="text-amber-500 hover:text-amber-400 font-medium">
            Admin login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default SuperAdminLogin;
