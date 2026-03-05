import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Plus, Clock, ArrowRight, X, BookOpen,
  TrendingUp, MapPin, Award, GraduationCap, Star,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import blogFeaturedImg from "@/assets/blog-featured.jpg";

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

const topicPills = [
  { label: "Economic Empowerment", icon: TrendingUp },
  { label: "Youth Opportunities", icon: MapPin },
  { label: "Leadership Perspectives", icon: Award },
  { label: "Civic Education", icon: GraduationCap },
  { label: "Success Stories", icon: Star },
];

const filterTabs = ["All News", "Press Release", "National Updates", "Community"];

const Blog = () => {
  const { user, isAgent } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [featuredImage, setFeaturedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("All News");

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
      setTitle(""); setExcerpt(""); setContent(""); setFeaturedImage("");
      setShowForm(false);
      fetchPosts();
    }
    setLoading(false);
  };

  const filtered = filter === "All News" ? posts : posts.filter((p) => p.category === filter);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  // Single post view
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" className="mb-6 gap-2" onClick={() => setSelectedPost(null)}>
              <ChevronLeft className="h-4 w-4" /> Back to Blog
            </Button>
            <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {selectedPost.featured_image_url && (
                <img src={selectedPost.featured_image_url} alt={selectedPost.title} className="w-full h-64 md:h-96 object-cover rounded-xl mb-8" />
              )}
              <Badge className="mb-4 bg-primary text-primary-foreground">{selectedPost.category}</Badge>
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

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-bold tracking-widest text-primary uppercase">
              Power to the Youth
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-black mt-3 mb-2 uppercase tracking-tight">
              BLOGPOST
            </h1>
            <p className="text-xl md:text-2xl font-heading font-bold text-primary mb-6">
              Ideas. Knowledge. Opportunity
            </p>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base leading-relaxed">
              The Blog provides structured insights to strengthen economic awareness and civic understanding. We bridge the gap between policy and people, empowering the next generation of leaders.
            </p>
          </motion.div>

          {/* Topic Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 mt-10"
          >
            {topicPills.map((pill) => (
              <div
                key={pill.label}
                className="flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-default"
              >
                <pill.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{pill.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 mt-10">
            <span className="text-sm text-muted-foreground mr-1">FILTER BY:</span>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === tab
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {tab}
              </button>
            ))}
            {isAgent && (
              <Button onClick={() => setShowForm(!showForm)} size="sm" className="ml-auto gap-1">
                <Plus className="h-4 w-4" /> Write Post
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Agent Create Form */}
      {showForm && isAgent && (
        <section className="px-4 lg:px-8 pb-8">
          <div className="container mx-auto">
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
              <Card className="border-primary/30">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-heading font-bold">New Blog Post</h3>
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
          </div>
        </section>
      )}

      {/* Featured Post */}
      {featured && (
        <section className="px-4 lg:px-8 pb-16">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="grid md:grid-cols-2 rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setSelectedPost(featured)}
              >
                {/* Image */}
                <div className="h-64 md:h-[420px] relative">
                  <img
                    src={featured.featured_image_url || blogFeaturedImg}
                    alt={featured.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                      {featured.category === "General" ? "National" : featured.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(featured.created_at), "MMMM d, yyyy")}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-heading font-black mb-4 leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-4">
                    {featured.excerpt || featured.content.slice(0, 250)}
                  </p>
                  <span className="text-primary flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                    Read Full Story <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Article Grid */}
      <section className="px-4 lg:px-8 pb-16">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <div
                  className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-primary/30 transition-all group"
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Image */}
                  <div className="h-52 relative overflow-hidden">
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-muted-foreground/30" />
                      </div>
                    )}
                    {/* Category Badge */}
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs uppercase tracking-wider">
                      {post.category}
                    </Badge>
                    {/* Read time */}
                    <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded">
                      <Clock className="h-3 w-3" />
                      {Math.max(2, Math.ceil(post.content.length / 1000))} min read
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <span>{format(new Date(post.created_at), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span>By {(post.profiles as any)?.full_name || "Agent"}</span>
                    </div>
                    <h3 className="font-heading font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt || post.content.slice(0, 140)}
                    </p>
                    <span className="text-primary flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                      Read Full Article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-heading font-bold">No stories yet</p>
              <p className="text-sm">Check back soon for new content.</p>
            </div>
          )}

          {/* Read More + Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between mt-12">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-heading font-bold">Read More</h3>
                <span className="flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                  Live
                </span>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="w-9 h-9 rounded border border-border flex items-center justify-center hover:bg-secondary transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary/10 border-t border-b border-primary/20">
        <div className="container mx-auto px-4 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="bg-primary/20 text-primary border-primary/30 mb-6">OUR GOAL</Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-heading font-black max-w-3xl mx-auto leading-snug">
              "To equip young people with the knowledge required to make independent{" "}
              <span className="text-primary">economic</span> and{" "}
              <span className="text-primary">civic</span> decisions."
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button size="lg" className="font-bold" onClick={() => navigate("/join")}>
                Join The Movement
              </Button>
              <Button size="lg" variant="outline" className="font-bold" onClick={() => navigate("/donate")}>
                Support Our Cause
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
