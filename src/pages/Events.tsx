import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import eventRetreatBg from "@/assets/event-retreat-bg.jpg";

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string;
  status: string;
  attendee_count: number | null;
  max_attendees: number | null;
  image_url: string | null;
}

const Events = () => {
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    const now = new Date().toISOString();
    const [upcoming, past] = await Promise.all([
      supabase.from("events").select("*").gte("event_date", now).order("event_date", { ascending: true }).limit(6),
      supabase.from("events").select("*").lt("event_date", now).order("event_date", { ascending: false }).limit(4),
    ]);
    if (upcoming.data) setUpcomingEvents(upcoming.data as EventItem[]);
    if (past.data) setPastEvents(past.data as EventItem[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const channel = supabase
      .channel("events-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-sm font-bold tracking-widest text-primary uppercase">Power to the Youth</span>
            <h1 className="text-5xl md:text-7xl font-black mt-3 leading-tight">
              Live Events<br />
              <span className="text-primary">& Activities</span>
            </h1>
            <p className="text-muted-foreground mt-6 max-w-xl">
              Stay connected with rallies, town halls, workshops, and community events happening across Plateau State and beyond.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black">Upcoming Events</h2>
              {upcomingEvents.length > 0 && (
                <span className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  {upcomingEvents.length} Live
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-12">Loading events...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No upcoming events. Check back soon!</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, i) => {
                const eventDate = new Date(event.event_date);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all group"
                  >
                    <div className="relative h-56 overflow-hidden">
                      {event.image_url ? (
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Calendar className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-center">
                        <span className="block text-lg font-black leading-none">{format(eventDate, "dd")}</span>
                        <span className="block text-xs font-bold uppercase">{format(eventDate, "MMM")}</span>
                      </div>
                      {event.location && (
                        <span className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                          <MapPin size={10} /> {event.location}
                        </span>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={12} /> {format(eventDate, "hh:mm a")}</span>
                        {event.max_attendees && (
                          <span className="flex items-center gap-1"><Users size={12} /> {event.attendee_count ?? 0}/{event.max_attendees}</span>
                        )}
                        <span className="flex items-center gap-1 capitalize"><Calendar size={12} /> {event.event_type}</span>
                      </div>
                      <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{event.title}</h3>
                      {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
                      <Button className="w-full gap-2 font-bold">
                        RSVP NOW <ArrowRight size={14} />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Past Movements */}
      {pastEvents.length > 0 && (
        <section className="py-16 px-4 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-black mb-8">Past Movements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {pastEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative h-48 rounded-xl overflow-hidden group cursor-pointer"
                >
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-secondary" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-bold text-sm">{event.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Retreat */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden"
          >
            <img src={eventRetreatBg} alt="Retreat" className="w-full h-[500px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8 grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="inline-block bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    ★ FEATURED EVENT
                  </span>
                  <h2 className="text-3xl md:text-4xl font-black leading-tight">
                    National Leadership Retreat: The 2026 Roadmap
                  </h2>
                  <p className="text-muted-foreground">
                    Join our core leadership team in Obudu for a 3-day intensive strategy session. This is where the foundation for the upcoming electoral cycle will be solidified.
                  </p>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> <span><span className="text-xs uppercase text-muted-foreground">Venue</span><br /><span className="font-bold text-foreground">Crispan Hotel & Suites</span></span></span>
                    <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> <span><span className="text-xs uppercase text-muted-foreground">Date</span><br /><span className="font-bold text-foreground">Dec 12-15, 2024</span></span></span>
                  </div>
                </div>
                <div className="text-center md:text-right space-y-4">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">Secure Your Spot</span>
                  <p className="text-4xl font-black text-foreground">₦25,000 <span className="text-sm font-normal text-muted-foreground">/ Delegate</span></p>
                  <Button size="lg" className="font-bold px-8">REGISTER FOR RETREAT</Button>
                  <p className="text-xs text-muted-foreground">Includes accommodation and networking sessions</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
