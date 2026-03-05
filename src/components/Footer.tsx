import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Movement: ["About Us", "Our Mission", "Leadership", "Join Us"],
  Engage: ["Discuss", "Situation Room", "Events", "Blog"],
  Support: ["Donate", "Volunteer", "Partner With Us", "Contact"],
};

const socials = [
  { label: "Twitter / X", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "YouTube", href: "#" },
];

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-12"
        >
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <img src="/brand-logo.png" alt="The Plateau Consensus" className="h-12 w-auto" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              A non-partisan civic and economic empowerment movement organizing Nigeria's youth for a new era of leadership defined by competence, integrity, and shared prosperity.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="mailto:info@plateauconsensus.ng" className="flex items-center gap-2 hover:text-foreground transition-colors">
                <Mail size={14} className="text-primary" /> info@plateauconsensus.ng
              </a>
              <span className="flex items-center gap-2">
                <Phone size={14} className="text-primary" /> +234 800 000 0000
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={14} className="text-primary" /> Jos, Plateau State, Nigeria
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-4">{heading}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 The Plateau Consensus. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
