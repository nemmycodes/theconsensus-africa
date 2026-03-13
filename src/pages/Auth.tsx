import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import loginHero from "@/assets/login-hero.jpg";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, isAgent, isAdmin, rolesLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Role-based redirect
  useEffect(() => {
    if (!authLoading && !rolesLoading && user) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else if (isAgent) {
        navigate("/agent", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, authLoading, rolesLoading, isAdmin, isAgent, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={loginHero}
          alt="Empowering the youth"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

        {/* Logo */}
        <div className="absolute top-8 left-8 z-10">
          <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-14" />
        </div>

        {/* Hero Text */}
        <div className="absolute bottom-16 left-8 right-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl xl:text-5xl font-heading font-black leading-tight text-foreground">
              Empowering the{" "}
              <br />
              youth for a better{" "}
              <br />
              Nigeria.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
              Join thousands of citizens building a transparent, consensus-driven future. Your voice is the catalyst for change.
            </p>
          </motion.div>
        </div>

        {/* Bottom links */}
        <div className="absolute bottom-6 left-8 z-10 flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <span>© 2026 Consensus Party</span>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-1/2 bg-background flex flex-col">
        {/* Back Button */}
        <div className="flex justify-between items-center p-6 lg:p-8">
          <div className="lg:hidden">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-10" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 ml-auto"
            onClick={() => navigate("/")}
          >
            Back <ArrowLeft className="h-4 w-4" />
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
            <h2 className="text-3xl font-heading font-black mb-2">Welcome Back</h2>
            <p className="text-muted-foreground text-sm mb-8">
              Log in to your account and continue building.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email or Phone Number</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 bg-secondary border-border"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 bg-secondary border-border pr-12"
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="rounded border-border bg-secondary text-primary focus:ring-primary h-4 w-4"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold tracking-widest uppercase"
                disabled={loading}
              >
                {loading ? "Signing in..." : "LOGIN"}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 gap-2 font-medium">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12 gap-2 font-medium">
                <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
            </div>

            <div className="mt-8 text-center">
              <span className="text-sm text-muted-foreground">Don't have an account? </span>
              <button
                onClick={() => navigate("/join")}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign up
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
