import AdminHeader from "./AdminHeader";
import { Globe, Shield, Bell, Database, Key, Settings as SettingsIcon } from "lucide-react";

const phases = [
  { name: "Pre-Election", desc: "Campaign and registration period", active: false },
  { name: "Voting Day", desc: "Active voting in progress", active: true },
  { name: "Collation", desc: "Results aggregation phase", active: false },
  { name: "Post-Election", desc: "Analysis and reporting", active: false },
];

const roles = [
  { name: "Administrator", count: 3, access: "Full Access" },
  { name: "Election Coordinator", count: 12, access: "Manage Elections" },
  { name: "Field Agent", count: 384, access: "Report Submission" },
  { name: "Content Manager", count: 8, access: "Content Control" },
  { name: "Viewer", count: 12440, access: "Read Only" },
];

const security = [
  { name: "Two-Factor Authentication", value: "Enabled", color: "text-emerald-600 bg-emerald-50" },
  { name: "Session Timeout", value: "30 minutes", color: "text-gray-700 bg-gray-100" },
  { name: "Password Policy", value: "Strong", color: "text-gray-700 bg-gray-100" },
  { name: "IP Whitelisting", value: "Disabled", color: "text-gray-500 bg-gray-100" },
  { name: "Audit Logging", value: "Enabled", color: "text-emerald-600 bg-emerald-50" },
];

const AdminSettings = () => {
  return (
    <div>
      <AdminHeader title="Settings" subtitle="System configuration, security, and preferences" />

      {/* Election Phase Control */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Globe className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Election Phase Control</h3>
            <p className="text-xs text-gray-600">Select the current election phase to configure system behavior</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {phases.map((phase) => (
            <div key={phase.name} className={`rounded-xl p-4 border ${phase.active ? "bg-white border-emerald-300 ring-2 ring-emerald-200" : "bg-white border-gray-200"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2.5 h-2.5 rounded-full ${phase.active ? "bg-emerald-500" : "bg-gray-300"}`} />
                <p className="text-sm font-bold text-gray-900">{phase.name}</p>
              </div>
              <p className="text-xs text-gray-500">{phase.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles + Security */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">User Roles & Permissions</h3>
              <p className="text-xs text-gray-500">Manage user roles, access levels, and permission matrices</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-gray-100">
            {roles.map((role) => (
              <div key={role.name} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-900">{role.name}</span>
                <span className="text-xs text-gray-500">{role.count} users · {role.access}</span>
              </div>
            ))}
          </div>
          <button className="text-xs text-emerald-600 font-bold mt-4 hover:underline">Configure Settings →</button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Security Settings</h3>
              <p className="text-xs text-gray-500">Configure authentication, session management, and security policies</p>
            </div>
          </div>
          <div className="space-y-0 divide-y divide-gray-100">
            {security.map((item) => (
              <div key={item.name} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
          <button className="text-xs text-emerald-600 font-bold mt-4 hover:underline">Configure Settings →</button>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Bell, label: "Notifications", desc: "Configure system-wide notification preferences and alert thresholds", link: "Manage Notifications →", bg: "bg-blue-50", color: "text-blue-600" },
          { icon: Database, label: "Data & Backup", desc: "Database management, backups, and data export configurations", link: "Manage Data →", bg: "bg-emerald-50", color: "text-emerald-600" },
          { icon: Key, label: "API Keys", desc: "Manage API access tokens and integration credentials", link: "Manage Keys →", bg: "bg-purple-50", color: "text-purple-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-6">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <h4 className="text-base font-bold text-gray-900">{card.label}</h4>
            <p className="text-xs text-gray-500 mt-1 mb-3">{card.desc}</p>
            <button className="text-xs text-emerald-600 font-bold hover:underline">{card.link}</button>
          </div>
        ))}
      </div>

      {/* System Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">System Information</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Version", value: "v2.4.1" },
            { label: "Last Updated", value: "March 1, 2026" },
            { label: "Database Status", value: "Operational", color: "text-emerald-600" },
          ].map((info) => (
            <div key={info.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">{info.label}</p>
              <p className={`text-base font-bold mt-1 ${info.color ?? "text-gray-900"}`}>{info.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
