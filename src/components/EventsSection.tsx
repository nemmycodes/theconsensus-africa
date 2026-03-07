import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  image_url: string | null;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const EventsSection = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("events")
      .select("id, title, description, event_type, image_url")
      .gte("event_date", new Date().toISOString())
      .order("event_date", { ascending: true })
      .limit(3);
    if (data) setEvents(data as EventItem[]);
  };

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel("events-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (events.length === 0) return null;

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold tracking-widest text-primary uppercase">
            Movement Highlights
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight">
            Shaping the Narrative Together
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Join us in these cornerstone initiatives that are redefining political engagement across the nation.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-3 gap-6"
        >
          {events.map((event) => (
            <motion.div
              key={event.id}
              variants={fadeInUp}
              className="group bg-secondary rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                {event.image_url ? (
                  <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-6 space-y-3">
                <span className="inline-block text-xs font-bold tracking-wider px-2 py-1 rounded bg-primary/20 text-primary uppercase">
                  {event.event_type}
                </span>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {event.description || "Join us for this exciting event."}
                </p>
                <button
                  onClick={() => navigate("/events")}
                  className="text-primary text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Learn more <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EventsSection;
