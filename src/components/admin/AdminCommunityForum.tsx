import AdminHeader from "./AdminHeader";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Users, TrendingUp, AlertCircle, Eye, ThumbsUp, MessageCircle, Pin, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

interface ForumPost {
  id: string;
  content: string;
  category: string;
  pinned: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author_id: string;
  author_name?: string;
  comment_count?: number;
  like_count?: number;
}

const colorPool = ["bg-emerald-700", "bg-blue-700", "bg-rose-700", "bg-amber-700", "bg-purple-700", "bg-gray-700"];
const initialsOf = (name?: string) => (name?.trim()?.[0] || "?").toUpperCase();

const AdminCommunityForum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeMembers, setActiveMembers] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    const { data: postsData, error } = await supabase
      .from("forum_posts")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load forum posts");
      setLoading(false);
      return;
    }

    const rows = postsData || [];
    const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
    const postIds = rows.map((r) => r.id);

    const [{ data: profiles }, { data: comments }, { data: likes }] = await Promise.all([
      supabase.from("profiles").select("user_id, full_name").in("user_id", authorIds.length ? authorIds : ["00000000-0000-0000-0000-000000000000"]),
      supabase.from("forum_comments").select("post_id").in("post_id", postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]),
      supabase.from("forum_likes").select("post_id").in("post_id", postIds.length ? postIds : ["00000000-0000-0000-0000-000000000000"]),
    ]);

    const nameMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));
    const cMap = new Map<string, number>();
    (comments || []).forEach((c) => cMap.set(c.post_id, (cMap.get(c.post_id) || 0) + 1));
    const lMap = new Map<string, number>();
    (likes || []).forEach((l) => lMap.set(l.post_id, (lMap.get(l.post_id) || 0) + 1));

    setPosts(
      rows.map((r) => ({
        ...r,
        author_name: nameMap.get(r.author_id) || "Member",
        comment_count: cMap.get(r.id) || 0,
        like_count: lMap.get(r.id) || 0,
      }))
    );
    setActiveMembers(authorIds.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    const channel = supabase
      .channel("admin-forum")
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_posts" }, () => fetchPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_comments" }, () => fetchPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "forum_likes" }, () => fetchPosts())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const togglePin = async (post: ForumPost) => {
    const { error } = await supabase.from("forum_posts").update({ pinned: !post.pinned }).eq("id", post.id);
    if (error) toast.error("Failed to update post");
    else toast.success(post.pinned ? "Unpinned" : "Pinned to top");
  };

  const deletePost = async (post: ForumPost) => {
    if (!confirm("Delete this post permanently? Comments and likes will also be removed.")) return;
    await supabase.from("forum_comments").delete().eq("post_id", post.id);
    await supabase.from("forum_likes").delete().eq("post_id", post.id);
    const { error } = await supabase.from("forum_posts").delete().eq("id", post.id);
    if (error) toast.error("Failed to delete post");
    else toast.success("Post deleted");
  };

  const filtered = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(search.toLowerCase()) ||
      p.author_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categoryCounts: Record<string, number> = {};
  posts.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });
  const categoryList = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));

  const totalThreads = posts.length;
  const totalReplies = posts.reduce((s, p) => s + (p.comment_count || 0), 0);
  const pinnedCount = posts.filter((p) => p.pinned).length;

  return (
    <div>
      <AdminHeader
        title="Community Forum"
        subtitle="Moderate live discussions across the platform"
        liveBadge={{ label: `${totalThreads} POSTS`, color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL POSTS", value: totalThreads.toString(), icon: MessageSquare, bg: "bg-blue-50", color: "text-blue-600" },
          { label: "ACTIVE AUTHORS", value: activeMembers.toString(), icon: Users, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "TOTAL REPLIES", value: totalReplies.toString(), icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "PINNED", value: pinnedCount.toString(), icon: Pin, bg: "bg-amber-50", color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      {categoryList.length > 0 && (
        <>
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Active Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categoryList.map((cat) => (
              <div key={cat.name} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg mb-3">💬</div>
                <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{cat.count} {cat.count === 1 ? "post" : "posts"}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts, authors, or categories…"
          className="border-0 focus-visible:ring-0 p-0 h-auto text-sm"
        />
      </div>

      {/* Discussions table */}
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">All Discussions</h3>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-4">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-900 mb-1">No discussions yet</h4>
            <p className="text-sm text-gray-500">
              {search ? "No posts match your search." : "Posts created on the Discuss page will appear here for moderation."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Post", "Author", "Replies", "Likes", "Posted", "Actions"].map((h) => (
                    <th key={h} className="text-left p-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((post, i) => (
                  <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                    <td className="p-3 max-w-[360px]">
                      <div className="flex items-start gap-2">
                        {post.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 mt-1 shrink-0" />}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{post.content}</p>
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded mt-1">{post.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full ${colorPool[i % colorPool.length]} text-white flex items-center justify-center text-xs font-bold`}>
                          {initialsOf(post.author_name)}
                        </div>
                        <span className="text-xs text-gray-700 truncate max-w-[120px]">{post.author_name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3 text-gray-400" />{post.comment_count}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-gray-400" />{post.like_count}</span>
                    </td>
                    <td className="p-3 text-xs text-gray-500" title={format(new Date(post.created_at), "PPpp")}>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePin(post)}
                          className="h-8 px-2"
                          title={post.pinned ? "Unpin" : "Pin to top"}
                        >
                          <Pin className={`w-3.5 h-3.5 ${post.pinned ? "text-amber-500 fill-amber-500" : "text-gray-400"}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePost(post)}
                          className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete post"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-500">Showing {filtered.length} of {posts.length} {posts.length === 1 ? "post" : "posts"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommunityForum;
