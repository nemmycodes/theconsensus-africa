import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  category: string;
  created_at: string;
}

const NewsSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const navigate = useNavigate();

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, content, featured_image_url, category, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(2);
    if (data) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("news-home")
      .on("postgres_changes", { event: "*", schema: "public", table: "blog_posts" }, () => fetchPosts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">News Feed</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2">Latest Updates</h2>
          </div>
          <button
            onClick={() => navigate("/blog")}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
          >
            View News Archive <ArrowRight size={14} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              onClick={() => navigate(`/blog?post=${post.id}`)}
              className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="h-56 relative overflow-hidden">
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
                <span className="absolute top-3 left-3 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded">
                  {post.category}
                </span>
                <span className="absolute bottom-3 left-3 flex items-center gap-1 text-xs bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded">
                  <Clock className="h-3 w-3" />
                  {Math.max(2, Math.ceil(post.content.length / 1000))} min read
                </span>
              </div>
              <div className="p-6">
                <span className="text-xs font-bold text-primary tracking-wider uppercase">
                  {format(new Date(post.created_at), "MMMM d, yyyy")}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                  {post.excerpt || post.content.slice(0, 200)}
                </p>
                <span className="text-primary flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                  Read Full Story <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
