import { motion } from "framer-motion";
import { Download, ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Our Identity",
    body: [
      "The Plateau Consensus Movement is a non-partisan civic and development movement created to redefine leadership, governance, and citizen participation in Plateau State.",
      "We are not a political party. We exist to build a common platform of ideas, competence, and development-driven leadership that prioritises Plateau State above political interests.",
    ],
  },
  {
    title: "2. Why We Exist",
    body: [
      "Fragmented political participation",
      "Weak grassroots organisation",
      "Youth unemployment and underutilised potential",
      "Poor connection between governance and economic opportunity",
      "Politics driven by patronage instead of competence",
    ],
  },
  {
    title: "3. Our Core Belief",
    body: ["Leadership should be earned through competence, ideas, service, and measurable impact."],
  },
  {
    title: "4. Non-Partisan Political Collaboration",
    body: [
      "The movement welcomes aspirants and supporters from different political parties.",
      "Political affiliation remains personal, but development remains our collective responsibility.",
    ],
  },
  {
    title: "5. A New Political Culture",
    body: [
      "We reject toxic political division and blind party loyalty.",
      "We promote issue-based politics and collaborative governance.",
    ],
  },
  {
    title: "6. Economic Empowerment Agenda",
    body: ["Through KEF-CARES, we support farmers, traders, artisans, creatives, startups, and SMEs."],
  },
  {
    title: "7. Data-Driven Governance",
    body: ["Through www.theconsensus.africa, we will build verified citizen databases and community intelligence systems."],
  },
  {
    title: "8. Youth Inclusion",
    body: ["The movement is driven by Gen Z, Millennials, young professionals, and innovators."],
  },
  {
    title: "9. Community Development",
    body: ["Ward-level engagement, polling unit organisation, and grassroots mobilisation."],
  },
  {
    title: "10. Professional Governance",
    body: ["Lawyers, architects, doctors, engineers, educators, ICT professionals, financial experts, sports leaders, and agricultural experts."],
  },
  {
    title: "11. Leadership Redefined",
    body: ["Competence, integrity, accountability, vision, and community credibility."],
  },
  {
    title: "12. Our Vision for Plateau State",
    body: ["A politically conscious, economically productive, and competence-driven Plateau State."],
  },
  {
    title: "13. The Consensus Promise",
    body: ["We support leaders across political platforms who demonstrate competence, credibility, and service."],
  },
];

const Manifesto = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 lg:px-8 bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <ScrollText className="w-3.5 h-3.5" /> Official Document
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-tight">
              The Plateau Consensus Movement Manifesto
            </h1>
            <p className="text-base md:text-lg text-muted-foreground italic">
              Building Consciousness. Building Communities. Building the Future.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Button asChild size="lg" className="font-semibold">
                <a href="/Plateau_Consensus_Manifesto.docx" download>
                  <Download className="w-4 h-4 mr-2" /> Download Manifesto (.docx)
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-semibold" onClick={() => navigate("/manifesto/contribute")}>
                <button type="button"><ScrollText className="w-4 h-4 mr-2" /> Become a Contributor</button>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto max-w-3xl space-y-10">
          {sections.map((s, i) => (
            <motion.article
              key={s.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.2) }}
              className="border-l-4 border-primary/70 pl-6"
            >
              <h2 className="text-xl md:text-2xl font-black mb-3">{s.title}</h2>
              {s.body.length === 1 ? (
                <p className="text-base text-foreground/90 leading-relaxed">{s.body[0]}</p>
              ) : (
                <ul className="space-y-2">
                  {s.body.map((line) => (
                    <li key={line} className="flex gap-3 text-foreground/90 leading-relaxed">
                      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.article>
          ))}

          {/* Final Declaration */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-12 p-8 md:p-10 rounded-2xl bg-primary text-primary-foreground"
          >
            <h2 className="text-2xl font-black mb-4">Final Declaration</h2>
            <p className="leading-relaxed mb-3">
              We are building a movement where political differences do not stop developmental consensus.
              We are building a generation that chooses ideas over division. We are building the future of Plateau State.
            </p>
            <p className="font-bold italic">Building Consciousness. Building Communities. Building the Future.</p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Manifesto;
