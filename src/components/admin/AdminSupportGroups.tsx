import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Users2, Search, FileSpreadsheet, FileText, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface SupportGroupRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  lga: string;
  ward: string | null;
  support_group_name: string | null;
  support_group_objectives: string | null;
  support_group_active_members: number | null;
  motivation: string | null;
  availability_areas: string[] | null;
  skills: string[] | null;
  declaration_signature: string | null;
  declaration_date: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
}

const AdminSupportGroups = () => {
  const [rows, setRows] = useState<SupportGroupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("volunteer_registrations")
      .select("*")
      .not("support_group_name", "is", null)
      .neq("support_group_name", "")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(`Failed to load support groups: ${error.message}`);
    } else {
      setRows((data ?? []) as SupportGroupRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.support_group_name, r.full_name, r.email, r.phone, r.lga, r.ward]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [rows, search]);

  const totalMembers = rows.reduce((sum, r) => sum + (r.support_group_active_members ?? 0), 0);

  const exportRows = () =>
    filtered.map((r) => ({
      "Support Group": r.support_group_name ?? "",
      "Objectives": r.support_group_objectives ?? "",
      "Active Members": r.support_group_active_members ?? "",
      "Coordinator": r.full_name,
      "Email": r.email,
      "Phone": r.phone,
      "LGA": r.lga,
      "Ward": r.ward ?? "",
      "Motivation": r.motivation ?? "",
      "Focus Areas": (r.availability_areas ?? []).join("; "),
      "Skills": (r.skills ?? []).join("; "),
      "Signature": r.declaration_signature ?? "",
      "Declaration Date": r.declaration_date ?? "",
      "Status": r.status,
      "Registered": new Date(r.created_at).toLocaleString(),
    }));

  const stamp = () => new Date().toISOString().slice(0, 10);

  const handleExcel = () => {
    if (!filtered.length) return toast.info("No records to export");
    const ws = XLSX.utils.json_to_sheet(exportRows());
    ws["!cols"] = Array.from({ length: 15 }, () => ({ wch: 24 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Support Groups");
    XLSX.writeFile(wb, `support-groups-${stamp()}.xlsx`);
    toast.success(`Exported ${filtered.length} record(s) to Excel`);
  };

  const handlePdf = () => {
    if (!filtered.length) return toast.info("No records to export");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text("Support Group Registrations", 40, 40);
    doc.setFontSize(10);
    doc.text(`Generated ${new Date().toLocaleString()} — ${filtered.length} record(s)`, 40, 58);
    autoTable(doc, {
      startY: 75,
      head: [["Support Group", "Members", "Coordinator", "Phone", "Email", "LGA", "Ward", "Objectives", "Registered"]],
      body: filtered.map((r) => [
        r.support_group_name ?? "",
        r.support_group_active_members ?? "-",
        r.full_name,
        r.phone,
        r.email,
        r.lga,
        r.ward ?? "",
        (r.support_group_objectives ?? "").slice(0, 160),
        new Date(r.created_at).toLocaleDateString(),
      ]),
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [16, 122, 87], textColor: 255 },
      columnStyles: { 7: { cellWidth: 200 } },
    });
    doc.save(`support-groups-${stamp()}.pdf`);
    toast.success(`Exported ${filtered.length} record(s) to PDF`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
            <Users2 className="w-7 h-7 text-emerald-600" />
            Support Groups
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            All support group registrations submitted publicly or from member dashboards.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <button
            onClick={handleExcel}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel (XLSX)
          </button>
          <button
            onClick={handlePdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold"
          >
            <FileText className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Groups", value: rows.length },
          { label: "Declared Active Members", value: totalMembers },
          { label: "With Objectives", value: rows.filter((r) => !!r.support_group_objectives).length },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-black text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by group, coordinator, phone, LGA…"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          No support group registrations yet.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const open = expanded === r.id;
            return (
              <div key={r.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpanded(open ? null : r.id)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-muted/40"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{r.support_group_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {r.full_name} · {r.lga}{r.ward ? ` / ${r.ward}` : ""} ·{" "}
                      {r.support_group_active_members ?? 0} member(s)
                    </p>
                  </div>
                  {open ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                </button>
                {open && (
                  <div className="px-5 pb-5 pt-1 border-t border-border grid md:grid-cols-2 gap-4 text-sm">
                    <Detail label="Coordinator" value={r.full_name} />
                    <Detail label="Phone" value={r.phone} />
                    <Detail label="Email" value={r.email} />
                    <Detail label="LGA / Ward" value={`${r.lga}${r.ward ? ` / ${r.ward}` : ""}`} />
                    <Detail label="Active Members" value={String(r.support_group_active_members ?? "—")} />
                    <Detail label="Status" value={r.status} />
                    <Detail label="Objectives" value={r.support_group_objectives ?? "—"} full />
                    <Detail label="Motivation" value={r.motivation ?? "—"} full />
                    <Detail label="Focus Areas" value={(r.availability_areas ?? []).join(", ") || "—"} full />
                    <Detail label="Skills" value={(r.skills ?? []).join(", ") || "—"} full />
                    <Detail label="Signature" value={r.declaration_signature ?? "—"} />
                    <Detail label="Registered" value={new Date(r.created_at).toLocaleString()} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value, full }: { label: string; value: string; full?: boolean }) => (
  <div className={full ? "md:col-span-2" : ""}>
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-foreground whitespace-pre-wrap break-words">{value}</p>
  </div>
);

export default AdminSupportGroups;
