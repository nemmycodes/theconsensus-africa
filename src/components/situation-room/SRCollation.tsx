import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Flag } from "lucide-react";
import { format } from "date-fns";

interface Row {
  id: string;
  candidate_name: string | null;
  party: string | null;
  lga: string;
  ward: string;
  polling_unit: string;
  votes_recorded: number;
  status: string;
  created_at: string;
}

const partyColors: Record<string, string> = {
  APC: "bg-blue-500",
  PDP: "bg-red-500",
  LP: "bg-primary",
  NNPP: "bg-purple-500",
};

const SRCollation = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [partyTotals, setPartyTotals] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase
      .from("election_reports")
      .select("id, candidate_name, party, lga, ward, polling_unit, votes_recorded, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        setRows((data as Row[]) || []);
        const totals: Record<string, number> = { APC: 0, PDP: 0, LP: 0, NNPP: 0 };
        (data || []).forEach((r) => {
          if (r.party && totals[r.party] !== undefined) totals[r.party] += r.votes_recorded || 0;
        });
        setPartyTotals(totals);
      });
  }, []);

  const filtered = rows.filter(
    (r) =>
      !search ||
      [r.candidate_name, r.party, r.lga, r.ward, r.polling_unit]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const max = Math.max(...Object.values(partyTotals), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase">Election Collation Hub</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time monitoring and data aggregation across Plateau State.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" /> Filter Zone</Button>
          <Button className="gap-2"><Download className="h-4 w-4" /> Export Report</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Polling Units, Wards, or LGA by code or name…"
          className="pl-10 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Live Vote Count</h3>
          <span className="text-xs text-primary font-semibold flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Live Updating</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(partyTotals).map(([party, total]) => (
            <Card key={party} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider">{party}</span>
                <Flag className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-black">{total.toLocaleString()}</p>
              <div className="h-1 bg-muted rounded-full mt-3 overflow-hidden">
                <div className={`h-full ${partyColors[party] || "bg-primary"}`} style={{ width: `${(total / max) * 100}%` }} />
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold">LGA Results Aggregation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Polling Unit</th>
                <th className="text-left px-5 py-3">Ward / LGA</th>
                <th className="text-left px-5 py-3">Candidate</th>
                <th className="text-left px-5 py-3">Party</th>
                <th className="text-right px-5 py-3">Votes</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No reports yet.</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{r.polling_unit}</td>
                  <td className="px-5 py-3">{r.ward} / {r.lga}</td>
                  <td className="px-5 py-3">{r.candidate_name || "—"}</td>
                  <td className="px-5 py-3">{r.party || "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold">{(r.votes_recorded || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</td>
                  <td className="px-5 py-3">
                    <Badge
                      variant="secondary"
                      className={
                        r.status === "verified" ? "bg-primary/10 text-primary" :
                        r.status === "flagged" ? "bg-destructive/10 text-destructive" :
                        "bg-orange-100 text-orange-600"
                      }
                    >
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SRCollation;
