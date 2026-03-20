import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SuperAdminHeader from "./SuperAdminHeader";
import { Clock, User, FileText, Radio, Calendar } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "post" | "event" | "update" | "registration";
  title: string;
  date: string;
  meta?: string;
}

const SuperAdminActivityLog = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      const [postsRes, eventsRes, updatesRes, profilesRes] = await Promise.all([
        supabase.from("blog_posts").select("id, title, created_at, category").order("created_at", { ascending: false }).limit(20),
        supabase.from("events").select("id, title, created_at, event_type").order("created_at", { ascending: false }).limit(20),
        supabase.from("situation_updates").select("id, title, created_at, category").order("created_at", { ascending: false }).limit(20),
        supabase.from("profiles").select("user_id, full_name, created_at, email").order("created_at", { ascending: false }).limit(20),
      ]);

      const items: ActivityItem[] = [
        ...(postsRes.data || []).map((p) => ({ id: p.id, type: "post" as const, title: `Blog: ${p.title}`, date: p.created_at, meta: p.category })),
        ...(eventsRes.data || []).map((e) => ({ id: e.id, type: "event" as const, title: `Event: ${e.title}`, date: e.created_at, meta: e.event_type })),
        ...(updatesRes.data || []).map((u) => ({ id: u.id, type: "update" as const, title: `Update: ${u.title}`, date: u.created_at, meta: u.category })),
        ...(profilesRes.data || []).map((p) => ({ id: p.user_id, type: "registration" as const, title: `New member: ${p.full_name || p.email}`, date: p.created_at })),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setActivities(items.slice(0, 50));
      setLoading(false);
    };
    fetchActivity();
  }, []);

  const typeIcons: Record<string, React.ElementType> = {
    post: FileText,
    event: Calendar,
    update: Radio,
    registration: User,
  };

  const typeColors: Record<string, string> = {
    post: "bg-purple-50 text-purple-600",
    event: "bg-cyan-50 text-cyan-600",
    update: "bg-red-50 text-red-600",
    registration: "bg-blue-50 text-blue-600",
  };

  return (
    <div>
      <SuperAdminHeader title="Activity Log" subtitle="Recent activity across the entire platform" />

      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {activities.map((item) => {
                const Icon = typeIcons[item.type];
                return (
                  <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeColors[item.type]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(item.date).toLocaleString()}
                        </span>
                        {item.meta && (
                          <Badge variant="outline" className="text-[9px] h-4">{item.meta}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No activity recorded yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminActivityLog;
