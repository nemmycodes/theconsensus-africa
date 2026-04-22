import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Image as ImageIcon, Send, Trash2, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Profile = { user_id: string; full_name: string | null; avatar_url: string | null };
type Post = {
  id: string;
  author_id: string;
  content: string;
  image_url: string | null;
  category: string;
  created_at: string;
  profile?: Profile;
  likes: number;
  liked_by_me: boolean;
  comments_count: number;
};
type Comment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profile?: Profile;
};

const CATEGORIES = ["General Discussion", "Election Updates", "Polling Unit Reports", "Help & Support"];

const initials = (name?: string | null) =>
  (name || "U").split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();

const MemberForum = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [openComments, setOpenComments] = useState<Record<string, Comment[] | undefined>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPosts = async () => {
    const { data: postsData, error } = await supabase
      .from("forum_posts")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) { toast.error("Could not load posts"); setLoading(false); return; }

    const ids = (postsData || []).map(p => p.author_id);
    const [{ data: profiles }, { data: likes }, { data: counts }] = await Promise.all([
      ids.length ? supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", ids) : Promise.resolve({ data: [] as Profile[] }),
      supabase.from("forum_likes").select("post_id, user_id"),
      supabase.from("forum_comments").select("post_id"),
    ]);

    const profMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));
    const likeMap = new Map<string, { count: number; mine: boolean }>();
    (likes || []).forEach((l: any) => {
      const e = likeMap.get(l.post_id) || { count: 0, mine: false };
      e.count++;
      if (l.user_id === user?.id) e.mine = true;
      likeMap.set(l.post_id, e);
    });
    const commentMap = new Map<string, number>();
    (counts || []).forEach((c: any) => commentMap.set(c.post_id, (commentMap.get(c.post_id) || 0) + 1));

    setPosts((postsData || []).map(p => ({
      ...p,
      profile: profMap.get(p.author_id),
      likes: likeMap.get(p.id)?.count || 0,
      liked_by_me: likeMap.get(p.id)?.mine || false,
      comments_count: commentMap.get(p.id) || 0,
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const ch = supabase
      .channel("forum-wall")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_posts" }, fetchPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_likes" }, fetchPosts)
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_comments" }, fetchPosts)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleFile = (f: File | null) => {
    if (!f) { setImageFile(null); setImagePreview(null); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const submitPost = async () => {
    if (!user) return toast.error("Sign in to post");
    if (!content.trim() && !imageFile) return toast.error("Write something or add an image");
    setPosting(true);
    try {
      let image_url: string | null = null;
      if (imageFile) {
        const path = `${user.id}/${Date.now()}-${imageFile.name}`;
        const { error: upErr } = await supabase.storage.from("forum-uploads").upload(path, imageFile);
        if (upErr) throw upErr;
        image_url = supabase.storage.from("forum-uploads").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("forum_posts").insert({
        author_id: user.id,
        content: content.trim(),
        image_url,
        category,
      });
      if (error) throw error;
      setContent(""); setImageFile(null); setImagePreview(null);
      if (fileRef.current) fileRef.current.value = "";
      toast.success("Posted to the wall");
    } catch (e: any) {
      toast.error(e.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (post: Post) => {
    if (!user) return toast.error("Sign in to like");
    if (post.liked_by_me) {
      await supabase.from("forum_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    } else {
      await supabase.from("forum_likes").insert({ post_id: post.id, user_id: user.id });
    }
  };

  const loadComments = async (postId: string) => {
    if (openComments[postId] !== undefined) {
      setOpenComments(s => ({ ...s, [postId]: undefined }));
      return;
    }
    const { data } = await supabase.from("forum_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    const ids = Array.from(new Set((data || []).map(c => c.author_id)));
    const { data: profs } = ids.length ? await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", ids) : { data: [] as any };
    const profMap = new Map((profs || []).map((p: any) => [p.user_id, p]));
    setOpenComments(s => ({ ...s, [postId]: (data || []).map(c => ({ ...c, profile: profMap.get(c.author_id) })) }));
  };

  const submitComment = async (postId: string) => {
    if (!user) return;
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;
    const { data, error } = await supabase.from("forum_comments").insert({ post_id: postId, author_id: user.id, content: text }).select().single();
    if (error) return toast.error("Comment failed");
    setCommentDrafts(s => ({ ...s, [postId]: "" }));
    const { data: prof } = await supabase.from("profiles").select("user_id, full_name, avatar_url").eq("user_id", user.id).maybeSingle();
    setOpenComments(s => ({ ...s, [postId]: [...(s[postId] || []), { ...data, profile: prof || undefined }] }));
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("forum_posts").delete().eq("id", id);
    if (error) return toast.error("Could not delete");
    toast.success("Deleted");
  };

  const deleteComment = async (postId: string, id: string) => {
    const { error } = await supabase.from("forum_comments").delete().eq("id", id);
    if (error) return toast.error("Could not delete");
    setOpenComments(s => ({ ...s, [postId]: (s[postId] || []).filter(c => c.id !== id) }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Discussion Wall</h2>
        <p className="text-sm text-gray-500">Share updates, ask questions, react and reply.</p>
      </div>

      {/* Composer */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">{initials(user?.email)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none border-gray-200 focus-visible:ring-emerald-500"
            />
            {imagePreview && (
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="max-h-48 rounded-lg border" />
                <button onClick={() => handleFile(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-emerald-600 px-2 py-1.5 rounded-lg hover:bg-emerald-50">
                  <ImageIcon className="w-4 h-4" /> Photo
                </button>
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0] || null)} />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <Button onClick={submitPost} disabled={posting} className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-1.5">
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="text-center py-10"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <MessageCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Be the first to post on the wall.</p>
        </div>
      ) : (
        posts.map(post => (
          <article key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <header className="flex items-center gap-3 p-4">
              <Avatar className="h-10 w-10">
                {post.profile?.avatar_url && <AvatarImage src={post.profile.avatar_url} />}
                <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">{initials(post.profile?.full_name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{post.profile?.full_name || "Member"}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} · <span className="text-emerald-700 font-semibold">{post.category}</span>
                </p>
              </div>
              {post.author_id === user?.id && (
                <button onClick={() => deletePost(post.id)} className="text-gray-400 hover:text-red-500 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </header>
            {post.content && <p className="px-4 pb-3 text-[15px] text-gray-800 whitespace-pre-wrap">{post.content}</p>}
            {post.image_url && (
              <img src={post.image_url} alt="" className="w-full max-h-[500px] object-cover border-y border-gray-100" />
            )}
            <div className="px-4 py-2 flex items-center justify-between text-xs text-gray-500 border-b border-gray-100">
              <span>{post.likes > 0 && `❤️ ${post.likes}`}</span>
              <span>{post.comments_count > 0 && `${post.comments_count} comment${post.comments_count > 1 ? "s" : ""}`}</span>
            </div>
            <div className="grid grid-cols-2 px-2 py-1">
              <button onClick={() => toggleLike(post)} className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 ${post.liked_by_me ? "text-red-500" : "text-gray-600"}`}>
                <Heart className={`w-4 h-4 ${post.liked_by_me ? "fill-current" : ""}`} /> Like
              </button>
              <button onClick={() => loadComments(post.id)} className="flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50">
                <MessageCircle className="w-4 h-4" /> Comment
              </button>
            </div>

            {openComments[post.id] && (
              <div className="bg-gray-50 px-4 py-3 space-y-3 border-t border-gray-100">
                {openComments[post.id]!.map(c => (
                  <div key={c.id} className="flex gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      {c.profile?.avatar_url && <AvatarImage src={c.profile.avatar_url} />}
                      <AvatarFallback className="bg-emerald-600 text-white text-[10px] font-bold">{initials(c.profile?.full_name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white rounded-2xl px-3 py-2 inline-block max-w-full">
                        <p className="text-xs font-bold text-gray-900">{c.profile?.full_name || "Member"}</p>
                        <p className="text-sm text-gray-800 break-words">{c.content}</p>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1 ml-2 flex items-center gap-2">
                        <span>{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
                        {c.author_id === user?.id && (
                          <button onClick={() => deleteComment(post.id, c.id)} className="hover:text-red-500">Delete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2 items-center">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-emerald-600 text-white text-[10px] font-bold">{initials(user?.email)}</AvatarFallback>
                  </Avatar>
                  <Input
                    value={commentDrafts[post.id] || ""}
                    onChange={(e) => setCommentDrafts(s => ({ ...s, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && submitComment(post.id)}
                    placeholder="Write a comment…"
                    className="bg-white rounded-full text-sm h-9"
                  />
                </div>
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
};

export default MemberForum;
