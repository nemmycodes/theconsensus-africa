import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Clock, AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { format } from "date-fns";

const statusIcons: Record<string, React.ReactNode> = {
  Active: <AlertTriangle className="h-4 w-4" />,
  Resolved: <CheckCircle className="h-4 w-4" />,
  Monitoring: <Clock className="h-4 w-4" />,
  Info: <Info className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  Active: "bg-destructive text-destructive-foreground",
  Resolved: "bg-primary text-primary-foreground",
  Monitoring: "bg-accent text-accent-foreground",
  Info: "bg-secondary text-secondary-foreground",
};

interface SituationUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  author_id: string;
  profiles?: { full_name: string | null } | null;
}

const SituationRoom = () => {
  const { user, isAgent } = useAuth();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState("Active");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["General", "Security", "Infrastructure", "Political", "Social", "Economic"];
  const statuses = ["Active", "Resolved", "Monitoring", "Info"];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from("situation_updates")
      .select("*, profiles!situation_updates_author_id_fkey(full_name)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setUpdates(data as unknown as SituationUpdate[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("situation_updates").insert({
      title,
      content,
      category,
      status,
      author_id: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Update posted!" });
      setTitle("");
      setContent("");
      setShowForm(false);
      fetchUpdates();
    }
    setLoading(false);
  };

  const filtered = filter === "All" ? updates : updates.filter((u) => u.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Hero */}
        <div className="container mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Badge className="mb-4">LIVE UPDATES</Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-black mb-4">
              Situation Room
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time updates from our agents across Plateau State. Stay informed about critical developments.
            </p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((cat) => (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
            {isAgent && (
              <Button onClick={() => setShowForm(!showForm)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Post Update
              </Button>
            )}
          </div>

          {/* Agent Create Form */}
          {showForm && isAgent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-8"
            >
              <Card className="border-primary/30">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">New Situation Update</CardTitle>
                  <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <Textarea placeholder="Describe the situation..." value={content} onChange={(e) => setContent(e.target.value)} required rows={4} />
                    <div className="flex gap-4">
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Update"}</Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Updates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((update, i) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{update.category}</Badge>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[update.status] || statusColors.Info}`}>
                        {statusIcons[update.status] || statusIcons.Info}
                        {update.status}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-tight">{update.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{update.content}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{(update.profiles as any)?.full_name || "Agent"}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(update.created_at), "MMM d, yyyy HH:mm")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No updates yet</p>
              <p className="text-sm">Check back soon for the latest developments.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SituationRoom;
