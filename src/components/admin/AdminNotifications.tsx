import AdminHeader from "./AdminHeader";
import { Bell, Check, AlertTriangle, Info, MessageSquare } from "lucide-react";

const notifications = [
  { type: "alert", icon: AlertTriangle, color: "bg-red-50 text-red-500", title: "Critical incident reported in Jos North", time: "2 mins ago", read: false },
  { type: "info", icon: Info, color: "bg-blue-50 text-blue-500", title: "New agent registration: Emmanuel Yakubu", time: "15 mins ago", read: false },
  { type: "success", icon: Check, color: "bg-emerald-50 text-emerald-500", title: "Report verified for Ward 8, Barkin Ladi", time: "23 mins ago", read: true },
  { type: "message", icon: MessageSquare, color: "bg-purple-50 text-purple-500", title: "New forum thread requires moderation", time: "1 hour ago", read: true },
  { type: "info", icon: Info, color: "bg-blue-50 text-blue-500", title: "System update completed successfully", time: "2 hours ago", read: true },
];

const AdminNotifications = () => {
  return (
    <div>
      <AdminHeader title="Notifications" subtitle="System alerts, updates, and messages" />

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Unread", value: "2", bg: "bg-red-50", color: "text-red-600" },
          { label: "Today", value: notifications.length.toString(), bg: "bg-blue-50", color: "text-blue-600" },
          { label: "Total", value: notifications.length.toString(), bg: "bg-gray-50", color: "text-gray-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {notifications.map((notif, i) => (
          <div key={i} className={`p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${!notif.read ? "bg-emerald-50/30" : ""}`}>
            <div className={`w-9 h-9 rounded-full ${notif.color} flex items-center justify-center shrink-0`}>
              <notif.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!notif.read ? "font-bold text-gray-900" : "text-gray-700"}`}>{notif.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{notif.time}</p>
            </div>
            {!notif.read && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminNotifications;
