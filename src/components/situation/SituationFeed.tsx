import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, ImageIcon, MapPin, Send, X, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Profile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  location: string | null;
  created_at: string;
  author?: Profile | null;
  likes_count: number;
  liked_by_me: boolean;
  comments_count: number;
}

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile | null;
}

const SituationFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPosts();
    const ch = supabase
      .channel("situation-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_posts" }, fetchPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_post_likes" }, fetchPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_post_comments" }, fetchPosts)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("situation_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!postsData) { setLoading(false); return; }

    const authorIds = Array.from(new Set(postsData.map((p) => p.author_id)));
    const postIds = postsData.map((p) => p.id);

    const [{ data: profilesData }, { data: likesData }, { data: commentsCountData }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", authorIds),
      supabase.from("situation_post_likes").select("post_id, user_id").in("post_id", postIds),
      supabase.from("situation_post_comments").select("post_id").in("post_id", postIds),
    ]);

    const profileMap = new Map((profilesData || []).map((p) => [p.user_id, p]));
    const likeCounts: Record<string, number> = {};
    const likedByMe: Record<string, boolean> = {};
    (likesData || []).forEach((l) => {
      likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1;
      if (user && l.user_id === user.id) likedByMe[l.post_id] = true;
    });
    const commentCounts: Record<string, number> = {};
    (commentsCountData || []).forEach((c) => { commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1; });

    setPosts(postsData.map((p) => ({
      ...p,
      author: profileMap.get(p.author_id) || null,
      likes_count: likeCounts[p.id] || 0,
      liked_by_me: !!likedByMe[p.id],
      comments_count: commentCounts[p.id] || 0,
    })));
    setLoading(false);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast({ title: "Image too large", description: "Max 5MB", variant: "destructive" });
      return;
    }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handlePost = async () => {
    if (!user) {
      toast({ title: "Sign in required" });
      navigate("/auth?redirect=/situation-room");
      return;
    }
    if (!content.trim()) return;
    setPosting(true);

    let image_url: string | null = null;
    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("situation-uploads").upload(path, imageFile);
      if (upErr) {
        toast({ title: "Upload failed", description: upErr.message, variant: "destructive" });
        setPosting(false);
        return;
      }
      const { data } = supabase.storage.from("situation-uploads").getPublicUrl(path);
      image_url = data.publicUrl;
    }

    const { error } = await supabase.from("situation_posts").insert({
      author_id: user.id,
      content: content.trim(),
      image_url,
      location: location.trim() || null,
    });

    if (error) {
      toast({ title: "Post failed", description: error.message, variant: "destructive" });
    } else {
      setContent(""); setLocation(""); clearImage();
      toast({ title: "Posted to Situation Feed" });
      fetchPosts();
    }
    setPosting(false);
  };

  const toggleLike = async (post: Post) => {
    if (!user) {
      navigate("/auth?redirect=/situation-room");
      return;
    }
    // optimistic
    setPosts((prev) => prev.map((p) => p.id === post.id
      ? { ...p, liked_by_me: !p.liked_by_me, likes_count: p.likes_count + (p.liked_by_me ? -1 : 1) }
      : p));
    if (post.liked_by_me) {
      await supabase.from("situation_post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("situation_post_likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const toggleComments = async (postId: string) => {
    const next = !openComments[postId];
    setOpenComments((p) => ({ ...p, [postId]: next }));
    if (next && !commentsByPost[postId]) {
      const { data } = await supabase
        .from("situation_post_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      if (data) {
        const ids = Array.from(new Set(data.map((c) => c.author_id)));
        const { data: profs } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", ids);
        const m = new Map((profs || []).map((p) => [p.user_id, p]));
        setCommentsByPost((prev) => ({ ...prev, [postId]: data.map((c) => ({ ...c, author: m.get(c.author_id) || null })) }));
      }
    }
  };

  const submitComment = async (postId: string) => {
    if (!user) { navigate("/auth?redirect=/situation-room"); return; }
    const text = (commentInput[postId] || "").trim();
    if (!text) return;
    const { data, error } = await supabase
      .from("situation_post_comments")
      .insert({ post_id: postId, author_id: user.id, content: text })
      .select().single();
    if (error) { toast({ title: "Comment failed", description: error.message, variant: "destructive" }); return; }
    const { data: prof } = await supabase.from("profiles").select("user_id, full_name, avatar_url").eq("user_id", user.id).maybeSingle();
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { ...data, author: prof || null } as Comment],
    }));
    setCommentInput((p) => ({ ...p, [postId]: "" }));
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
  };

  const deletePost = async (postId: string) => {
    await supabase.from("situation_posts").delete().eq("id", postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const initials = (name?: string | null) => (name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-3xl font-heading font-black uppercase tracking-tight">Situation Feed</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Share what's happening on the ground. Members and agents can post, like, and discuss in real time.
          </p>
        </div>

        {/* Composer */}
        <Card className="p-4 mb-6 border-border">
          {!user ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">Sign in to share a situation update.</p>
              <Button onClick={() => navigate("/auth?redirect=/situation-room")}>Sign In</Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{initials(user.email)}</AvatarFallback>
                </Avatar>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's happening in your area? Report a situation..."
                  className="min-h-[80px] resize-none border-0 focus-visible:ring-0 p-0 text-base"
                  maxLength={1000}
                />
              </div>
              {imagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-border">
                  <img src={imagePreview} alt="preview" className="w-full max-h-80 object-cover" />
                  <button onClick={clearImage} className="absolute top-2 right-2 bg-background/80 rounded-full p-1.5 hover:bg-background">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (e.g. Jos North, Ward 3)"
                className="h-9 text-sm"
                maxLength={120}
              />
              <div className="flex items-center justify-between border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ImageIcon className="w-5 h-5 text-primary" /> Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
                <Button onClick={handlePost} disabled={posting || !content.trim()} className="font-semibold">
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-1.5" />Post</>}
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Feed */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No situations posted yet. Be the first to report from your area.
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {posts.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="border-border overflow-hidden">
                    {/* Header */}
                    <div className="p-4 flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.author?.avatar_url || undefined} />
                        <AvatarFallback>{initials(post.author?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{post.author?.full_name || "Anonymous"}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                          {post.location && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {user?.id === post.author_id && (
                        <button
                          onClick={() => deletePost(post.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-3">
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>

                    {/* Image */}
                    {post.image_url && (
                      <div className="bg-secondary">
                        <img src={post.image_url} alt="Post" className="w-full max-h-[500px] object-cover" />
                      </div>
                    )}

                    {/* Stats */}
                    {(post.likes_count > 0 || post.comments_count > 0) && (
                      <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border">
                        <span>{post.likes_count > 0 && `${post.likes_count} ${post.likes_count === 1 ? "like" : "likes"}`}</span>
                        <span>{post.comments_count > 0 && `${post.comments_count} ${post.comments_count === 1 ? "comment" : "comments"}`}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-2 py-1 flex items-center border-t border-border">
                      <button
                        onClick={() => toggleLike(post)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium ${post.liked_by_me ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <Heart className={`w-5 h-5 ${post.liked_by_me ? "fill-current" : ""}`} />
                        Like
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-secondary transition-colors text-sm font-medium text-muted-foreground"
                      >
                        <MessageCircle className="w-5 h-5" /> Comment
                      </button>
                    </div>

                    {/* Comments */}
                    {openComments[post.id] && (
                      <div className="border-t border-border bg-secondary/30 p-4 space-y-3">
                        {(commentsByPost[post.id] || []).map((c) => (
                          <div key={c.id} className="flex gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={c.author?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{initials(c.author?.full_name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-background rounded-2xl px-3 py-2 inline-block max-w-full">
                                <p className="text-xs font-semibold">{c.author?.full_name || "Anonymous"}</p>
                                <p className="text-sm whitespace-pre-wrap">{c.content}</p>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 ml-3">
                                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {user ? (
                          <div className="flex gap-2 pt-1">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(user.email)}</AvatarFallback></Avatar>
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={commentInput[post.id] || ""}
                                onChange={(e) => setCommentInput((p) => ({ ...p, [post.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(post.id); } }}
                                placeholder="Write a comment..."
                                className="rounded-full bg-background h-9"
                                maxLength={500}
                              />
                              <Button size="sm" onClick={() => submitComment(post.id)} disabled={!commentInput[post.id]?.trim()}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center">
                            <button onClick={() => navigate("/auth?redirect=/situation-room")} className="text-primary underline">Sign in</button> to comment.
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
};

export default SituationFeed;
