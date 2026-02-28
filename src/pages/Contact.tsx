import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CtaBanner from "@/components/CtaBanner";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be under 200 characters"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message must be under 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const contactInfo = [
  { icon: Mail, label: "Email", value: "info@plateauconsensus.ng", href: "mailto:info@plateauconsensus.ng" },
  { icon: Phone, label: "Phone", value: "+234 800 000 0000", href: "tel:+2348000000000" },
  { icon: MapPin, label: "Address", value: "Jos, Plateau State, Nigeria" },
  { icon: Clock, label: "Office Hours", value: "Mon – Fri, 9AM – 5PM WAT" },
];

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    reset();
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. We'll get back to you shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 bg-card border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          >
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              Get In Touch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mt-4 leading-tight">
              CONTACT US
            </h1>
            <p className="text-muted-foreground text-base md:text-lg mt-4 max-w-xl">
              Have questions, ideas, or want to join the movement? We'd love to hear from you. Reach out and let's build the future together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="lg:col-span-3"
            >
              <motion.h2 variants={fadeInUp} className="text-2xl font-bold mb-8">
                Send Us a Message
              </motion.h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register("name")}
                      className="bg-card"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      className="bg-card"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="What is this about?"
                    {...register("subject")}
                    className="bg-card"
                  />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more..."
                    rows={6}
                    {...register("message")}
                    className="bg-card resize-none"
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Button type="submit" size="lg" className="gap-2 font-semibold" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"} <Send size={16} />
                  </Button>
                </motion.div>
              </form>
            </motion.div>

            {/* Contact Info Sidebar */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="lg:col-span-2 space-y-6"
            >
              <motion.h2 variants={fadeInUp} className="text-2xl font-bold mb-8">
                Contact Information
              </motion.h2>

              {contactInfo.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeInUp}
                  className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl group hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium text-foreground hover:text-primary transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="font-medium">{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-card border-t border-border">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <iframe
            title="The Plateau Consensus — Jos, Plateau State"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125529.23098270945!2d8.8200016!3d9.8964815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x105373b4e3c4e1e7%3A0x99ab32a1e49337b2!2sJos%2C%20Plateau%20State%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            className="w-full h-[400px] md:h-[480px] border-0 grayscale hover:grayscale-0 transition-all duration-500"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>
      </section>

      <CtaBanner />
      <Footer />
    </div>
  );
};

export default Contact;
