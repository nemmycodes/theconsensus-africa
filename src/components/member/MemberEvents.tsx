import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Clock, Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const typeFilters = ["All", "Registered", "Training", "Summit", "Townhall"];

const MemberEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("events").select("*").order("event_date", { ascending: true }).then(({ data }) => {
      if (data) setEvents(data);
    });

    const channel = supabase.channel("member-events").on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
      supabase.from("events").select("*").order("event_date", { ascending: true }).then(({ data }) => { if (data) setEvents(data); });
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleRegister = (id: string) => {
    setRegisteredIds((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filtered = events.filter(ev => {
    if (activeFilter === "Registered" && !registeredIds.includes(ev.id)) return false;
    if (!["All", "Registered"].includes(activeFilter) && ev.event_type?.toLowerCase() !== activeFilter.toLowerCase()) return false;
    if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getTypeColor = (type: string) => {
    const t = type?.toLowerCase();
    if (t === "summit") return "bg-amber-100 text-amber-700";
    if (t === "training") return "bg-emerald-100 text-emerald-700";
    if (t === "townhall") return "bg-blue-100 text-blue-700";
    if (t === "meeting") return "bg-purple-100 text-purple-700";
    if (t === "drive") return "bg-orange-100 text-orange-700";
    if (t === "workshop") return "bg-pink-100 text-pink-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Events</h2>
          <p className="text-sm text-gray-500">Browse and register for upcoming events, trainings, and activities</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">{registeredIds.length} Registered</span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{events.length} Total Events</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        {typeFilters.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${activeFilter === f ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? filtered.map((ev) => {
          const isRegistered = registeredIds.includes(ev.id);
          const date = new Date(ev.event_date);
          const progress = ev.max_attendees ? Math.min(100, ((ev.attendee_count || 0) / ev.max_attendees) * 100) : 0;

          return (
            <div key={ev.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${getTypeColor(ev.event_type)}`}>
                  {ev.event_type}
                </span>
                {isRegistered && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">✓ Registered</span>}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{ev.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{ev.description}</p>
              <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{ev.location || "TBD"}</div>
              </div>
              {ev.max_attendees && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ev.attendee_count || 0}/{ev.max_attendees} registered</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full">
                    <div className={`h-full rounded-full ${progress > 80 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <Button onClick={() => toggleRegister(ev.id)} variant={isRegistered ? "outline" : "default"} className={`w-full font-bold ${!isRegistered ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}>
                {isRegistered ? "Cancel Registration" : "RSVP Now"}
              </Button>
            </div>
          );
        }) : (
          <p className="text-sm text-gray-400 col-span-2 text-center py-12">No events found.</p>
        )}
      </div>
    </div>
  );
};

export default MemberEvents;
