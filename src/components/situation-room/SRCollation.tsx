import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Search, Download, Filter, X, MapPin } from "lucide-react";
import { format } from "date-fns";
import ElectionLocationFilter, { type ElectionLocationValue } from "@/components/shared/ElectionLocationFilter";

interface Row {
  id: string;
  election_type: string;
  state: string | null;
  senatorial_zone: string | null;
  lga: string;
  ward: string;
  polling_unit: string;
  party: string | null;
  votes_recorded: number;
  status: string;
  created_at: string;
  candidate_name: string | null;
}

const ELECTION_TYPES = [
  { value: "all", label: "All Election Types" },
  { value: "presidential", label: "Presidential" },
  { value: "gubernatorial", label: "Gubernatorial" },
  { value: "senate", label: "Senatorial" },
  { value: "house_of_reps", label: "House of Reps" },
  { value: "house_of_assembly", label: "House of Assembly" },
  { value: "chairman", label: "LGA Chairman" },
  { value: "councillor", label: "Councillor" },
  { value: "party_primary", label: "Party Primaries" },
];

const PARTIES = [
  "A","AA","AAC","ADC","ADP","APC","APGA","APM","APP",
  "BP","LP","NNPP","NRM","PDP","PRP","SDP","YPP","ZLP",
];

const SRCollation = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [puSearch, setPuSearch] = useState("");
  const [electionType, setElectionType] = useState("all");
  const [filter, setFilter] = useState<ElectionLocationValue>({
    state: "", senatorialZone: "", lga: "", ward: "", pu: "",
  });
  const [showFilter, setShowFilter] = useState(true);

  // Initial fetch + realtime subscription
  useEffect(() => {
    const fetchRows = async () => {
      const { data } = await supabase
        .from("election_reports")
        .select("id,election_type,state,senatorial_zone,lga,ward,polling_unit,party,votes_recorded,status,created_at,candidate_name")
        .order("created_at", { ascending: false })
        .limit(2000);
      setRows((data as Row[]) || []);
    };
    fetchRows();
    const channel = supabase
      .channel("sr-collation")
      .on("postgres_changes", { event: "*", schema: "public", table: "election_reports" }, fetchRows)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Apply cascading filters
  const scoped = useMemo(() => rows.filter(r => {
    if (electionType !== "all" && r.election_type !== electionType) return false;
    if (filter.state && r.state !== filter.state) return false;
    if (filter.senatorialZone && r.senatorial_zone !== filter.senatorialZone) return false;
    if (filter.lga && r.lga !== filter.lga) return false;
    if (filter.ward && r.ward !== filter.ward) return false;
    if (filter.pu && r.polling_unit !== filter.pu) return false;
    return true;
  }), [rows, electionType, filter]);

  // PU search (typed) further narrows
  const puScoped = useMemo(() => {
    if (!puSearch.trim()) return scoped;
    const q = puSearch.toLowerCase();
    return scoped.filter(r =>
      r.polling_unit?.toLowerCase().includes(q) ||
      r.ward?.toLowerCase().includes(q) ||
      r.lga?.toLowerCase().includes(q)
    );
  }, [scoped, puSearch]);

  // Build vertical party totals from current scope
  const partyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    PARTIES.forEach(p => { totals[p] = 0; });
    puScoped.forEach(r => {
      if (r.party && totals[r.party] !== undefined) totals[r.party] += r.votes_recorded || 0;
      else if (r.party) totals[r.party] = (totals[r.party] || 0) + (r.votes_recorded || 0);
    });
    return totals;
  }, [puScoped]);

  const grandTotal = Object.values(partyTotals).reduce((a, b) => a + b, 0);
  const leadingParty = Object.entries(partyTotals).sort((a, b) => b[1] - a[1])[0];

  // Search-by-text fallback for the result rows table at the bottom
  const tableRows = puScoped.filter(r =>
    !search ||
    [r.candidate_name, r.party, r.lga, r.ward, r.polling_unit, r.state, r.senatorial_zone]
      .filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())
  ).slice(0, 200);

  const clearFilters = () => {
    setFilter({ state: "", senatorialZone: "", lga: "", ward: "", pu: "" });
    setElectionType("all");
    setPuSearch("");
    setSearch("");
  };

  const activeFilterCount =
    (electionType !== "all" ? 1 : 0) +
    (filter.state ? 1 : 0) +
    (filter.senatorialZone ? 1 : 0) +
    (filter.lga ? 1 : 0) +
    (filter.ward ? 1 : 0) +
    (filter.pu ? 1 : 0);

  const exportCsv = () => {
    const headers = ["Party", "Votes"];
    const csvRows = [
      headers.join(","),
      ...Object.entries(partyTotals).map(([p, v]) => `${p},${v}`),
      `TOTAL,${grandTotal}`,
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `live-collation-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl md:text-4xl font-black uppercase">Election Collation Hub</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time vote aggregation. Filter by election type, state, senatorial zone, LGA, ward, or polling unit.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowFilter(s => !s)}>
            <Filter className="h-4 w-4" /> {showFilter ? "Hide" : "Show"} Filters
            {activeFilterCount > 0 && <Badge className="ml-1 h-5 px-1.5">{activeFilterCount}</Badge>}
          </Button>
          <Button className="gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* CASCADING FILTER BAR */}
      {showFilter && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider">Live Results Filter</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                <X className="h-3.5 w-3.5" /> Clear all
              </Button>
            )}
          </div>

          {/* Election type */}
          <div>
            <Label>Election Type</Label>
            <select
              value={electionType}
              onChange={(e) => setElectionType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {ELECTION_TYPES.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
            </select>
          </div>

          {/* State → Zone → LGA → Ward → PU */}
          <ElectionLocationFilter
            value={filter}
            onChange={setFilter}
            showPU
          />

          {/* PU quick search */}
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Search Polling Units</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Type to find a polling unit, ward, or LGA…"
                className="pl-10"
                value={puSearch}
                onChange={(e) => setPuSearch(e.target.value)}
              />
            </div>
          </div>
        </Card>
      )}

      {/* LIVE VOTE COUNT TABLE — vertical parties + total */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Live Vote Count
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              Scope: <strong className="text-foreground">
                {[ELECTION_TYPES.find(e => e.value === electionType)?.label,
                  filter.state, filter.senatorialZone, filter.lga, filter.ward, filter.pu]
                  .filter(Boolean).join(" · ") || "Nationwide · All elections"}
              </strong>
            </span>
            <span className="text-primary font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary" /> Live
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3 w-16">#</th>
                <th className="text-left px-5 py-3">Political Party</th>
                <th className="text-right px-5 py-3">Votes</th>
                <th className="text-right px-5 py-3 w-32">Share</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(partyTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([party, votes], i) => {
                  const pct = grandTotal > 0 ? (votes / grandTotal) * 100 : 0;
                  const isLead = leadingParty && leadingParty[0] === party && votes > 0;
                  return (
                    <tr key={party} className={`border-t border-border ${isLead ? "bg-primary/5" : ""}`}>
                      <td className="px-5 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-5 py-3 font-semibold flex items-center gap-2">
                        {party}
                        {isLead && <Badge className="bg-primary/15 text-primary border-0 text-[10px]">Leading</Badge>}
                      </td>
                      <td className="px-5 py-3 text-right font-bold tabular-nums">{votes.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-muted-foreground tabular-nums">{pct.toFixed(2)}%</td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-primary bg-primary/10 font-black">
                <td className="px-5 py-4"></td>
                <td className="px-5 py-4 uppercase tracking-wider text-sm">Total Votes</td>
                <td className="px-5 py-4 text-right tabular-nums text-lg">{grandTotal.toLocaleString()}</td>
                <td className="px-5 py-4 text-right tabular-nums">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* RAW REPORTS TABLE */}
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-bold">Submitted Reports ({puScoped.length})</h3>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rows…"
              className="pl-10 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Polling Unit</th>
                <th className="text-left px-5 py-3">Ward / LGA</th>
                <th className="text-left px-5 py-3">Zone / State</th>
                <th className="text-left px-5 py-3">Party</th>
                <th className="text-right px-5 py-3">Votes</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground">No reports match this scope yet.</td></tr>
              )}
              {tableRows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-5 py-3 font-medium">{r.polling_unit}</td>
                  <td className="px-5 py-3">{r.ward} / {r.lga}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{r.senatorial_zone || "—"} / {r.state || "—"}</td>
                  <td className="px-5 py-3 font-semibold">{r.party || "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums">{(r.votes_recorded || 0).toLocaleString()}</td>
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
