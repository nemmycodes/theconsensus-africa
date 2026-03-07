import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, ArrowRight, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import eventMegarally from "@/assets/event-megarally.jpg";
import eventPoundedYam from "@/assets/event-pounded-yam.jpg";
import eventRetreatBg from "@/assets/event-retreat-bg.jpg";
import eventTownhall from "@/assets/event-townhall.jpg";
import eventWorkshop from "@/assets/event-workshop.jpg";
import eventRally from "@/assets/event-rally.jpg";

const upcomingEvents = [
  {
    image: eventMegarally,
    date: { day: "24", month: "OCT" },
    location: "Lagos, NG",
    time: "14:00 WAT",
    attendees: "5k+ Expected",
    title: "The Consensus Megarally: Youth Voice 2026",
    description: "Join us for the largest convergence of young leaders at the National Stadium. Let...",
  },
  {
    image: eventPoundedYam,
    date: { day: "02", month: "NOV" },
    location: "Abuja, FCT",
    time: "10:00 WAT",
    type: "Hybrid Event",
    title: "Policy & Pounded Yam: Town Hall Meeting",
    description: "A casual, high-impact session with consensus leaders discussing economic...",
  },
  {
    image: eventWorkshop,
    date: { day: "15", month: "NOV" },
    location: "Port Harcourt",
    time: "16:00 WAT",
    type: "Workshop",
    title: "Tech-in-Governance Workshop",
    description: "Learning how to leverage blockchain and AI for transparent electoral processes. For th...",
  },
];

const pastEvents = [
  { image: eventTownhall, title: "Plateau Unity Summit" },
  { image: eventRally, title: "Voter Registration Drive" },
  { image: eventWorkshop, title: "Policy Hackathon" },
  { image: eventMegarally, title: "E-Leadership Seminar" },
];

const Events = () => {
  const navigate = useNavigate();

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
              The Blog provides structured insights to strengthen economic awareness and civic understanding.
            </p>
            <p className="text-muted-foreground mt-2">Content includes:</p>
            <ul className="text-muted-foreground mt-2 space-y-1 list-disc pl-5 text-sm">
              <li>Economic empowerment insights</li>
              <li>Youth opportunity information</li>
              <li>Leadership perspectives</li>
              <li>Civic education</li>
              <li>Community success stories</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-black">Upcoming Events</h2>
              <span className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                4 Live
              </span>
            </div>
            <div className="flex gap-2">
              <button className="w-9 h-9 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="w-9 h-9 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-lg px-3 py-2 text-center">
                    <span className="block text-lg font-black leading-none">{event.date.day}</span>
                    <span className="block text-xs font-bold uppercase">{event.date.month}</span>
                  </div>
                  {event.location && (
                    <span className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                      <MapPin size={10} /> {event.location}
                    </span>
                  )}
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                    {event.attendees && <span className="flex items-center gap-1"><Users size={12} /> {event.attendees}</span>}
                    {event.type && <span className="flex items-center gap-1"><Calendar size={12} /> {event.type}</span>}
                  </div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{event.title}</h3>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <Button className="w-full gap-2 font-bold">
                    RSVP NOW <ArrowRight size={14} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Movements */}
      <section className="py-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-black mb-8">Past Movements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pastEvents.map((event, i) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative h-48 rounded-xl overflow-hidden group cursor-pointer"
              >
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-bold text-sm">{event.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                    Join our core leadership team in Obudu for a 3-day intensive strategy session. This is where the foundation for the upcoming electoral cycle will be solidified. Limited spaces available for state coordinators.
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
