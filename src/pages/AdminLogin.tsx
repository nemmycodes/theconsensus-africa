import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Lock } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Verify admin role
    const { data: hasAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (!hasAdmin) {
      await supabase.auth.signOut();
      toast({
        title: "Access Denied",
        description: "This login is restricted to administrators only.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({ title: "Welcome, Administrator" });
    navigate("/admin");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center px-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo & Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 mb-4">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-10" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">
            Admin Portal
          </h1>
          <p className="text-sm text-gray-400 mt-1">Restricted access — Administrators only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-300">This portal is for authorized administrators only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Admin Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500"
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
                  className="h-12 bg-white/5 border-white/10 text-white pr-12 focus:border-emerald-500"
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
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-widest uppercase text-sm"
            >
              {loading ? "Verifying..." : "Sign In as Admin"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          Not an admin?{" "}
          <button onClick={() => navigate("/auth")} className="text-emerald-500 hover:text-emerald-400 font-medium">
            Member login
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
