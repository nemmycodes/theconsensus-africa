import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface BroadcastItem {
  id: string;
  content: string;
  created_at: string;
  channel: string;
  author_name: string | null;
}

/** Shows every public broadcast message dropped by any account holder in the room. */
const SituationBroadcasts = ({ compact = false }: { compact?: boolean }) => {
  const [items, setItems] = useState<BroadcastItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("situation_chat_messages")
      .select("id, content, created_at, channel, author_id")
      .eq("is_broadcast", true)
      .order("created_at", { ascending: false })
      .limit(compact ? 3 : 40);

    const rows = data || [];
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    let names = new Map<string, string | null>();
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name").in("user_id", ids);
      names = new Map((profs || []).map((p) => [p.user_id, p.full_name]));
    }
    setItems(
      rows.map((r) => ({
        id: r.id,
        content: r.content,
        created_at: r.created_at,
        channel: r.channel,
        author_name: names.get(r.author_id) || null,
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`situation-broadcasts-${compact ? "compact" : "full"}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_chat_messages" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading broadcasts…
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No broadcasts yet. Any member can flip the broadcast switch in the chat to pin a message here for everyone.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "grid md:grid-cols-2 gap-4"}>
      <AnimatePresence initial={false}>
        {items.map((b) => (
          <motion.div key={b.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <Badge className="gap-1 text-[10px] uppercase">
                    <Megaphone className="h-3 w-3" /> Broadcast
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(b.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{b.content}</p>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {b.author_name || "Member"} • #{b.channel}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SituationBroadcasts;
