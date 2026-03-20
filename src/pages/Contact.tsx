import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Phone, MapPin, Send, Twitter, Facebook, Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(200),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formType, setFormType] = useState<"general" | "media">("general");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setIsSubmitting(false);
    reset();
    toast({ title: "Message sent!", description: "We'll get back to you shortly." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
              GET IN <span className="text-primary">TOUCH</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl mx-auto">
              Our movement thrives on your voice. Whether you are a member of the press, a potential volunteer, or a concerned citizen, we are ready to listen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Left - Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-8"
            >
              <div>
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Secretariat</span>
                <div className="mt-4 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">Email</span>
                      <p className="font-medium mt-1">info@consensusparty.org.ng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">Phone</span>
                      <p className="font-medium mt-1">+234 703 770 5088</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-primary font-bold uppercase tracking-wider">Headquarters</span>
                      <p className="font-medium mt-1">Abuja, FCT, Nigeria</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">Follow the Movement</span>
                <div className="flex items-center gap-3 mt-4">
                  <a href="#" className="w-9 h-9 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                    <Twitter size={16} />
                  </a>
                  <a href="#" className="w-9 h-9 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                    <Facebook size={16} />
                  </a>
                  <a href="#" className="w-9 h-9 rounded border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                    <Instagram size={16} />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Right - Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
                {/* Form type tabs */}
                <div className="flex gap-3 mb-8">
                  <button
                    onClick={() => setFormType("general")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formType === "general" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    General Inquiry
                  </button>
                  <button
                    onClick={() => setFormType("media")}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formType === "media" ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    Media & Press
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold tracking-wider uppercase">Full Name</Label>
                      <Input {...register("name")} className="bg-card border-border" />
                      {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold tracking-wider uppercase">Email Address</Label>
                      <Input type="email" {...register("email")} className="bg-card border-border" />
                      {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold tracking-wider uppercase">Subject</Label>
                    <Input {...register("subject")} className="bg-card border-border" />
                    {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold tracking-wider uppercase">Your Message</Label>
                    <Textarea {...register("message")} rows={6} className="bg-card border-border resize-none" />
                    {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                  </div>
                  <Button type="submit" size="lg" className="gap-2 font-bold" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "SEND MESSAGE"} <Send size={14} />
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Media Inquiries */}
      <section className="py-12 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card border border-border rounded-xl p-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Media Inquiries</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  For official press statements, interview requests, and media credentials, please include your organization name and deadline in the message field above, or email our press office directly at{" "}
                  <a href="mailto:media@consensusparty.org.ng" className="text-primary hover:underline">media@consensusparty.org.ng</a>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
