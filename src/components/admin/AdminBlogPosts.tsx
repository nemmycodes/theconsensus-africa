import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Filter, Edit, MoreVertical, Eye, FileText, BookOpen, Upload } from "lucide-react";
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

const categories = ["All", "Guidelines", "Education", "Analysis", "Technology", "Engagement", "General", "Politics", "Community", "Development"];

const AdminBlogPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({ title: "", excerpt: "", content: "", category: "General", featured_image_url: "", published: true });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);
  useEffect(() => {
    const channel = supabase.channel("blog-admin").on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, () => fetchPosts()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openCreate = () => { setEditingPost(null); setForm({ title: "", excerpt: "", content: "", category: "General", featured_image_url: "", published: true }); setDialogOpen(true); };
  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({ title: post.title, excerpt: post.excerpt || "", content: post.content, category: post.category, featured_image_url: post.featured_image_url || "", published: post.published });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({ title: "Please sign in", description: "You must be logged in to upload images.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const extension = file.name.split(".").pop() || "jpg";
    const path = `blog/${authData.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage.from("cms-uploads").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from("cms-uploads").getPublicUrl(path);
      setForm((f) => ({ ...f, featured_image_url: urlData.publicUrl }));
      toast({ title: "Image uploaded" });
    }

    e.target.value = "";
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      toast({ title: "Please sign in", description: "You must be logged in to create or edit articles.", variant: "destructive" });
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
      if (error) {
        toast({ title: "Update failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Post updated" });
      }
    } else {
      const { error } = await supabase.from("blog_posts").insert({ ...payload, author_id: authData.user.id });
      if (error) {
        toast({ title: "Create failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Post created" });
      }
    }

    setSaving(false);
    setDialogOpen(false);
    fetchPosts();
  };

  const filtered = posts.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  return (
    <div>
      <AdminHeader title="Blog & Articles" subtitle="Content management and publishing" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL ARTICLES", value: posts.length.toString(), icon: FileText, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "PUBLISHED", value: publishedCount.toString(), icon: FileText, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "DRAFTS", value: draftCount.toString(), icon: Edit, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "TOTAL VIEWS", value: "8,191", icon: Eye, change: "+18%", bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                {s.change && <p className="text-xs text-emerald-600 font-bold mt-1">↑ {s.change}</p>}
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400" />
        </div>
        <Button variant="outline" className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="w-4 h-4" /> Filter
        </Button>
        <Button onClick={openCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4" /> New Article
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.slice(0, 7).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat ? "bg-emerald-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {loading ? (
          <p className="text-center text-gray-500 py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No articles found.</p>
          </div>
        ) : (
          filtered.map((post) => (
            <div key={post.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-bold text-gray-900">{post.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      post.published ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">{post.excerpt || post.content.slice(0, 100)}...</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>By Agent</span>
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">{post.category}</span>
                    <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                    {post.published && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 2,847 views</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <button onClick={() => openEdit(post)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-gray-900">{editingPost ? "Edit Article" : "Create New Article"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label className="text-gray-700">Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white border-gray-200 text-gray-900" /></div>
            <div><Label className="text-gray-700">Excerpt</Label><Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="bg-white border-gray-200 text-gray-900" placeholder="Short summary..." /></div>
            <div><Label className="text-gray-700">Content</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={10} className="bg-white border-gray-200 text-gray-900" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-gray-700">Category</Label><select className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.filter((c) => c !== "All").map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
              <div className="flex items-center gap-3 pt-6"><Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} /><Label className="text-sm text-gray-700">{form.published ? "Published" : "Draft"}</Label></div>
            </div>
            <div>
              <Label className="text-gray-700">Featured Image</Label>
              <div className="flex gap-3 mt-1">
                <Input value={form.featured_image_url} onChange={(e) => setForm({ ...form, featured_image_url: e.target.value })} placeholder="Image URL or upload" className="flex-1 bg-white border-gray-200 text-gray-900" />
                <label className="cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} /><Button type="button" variant="outline" size="sm" className="gap-1 h-10 border-gray-200" asChild><span>{uploading ? "Uploading..." : <><Upload className="w-3 h-3" /> Upload</>}</span></Button></label>
              </div>
              {form.featured_image_url && <img src={form.featured_image_url} alt="Preview" className="mt-3 h-32 rounded-lg object-cover" />}
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{saving ? "Saving..." : editingPost ? "Update Article" : "Create Article"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlogPosts;
