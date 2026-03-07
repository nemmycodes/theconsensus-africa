import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Update {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null };
}

const AdminUpdates = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const { toast } = useToast();

  const fetchUpdates = async () => {
    setLoading(true);
    const { data } = await supabase.from("situation_updates").select("*").order("created_at", { ascending: false });
    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map((u) => u.author_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);
      setUpdates(data.map((u) => ({ ...u, profile: profileMap.get(u.author_id) })));
    } else {
      setUpdates([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUpdates(); }, []);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("updates-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => fetchUpdates())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = updates.filter((u) =>
    u.title.toLowerCase().includes(search.toLowerCase()) ||
    u.category.toLowerCase().includes(search.toLowerCase()) ||
    (u.profile?.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    Active: "bg-primary/15 text-primary",
    Monitoring: "bg-yellow-500/15 text-yellow-400",
    Resolved: "bg-blue-500/15 text-blue-400",
  };

  const exportCSV = () => {
    const header = "Title,Author,Category,Status,Created At,Content\n";
    const rows = filtered.map((u) =>
      `"${u.title}","${u.profile?.full_name ?? "N/A"}","${u.category}","${u.status}","${u.created_at}","${u.content.replace(/"/g, '""').slice(0, 500)}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agent_updates_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: `${filtered.length} updates exported.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Agent Updates & Field Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">{updates.length} total updates</p>
        </div>
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" /> Export
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search updates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No agent updates found.</p>
        ) : (
          filtered.map((update) => (
            <div key={update.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{update.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>By {update.profile?.full_name ?? "Unknown"}</span>
                    <span>•</span>
                    <span>{update.category}</span>
                    <span>•</span>
                    <span>{new Date(update.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[update.status] ?? "bg-muted text-muted-foreground"}`}>
                  {update.status}
                </span>
                <Button size="sm" variant="ghost" className="h-7 gap-1" onClick={() => setSelectedUpdate(update)}>
                  <Eye className="w-3 h-3" /> View
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={!!selectedUpdate} onOpenChange={(open) => !open && setSelectedUpdate(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedUpdate?.title}</DialogTitle>
          </DialogHeader>
          {selectedUpdate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>By {selectedUpdate.profile?.full_name ?? "Unknown"}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${statusColors[selectedUpdate.status] ?? ""}`}>{selectedUpdate.status}</span>
                <span>{selectedUpdate.category}</span>
                <span>{new Date(selectedUpdate.created_at).toLocaleString()}</span>
              </div>
              <div className="bg-secondary rounded-lg p-4 text-sm whitespace-pre-wrap">{selectedUpdate.content}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUpdates;
