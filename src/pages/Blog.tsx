import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Plus, Clock, ArrowRight, X, BookOpen } from "lucide-react";
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
  profiles?: { full_name: string | null } | null;
}

const Blog = () => {
  const { user, isAgent } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [featuredImage, setFeaturedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All");

  const categories = ["General", "Politics", "Community", "Development", "Youth", "Culture"];

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, profiles!blog_posts_author_id_fkey(full_name)")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPosts(data as unknown as BlogPost[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from("blog_posts").insert({
      title,
      excerpt,
      content,
      category,
      featured_image_url: featuredImage || null,
      published: true,
      author_id: user.id,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog post published!" });
      setTitle("");
      setExcerpt("");
      setContent("");
      setFeaturedImage("");
      setShowForm(false);
      fetchPosts();
    }
    setLoading(false);
  };

  const filtered = filter === "All" ? posts : posts.filter((p) => p.category === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" className="mb-6" onClick={() => setSelectedPost(null)}>
              ← Back to Blog
            </Button>
            <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {selectedPost.featured_image_url && (
                <img src={selectedPost.featured_image_url} alt={selectedPost.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-8" />
              )}
              <Badge className="mb-4">{selectedPost.category}</Badge>
              <h1 className="text-3xl md:text-4xl font-heading font-black mb-4">{selectedPost.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
                <span>{(selectedPost.profiles as any)?.full_name || "Agent"}</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(selectedPost.created_at), "MMMM d, yyyy")}
                </span>
              </div>
              <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {selectedPost.content}
              </div>
            </motion.article>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        {/* Hero */}
        <div className="container mx-auto px-4 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Badge className="mb-4">STORIES & INSIGHTS</Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-black mb-4">Blog</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Read the latest stories, insights, and updates from The Plateau Consensus community.
            </p>
          </motion.div>
        </div>

        <div className="container mx-auto px-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap gap-2">
              {["All", ...categories].map((cat) => (
                <Button key={cat} variant={filter === cat ? "default" : "outline"} size="sm" onClick={() => setFilter(cat)}>
                  {cat}
                </Button>
              ))}
            </div>
            {isAgent && (
              <Button onClick={() => setShowForm(!showForm)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Write Post
              </Button>
            )}
          </div>

          {/* Agent Create Form */}
          {showForm && isAgent && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8">
              <Card className="border-primary/30">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">New Blog Post</h3>
                    <button onClick={() => setShowForm(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    <Input placeholder="Excerpt (short summary)" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
                    <Textarea placeholder="Write your story..." value={content} onChange={(e) => setContent(e.target.value)} required rows={8} />
                    <Input placeholder="Featured image URL (optional)" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} />
                    <div className="flex gap-4 items-center">
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <Button type="submit" disabled={loading}>{loading ? "Publishing..." : "Publish"}</Button>
                    </div>
                  </form>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Featured Post */}
          {featured && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <Card
                className="overflow-hidden cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setSelectedPost(featured)}
              >
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-80 bg-secondary flex items-center justify-center">
                    {featured.featured_image_url ? (
                      <img src={featured.featured_image_url} alt={featured.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-16 w-16 text-muted-foreground/30" />
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <Badge variant="outline" className="w-fit mb-3">{featured.category}</Badge>
                    <h2 className="text-2xl font-heading font-bold mb-3">{featured.title}</h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {featured.excerpt || featured.content.slice(0, 200)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {(featured.profiles as any)?.full_name || "Agent"} · {format(new Date(featured.created_at), "MMM d, yyyy")}
                      </span>
                      <span className="text-primary flex items-center gap-1 text-sm font-medium">
                        Read more <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="h-full cursor-pointer hover:border-primary/30 transition-colors overflow-hidden"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="h-48 bg-secondary flex items-center justify-center">
                    {post.featured_image_url ? (
                      <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                    )}
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="outline" className="mb-2 text-xs">{post.category}</Badge>
                    <h3 className="font-heading font-bold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {post.excerpt || post.content.slice(0, 120)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{(post.profiles as any)?.full_name || "Agent"}</span>
                      <span>{format(new Date(post.created_at), "MMM d")}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No stories yet</p>
              <p className="text-sm">Check back soon for new content.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
