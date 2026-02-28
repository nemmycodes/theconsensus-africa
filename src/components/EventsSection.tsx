import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import eventTownhall from "@/assets/event-townhall.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventRally from "@/assets/event-rally.jpg";

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
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const events = [
  {
    image: eventTownhall,
    title: "Youth Town Hall — Central Zone",
    date: "March 15, 2026",
    location: "Jos, Plateau State",
    description: "An open forum for young people to discuss economic challenges and propose community-driven solutions.",
  },
  {
    image: eventWorkshop,
    title: "Digital Skills Bootcamp",
    date: "April 5, 2026",
    location: "University of Jos Campus",
    description: "A two-day intensive training on digital entrepreneurship, freelancing, and tech skills for economic freedom.",
  },
  {
    image: eventRally,
    title: "Civic Engagement Rally",
    date: "April 20, 2026",
    location: "Plateau State Capital",
    description: "A peaceful rally to advocate for youth inclusion in governance and transparent leadership across the state.",
  },
];

const EventsSection = () => {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4"
        >
          <div>
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              Upcoming Events
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mt-4 leading-tight">
              Get <span className="text-primary">Involved</span>
            </h2>
          </div>
          <Button variant="outline" className="gap-2 self-start md:self-auto">
            View All Events <ArrowRight size={16} />
          </Button>
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
              key={event.title}
              variants={fadeInUp}
              className="group bg-secondary rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary to-transparent" />
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-primary" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" />
                    {event.location}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default EventsSection;
