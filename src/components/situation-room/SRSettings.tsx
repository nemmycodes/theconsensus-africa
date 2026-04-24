import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Database, ShieldCheck, Bell, Cog, Calendar, Download, CheckCircle2 } from "lucide-react";

const phases = [
  { key: "pre", title: "Pre-Election", desc: "Preparation and setup phase" },
  { key: "accred", title: "Accreditation", desc: "Voter accreditation process" },
  { key: "voting", title: "Voting", desc: "Active voting period" },
  { key: "collation", title: "Collation", desc: "Results collation and verification" },
  { key: "declaration", title: "Declaration", desc: "Results declaration phase" },
];

const SRSettings = () => {
  const [phase, setPhase] = useState("voting");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-black uppercase">System Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure election phases, notifications, permissions, and system parameters.
        </p>
      </div>

      <Tabs defaultValue="phase" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0">
          {[
            { v: "phase", l: "Election Phase", I: Calendar },
            { v: "notif", l: "Notifications", I: Bell },
            { v: "roles", l: "Role Permissions", I: ShieldCheck },
            { v: "config", l: "System Config", I: Cog },
            { v: "data", l: "Data & Backup", I: Database },
          ].map((t) => (
            <TabsTrigger
              key={t.v}
              value={t.v}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-4 py-3 gap-2"
            >
              <t.I className="h-4 w-4" /> {t.l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Election Phase */}
        <TabsContent value="phase">
          <Card className="p-6">
            <h3 className="font-bold mb-1">Election Phase Control</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set the current election phase. This affects data visibility and system behavior.
            </p>
            <div className="space-y-3">
              {phases.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPhase(p.key)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border text-left transition-colors ${
                    phase === p.key ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-4 w-4 rounded-full border-2 ${phase === p.key ? "bg-primary border-primary" : "border-muted-foreground"}`} />
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                  {phase === p.key && (
                    <span className="text-[10px] font-bold tracking-wider bg-primary/10 text-primary px-2 py-1 rounded-full">ACTIVE</span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <Button className="gap-2"><Save className="h-4 w-4" /> Update Phase</Button>
              <p className="text-xs text-orange-600">⚠ Phase changes affect all active sessions</p>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notif">
          <Card className="p-6 space-y-4">
            <h3 className="font-bold mb-2">Notification Preferences</h3>
            {[
              { t: "Critical Incident Alerts", d: "Receive immediate alerts for critical security incidents", on: true },
              { t: "Collation Updates", d: "Notifications when new results are uploaded or verified", on: true },
              { t: "Agent Status Changes", d: "Alert when agents go offline or change status", on: false },
              { t: "System Health Warnings", d: "Technical alerts about server and API performance", on: true },
              { t: "Daily Summary Reports", d: "End-of-day summary of all activities and metrics", on: true },
              { t: "New User Registrations", d: "Alert when new users are added to the system", on: false },
            ].map((n) => (
              <div key={n.t} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{n.t}</p>
                  <p className="text-xs text-muted-foreground">{n.d}</p>
                </div>
                <Switch defaultChecked={n.on} />
              </div>
            ))}
          </Card>
        </TabsContent>

        {/* Role Permissions */}
        <TabsContent value="roles">
          <Card className="p-6">
            <h3 className="font-bold mb-1">Role Permissions Matrix</h3>
            <p className="text-sm text-muted-foreground mb-4">Define access levels for each role in the system.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="text-left py-3">Permission</th>
                    {["Admin", "Coordinator", "Intelligence Officer", "Field Agent"].map((c) => (
                      <th key={c} className="text-center py-3">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["View Dashboard", true, true, true, true],
                    ["Manage Users", true, false, false, false],
                    ["Submit Reports", true, true, true, true],
                    ["Verify Results", true, true, true, false],
                    ["Export Data", true, true, true, false],
                    ["Manage Settings", true, false, false, false],
                    ["Delete Records", true, false, false, false],
                    ["Assign Agents", true, true, false, false],
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="py-3">{row[0] as string}</td>
                      {(row.slice(1) as boolean[]).map((v, j) => (
                        <td key={j} className="text-center py-3">
                          {v ? <CheckCircle2 className="h-4 w-4 text-primary inline" /> : <span className="inline-block h-4 w-4 rounded-full border border-muted" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button className="mt-6 gap-2"><Save className="h-4 w-4" /> Save Permissions</Button>
          </Card>
        </TabsContent>

        {/* System Config */}
        <TabsContent value="config">
          <Card className="p-6">
            <h3 className="font-bold mb-4">System Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Election Name</Label><Input defaultValue="2026 General Elections" className="mt-1" /></div>
              <div><Label>Election Date</Label><Input type="date" className="mt-1" /></div>
              <div><Label>Time Zone</Label><Input defaultValue="Africa/Lagos (WAT)" className="mt-1" /></div>
              <div><Label>Data Refresh Interval</Label><Input defaultValue="30 seconds" className="mt-1" /></div>
              <div><Label>Max Upload Size</Label><Input defaultValue="10 MB" className="mt-1" /></div>
              <div><Label>Session Timeout</Label><Input defaultValue="30 minutes" className="mt-1" /></div>
            </div>
            <Button className="mt-6 gap-2"><Save className="h-4 w-4" /> Save Configuration</Button>
          </Card>
        </TabsContent>

        {/* Data & Backup */}
        <TabsContent value="data">
          <Card className="p-6">
            <h3 className="font-bold mb-1">Data Export</h3>
            <p className="text-sm text-muted-foreground mb-4">Export system data in various formats for analysis and reporting.</p>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { t: "Election Results", d: "All collation data and vote counts", m: "CSV / Excel · ~12 MB" },
                { t: "Intelligence Reports", d: "All incident reports and evidence", m: "PDF / CSV · ~45 MB" },
                { t: "User Activity Logs", d: "Complete audit trail of user actions", m: "CSV · ~8 MB" },
                { t: "Agent Reports", d: "Field agent submissions and verifications", m: "CSV / PDF · ~22 MB" },
                { t: "System Logs", d: "Technical system and error logs", m: "JSON · ~3 MB" },
                { t: "Full Database Backup", d: "Complete system backup snapshot", m: "SQL · ~120 MB" },
              ].map((c) => (
                <Card key={c.t} className="p-4 bg-muted/30">
                  <p className="font-semibold text-sm">{c.t}</p>
                  <p className="text-xs text-muted-foreground mb-3">{c.d}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{c.m}</span>
                    <Button size="sm" variant="outline" className="gap-1 h-7"><Download className="h-3 w-3" /> Export</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SRSettings;
