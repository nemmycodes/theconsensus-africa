import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = forwardRef<HTMLElement>((_, ref) => {
  return (
    <footer ref={ref} className="bg-[hsl(220,20%,8%)] text-white border-t border-[hsl(220,15%,18%)]">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/"><img src="/brand-logo.png" alt="The Plateau Consensus" className="h-12 w-auto" /></Link>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              The Consensus Movement<br />
              Central Zone Pilot – Plateau State<br />
              Economic Freedom. Political Consciousness. Shared Prosperity.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <Instagram size={16} />
              </a>
              <a href="https://whatsapp.com/channel/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Movement */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-primary-foreground">Movement</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Our Vision</Link></li>
              <li><Link to="/about" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">About us</Link></li>
              <li><Link to="/situation-room" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Situation Room</Link></li>
              <li><Link to="/discuss" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Discuss</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-primary-foreground">Support</h4>
            <ul className="space-y-2">
              <li><Link to="/join" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Join Us</Link></li>
              <li><Link to="/kef-cares" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">KEF-Cares</Link></li>
              <li><Link to="/situation-room" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Report Issue</Link></li>
              <li><Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 text-primary-foreground">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Stay updated with our latest activities and announcements.
            </p>
            <div className="space-y-3">
              <Input placeholder="Enter Your Email here" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50" />
              <Button variant="secondary" className="w-full font-semibold">Subscribe</Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-primary-foreground/60">
            © 2026 Powered by Pambah Promotions. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
