import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Trash2, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export interface ChatMessage {
  id: string;
  channel: string;
  author_id: string;
  content: string;
  is_broadcast: boolean;
  created_at: string;
  author?: { full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  channel: string;
  title: string;
  description: string;
  allowBroadcast?: boolean;
}

const SituationChat = ({ channel, title, description, allowBroadcast = true }: Props) => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [broadcast, setBroadcast] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from("situation_chat_messages")
      .select("id, channel, author_id, content, is_broadcast, created_at")
      .eq("channel", channel)
      .order("created_at", { ascending: true })
      .limit(200);

    const rows = data || [];
    let profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", ids);
      profileMap = new Map((profs || []).map((p) => [p.user_id, { full_name: p.full_name, avatar_url: p.avatar_url }]));
    }
    setMessages(rows.map((r) => ({ ...r, author: profileMap.get(r.author_id) || null })));
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    load();
    const ch = supabase
      .channel(`situation-chat-${channel}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "situation_chat_messages", filter: `channel=eq.${channel}` },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  const canModerate = isAdmin || isSuperAdmin;

  const send = async () => {
    if (!user) {
      navigate("/auth?redirect=/situation-room");
      return;
    }
    const body = text.trim();
    if (!body) return;
    setSending(true);
    const { error } = await supabase.from("situation_chat_messages").insert({
      channel,
      author_id: user.id,
      content: body,
      is_broadcast: allowBroadcast ? broadcast : false,
    });
    if (error) {
      toast({ title: "Message failed", description: error.message, variant: "destructive" });
    } else {
      setText("");
      setBroadcast(false);
      load();
    }
    setSending(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("situation_chat_messages").delete().eq("id", id);
    if (error) toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    else load();
  };

  const initials = (name?: string | null) =>
    (name || "Member")
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const count = useMemo(() => messages.length, [messages]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <h3 className="font-heading font-bold text-lg">{title}</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <Badge variant="outline" className="text-[11px] shrink-0">
          {count} message{count === 1 ? "" : "s"}
        </Badge>
      </div>

      <div className="h-[460px] overflow-y-auto px-5 py-4 space-y-4 bg-secondary/20">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Connecting to the room…
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {user
              ? "No messages here yet. Start the conversation — the room is live."
              : "Conversations in this room are visible to members only. Sign in to read and join the discussion."}
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const mine = m.author_id === user?.id;
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={m.author?.avatar_url || undefined} />
                    <AvatarFallback className="text-[11px]">{initials(m.author?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className={`max-w-[78%] ${mine ? "text-right" : ""}`}>
                    <div className={`flex items-center gap-2 mb-1 ${mine ? "justify-end" : ""}`}>
                      <span className="text-xs font-bold">{m.author?.full_name || "Member"}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(m.created_at), { addSuffix: true })}
                      </span>
                      {m.is_broadcast && (
                        <Badge className="gap-1 text-[9px] uppercase">
                          <Megaphone className="h-3 w-3" /> Broadcast
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`rounded-xl px-4 py-2.5 text-sm whitespace-pre-wrap break-words border ${
                        m.is_broadcast
                          ? "bg-primary/10 border-primary/40"
                          : mine
                          ? "bg-primary text-primary-foreground border-transparent"
                          : "bg-card border-border"
                      }`}
                    >
                      {m.content}
                    </div>
                    {(mine || canModerate) && (
                      <button
                        onClick={() => remove(m.id)}
                        className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-3 w-3" /> Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-border p-4 space-y-3">
        {user ? (
          <>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message the ${title.toLowerCase()}…  (Enter to send, Shift+Enter for a new line)`}
              className="min-h-[70px] resize-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              {allowBroadcast ? (
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={broadcast} onCheckedChange={setBroadcast} />
                  <span className="inline-flex items-center gap-1">
                    <Megaphone className="h-3.5 w-3.5" /> Send as public broadcast (pinned for everyone)
                  </span>
                </label>
              ) : (
                <span />
              )}
              <Button onClick={send} disabled={sending || !text.trim()} className="font-bold gap-2">
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Sign in with your account to join the conversation.</p>
            <Button onClick={() => navigate("/auth?redirect=/situation-room")} className="font-bold">
              Sign in to chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SituationChat;
