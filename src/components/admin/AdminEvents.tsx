import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar, Plus, MapPin, Users, Trash2, Edit, Upload, Search, Eye, Image as ImageIcon,
} from "lucide-react";
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

const eventTypes = ["rally", "townhall", "workshop", "summit", "retreat"];
const statusOptions = ["upcoming", "live", "completed", "cancelled"];

const emptyForm = {
  title: "", description: "", location: "", event_date: "",
  event_type: "rally", max_attendees: "", image_url: "",
};

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    const channel = supabase
      .channel("events-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => fetchEvents())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      event_date: event.event_date ? new Date(event.event_date).toISOString().slice(0, 16) : "",
      event_type: event.event_type,
      max_attendees: event.max_attendees?.toString() || "",
      image_url: event.image_url || "",
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `events/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cms-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("cms-uploads").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
      toast({ title: "Image uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.event_date) {
      toast({ title: "Title and date are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      location: form.location.trim() || null,
      event_date: form.event_date,
      event_type: form.event_type,
      max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
      image_url: form.image_url.trim() || null,
    };

    if (editingEvent) {
      const { error } = await supabase.from("events").update(payload).eq("id", editingEvent.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Event updated" });
    } else {
      const { error } = await supabase.from("events").insert({
        ...payload,
        created_by: user?.id,
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Event created" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchEvents();
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

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    upcoming: "bg-blue-500/15 text-blue-400",
    live: "bg-primary/15 text-primary",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/15 text-destructive",
  };

  const liveCount = events.filter((e) => e.status === "live").length;
  const upcomingCount = events.filter((e) => e.status === "upcoming").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Events CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {events.length} events · {liveCount} live · {upcomingCount} upcoming
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", value: events.length, color: "text-foreground" },
          { label: "Live Now", value: liveCount, color: "text-primary" },
          { label: "Upcoming", value: upcomingCount, color: "text-blue-400" },
          { label: "Completed", value: events.filter((e) => e.status === "completed").length, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading events...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No events found.</p>
          </div>
        ) : (
          filtered.map((event) => (
            <div key={event.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                {event.image_url ? (
                  <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm truncate">{event.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[event.status] ?? statusColors.upcoming}`}>
                    {event.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                  <span>{format(new Date(event.event_date), "MMM d, yyyy · h:mm a")}</span>
                  <span className="capitalize">{event.event_type}</span>
                  {event.attendee_count != null && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.attendee_count}{event.max_attendees ? `/${event.max_attendees}` : ""}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <select
                  className="bg-secondary border border-border rounded-md px-2 py-1 text-xs"
                  value={event.status}
                  onChange={(e) => updateStatus(event.id, e.target.value)}
                >
                  {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setViewEvent(event)} title="View">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(event)} title="Edit">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => deleteEvent(event.id)} title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              <div><Label>Date & Time</Label><Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <select className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                  {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><Label>Max Attendees</Label><Input type="number" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} /></div>
            </div>
            <div>
              <Label>Event Image</Label>
              <div className="flex gap-3 mt-1">
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="Image URL or upload" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button type="button" variant="outline" size="sm" className="gap-1 h-10" asChild>
                    <span>{uploading ? "Uploading..." : <><Upload className="w-3 h-3" /> Upload</>}</span>
                  </Button>
                </label>
              </div>
              {form.image_url && <img src={form.image_url} alt="Preview" className="mt-3 h-32 rounded-lg object-cover" />}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewEvent} onOpenChange={(open) => !open && setViewEvent(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewEvent?.title}</DialogTitle>
          </DialogHeader>
          {viewEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${statusColors[viewEvent.status] ?? ""}`}>{viewEvent.status}</span>
                <span className="capitalize">{viewEvent.event_type}</span>
                <span>{format(new Date(viewEvent.event_date), "MMM d, yyyy · h:mm a")}</span>
                {viewEvent.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{viewEvent.location}</span>}
              </div>
              {viewEvent.image_url && <img src={viewEvent.image_url} alt="" className="w-full h-48 object-cover rounded-lg" />}
              {viewEvent.description && <div className="bg-secondary rounded-lg p-4 text-sm">{viewEvent.description}</div>}
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Attendees: {viewEvent.attendee_count ?? 0}{viewEvent.max_attendees ? ` / ${viewEvent.max_attendees}` : ""}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminEvents;
