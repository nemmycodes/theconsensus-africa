import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import loginHero from "@/assets/login-hero.jpg";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, isAgent, isAdmin, isKefUser, rolesLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Role-based redirect (or honor explicit ?redirect= param)
  useEffect(() => {
    if (!authLoading && !rolesLoading && user) {
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }
      if (isAdmin) navigate("/admin", { replace: true });
      else if (isAgent) navigate("/agent", { replace: true });
      else if (isKefUser) navigate("/kef-cares/dashboard", { replace: true });
      else navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, rolesLoading, isAdmin, isAgent, isKefUser, navigate, redirectTo]);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Use at least 6 characters.", variant: "destructive" });
      return;
    }
    if (!fullName.trim()) {
      toast({ title: "Full name required", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo ? `${window.location.origin}${redirectTo}` : window.location.origin,
        data: { full_name: fullName, phone },
      },
    });
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    toast({
      title: "Account created!",
      description: "Check your email to confirm your account, then log in.",
    });
    setLoading(false);
    setMode("login");
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img src={loginHero} alt="Empowering the youth" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute top-8 left-8 z-10">
          <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-14" />
        </div>
        <div className="absolute bottom-16 left-8 right-8 z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-4xl xl:text-5xl font-heading font-black leading-tight text-foreground">
              Empowering the <br />youth for a better <br />Nigeria.
            </h1>
            <p className="text-muted-foreground mt-4 max-w-md text-sm leading-relaxed">
              Join thousands of citizens building a transparent, consensus-driven future. Your voice is the catalyst for change.
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-6 left-8 z-10 flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <span>© 2026 Consensus Party</span>
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="w-full lg:w-1/2 bg-background flex flex-col">
        <div className="flex justify-between items-center p-6 lg:p-8">
          <div className="lg:hidden">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-10" />
          </div>
          <Button variant="outline" size="sm" className="gap-2 ml-auto" onClick={() => navigate("/")}>
            Back <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 lg:px-16 xl:px-24 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full max-w-md"
          >
            {/* Toggle */}
            <div className="inline-flex p-1 bg-secondary rounded-full mb-6 w-full">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 h-10 rounded-full text-sm font-bold tracking-wide transition-all ${
                  isLogin ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 h-10 rounded-full text-sm font-bold tracking-wide transition-all ${
                  !isLogin ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <h2 className="text-3xl font-heading font-black mb-2">
              {isLogin ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              {isLogin
                ? "Log in to your account and continue building."
                : "Join the movement — it only takes a minute."}
            </p>

            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-12 bg-secondary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number (optional)</Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 bg-secondary border-border"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
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
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot Password?
                    </button>
                  )}
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

              <Button
                type="submit"
                className="w-full h-12 text-sm font-bold tracking-widest uppercase"
                disabled={loading}
              >
                {loading ? (isLogin ? "Signing in..." : "Creating account...") : (isLogin ? "LOGIN" : "CREATE ACCOUNT")}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground tracking-widest uppercase">Or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <GoogleSignInButton label="Continue with Google" className="w-full" />
            </div>

            <div className="mt-8 text-center">
              <span className="text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode(isLogin ? "signup" : "login")}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
