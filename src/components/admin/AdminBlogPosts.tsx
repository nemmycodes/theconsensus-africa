import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus, Search, Trash2, Edit, Eye, EyeOff, Upload, BookOpen, Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: string;
  published: boolean;
  created_at: string;
  author_id: string;
}

const categories = ["General", "Politics", "Community", "Development", "Youth", "Culture"];

const emptyForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "General",
  featured_image_url: "",
  published: true,
};

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [viewPost, setViewPost] = useState<BlogPost | null>(null);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const channel = supabase
      .channel("blog-admin")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreate = () => {
    setEditingPost(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category,
      featured_image_url: post.featured_image_url || "",
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `blog/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("cms-uploads").upload(path, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("cms-uploads").getPublicUrl(path);
      setForm((f) => ({ ...f, featured_image_url: urlData.publicUrl }));
      toast({ title: "Image uploaded" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      category: form.category,
      featured_image_url: form.featured_image_url.trim() || null,
      published: form.published,
    };

    if (editingPost) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingPost.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Post updated" });
    } else {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase.from("blog_posts").insert({
        ...payload,
        author_id: userData.user?.id || "",
      });
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Post created" });
    }
    setSaving(false);
    setDialogOpen(false);
    fetchPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase.from("blog_posts").update({ published: !post.published }).eq("id", post.id);
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Post deleted" }); fetchPosts(); }
  };

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Blog Posts CRM</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.length} posts · {publishedCount} published · {draftCount} drafts
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Posts", value: posts.length, color: "text-foreground" },
          { label: "Published", value: publishedCount, color: "text-primary" },
          { label: "Drafts", value: draftCount, color: "text-yellow-400" },
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
        <Input placeholder="Search posts by title or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Posts Table */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">No blog posts found.</p>
          </div>
        ) : (
          filtered.map((post) => (
            <div key={post.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
                {post.featured_image_url ? (
                  <img src={post.featured_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm truncate">{post.title}</h3>
                  <Badge variant={post.published ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {post.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                </div>
                {post.excerpt && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{post.excerpt}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setViewPost(post)} title="Preview">
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => openEdit(post)} title="Edit">
                  <Edit className="w-3.5 h-3.5" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => togglePublish(post)} title={post.published ? "Unpublish" : "Publish"}>
                  {post.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-primary" />}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => deletePost(post.id)} title="Delete">
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
            <DialogTitle>{editingPost ? "Edit Post" : "Create New Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Enter post title" />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary (optional)" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write the full article..." rows={10} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <select
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
                <Label className="text-sm">{form.published ? "Published" : "Draft"}</Label>
              </div>
            </div>
            <div>
              <Label>Featured Image</Label>
              <div className="flex gap-3 mt-1">
                <Input
                  value={form.featured_image_url}
                  onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })}
                  placeholder="Image URL or upload"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  <Button type="button" variant="outline" size="sm" className="gap-1 h-10" asChild>
                    <span>{uploading ? "Uploading..." : <><Upload className="w-3 h-3" /> Upload</>}</span>
                  </Button>
                </label>
              </div>
              {form.featured_image_url && (
                <img src={form.featured_image_url} alt="Preview" className="mt-3 h-32 rounded-lg object-cover" />
              )}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : editingPost ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewPost} onOpenChange={(open) => !open && setViewPost(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewPost?.title}</DialogTitle>
          </DialogHeader>
          {viewPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <Badge variant={viewPost.published ? "default" : "secondary"}>{viewPost.published ? "Published" : "Draft"}</Badge>
                <span>{viewPost.category}</span>
                <span>{format(new Date(viewPost.created_at), "MMM d, yyyy")}</span>
              </div>
              {viewPost.featured_image_url && (
                <img src={viewPost.featured_image_url} alt="" className="w-full h-48 object-cover rounded-lg" />
              )}
              {viewPost.excerpt && (
                <p className="text-sm italic text-muted-foreground">{viewPost.excerpt}</p>
              )}
              <div className="bg-secondary rounded-lg p-4 text-sm whitespace-pre-wrap">{viewPost.content}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogPosts;
