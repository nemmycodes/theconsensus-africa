import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CtaBanner = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/80 px-8 py-16 md:py-20 text-center"
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_hsla(145,80%,60%,0.25)_0%,_transparent_60%)]" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary-foreground leading-tight">
              Ready to Lead the Change?
            </h2>
            <p className="text-primary-foreground/80 text-base md:text-lg">
              Join over 2 million Nigerians who have chosen a better path for our nation's future. Register as a member or become an agent to report from the field.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Button
                size="lg"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8"
                onClick={() => navigate("/join")}
              >
                Register as a Member
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8"
                onClick={() => navigate("/election-form")}
              >
                Become an Agent
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CtaBanner;
