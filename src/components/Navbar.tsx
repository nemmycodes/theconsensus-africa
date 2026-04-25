import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Crown } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Discuss", href: "/discuss" },
  { label: "Situation Room", href: "/situation-room" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "KEF-Cares", href: "/kef-cares" },
  { label: "INEC", href: "https://www.inecnigeria.org", external: true },
  
  { label: "Contact Us", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut, isSuperAdmin, isAdmin, isAgent, isKefUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-[hsl(220,20%,8%)]/95 backdrop-blur-md border-b border-[hsl(220,15%,18%)] shadow-lg"
    >
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2 group" aria-label="The Plateau Consensus — Home">
          <img
            src="/brand-logo.png"
            alt="The Plateau Consensus"
            className="h-12 md:h-16 lg:h-20 w-auto transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_2px_8px_hsl(var(--primary)/0.35)]"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {isSuperAdmin && (
                <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={() => navigate("/super-admin")}>
                  <Crown className="w-3.5 h-3.5" /> Super Admin
                </Button>
              )}
              {isAdmin && !isSuperAdmin && (
                <Button size="sm" variant="outline" onClick={() => navigate("/admin")}>Admin</Button>
              )}
              {isAgent && !isAdmin && !isSuperAdmin && (
                <Button size="sm" variant="outline" onClick={() => navigate("/agent")}>Agent Panel</Button>
              )}
              {isKefUser && !isAdmin && !isSuperAdmin && !isAgent && (
                <Button size="sm" variant="default" onClick={() => navigate("/kef-cares/dashboard")}>KEF Dashboard</Button>
              )}
              {!isKefUser && <Button size="sm" variant="default" onClick={() => navigate("/dashboard")}>Dashboard</Button>}
              <Button size="sm" variant="outline" onClick={handleSignOut}>Logout</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="default" onClick={() => navigate("/join")}>Join Us</Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/login")}>Login</Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-white inline-flex items-center justify-center rounded-md tap-target hover:bg-white/10 active:bg-white/20 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[hsl(220,20%,8%)] border-b border-[hsl(220,15%,18%)] px-4 pb-4 overflow-hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className="block py-2 text-sm text-white/70 hover:text-white transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )}
              </motion.div>
            ))}
            <div className="flex flex-col gap-2 mt-4">
              {user ? (
                <>
                  {isSuperAdmin && (
                    <Button size="sm" variant="outline" className="gap-1.5 border-amber-500/30 text-amber-400" onClick={() => { navigate("/super-admin"); setMobileOpen(false); }}>
                      <Crown className="w-3.5 h-3.5" /> Super Admin
                    </Button>
                  )}
                  {isKefUser && !isAdmin && !isSuperAdmin ? (
                    <Button size="sm" variant="default" onClick={() => { navigate("/kef-cares/dashboard"); setMobileOpen(false); }}>KEF Dashboard</Button>
                  ) : (
                    <Button size="sm" variant="default" onClick={() => { navigate("/dashboard"); setMobileOpen(false); }}>Dashboard</Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { handleSignOut(); setMobileOpen(false); }}>Logout</Button>
                </>
              ) : (
                <>
                  <Button size="sm" variant="default" onClick={() => { navigate("/join"); setMobileOpen(false); }}>Join Us</Button>
                  <Button size="sm" variant="outline" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Login</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
