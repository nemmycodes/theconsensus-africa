import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Plus, MapPin, Users, Clock, Search, Filter, Eye, Edit, Trash2, Upload, ImageIcon } from "lucide-react";
import { format } from "date-fns";

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
  image_url?: string | null;
  created_at: string;
}

const eventTypes = ["rally", "townhall", "workshop", "summit", "retreat", "training", "forum"];
const typeColors: Record<string, string> = {
  training: "bg-emerald-50 text-emerald-700 border-emerald-200",
  townhall: "bg-emerald-50 text-emerald-700 border-emerald-200",
  forum: "bg-emerald-50 text-emerald-700 border-emerald-200",
  summit: "bg-amber-50 text-amber-700 border-amber-200",
  rally: "bg-blue-50 text-blue-700 border-blue-200",
  workshop: "bg-purple-50 text-purple-700 border-purple-200",
  retreat: "bg-rose-50 text-rose-700 border-rose-200",
};

const emptyForm = { title: "", description: "", location: "", event_date: "", event_type: "rally", max_attendees: "", image_url: "" };

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data as Event[]);
    setLoading(false);
  };

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => {
    const channel = supabase.channel("events-admin").on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreate = () => { setEditingEvent(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({ title: event.title, description: event.description || "", location: event.location || "", event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "", event_type: event.event_type, max_attendees: event.max_attendees?.toString() || "", image_url: (event as any).image_url || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date) { toast({ title: "Title and date are required", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { title: form.title.trim(), description: form.description.trim() || null, location: form.location.trim() || null, event_date: form.event_date, event_type: form.event_type, max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null };
    if (editingEvent) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingEvent.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Event updated" });
    } else {
      const { error } = await supabase.from("events").insert({ ...payload, created_by: user?.id });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Event created" });
    }
    setSaving(false); setDialogOpen(false); fetchEvents();
  };

  const deleteEvent = async (id: string) => {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  };

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));
  const upcomingCount = events.filter((e) => e.status === "upcoming").length;
  const totalAttendees = events.reduce((sum, e) => sum + (e.attendee_count ?? 0), 0);

  return (
    <div>
      <AdminHeader title="Events & Activities" subtitle="Manage events, trainings, and community activities" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL EVENTS", value: events.length.toString(), icon: Calendar, change: "+18", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "UPCOMING", value: upcomingCount.toString(), icon: Clock, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "TOTAL ATTENDEES", value: totalAttendees.toLocaleString(), icon: Users, change: "+12%", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "THIS MONTH", value: events.filter((e) => new Date(e.event_date).getMonth() === new Date().getMonth()).length.toString(), icon: Calendar, bg: "bg-purple-50", color: "text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                {s.change && <p className="text-xs text-emerald-600 font-bold mt-1">↑ {s.change}</p>}
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400" />
        </div>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter
        </Button>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" /> Create Event
        </Button>
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-center text-gray-500 col-span-2 py-12">Loading events...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 col-span-2 py-12">No events found.</p>
        ) : (
          filtered.map((event) => {
            const progress = event.max_attendees ? ((event.attendee_count ?? 0) / event.max_attendees) * 100 : 0;
            const eventDate = new Date(event.event_date);
            return (
              <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${typeColors[event.event_type] ?? typeColors.rally}`}>
                    {event.event_type}
                  </span>
                  <span className="text-xs text-gray-500">{event.status}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{event.title}</h3>
                <div className="space-y-1.5 mb-4">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> {format(eventDate, "EEE, MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {format(eventDate, "hh:mm a")}
                  </p>
                  {event.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {event.location}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-bold text-gray-900">{event.attendee_count ?? 0}</span>
                    {event.max_attendees && <span>/{event.max_attendees} registered</span>}
                  </p>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="text-xs h-8 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => openEdit(event)}>
                      View Details
                    </Button>
                  </div>
                </div>
                {event.max_attendees && (
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-900">{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-700">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
            <div><Label className="text-gray-700">Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="bg-white border-gray-200 text-gray-900" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-700">Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
              <div><Label className="text-gray-700">Date & Time</Label><Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-700">Type</Label><select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>{eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><Label className="text-gray-700">Max Attendees</Label><Input type="number" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
