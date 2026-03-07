import AdminHeader from "./AdminHeader";
import { Radio, AlertTriangle, CheckCircle, Clock, MapPin, ArrowUp } from "lucide-react";
import { useState } from "react";

const reports = [
  { type: "INCIDENT", time: "23:24:15", text: "Unusual crowd gathering near polling station. Estimated 50+ individuals.", location: "Ward 12, Pankshin LGA", reporter: "Sarah Okonkwo", color: "bg-red-50 border-red-100", iconBg: "bg-red-100", iconColor: "text-red-500", icon: AlertTriangle },
  { type: "IRREGULARITY", time: "23:22:47", text: "Ballot box seal appears tampered. Awaiting verification team.", location: "Polling Unit 034, Jos North", reporter: "John Danladi", color: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", icon: AlertTriangle },
  { type: "VERIFIED", time: "23:21:03", text: "Voting proceeding smoothly. No incidents to report.", location: "Ward 8, Barkin Ladi", reporter: "David Gowon", color: "bg-emerald-50 border-emerald-100", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", icon: CheckCircle },
  { type: "DELAY", time: "23:19:28", text: "Polling materials arrived 45 minutes late. Voting now commenced.", location: "Jos South Central", reporter: "Ruth Choji", color: "bg-amber-50 border-amber-100", iconBg: "bg-amber-100", iconColor: "text-amber-600", icon: Clock },
];

const filterTabs = ["All", "Incidents", "Verified"];

const regionalStats = [
  { name: "Plateau North", reports: 892, status: "bg-emerald-500" },
  { name: "Plateau Central", reports: 1124, status: "bg-emerald-500" },
  { name: "Plateau South", reports: 831, status: "bg-amber-500" },
];

const AdminSituationRoom = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div>
      <AdminHeader
        title="Situation Room"
        subtitle="Real-time monitoring and incident response"
        liveBadge={{ label: "LIVE MONITORING", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "ACTIVE REPORTS", value: "2,847", icon: Radio, change: "+156", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "CRITICAL INCIDENTS", value: "42", icon: AlertTriangle, change: "-5", bg: "bg-red-50", color: "text-red-500" },
          { label: "VERIFIED REPORTS", value: "1,923", icon: CheckCircle, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "RESPONSE TIME", value: "8.5", suffix: "min", icon: Clock, change: "-2.1 min", bg: "bg-blue-50", color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}{s.suffix && <span className="text-lg ml-1">{s.suffix}</span>}</p>
                {s.change && <p className="text-xs text-emerald-600 font-bold mt-1">↑ {s.change}</p>}
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Reports Feed */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Live Reports Feed</h3>
            </div>
            <div className="flex gap-2">
              {filterTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${activeFilter === tab ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {reports.map((report, i) => (
              <div key={i} className={`${report.color} border rounded-xl p-4`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full ${report.iconBg} flex items-center justify-center shrink-0`}>
                    <report.icon className={`w-4 h-4 ${report.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${report.iconColor} ${report.iconBg}`}>{report.type}</span>
                      <span className="text-xs text-gray-500">{report.time}</span>
                      <button className="ml-auto px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Review</button>
                    </div>
                    <p className="text-sm text-gray-800 mb-1">{report.text}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location}</span>
                      <span>Reporter: {report.reporter}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Map Placeholder */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Regional Overview</h3>
            <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Interactive Map</p>
                <p className="text-xs text-gray-400">Real-time incident tracking</p>
              </div>
            </div>
          </div>

          {/* Regional Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Regional Stats</h3>
            <div className="space-y-3">
              {regionalStats.map((region) => (
                <div key={region.name} className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{region.name}</p>
                    <p className="text-xs text-gray-500">{region.reports} reports</p>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${region.status}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSituationRoom;
