import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Situation Room", href: "/situation-room" },
  { label: "Blog", href: "/blog" },
  { label: "Events", href: "#" },
  { label: "Donate", href: "#" },
  { label: "Contact Us", href: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">The</span>
            <span className="text-xs font-bold tracking-widest text-accent uppercase">Plateau</span>
            <span className="text-sm font-black tracking-wider text-foreground uppercase">Consensus</span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-xs text-muted-foreground">{user.email}</span>
              <Button size="sm" variant="outline" onClick={() => signOut()}>Logout</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="default" onClick={() => navigate("/auth")}>Join Us</Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/auth")}>Login</Button>
            </>
          )}
        </div>

        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-b border-border px-4 pb-4 overflow-hidden"
          >
            {navLinks.map((link, i) => (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={link.href}
                  className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <div className="flex gap-3 mt-4">
              {user ? (
                <Button size="sm" variant="outline" onClick={() => { signOut(); setMobileOpen(false); }}>Logout</Button>
              ) : (
                <>
                  <Button size="sm" variant="default" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Join Us</Button>
                  <Button size="sm" variant="outline" onClick={() => { navigate("/auth"); setMobileOpen(false); }}>Login</Button>
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
