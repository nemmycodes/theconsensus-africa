import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Download, Database, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const tables = [
  { id: "profiles", label: "User Profiles", icon: "👤" },
  { id: "user_roles", label: "User Roles", icon: "🛡️" },
  { id: "blog_posts", label: "Blog Posts", icon: "📝" },
  { id: "situation_updates", label: "Situation Updates", icon: "📡" },
  { id: "agent_locations", label: "Agent Locations", icon: "📍" },
  { id: "events", label: "Events", icon: "📅" },
] as const;

type TableId = typeof tables[number]["id"];

const AdminData = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const exportTable = async (tableId: TableId, label: string) => {
    setExporting(tableId);
    try {
      const { data, error } = await supabase.from(tableId).select("*");
      if (error) throw error;
      if (!data || data.length === 0) {
        toast({ title: "No Data", description: `${label} has no records to export.` });
        setExporting(null);
        return;
      }

      const headers = Object.keys(data[0]).join(",") + "\n";
      const rows = data.map((row) =>
        Object.values(row).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      ).join("\n");

      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tableId}_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Exported", description: `${data.length} records from ${label}.` });
    } catch (err: any) {
      toast({ title: "Export Failed", description: err.message, variant: "destructive" });
    }
    setExporting(null);
  };

  const exportAll = async () => {
    for (const table of tables) {
      await exportTable(table.id, table.label);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">Data Collection & Exports</h1>
          <p className="text-muted-foreground text-sm mt-1">Export platform data as CSV files.</p>
        </div>
        <Button onClick={exportAll} className="gap-2">
          <FileSpreadsheet className="w-4 h-4" /> Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{table.icon}</span>
              <div>
                <h3 className="font-bold text-sm">{table.label}</h3>
                <p className="text-xs text-muted-foreground">Table: {table.id}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full"
              disabled={exporting === table.id}
              onClick={() => exportTable(table.id, table.label)}
            >
              {exporting === table.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export CSV
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminData;
