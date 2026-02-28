import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import mentorImg from "@/assets/mentor-portrait.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Nigerian youth community"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 border border-primary/40 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-primary tracking-wide">
                YOUR FUTURE IS TODAY
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
              EMPOWERING NIGERIA'S{" "}
              <span className="text-primary">YOUTH</span> FOR A NEW ERA OF LEADERSHIP
            </h1>

            {/* Description */}
            <div className="space-y-4 text-muted-foreground text-base lg:text-lg max-w-xl">
              <p>
                The Consensus is a non-partisan civic and economic empowerment movement organizing Gen Z and young Millennial into a structured community focused on increasing economic freedom, strengthening political consciousness, and building a future defined by competence, integrity, and shared prosperity.
              </p>
              <p>
                We believe that when young people are economically empowered, families are stabilized, mothers are strengthened, and communities move forward. The movement begins with the Central Zone of Plateau State, building a verified digital community and scalable infrastructure ready for statewide expansion.
              </p>
            </div>

            {/* Mentor */}
            <p className="text-foreground">
              <span className="font-bold">Lead Mentor:</span> Chief Kefas Ropshik Wungak
            </p>
            <p className="text-muted-foreground text-sm">
              Join the movement. Build your economic power. Shape the future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="gap-2 font-semibold">
                JOIN US <ArrowRight size={18} />
              </Button>
              <Button size="lg" variant="secondary">
                Discuss
              </Button>
              <Button size="lg" variant="secondary">
                Situation Room
              </Button>
              <Button size="lg" variant="secondary">
                Donate
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="hidden lg:flex justify-end" style={{ animationDelay: "0.3s" }}>
            <div className="relative w-[460px] h-[560px] rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
              <img
                src={mentorImg}
                alt="Chief Kefas Ropshik Wungak"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
