import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const portals = [
  {
    title: "Member",
    subtitle: "Community Portal",
    description: "Access your dashboard, events, forum, and situation room updates.",
    icon: Users,
    route: "/auth",
    color: "bg-primary/10 text-primary border-primary/20",
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
  {
    title: "Agent",
    subtitle: "Field Operations",
    description: "Submit election collation data, report incidents, and manage your assigned polling units.",
    icon: Shield,
    route: "/agent/login",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  {
    title: "Admin",
    subtitle: "Control Center",
    description: "Full system administration — users, content, elections, and platform settings.",
    icon: ShieldCheck,
    route: "/admin/login",
    color: "bg-red-500/10 text-red-400 border-red-500/20",
    btnClass: "bg-red-600 hover:bg-red-700 text-white",
  },
];

const LoginPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-16 mx-auto mb-4 cursor-pointer" onClick={() => navigate("/")} />
        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
          Choose Your Portal
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
          Select how you'd like to sign in to The Plateau Consensus platform.
        </p>
      </motion.div>

      {/* Portal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-4xl">
        {portals.map((portal, i) => (
          <motion.div
            key={portal.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 flex flex-col items-center text-center hover:border-primary/30 transition-all group cursor-pointer"
            onClick={() => navigate(portal.route)}
          >
            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center border ${portal.color} mb-4 md:mb-5`}>
              <portal.icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <h2 className="text-lg md:text-xl font-black text-foreground">{portal.title}</h2>
            <p className="text-[10px] md:text-xs font-bold tracking-widest text-muted-foreground uppercase mt-1">
              {portal.subtitle}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-3 md:mt-4 mb-4 md:mb-6 leading-relaxed flex-1">
              {portal.description}
            </p>
            <Button className={`w-full gap-2 font-bold text-xs md:text-sm ${portal.btnClass}`}>
              Sign In <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Homepage
        </button>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-4">
          <span>© 2026 The Consensus</span>
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-foreground">Terms of Service</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPortal;
