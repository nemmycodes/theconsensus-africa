import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  "Home", "About", "Join Us", "Discuss", "Situation Room", "Events", "Blog", "Donate", "Contact Us"
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">The</span>
            <span className="text-xs font-bold tracking-widest text-accent uppercase">Plateau</span>
            <span className="text-sm font-black tracking-wider text-foreground uppercase">Consensus</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <Button size="sm" variant="default">Join Us</Button>
          <Button size="sm" variant="outline">Login</Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background border-b border-border px-4 pb-4">
          {navLinks.map((link) => (
            <a
              key={link}
              href="#"
              className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link}
            </a>
          ))}
          <div className="flex gap-3 mt-4">
            <Button size="sm" variant="default">Join Us</Button>
            <Button size="sm" variant="outline">Login</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
