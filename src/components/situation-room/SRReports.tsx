import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye } from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  content: string;
  location: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string;
}

const SRReports = () => {
  const [rows, setRows] = useState<Report[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    supabase
      .from("situation_posts")
      .select("id, content, location, image_url, created_at, author_id")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => setRows((data as Report[]) || []));
  }, []);

  const filtered = rows.filter(
    (r) => !search || `${r.content} ${r.location ?? ""}`.toLowerCase().includes(search.toLowerCase())
  );

  const categoryFor = (text: string) => {
    const t = text.toLowerCase();
    if (/(violence|attack|security|gun|weapon)/.test(t)) return { label: "Security", cls: "bg-orange-100 text-orange-600" };
    if (/(ballot|vote|polling|inec|result)/.test(t)) return { label: "Electoral", cls: "bg-primary/10 text-primary" };
    if (/(card reader|tech|system|app)/.test(t)) return { label: "Technical", cls: "bg-blue-100 text-blue-600" };
    return { label: "Logistics", cls: "bg-purple-100 text-purple-600" };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase">Intelligence Reports</h2>
          <p className="text-muted-foreground text-sm mt-1 max-w-xl">
            Verified civic and security reports submitted by agents from across the region.
            Track, verify, and act on incoming data.
          </p>
        </div>
        <Button className="gap-2"><Plus className="h-4 w-4" /> New Report</Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports by title, keywords or ID…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Report</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Location</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground">No reports yet.</td></tr>
              )}
              {filtered.map((r, i) => {
                const cat = categoryFor(r.content);
                const idShort = `#REP-${new Date(r.created_at).getFullYear()}-${String(i + 1).padStart(3, "0")}`;
                return (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-5 py-3">
                      <p className="font-semibold line-clamp-1">{r.content.slice(0, 60) || "Field report"}</p>
                      <p className="text-xs text-muted-foreground">ID: {idShort}</p>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className={cat.cls}>{cat.label}</Badge>
                    </td>
                    <td className="px-5 py-3">{r.location || "—"}</td>
                    <td className="px-5 py-3 text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Verified</Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button className="text-primary"><Eye className="h-4 w-4 inline" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SRReports;
