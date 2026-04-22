import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Globe, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const REQUIRED_A = "185.158.133.1";
const REQUIRED_TXT_PREFIX = "lovable_verify=";

type CheckStatus = "idle" | "checking" | "ok" | "fail" | "partial";

interface RecordCheck {
  label: string;
  type: "A" | "TXT";
  host: string;
  expected: string;
  found: string[];
  status: CheckStatus;
  resolver: string;
}

const cleanDomain = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");

async function dohQuery(name: string, type: "A" | "TXT"): Promise<{ values: string[]; resolver: string }> {
  // Try Google first, fall back to Cloudflare
  const endpoints = [
    { url: `https://dns.google/resolve?name=${name}&type=${type}`, name: "Google" },
    { url: `https://cloudflare-dns.com/dns-query?name=${name}&type=${type}`, name: "Cloudflare" },
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, { headers: { Accept: "application/dns-json" } });
      if (!res.ok) continue;
      const json = await res.json();
      const answers = (json.Answer || []) as Array<{ data: string; type: number }>;
      const wantedType = type === "A" ? 1 : 16;
      const values = answers
        .filter((a) => a.type === wantedType)
        .map((a) => (type === "TXT" ? a.data.replace(/(^"|"$)/g, "").replace(/""/g, "") : a.data));
      return { values, resolver: ep.name };
    } catch {
      continue;
    }
  }
  return { values: [], resolver: "unreachable" };
}

