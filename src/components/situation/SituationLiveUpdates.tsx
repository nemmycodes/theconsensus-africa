import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Info, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SituationUpdate {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
}

const statusMeta: Record<string, { icon: typeof Info; className: string }> = {
  Active: { icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/30" },
  Resolved: { icon: CheckCircle, className: "bg-primary/10 text-primary border-primary/30" },
  Monitoring: { icon: Clock, className: "bg-accent/20 text-foreground border-accent" },
  Info: { icon: Info, className: "bg-secondary text-muted-foreground border-border" },
};

const CATEGORIES = ["All", "General", "Security", "Infrastructure", "Political", "Social", "Economic"];

/** Some updates store structured JSON payloads — render a readable summary instead of raw JSON. */
const readable = (content: string) => {
  const trimmed = (content || "").trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return trimmed;
  try {
    const data = JSON.parse(trimmed);
    const parts: string[] = [];
    const push = (label: string, value: unknown) => {
      if (value && typeof value !== "object") parts.push(`${label}: ${value}`);
    };
    push("Election", data.electionType || data.type);
    push("Date", data.electionDate || data.date);
    push("Centre", data.center?.centerName || data.venue);
    push("LGA", data.center?.lga || data.lga);
    push("Party", data.party);
    push("Position", data.position);
    return parts.length ? parts.join(" • ") : "Structured field report submitted from the ground.";
  } catch {
    return "Structured field report submitted from the ground.";
  }
};

const SituationLiveUpdates = () => {
  const [updates, setUpdates] = useState<SituationUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("situation_updates")
      .select("id, title, content, category, status, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    setUpdates((data as SituationUpdate[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("situation-live-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "All" ? updates : updates.filter((u) => u.category === filter)),
    [updates, filter]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={filter === c ? "default" : "outline"}
            className="rounded-full text-xs font-bold"
            onClick={() => setFilter(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading live updates…
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No updates in this category yet. The room is monitoring.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence initial={false}>
            {filtered.map((u) => {
              const meta = statusMeta[u.status] || statusMeta.Info;
              const Icon = meta.icon;
              const isOpen = expanded === u.id;
              return (
                <motion.div
                  key={u.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card
                    className="h-full cursor-pointer border-border hover:border-primary/40 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : u.id)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <Badge variant="outline" className={`gap-1 text-[10px] uppercase ${meta.className}`}>
                          <Icon className="h-3 w-3" /> {u.status}
                        </Badge>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base mb-1">{u.title}</h3>
                      <p className={`text-sm text-muted-foreground ${isOpen ? "" : "line-clamp-2"}`}>{u.content}</p>
                      <p className="text-[11px] uppercase tracking-wider text-primary mt-3">{u.category}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default SituationLiveUpdates;
