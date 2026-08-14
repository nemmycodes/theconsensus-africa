import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileJson, FileSpreadsheet, Loader2, Database } from "lucide-react";
import { toast } from "sonner";

type TableName = Parameters<typeof supabase.from>[0];

interface ExportSection {
  group: string;
  items: { table: TableName; label: string; description: string }[];
}

const SECTIONS: ExportSection[] = [
  {
    group: "Members & Accounts",
    items: [
      { table: "profiles" as TableName, label: "User Profiles", description: "All registered members and their profile data" },
      { table: "user_roles" as TableName, label: "User Roles", description: "Role assignments for every user" },
    ],
  },
  {
    group: "Forms & Applications",
    items: [
      { table: "manifesto_contributors" as TableName, label: "Manifesto Contributors", description: "Contributor form submissions" },
      { table: "kef_cares_registrations" as TableName, label: "KEF-CARES Registrations", description: "All KEF-CARES applications" },
      { table: "agent_recruitment_applications" as TableName, label: "Agent Recruitment Applications", description: "Agent applications submitted" },
      { table: "pvc_surveys" as TableName, label: "Election Survey Results", description: "Submitted election survey responses" },
      { table: "volunteer_registrations" as TableName, label: "Volunteer Registrations", description: "Volunteer signups" },
      { table: "contact_messages" as TableName, label: "Contact Messages", description: "General & media contact form messages" },
    ],
  },
  {
    group: "Elections & Situation Room",
    items: [
      { table: "election_reports" as TableName, label: "Election Reports", description: "EC8-A election reports submitted by agents" },
      { table: "primaries_collation" as TableName, label: "Primaries Collation", description: "Primaries election collation data" },
      { table: "primaries_contestants" as TableName, label: "Primaries Contestants", description: "Registered primaries contestants" },
      { table: "situation_updates" as TableName, label: "Situation Updates", description: "Situation room updates" },
      { table: "situation_posts" as TableName, label: "Situation Posts", description: "Posts from the situation room feed" },
      { table: "agent_locations" as TableName, label: "Agent Locations", description: "Captured GPS locations of agents" },
    ],
  },
  {
    group: "Content & Community",
    items: [
      { table: "blog_posts" as TableName, label: "Blog Posts", description: "All published & draft blog posts" },
      { table: "events" as TableName, label: "Events", description: "All scheduled events" },
      { table: "forum_posts" as TableName, label: "Forum Posts", description: "All community forum posts" },
      { table: "forum_comments" as TableName, label: "Forum Comments", description: "Forum thread comments" },
      { table: "broadcasts" as TableName, label: "Broadcasts", description: "Broadcast/podcast records" },
    ],
  },
  {
    group: "System",
    items: [
      { table: "audit_logs" as TableName, label: "Audit Logs", description: "System-wide audit log entries" },
      { table: "feature_flags" as TableName, label: "Feature Flags", description: "Configured feature flags" },
      { table: "site_content" as TableName, label: "Site Content (CMS)", description: "JSON overrides for landing page content" },
    ],
  },
];

const toCSV = (rows: any[]): string => {
  if (!rows.length) return "";
  const headers = Array.from(
    rows.reduce<Set<string>>((set, r) => {
      Object.keys(r ?? {}).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  const escape = (val: any): string => {
    if (val === null || val === undefined) return "";
    let s = typeof val === "object" ? JSON.stringify(val) : String(val);
    if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
};

const downloadBlob = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const SuperAdminDataExport = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const fetchAll = async (table: TableName) => {
    const pageSize = 1000;
    let from = 0;
    const all: any[] = [];
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .range(from, from + pageSize - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      all.push(...data);
      if (data.length < pageSize) break;
      from += pageSize;
    }
    return all;
  };

  const handleExport = async (table: TableName, label: string, format: "csv" | "json") => {
    const key = `${table}-${format}`;
    setLoading(key);
    try {
      const rows = await fetchAll(table);
      if (!rows.length) {
        toast.info(`${label}: no records to export`);
        return;
      }
      const stamp = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        downloadBlob(toCSV(rows), `${table}-${stamp}.csv`, "text/csv;charset=utf-8");
      } else {
        downloadBlob(JSON.stringify(rows, null, 2), `${table}-${stamp}.json`, "application/json");
      }
      toast.success(`Exported ${rows.length} ${label} record(s)`);
    } catch (e: any) {
      console.error(e);
      toast.error(`Failed to export ${label}: ${e.message ?? e}`);
    } finally {
      setLoading(null);
    }
  };

  const handleExportAll = async () => {
    setLoading("__all__");
    try {
      const bundle: Record<string, any[]> = {};
      for (const section of SECTIONS) {
        for (const item of section.items) {
          try {
            bundle[item.table as string] = await fetchAll(item.table);
          } catch (e) {
            bundle[item.table as string] = [];
          }
        }
      }
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      downloadBlob(
        JSON.stringify(bundle, null, 2),
        `consensus-full-backup-${stamp}.json`,
        "application/json"
      );
      toast.success("Full data backup downloaded");
    } catch (e: any) {
      toast.error(`Backup failed: ${e.message ?? e}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
            <Database className="w-7 h-7 text-amber-500" />
            Data Export Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Download a complete dump of every form submission and section in CSV or JSON.
          </p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-bold text-sm shadow-md transition"
        >
          {loading === "__all__" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Download Full Backup (JSON)
        </button>
      </div>

      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <div key={section.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-muted/40 border-b border-border">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">{section.group}</h2>
            </div>
            <div className="divide-y divide-border">
              {section.items.map((item) => {
                const csvKey = `${item.table}-csv`;
                const jsonKey = `${item.table}-json`;
                return (
                  <div
                    key={item.table as string}
                    className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <code className="text-[10px] text-muted-foreground/70">{item.table as string}</code>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleExport(item.table, item.label, "csv")}
                        disabled={loading !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50 text-xs font-medium transition"
                      >
                        {loading === csvKey ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
                        )}
                        CSV
                      </button>
                      <button
                        onClick={() => handleExport(item.table, item.label, "json")}
                        disabled={loading !== null}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted disabled:opacity-50 text-xs font-medium transition"
                      >
                        {loading === jsonKey ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileJson className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        JSON
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuperAdminDataExport;
