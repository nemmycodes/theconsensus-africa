import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Clock, FileText, CheckCircle, MoreHorizontal, Plus, Search, Eye, Edit, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface Submission {
  id: string;
  title: string;
  category: string;
  status: string;
  content: string;
  created_at: string;
  attachment_url?: string | null;
}

const AgentSubmissions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchSubmissions = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("situation_updates")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      setSubmissions(data || []);
      setLoading(false);
    };
    fetchSubmissions();

    const channel = supabase
      .channel("agent-submissions")
      .on("postgres_changes", { event: "*", schema: "public", table: "situation_updates" }, () => fetchSubmissions())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  const total = submissions.length;
  const accepted = submissions.filter(s => s.status === "Resolved").length;
  const pending = submissions.filter(s => s.status === "Active" || s.status === "Critical").length;

  const filtered = submissions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap: Record<string, { label: string; color: string }> = {
    Active: { label: "VERIFICATION PENDING", color: "text-amber-400" },
    Resolved: { label: "ACCEPTED", color: "text-emerald-400" },
    Critical: { label: "REJECTED", color: "text-red-400" },
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold tracking-widest text-emerald-600 uppercase">Election Phase: Collation</p>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d1f15] text-white text-sm">
          <Clock className="w-4 h-4" />
          {dateStr} · {timeStr}
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Submission</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage your polling unit collation reports.</p>
        </div>
        <Button
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2"
          onClick={() => navigate("/election-form")}
        >
          <Plus className="w-4 h-4" /> New Submission
        </Button>
      </div>

      <div className="h-px bg-gray-200 mb-6" />

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0d1f15] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Total Submissions</p>
            <FileText className="w-5 h-5 text-gray-500" />
          </div>
          <p className="text-4xl font-black">{total}</p>
        </div>
        <div className="bg-[#0d1f15] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Accepted</p>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-4xl font-black">{accepted}</p>
        </div>
        <div className="bg-[#0d1f15] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Pending Verification</p>
            <MoreHorizontal className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-4xl font-black">{pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by PU Name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-[#0d1f15] border-none text-white placeholder:text-gray-500"
          />
        </div>
        <select className="h-12 px-4 rounded-lg bg-[#0d1f15] text-white text-sm border-none">
          <option>All LGAs</option>
        </select>
        <select className="h-12 px-4 rounded-lg bg-[#0d1f15] text-white text-sm border-none">
          <option>All Wards</option>
        </select>
        <Button variant="outline" className="h-12 gap-2 border-gray-300 text-gray-600">
          <Clock className="w-4 h-4" /> Select Date Range
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#0d1f15] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">No submissions found. Create your first collation report.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-white/5">
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Report</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((sub) => {
                const date = new Date(sub.created_at);
                const st = statusMap[sub.status] || { label: sub.status, color: "text-gray-400" };
                return (
                  <tr key={sub.id} className="text-white text-sm hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                      <p className="text-xs text-gray-400">{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{sub.title}</p>
                      {sub.attachment_url && (
                        <a href={sub.attachment_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 mt-1">
                          <FileText className="w-3 h-3" /> Attachment
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{sub.category}</td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-xs ${st.color} flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sub.status === "Active" ? (
                        <button className="text-emerald-400 hover:text-emerald-300"><Edit className="w-4 h-4" /></button>
                      ) : sub.status === "Critical" ? (
                        <button className="text-gray-400 hover:text-white"><Info className="w-4 h-4" /></button>
                      ) : (
                        <button className="text-gray-400 hover:text-white"><Eye className="w-4 h-4" /></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-bold text-emerald-600">1-{filtered.length}</span> of {total}
          </p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg bg-emerald-600 text-white text-sm font-bold">1</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSubmissions;
