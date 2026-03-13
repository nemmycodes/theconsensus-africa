import { useState } from "react";
import { Search, MessageSquare, Eye, ThumbsUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "Election Updates", threads: 245, color: "bg-emerald-500" },
  { name: "Polling Unit Reports", threads: 189, color: "bg-emerald-400" },
  { name: "General Discussion", threads: 523, color: "bg-amber-500" },
  { name: "Help & Support", threads: 87, color: "bg-blue-500" },
];

const threads = [
  { id: 1, title: "Results Upload Issues at Ward 12 - Jos North", preview: "Hello everyone, I'm experiencing technical issues uploading results from Ward 12...", category: "Polling Unit Reports", author: "Emmanuel Dung", initials: "ED", comments: 24, views: 342, likes: 18, time: "2 mins ago", pinned: true },
  { id: 2, title: "Best Practices for Voter Engagement in Rural Areas", preview: "I've been working in rural communities across Plateau Central for the past few months...", category: "General Discussion", author: "Grace Nanbol", initials: "GN", comments: 47, views: 856, likes: 63, time: "5 mins ago", pinned: true },
  { id: 3, title: "Election Day Protocol Clarifications", preview: "With election day approaching, I want to make sure everyone is clear on the official protocols...", category: "Election Updates", author: "Michael Pwajok", initials: "MP", comments: 89, views: 1247, likes: 124, time: "12 mins ago", pinned: false },
  { id: 4, title: "Technical Issues with Mobile App Login", preview: "Is anyone else having trouble logging into the mobile app? I keep getting an error...", category: "Help & Support", author: "Ruth Gyang", initials: "RG", comments: 12, views: 234, likes: 8, time: "25 mins ago", pinned: false },
  { id: 5, title: "Collation Center Security Measures", preview: "Important security protocols for all collation center personnel to follow...", category: "Election Updates", author: "John Choji", initials: "JC", comments: 34, views: 567, likes: 42, time: "1 hour ago", pinned: false },
  { id: 6, title: "Volunteer Coordination for Plateau Central", preview: "Looking for volunteers to help with voter education programs in Plateau Central...", category: "General Discussion", author: "Sarah Laraba", initials: "SL", comments: 56, views: 923, likes: 71, time: "1 hour ago", pinned: false },
];

const getCategoryColor = (cat: string) => {
  if (cat === "Election Updates") return "bg-emerald-100 text-emerald-700";
  if (cat === "Polling Unit Reports") return "bg-emerald-50 text-emerald-600";
  if (cat === "General Discussion") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
};

const MemberForum = () => {
  const [search, setSearch] = useState("");

  const filtered = threads.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Community Forum</h2>
          <p className="text-sm text-gray-500">Connect with fellow members, share experiences, and get support</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 font-bold gap-2">+ New Thread</Button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.map(c => (
          <div key={c.name} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-3 h-3 rounded-full ${c.color} mb-2`} />
            <h4 className="font-bold text-sm text-gray-900">{c.name}</h4>
            <p className="text-xs text-gray-500">{c.threads} threads</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search threads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-white" />
      </div>

      {/* Threads */}
      <div className="space-y-2">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-emerald-200 transition-colors cursor-pointer flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{t.initials}</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                {t.pinned && <span className="text-amber-500">📌</span>}
                {t.title}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{t.preview}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(t.category)}`}>{t.category}</span>
                <span>by {t.author}</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {t.comments}</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {t.views}</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {t.likes}</span>
                <span>{t.time}</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberForum;
