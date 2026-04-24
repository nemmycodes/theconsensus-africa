import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do I become a member of The Plateau Consensus?",
    answer:
      "Click the 'Join Us' button on our website and complete the registration form. You'll be asked for basic information including your name, LGA, ward, and areas of interest. Once registered, you'll gain access to our member dashboard, community discussions, and event notifications.",
  },
  {
    question: "What is the Situation Room?",
    answer:
      "The Situation Room is our real-time monitoring and reporting platform. Members and agents can submit reports on political developments, electoral activities, and community issues across Plateau State. These reports are verified and aggregated to provide transparent, up-to-date information to the public.",
  },
  {
    question: "How can I volunteer or become a field agent?",
    answer:
      "You can apply to become a field agent through the 'Become an Agent' option on our website. Agents play a critical role in on-ground reporting, election monitoring, and community engagement. Once approved, you'll receive training and access to agent-specific tools on the platform.",
  },
  {
    question: "Is my personal information safe?",
    answer:
      "Yes. We take data privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your explicit consent. Our platform follows industry-standard security practices to protect your identity and contributions.",
  },
];

const FaqSection = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Got Questions?
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 text-foreground">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FaqSection;
