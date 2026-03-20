import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import SuperAdminHeader from "./SuperAdminHeader";
import { Mail, MailOpen, Trash2, Clock } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  form_type: string;
  is_read: boolean;
  created_at: string;
}

const SuperAdminContactMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    setMessages((data as ContactMessage[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const toggleRead = async (id: string, currentRead: boolean) => {
    await supabase.from("contact_messages").update({ is_read: !currentRead } as any).eq("id", id);
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_messages").delete().eq("id", id);
    toast({ title: "Message deleted" });
    fetchMessages();
  };

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <SuperAdminHeader
        title="Contact Messages"
        subtitle={`${unreadCount} unread message${unreadCount !== 1 ? "s" : ""} from the website contact form`}
      />

      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold uppercase tracking-wide">
              All Messages ({messages.length})
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-[10px]">
                <Mail className="w-3 h-3 mr-1" /> {unreadCount} unread
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">No contact messages yet</p>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`border rounded-lg transition-colors ${
                    msg.is_read ? "border-border bg-card" : "border-amber-200 bg-amber-50/50"
                  }`}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => {
                      setExpanded(expanded === msg.id ? null : msg.id);
                      if (!msg.is_read) toggleRead(msg.id, false);
                    }}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.is_read ? "bg-muted" : "bg-amber-100"}`}>
                      {msg.is_read ? <MailOpen className="w-4 h-4 text-muted-foreground" /> : <Mail className="w-4 h-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm truncate ${msg.is_read ? "font-normal text-foreground" : "font-bold text-foreground"}`}>{msg.subject}</p>
                        <Badge variant="outline" className="text-[9px] shrink-0">{msg.form_type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {msg.name} · {msg.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {expanded === msg.id && (
                    <div className="px-4 pb-4 border-t border-border mt-1 pt-3">
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                        <div><span className="font-bold text-muted-foreground">From:</span> {msg.name}</div>
                        <div><span className="font-bold text-muted-foreground">Email:</span> {msg.email}</div>
                        <div><span className="font-bold text-muted-foreground">Type:</span> {msg.form_type}</div>
                        <div><span className="font-bold text-muted-foreground">Date:</span> {new Date(msg.created_at).toLocaleString()}</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminContactMessages;
