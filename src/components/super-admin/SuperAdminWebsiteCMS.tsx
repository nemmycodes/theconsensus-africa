import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SuperAdminHeader from "./SuperAdminHeader";
import { Globe, FileText, Calendar, Radio, Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";

const SuperAdminWebsiteCMS = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    const [postsRes, eventsRes, updatesRes] = await Promise.all([
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("event_date", { ascending: false }),
      supabase.from("situation_updates").select("*").order("created_at", { ascending: false }),
    ]);
    setPosts(postsRes.data || []);
    setEvents(eventsRes.data || []);
    setUpdates(updatesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const togglePostPublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from("blog_posts").update({ published: !current }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: current ? "Post unpublished" : "Post published" });
    fetchAll();
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    fetchAll();
  };

  const deleteEvent = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    await supabase.from("events").delete().eq("id", id);
    toast({ title: "Event deleted" });
    fetchAll();
  };

  const deleteUpdate = async (id: string) => {
    if (!confirm("Delete this update?")) return;
    await supabase.from("situation_updates").delete().eq("id", id);
    toast({ title: "Update deleted" });
    fetchAll();
  };

  return (
    <div>
      <SuperAdminHeader title="Website CMS" subtitle="Manage all content displayed on the public website" />

      <Tabs defaultValue="blog" className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="blog" className="text-xs gap-1.5"><FileText className="w-3.5 h-3.5" />Blog ({posts.length})</TabsTrigger>
          <TabsTrigger value="events" className="text-xs gap-1.5"><Calendar className="w-3.5 h-3.5" />Events ({events.length})</TabsTrigger>
          <TabsTrigger value="updates" className="text-xs gap-1.5"><Radio className="w-3.5 h-3.5" />Situation Updates ({updates.length})</TabsTrigger>
        </TabsList>

        {/* Blog Posts */}
        <TabsContent value="blog">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Title</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium text-sm max-w-[250px] truncate">{post.title}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{post.category}</Badge></TableCell>
                        <TableCell>
                          <Badge className={`text-[10px] ${post.published ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
                            {post.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => togglePostPublish(post.id, post.published)}>
                              {post.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deletePost(post.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {posts.length === 0 && (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No blog posts</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events */}
        <TabsContent value="events">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Type</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((evt) => (
                    <TableRow key={evt.id}>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{evt.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{evt.event_type}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(evt.event_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{evt.location || "—"}</TableCell>
                      <TableCell><Badge className="text-[10px]">{evt.status}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteEvent(evt.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No events</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Situation Updates */}
        <TabsContent value="updates">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Title</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium text-sm max-w-[250px] truncate">{u.title}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{u.category}</Badge></TableCell>
                      <TableCell>
                        <Badge className={`text-[10px] ${u.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"}`}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteUpdate(u.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {updates.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No updates</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdminWebsiteCMS;
