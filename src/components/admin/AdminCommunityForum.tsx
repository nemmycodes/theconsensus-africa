import AdminHeader from "./AdminHeader";
import { useState } from "react";
import { MessageSquare, Users, TrendingUp, AlertCircle, Eye, ThumbsUp, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const forumCategories = [
  { name: "Election Updates", threads: 245, posts: 1847, lastActivity: "2 mins ago", icon: "📢", iconBg: "bg-emerald-50" },
  { name: "Polling Unit Reports", threads: 189, posts: 1256, lastActivity: "5 mins ago", icon: "📋", iconBg: "bg-blue-50" },
  { name: "General Discussion", threads: 523, posts: 4782, lastActivity: "1 min ago", icon: "💬", iconBg: "bg-purple-50" },
  { name: "Help & Support", threads: 87, posts: 423, lastActivity: "1 hour ago", icon: "❓", iconBg: "bg-amber-50" },
];

const threads = [
  { title: "Results Upload Issues at Ward 12 - Jos North", author: "Emmanuel Dung", initials: "E", color: "bg-emerald-700", category: "Polling Unit Reports", date: "2026-03-04 14:30", replies: 24, views: 342, likes: 18, status: "active", pinned: true },
  { title: "Best Practices for Voter Engagement in Rural Areas", author: "Grace Nanbol", initials: "G", color: "bg-emerald-700", category: "General Discussion", date: "2026-03-04 13:15", replies: 47, views: 856, likes: 63, status: "active", pinned: true },
  { title: "Election Day Protocol Clarifications", author: "Michael Pwajok", initials: "M", color: "bg-gray-700", category: "Election Updates", date: "2026-03-04 11:45", replies: 89, views: 1247, likes: 124, status: "active", pinned: false },
  { title: "Technical Issues with Mobile App Login", author: "Ruth Gyang", initials: "R", color: "bg-rose-700", category: "Help & Support", date: "2026-03-04 10:20", replies: 12, views: 234, likes: 8, status: "active", pinned: false },
  { title: "Collation Center Security Measures - Discussion", author: "John Choji", initials: "J", color: "bg-blue-700", category: "Election Updates", date: "2026-03-04 09:00", replies: 34, views: 567, likes: 42, status: "active", pinned: false },
  { title: "Volunteer Coordination for Plateau Central", author: "Sarah Laraba", initials: "S", color: "bg-emerald-700", category: "General Discussion", date: "2026-03-04 08:30", replies: 56, views: 923, likes: 71, status: "active", pinned: false },
  { title: "Reporting Suspicious Activities - Guidelines", author: "David Gyang", initials: "D", color: "bg-amber-700", category: "Election Updates", date: "2026-03-04 07:15", replies: 18, views: 445, likes: 29, status: "flagged", pinned: false },
];

const AdminCommunityForum = () => {
  return (
    <div>
      <AdminHeader
        title="Community Forum"
        subtitle="Moderate discussions and manage forum categories"
        liveBadge={{ label: "ACTIVE DISCUSSIONS", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL THREADS", value: "8", icon: MessageSquare, change: "+12%", bg: "bg-blue-50", color: "text-blue-600" },
          { label: "ACTIVE MEMBERS", value: "2,847", icon: Users, change: "+8%", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "ACTIVE DISCUSSIONS", value: "7", icon: TrendingUp, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "FLAGGED CONTENT", value: "1", icon: AlertCircle, bg: "bg-red-50", color: "text-red-500" },
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

      {/* Forum Categories */}
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Forum Categories</h3>
      <div className="grid grid-cols-4 gap-4 mb-8">
        {forumCategories.map((cat) => (
          <div key={cat.name} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center text-lg mb-3`}>{cat.icon}</div>
            <h4 className="text-sm font-bold text-gray-900">{cat.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{cat.threads > 100 ? `${cat.threads}threads  ${cat.posts}posts` : `${cat.threads}threads  ${cat.posts}posts`}</p>
            <p className="text-[10px] text-gray-400 mt-1">Last activity: {cat.lastActivity}</p>
          </div>
        ))}
      </div>

      {/* Recent Discussions */}
      <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-3">Recent Discussions</h3>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {["Thread", "Author", "Replies", "Views", "Likes", "Status", "Last Activity"].map((h) => (
                <th key={h} className="text-left p-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {threads.map((thread, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 max-w-[200px]">
                  <div className="flex items-start gap-1">
                    {thread.pinned && <span className="text-amber-500 text-xs mt-0.5">📌</span>}
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2">{thread.title}</p>
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded mt-1">{thread.category}</span>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full ${thread.color} text-white flex items-center justify-center text-xs font-bold`}>{thread.initials}</div>
                    <span className="text-xs text-gray-700">{thread.author}</span>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-600 flex items-center gap-1"><MessageCircle className="w-3 h-3 text-gray-400" />{thread.replies}</td>
                <td className="p-3 text-sm text-gray-600 flex items-center gap-1"><Eye className="w-3 h-3 text-gray-400" />{thread.views}</td>
                <td className="p-3 text-sm text-gray-600 flex items-center gap-1"><ThumbsUp className="w-3 h-3 text-gray-400" />{thread.likes}</td>
                <td className="p-3">
                  <span className={`flex items-center gap-1 text-xs font-medium ${thread.status === "active" ? "text-emerald-600" : "text-red-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${thread.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />
                    {thread.status}
                  </span>
                </td>
                <td className="p-3 text-xs text-gray-500">{i < 2 ? `${i * 3 + 2} mins ago` : `${(i - 1) * 12} mins ago`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-200">
          <p className="text-sm text-gray-500">Showing {threads.length} of {threads.length} threads</p>
        </div>
      </div>
    </div>
  );
};

export default AdminCommunityForum;