const DomainCheck = () => {
  const [domain, setDomain] = useState("");
  const [running, setRunning] = useState(false);
  const [checks, setChecks] = useState<RecordCheck[]>([]);
  const [completedAt, setCompletedAt] = useState<Date | null>(null);

  const runChecks = async () => {
    const root = cleanDomain(domain);
    if (!root || !root.includes(".")) {
      toast.error("Enter a valid domain (e.g. example.com)");
      return;
    }

    setRunning(true);
    setChecks([
      { label: "Root A record", type: "A", host: root, expected: REQUIRED_A, found: [], status: "checking", resolver: "" },
      { label: "WWW A record", type: "A", host: `www.${root}`, expected: REQUIRED_A, found: [], status: "checking", resolver: "" },
      { label: "TXT verification", type: "TXT", host: `_lovable.${root}`, expected: `${REQUIRED_TXT_PREFIX}…`, found: [], status: "checking", resolver: "" },
    ]);

    const [rootA, wwwA, txt] = await Promise.all([
      dohQuery(root, "A"),
      dohQuery(`www.${root}`, "A"),
      dohQuery(`_lovable.${root}`, "TXT"),
    ]);

    const next: RecordCheck[] = [
      {
        label: "Root A record",
        type: "A",
        host: root,
        expected: REQUIRED_A,
        found: rootA.values,
        resolver: rootA.resolver,
        status: rootA.values.includes(REQUIRED_A)
          ? rootA.values.length === 1 ? "ok" : "partial"
          : "fail",
      },
      {
        label: "WWW A record",
        type: "A",
        host: `www.${root}`,
        expected: REQUIRED_A,
        found: wwwA.values,
        resolver: wwwA.resolver,
        status: wwwA.values.includes(REQUIRED_A)
          ? wwwA.values.length === 1 ? "ok" : "partial"
          : "fail",
      },
      {
        label: "TXT verification",
        type: "TXT",
        host: `_lovable.${root}`,
        expected: `${REQUIRED_TXT_PREFIX}…`,
        found: txt.values,
        resolver: txt.resolver,
        status: txt.values.some((v) => v.startsWith(REQUIRED_TXT_PREFIX)) ? "ok" : "fail",
      },
    ];

    setChecks(next);
    setCompletedAt(new Date());
    setRunning(false);
  };

  const allOk = checks.length > 0 && checks.every((c) => c.status === "ok");
  const anyFail = checks.some((c) => c.status === "fail");
  const anyPartial = checks.some((c) => c.status === "partial");

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const StatusIcon = ({ status }: { status: CheckStatus }) => {
    if (status === "checking") return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    if (status === "ok") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "partial") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
    if (status === "fail") return <XCircle className="h-5 w-5 text-destructive" />;
    return null;
  };

  useEffect(() => {
    document.title = "Domain Verification — The Plateau Consensus";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute("content", "Check your custom domain DNS records (A, www, TXT) and verify propagation status.");
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-4xl py-12 px-4">
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-4">
            <ShieldCheck className="h-3 w-3 mr-1" /> DNS Diagnostics
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Domain Verification</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Check whether your domain's DNS records are pointing to our servers and whether
            propagation has completed worldwide.
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" /> Enter your domain
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !running && runChecks()}
                className="flex-1"
              />
              <Button onClick={runChecks} disabled={running} className="sm:w-44">
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking…
                  </>
                ) : (
                  "Run DNS Check"
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Queries run via Google &amp; Cloudflare public DNS. We never store your domain.
            </p>
          </CardContent>
        </Card>

        {checks.length > 0 && (
          <>
            {!running && (
              <Alert
                className="mb-6"
                variant={anyFail ? "destructive" : "default"}
              >
                <AlertTitle className="flex items-center gap-2">
                  {allOk && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {anyFail && <XCircle className="h-4 w-4" />}
                  {!allOk && !anyFail && anyPartial && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  {allOk && "All records verified — propagation complete"}
                  {anyFail && "Some records are missing or incorrect"}
                  {!allOk && !anyFail && anyPartial && "Records found, but extra entries detected"}
                </AlertTitle>
                <AlertDescription>
                  {allOk &&
                    "Your domain is correctly pointing to our infrastructure. SSL will be provisioned automatically if not already active."}
                  {anyFail &&
                    "Update the failing records at your DNS provider, then re-run the check. Propagation can take up to 72 hours."}
                  {!allOk && !anyFail && anyPartial &&
                    "Remove old A records pointing elsewhere — multiple A records can cause inconsistent routing."}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              {checks.map((c) => (
                <Card key={c.host}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <StatusIcon status={c.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold">{c.label}</h3>
                          <Badge variant="secondary" className="font-mono text-xs">{c.type}</Badge>
                          {c.resolver && (
                            <span className="text-xs text-muted-foreground">via {c.resolver}</span>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Host</div>
                            <code className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">{c.host}</code>
                          </div>
                          <div>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Expected</div>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-xs bg-muted px-2 py-1 rounded break-all">{c.expected}</code>
                              <button
                                onClick={() => copy(c.expected.replace("…", ""))}
                                className="text-muted-foreground hover:text-foreground"
                                aria-label="Copy"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Found</div>
                            {c.status === "checking" ? (
                              <span className="text-muted-foreground text-xs">Querying DNS…</span>
                            ) : c.found.length === 0 ? (
                              <span className="text-destructive text-xs">No records returned</span>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {c.found.map((v, i) => {
                                  const matches =
                                    c.type === "A"
                                      ? v === REQUIRED_A
                                      : v.startsWith(REQUIRED_TXT_PREFIX);
                                  return (
                                    <code
                                      key={i}
                                      className={`font-mono text-xs px-2 py-1 rounded break-all ${
                                        matches
                                          ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                          : "bg-destructive/10 text-destructive"
                                      }`}
                                    >
                                      {v}
                                    </code>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {completedAt && !running && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Last checked at {completedAt.toLocaleTimeString()}
              </p>
            )}

            <Card className="mt-6 bg-muted/40">
              <CardHeader>
                <CardTitle className="text-base">Required DNS records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="font-semibold">Type</div>
                  <div className="font-semibold">Name</div>
                  <div className="font-semibold">Value</div>
                  <div>A</div><div>@</div><div>185.158.133.1</div>
                  <div>A</div><div>www</div><div>185.158.133.1</div>
                  <div>TXT</div><div>_lovable</div><div>lovable_verify=…</div>
                </div>
                <p className="text-xs text-muted-foreground pt-2">
                  Get your unique TXT verification value from Project Settings → Domains.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DomainCheck;
