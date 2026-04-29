import { useEffect, useMemo, useState } from "react";
import AdminHeader from "./AdminHeader";
import { Globe, Shield, Bell, Database, Key, Loader2, X, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type PhaseKey = "pre_election" | "voting_day" | "collation" | "post_election";

const PHASES: { key: PhaseKey; name: string; desc: string }[] = [
  { key: "pre_election", name: "Pre-Election", desc: "Campaign and registration period" },
  { key: "voting_day", name: "Voting Day", desc: "Active voting in progress" },
  { key: "collation", name: "Collation", desc: "Results aggregation phase" },
  { key: "post_election", name: "Post-Election", desc: "Analysis and reporting" },
];

const ROLE_DEFS: { key: string; name: string; access: string }[] = [
  { key: "super_admin", name: "Administrator", access: "Full Access" },
  { key: "admin", name: "Election Coordinator", access: "Manage Elections" },
  { key: "agent", name: "Field Agent", access: "Report Submission" },
  { key: "kef_user", name: "Content Manager", access: "Content Control" },
  { key: "user", name: "Viewer", access: "Read Only" },
];

interface SecuritySettings {
  two_factor: boolean;
  session_timeout_minutes: number;
  password_policy: "weak" | "medium" | "strong";
  ip_whitelisting: boolean;
  audit_logging: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  alert_threshold: "low" | "medium" | "high";
}

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingPhase, setSavingPhase] = useState(false);
  const [phase, setPhase] = useState<PhaseKey>("voting_day");
  const [security, setSecurity] = useState<SecuritySettings>({
    two_factor: true,
    session_timeout_minutes: 30,
    password_policy: "strong",
    ip_whitelisting: false,
    audit_logging: true,
  });
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email: true,
    sms: false,
    push: true,
    alert_threshold: "medium",
  });
  const [roleCounts, setRoleCounts] = useState<Record<string, number>>({});
  const [totalUsers, setTotalUsers] = useState(0);

  const [openModal, setOpenModal] = useState<null | "roles" | "security" | "notifications" | "data" | "keys">(null);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState("");

  const loadAll = async () => {
    setLoading(true);
    const [{ data: settingsRows }, { data: rolesData }, { count: profileCount }] = await Promise.all([
      supabase.from("system_settings" as any).select("key, value"),
      supabase.from("user_roles").select("role"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    if (settingsRows) {
      for (const r of settingsRows as any[]) {
        if (r.key === "election_phase") setPhase((r.value as PhaseKey) ?? "voting_day");
        if (r.key === "security") setSecurity({ ...security, ...(r.value as SecuritySettings) });
        if (r.key === "notifications") setNotifications({ ...notifications, ...(r.value as NotificationSettings) });
      }
    }

    const counts: Record<string, number> = {};
    (rolesData ?? []).forEach((r: any) => {
      counts[r.role] = (counts[r.role] ?? 0) + 1;
    });
    setRoleCounts(counts);
    setTotalUsers(profileCount ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from("system_settings" as any)
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  };

  const handlePhaseChange = async (next: PhaseKey) => {
    setSavingPhase(true);
    const prev = phase;
    setPhase(next);
    const ok = await saveSetting("election_phase", next);
    setSavingPhase(false);
    if (ok) toast({ title: "Election phase updated", description: PHASES.find((p) => p.key === next)?.name });
    else setPhase(prev);
  };

  const handleSecuritySave = async () => {
    const ok = await saveSetting("security", security);
    if (ok) {
      toast({ title: "Security settings saved" });
      setOpenModal(null);
    }
  };

  const handleNotificationsSave = async () => {
    const ok = await saveSetting("notifications", notifications);
    if (ok) {
      toast({ title: "Notification preferences saved" });
      setOpenModal(null);
    }
  };

  const loadApiKeys = async () => {
    const { data } = await supabase.from("api_keys").select("*").order("created_at", { ascending: false });
    setApiKeys(data ?? []);
  };

  useEffect(() => {
    if (openModal === "keys") loadApiKeys();
  }, [openModal]);

  const generateKey = async () => {
    if (!newKeyLabel.trim()) return;
    const raw = `tpc_${crypto.randomUUID().replace(/-/g, "")}`;
    const prefix = raw.slice(0, 8);
    const enc = new TextEncoder().encode(raw);
    const hashBuf = await crypto.subtle.digest("SHA-256", enc);
    const hashHex = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    const { error } = await supabase.from("api_keys").insert({
      label: newKeyLabel.trim(),
      prefix,
      key_hash: hashHex,
      scopes: ["read"],
    });
    if (error) {
      toast({ title: "Failed to create key", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "API key created",
      description: `Copy now (shown once): ${raw}`,
    });
    setNewKeyLabel("");
    loadApiKeys();
  };

  const revokeKey = async (id: string) => {
    const { error } = await supabase.from("api_keys").update({ revoked: true }).eq("id", id);
    if (error) return toast({ title: "Revoke failed", description: error.message, variant: "destructive" });
    toast({ title: "Key revoked" });
    loadApiKeys();
  };

  const exportData = async (table: string) => {
    const { data, error } = await supabase.from(table as any).select("*").limit(5000);
    if (error) return toast({ title: "Export failed", description: error.message, variant: "destructive" });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${table}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: `Exported ${table}`, description: `${data?.length ?? 0} records` });
  };

  const securityRows = useMemo(
    () => [
      {
        name: "Two-Factor Authentication",
        value: security.two_factor ? "Enabled" : "Disabled",
        on: security.two_factor,
      },
      {
        name: "Session Timeout",
        value: `${security.session_timeout_minutes} minutes`,
        on: true,
        neutral: true,
      },
      {
        name: "Password Policy",
        value: security.password_policy.charAt(0).toUpperCase() + security.password_policy.slice(1),
        on: true,
        neutral: true,
      },
      {
        name: "IP Whitelisting",
        value: security.ip_whitelisting ? "Enabled" : "Disabled",
        on: security.ip_whitelisting,
      },
      {
        name: "Audit Logging",
        value: security.audit_logging ? "Enabled" : "Disabled",
        on: security.audit_logging,
      },
    ],
    [security]
  );

  const roleRows = useMemo(
    () =>
      ROLE_DEFS.map((r) => ({
        ...r,
        count: r.key === "user" ? Math.max(totalUsers - Object.values(roleCounts).reduce((a, b) => a + b, 0), 0) : roleCounts[r.key] ?? 0,
      })),
    [roleCounts, totalUsers]
  );

  if (loading) {
    return (
      <div>
        <AdminHeader title="Settings" subtitle="System configuration, security, and preferences" />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader title="Settings" subtitle="System configuration, security, and preferences" />

      {/* Election Phase Control */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Election Phase Control</h3>
              <p className="text-xs text-gray-600">Click a phase to set it as the active system phase</p>
            </div>
          </div>
          {savingPhase && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PHASES.map((p) => {
            const active = p.key === phase;
            return (
              <button
                key={p.key}
                onClick={() => handlePhaseChange(p.key)}
                disabled={savingPhase}
                className={`text-left rounded-xl p-4 border transition-all ${
                  active
                    ? "bg-white border-emerald-300 ring-2 ring-emerald-200"
                    : "bg-white border-gray-200 hover:border-emerald-200 hover:shadow-sm"
                } disabled:opacity-60`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-300"}`} />
                  <p className="text-sm font-bold text-gray-900">{p.name}</p>
                </div>
                <p className="text-xs text-gray-500">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Roles + Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">User Roles & Permissions</h3>
              <p className="text-xs text-gray-500">Live counts from the database</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-gray-100">
            {roleRows.map((role) => (
              <div key={role.key} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-900">{role.name}</span>
                <span className="text-xs text-gray-500">
                  {role.count.toLocaleString()} users · {role.access}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setOpenModal("roles")}
            className="text-xs text-emerald-600 font-bold mt-4 hover:underline"
          >
            Configure Settings →
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Security Settings</h3>
              <p className="text-xs text-gray-500">Configure authentication and security policies</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-gray-100">
            {securityRows.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    item.neutral
                      ? "text-gray-700 bg-gray-100"
                      : item.on
                      ? "text-emerald-600 bg-emerald-50"
                      : "text-gray-500 bg-gray-100"
                  }`}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setOpenModal("security")}
            className="text-xs text-emerald-600 font-bold mt-4 hover:underline"
          >
            Configure Settings →
          </button>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: Bell,
            label: "Notifications",
            desc: "Configure system-wide notification preferences and alert thresholds",
            link: "Manage Notifications →",
            bg: "bg-blue-50",
            color: "text-blue-600",
            modal: "notifications" as const,
          },
          {
            icon: Database,
            label: "Data & Backup",
            desc: "Database management, backups, and data export configurations",
            link: "Manage Data →",
            bg: "bg-emerald-50",
            color: "text-emerald-600",
            modal: "data" as const,
          },
          {
            icon: Key,
            label: "API Keys",
            desc: "Manage API access tokens and integration credentials",
            link: "Manage Keys →",
            bg: "bg-purple-50",
            color: "text-purple-600",
            modal: "keys" as const,
          },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h4 className="text-base font-bold text-gray-900">{card.label}</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">{card.desc}</p>
            <button
              onClick={() => setOpenModal(card.modal)}
              className="text-xs text-emerald-600 font-bold hover:underline"
            >
              {card.link}
            </button>
          </div>
        ))}
      </div>

      {/* System Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">System Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Version", value: "v2.4.1" },
            { label: "Last Updated", value: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) },
            { label: "Database Status", value: "Operational", color: "text-emerald-600" },
          ].map((info) => (
            <div key={info.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">{info.label}</p>
              <p className={`text-base font-bold mt-1 ${info.color ?? "text-gray-900"}`}>{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles modal */}
      <Dialog open={openModal === "roles"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Roles Overview</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Use the <strong>Account Management</strong> section in the Super Admin dashboard to assign or revoke roles
            for individual users. Role definitions:
          </p>
          <div className="space-y-2 mt-2">
            {roleRows.map((r) => (
              <div key={r.key} className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-gray-500">{r.access}</p>
                </div>
                <span className="text-xs font-medium text-emerald-600">{r.count} users</span>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security modal */}
      <Dialog open={openModal === "security"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Security Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Two-Factor Authentication</Label>
              <Switch
                checked={security.two_factor}
                onCheckedChange={(v) => setSecurity({ ...security, two_factor: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>IP Whitelisting</Label>
              <Switch
                checked={security.ip_whitelisting}
                onCheckedChange={(v) => setSecurity({ ...security, ip_whitelisting: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Audit Logging</Label>
              <Switch
                checked={security.audit_logging}
                onCheckedChange={(v) => setSecurity({ ...security, audit_logging: v })}
              />
            </div>
            <div>
              <Label>Session Timeout (minutes)</Label>
              <Input
                type="number"
                min={5}
                max={480}
                value={security.session_timeout_minutes}
                onChange={(e) =>
                  setSecurity({ ...security, session_timeout_minutes: Number(e.target.value) || 30 })
                }
              />
            </div>
            <div>
              <Label>Password Policy</Label>
              <Select
                value={security.password_policy}
                onValueChange={(v: any) => setSecurity({ ...security, password_policy: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weak">Weak (6+ chars)</SelectItem>
                  <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                  <SelectItem value="strong">Strong (12+ chars, symbols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={handleSecuritySave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications modal */}
      <Dialog open={openModal === "notifications"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Preferences</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Email Notifications</Label>
              <Switch
                checked={notifications.email}
                onCheckedChange={(v) => setNotifications({ ...notifications, email: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>SMS Alerts</Label>
              <Switch
                checked={notifications.sms}
                onCheckedChange={(v) => setNotifications({ ...notifications, sms: v })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Push Notifications</Label>
              <Switch
                checked={notifications.push}
                onCheckedChange={(v) => setNotifications({ ...notifications, push: v })}
              />
            </div>
            <div>
              <Label>Alert Threshold</Label>
              <Select
                value={notifications.alert_threshold}
                onValueChange={(v: any) => setNotifications({ ...notifications, alert_threshold: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — all events</SelectItem>
                  <SelectItem value="medium">Medium — important only</SelectItem>
                  <SelectItem value="high">High — critical only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenModal(null)}>Cancel</Button>
            <Button onClick={handleNotificationsSave}>Save Preferences</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data & Backup modal */}
      <Dialog open={openModal === "data"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Data & Backup</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Export key datasets as JSON for backup or analysis.</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {["profiles", "election_reports", "blog_posts", "events", "contact_messages", "kef_cares_registrations"].map(
              (t) => (
                <Button key={t} variant="outline" onClick={() => exportData(t)}>
                  Export {t}
                </Button>
              )
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Keys modal */}
      <Dialog open={openModal === "keys"} onOpenChange={(o) => !o && setOpenModal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Keys</DialogTitle>
          </DialogHeader>
          <div className="flex gap-2">
            <Input
              placeholder="Key label (e.g. INEC sync)"
              value={newKeyLabel}
              onChange={(e) => setNewKeyLabel(e.target.value)}
            />
            <Button onClick={generateKey}>
              <Plus className="w-4 h-4 mr-1" /> Generate
            </Button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto mt-2">
            {apiKeys.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No API keys yet.</p>
            ) : (
              apiKeys.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between border rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold">{k.label}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      {k.prefix}••••••••• {k.revoked && <span className="text-red-500 ml-2">REVOKED</span>}
                    </p>
                  </div>
                  {!k.revoked && (
                    <Button size="sm" variant="ghost" onClick={() => revokeKey(k.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setOpenModal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
