import { useEffect, useState } from "react";
import AdminHeader from "./AdminHeader";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Download, FileText, Users, Paperclip, Loader2 } from "lucide-react";

interface Contributor {
  id: string;
  full_name: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  gender: string | null;
  age_range: string | null;
  lga: string | null;
  ward: string | null;
  current_location: string | null;
  occupation: string | null;
  organisation: string | null;
  qualification: string | null;
  areas_of_interest: string[];
  about: string | null;
  contribution: string | null;
  engagement_areas: string[];
  declaration: boolean;
  document_urls: string[];
  created_at: string;
}

const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

const AdminManifestoContributions = () => {
  const [rows, setRows] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("manifesto_contributors")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setRows((data as Contributor[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const openFile = async (path: string) => {
    setDownloading(path);
    // stored value may be a full URL or a storage path
    const clean = path.includes("/manifesto-docs/") ? path.split("/manifesto-docs/")[1] : path;
    const { data, error } = await supabase.storage
      .from("manifesto-docs")
      .createSignedUrl(clean, 120, { download: true });
    setDownloading(null);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const exportCsv = () => {
    if (!rows.length) return toast.error("Nothing to export");
    const headers = [
      "Submitted", "Full Name", "Email", "Phone", "WhatsApp", "Gender", "Age Range",
      "LGA", "Ward", "Location", "Occupation", "Organisation", "Qualification",
      "Areas of Interest", "Engagement Areas", "About", "Contribution", "Declaration", "Documents",
    ];
    const lines = rows.map((r) => [
      new Date(r.created_at).toISOString(), r.full_name, r.email, r.phone, r.whatsapp, r.gender,
      r.age_range, r.lga, r.ward, r.current_location, r.occupation, r.organisation, r.qualification,
      (r.areas_of_interest ?? []).join("; "), (r.engagement_areas ?? []).join("; "),
      r.about, r.contribution, r.declaration ? "Yes" : "No", (r.document_urls ?? []).join(" | "),
    ].map(csvEscape).join(","));
    const blob = new Blob([[headers.map(csvEscape).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `manifesto-contributions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = rows.filter((r) =>
    [r.full_name, r.email, r.phone, r.lga, r.occupation].join(" ").toLowerCase().includes(query.toLowerCase())
  );
  const totalDocs = rows.reduce((s, r) => s + (r.document_urls?.length ?? 0), 0);

  return (
    <div>
      <AdminHeader title="Manifesto Contributions" subtitle="Review CBT manifesto submissions and download attached documents" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Submissions", value: rows.length, icon: Users },
          { label: "Attached Documents", value: totalDocs, icon: Paperclip },
          { label: "With Documents", value: rows.filter((r) => (r.document_urls?.length ?? 0) > 0).length, icon: FileText },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
              <s.icon className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, phone, LGA..."
            className="pl-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <Button onClick={exportCsv} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 text-sm">Loading submissions…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No contributions found</h3>
          <p className="text-sm text-gray-500">Submissions from the manifesto contribution form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                className="w-full text-left p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50"
              >
                <div>
                  <p className="font-bold text-gray-900">{r.full_name}</p>
                  <p className="text-xs text-gray-500">
                    {r.email} · {r.phone} {r.lga ? `· ${r.lga}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {(r.document_urls?.length ?? 0)} file{(r.document_urls?.length ?? 0) === 1 ? "" : "s"}
                  </span>
                  <span className="text-[11px] text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </button>

              {expanded === r.id && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    {[
                      ["WhatsApp", r.whatsapp], ["Gender", r.gender], ["Age Range", r.age_range],
                      ["Ward", r.ward], ["Location", r.current_location], ["Occupation", r.occupation],
                      ["Organisation", r.organisation], ["Qualification", r.qualification],
                      ["Areas of Interest", (r.areas_of_interest ?? []).join(", ")],
                      ["Engagement Areas", (r.engagement_areas ?? []).join(", ")],
                    ].map(([label, value]) => (
                      <div key={label as string}>
                        <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">{label}</p>
                        <p className="text-gray-800">{(value as string) || "—"}</p>
                      </div>
                    ))}
                  </div>

                  {r.about && (
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">About</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{r.about}</p>
                    </div>
                  )}
                  {r.contribution && (
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">Contribution</p>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{r.contribution}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider mb-2">Uploaded Documents</p>
                    {(r.document_urls?.length ?? 0) === 0 ? (
                      <p className="text-sm text-gray-500">No documents attached.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {r.document_urls.map((p) => (
                          <Button
                            key={p}
                            size="sm"
                            variant="outline"
                            disabled={downloading === p}
                            onClick={() => openFile(p)}
                            className="gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 max-w-full"
                          >
                            {downloading === p ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            <span className="truncate">{decodeURIComponent(p.split("/").pop() ?? "document")}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminManifestoContributions;
