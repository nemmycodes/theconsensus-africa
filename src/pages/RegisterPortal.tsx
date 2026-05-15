import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const portals = [
  {
    title: "Member",
    subtitle: "Community Account",
    description: "Create your member account to access the dashboard, events, forum, and situation room updates. Once registered, you can apply to become an Agent or join KEF-Cares from your dashboard.",
    icon: Users,
    route: "/auth?mode=signup",
    color: "bg-primary/10 text-primary border-primary/20",
    btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground",
  },
];

const RegisterPortal = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <img
          src="/brand-logo.png"
          alt="The Plateau Consensus"
          className="h-16 mx-auto mb-4 cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight">
          Join The Movement
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
          Choose how you'd like to create your account on The Plateau Consensus platform.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:gap-6 w-full max-w-md">
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
              Create Account <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Homepage
        </button>
      </div>
    </div>
  );
};

export default RegisterPortal;
