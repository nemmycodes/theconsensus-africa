import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Plus, MapPin, Users, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  event_date: string;
  event_type: string;
  status: string;
  attendee_count: number | null;
  max_attendees: number | null;
  created_at: string;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", event_date: "", event_type: "rally", max_attendees: "" });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);

  // Subscribe to realtime
  useEffect(() => {
    const channel = supabase
      .channel("events-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const createEvent = async () => {
    if (!form.title || !form.event_date) {
      toast({ title: "Missing fields", description: "Title and date are required.", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      event_date: form.event_date,
      event_type: form.event_type,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
      created_by: user?.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event Created" });
      setDialogOpen(false);
      setForm({ title: "", description: "", location: "", event_date: "", event_type: "rally", max_attendees: "" });
      fetchEvents();
    }
  };

  const deleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else fetchEvents();
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("events").update({ status }).eq("id", id);
    fetchEvents();
  };

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500/15 text-blue-400",
    live: "bg-primary/15 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Live Events Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">{events.length} events total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Event</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
                <div><Label>Date & Time</Label><Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <select className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                    <option value="rally">Rally</option>
                    <option value="townhall">Town Hall</option>
                    <option value="workshop">Workshop</option>
                    <option value="summit">Summit</option>
                    <option value="retreat">Retreat</option>
                  </select>
                </div>
                <div><Label>Max Attendees</Label><Input type="number" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} /></div>
              </div>
              <Button onClick={createEvent} className="w-full">Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No events yet. Create your first event.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{event.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                    <span>{new Date(event.event_date).toLocaleString()}</span>
                    {event.attendee_count != null && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.attendee_count}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusColors[event.status] ?? statusColors.upcoming}`}>
                  {event.status}
                </span>
                <select
                  className="bg-secondary border border-border rounded-md px-2 py-1 text-xs"
                  value={event.status}
                  onChange={(e) => updateStatus(event.id, e.target.value)}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteEvent(event.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
