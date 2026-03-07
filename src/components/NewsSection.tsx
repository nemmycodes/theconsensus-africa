import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, MessageSquare, Share2, BookOpen } from "lucide-react";
import { format } from "date-fns";

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

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, content, featured_image_url, category, created_at")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(3);
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
          <a href="/blog" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            View News Archive <ArrowRight size={14} />
          </a>
        </motion.div>

        <div className="space-y-6">
          {posts.map((post, i) => (
            <motion.a
              key={post.id}
              href="/blog"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col md:flex-row gap-6 p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors group cursor-pointer"
            >
              <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden shrink-0">
                {post.featured_image_url ? (
                  <img src={post.featured_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <span className="text-xs font-bold text-primary tracking-wider uppercase">
                  {format(new Date(post.created_at), "MMMM d, yyyy")}
                </span>
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{post.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {post.excerpt || post.content.slice(0, 200)}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><Share2 size={12} /> Share</span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
