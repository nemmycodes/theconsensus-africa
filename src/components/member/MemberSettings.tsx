import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Eye, Key, LogOut, Trash2 } from "lucide-react";

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button onClick={onChange} className={`w-11 h-6 rounded-full transition-colors ${enabled ? "bg-emerald-600" : "bg-gray-300"} relative`}>
    <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "left-[22px]" : "left-0.5"}`} />
  </button>
);

const MemberSettings = () => {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Member";

  const [notifications, setNotifications] = useState({
    email: true, push: true, sms: false, reportStatus: true, eventReminders: true, forumMentions: true, securityAlerts: true, weeklyDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true, showLocation: true, showActivity: false, allowDM: true,
  });

  const [twoFactor, setTwoFactor] = useState(true);

  const toggleNotif = (key: keyof typeof notifications) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  const togglePrivacy = (key: keyof typeof privacy) => setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account preferences, notifications, and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-1 flex items-center gap-2"><Bell className="w-4 h-4 text-emerald-600" /> Notifications</h3>
            <p className="text-xs text-gray-500 mb-4">Configure how you receive alerts and updates</p>
            <div className="space-y-4">
              {[
                { key: "email" as const, label: "Email Alerts", desc: "Receive important alerts via email" },
                { key: "push" as const, label: "Push Notifications", desc: "Browser and device push notifications" },
                { key: "sms" as const, label: "SMS Alerts", desc: "Critical alerts via text message" },
                { key: "reportStatus" as const, label: "Report Status Updates", desc: "Notified when your reports are reviewed" },
                { key: "eventReminders" as const, label: "Event Reminders", desc: "Upcoming event notifications" },
                { key: "forumMentions" as const, label: "Forum Mentions", desc: "When someone replies or mentions you" },
                { key: "securityAlerts" as const, label: "Security Alerts", desc: "Login attempts and security issues" },
                { key: "weeklyDigest" as const, label: "Weekly Digest", desc: "Weekly summary of activity" },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{n.label}</p>
                    <p className="text-xs text-gray-500">{n.desc}</p>
                  </div>
                  <Toggle enabled={notifications[n.key]} onChange={() => toggleNotif(n.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-1 flex items-center gap-2"><Eye className="w-4 h-4 text-amber-600" /> Privacy</h3>
            <p className="text-xs text-gray-500 mb-4">Control your profile visibility and data sharing</p>
            <div className="space-y-4">
              {[
                { key: "profileVisible" as const, label: "Profile Visible to Members", desc: "Other members can view your profile" },
                { key: "showLocation" as const, label: "Show Location", desc: "Display your assigned area on profile" },
                { key: "showActivity" as const, label: "Show Activity Status", desc: "Others can see when you're online" },
                { key: "allowDM" as const, label: "Allow Direct Messages", desc: "Members can send you private messages" },
              ].map(p => (
                <div key={p.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{p.label}</p>
                    <p className="text-xs text-gray-500">{p.desc}</p>
                  </div>
                  <Toggle enabled={privacy[p.key]} onChange={() => togglePrivacy(p.key)} />
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-1 flex items-center gap-2"><Shield className="w-4 h-4 text-red-600" /> Security</h3>
            <p className="text-xs text-gray-500 mb-4">Manage your account security and authentication</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center gap-3"><Key className="w-4 h-4 text-gray-400" /><div><p className="text-sm font-bold">Change Password</p><p className="text-xs text-gray-500">Last changed 30 days ago</p></div></div>
                <Button variant="outline" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <div><p className="text-sm font-bold">Two-Factor Authentication</p><p className="text-xs text-gray-500">Extra layer of security</p></div>
                <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-bold">Active Sessions</p><p className="text-xs text-gray-500">2 active sessions on your account</p></div>
                <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200">Manage</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Account Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-bold">{displayName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-bold text-xs">{user?.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Role</span><span className="font-bold text-emerald-600">Member</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-bold text-emerald-600">Active</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wide mb-3">Data Management</h4>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 py-2">⬇ Export My Data <span className="text-gray-300">›</span></button>
              <button className="w-full flex items-center justify-between text-sm text-gray-700 hover:text-gray-900 py-2">⬇ Download Reports <span className="text-gray-300">›</span></button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-red-200 p-5">
            <h4 className="font-bold text-sm text-red-600 uppercase tracking-wide mb-3">Danger Zone</h4>
            <div className="space-y-2">
              <button onClick={() => signOut()} className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-700 py-2"><LogOut className="w-4 h-4" /> Sign Out of All Devices</button>
              <button className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-700 py-2"><Trash2 className="w-4 h-4" /> Deactivate Account</button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Account deactivation is reversible within 30 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberSettings;
