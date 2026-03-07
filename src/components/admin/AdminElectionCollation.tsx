import AdminHeader from "./AdminHeader";
import { Button } from "@/components/ui/button";
import { BarChart3, CheckCircle, Clock, AlertTriangle, Download, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const barData = [
  { name: "PU 002", votes: 420 },
  { name: "PU 004", votes: 380 },
  { name: "PU 006", votes: 510 },
];

const pieData = [
  { name: "Consensus Party", value: 45, color: "#16a34a" },
  { name: "Party B", value: 28, color: "#eab308" },
  { name: "Party C", value: 17, color: "#22c55e" },
  { name: "Others", value: 10, color: "#9ca3af" },
];

const wardResults = [
  { ward: "Ward 1", lga: "Jos North", votes: "4,523", registered: "6,789", turnout: "67%", status: "verified" },
  { ward: "Ward 2", lga: "Jos North", votes: "3,892", registered: "5,234", turnout: "74%", status: "verified" },
  { ward: "Ward 3", lga: "Jos South", votes: "5,124", registered: "7,456", turnout: "69%", status: "pending" },
  { ward: "Ward 4", lga: "Pankshin", votes: "2,893", registered: "4,123", turnout: "70%", status: "verified" },
  { ward: "Ward 5", lga: "Barkin Ladi", votes: "3,456", registered: "5,012", turnout: "69%", status: "verified" },
];

const districts = [
  { name: "Plateau North", senator: "Sen. Dr. Nora Dadu'ut", lgas: 8, distributed: 342, pending: 28 },
  { name: "Plateau Central", senator: "Sen. Diket Plang", lgas: 6, distributed: 287, pending: 15 },
  { name: "Plateau South", senator: "Sen. Simon Lalong", lgas: 9, distributed: 245, pending: 12 },
];

const AdminElectionCollation = () => {
  return (
    <div>
      <AdminHeader
        title="Election Collation"
        subtitle="Results aggregation and verification across all levels"
        liveBadge={{ label: "COLLATION IN PROGRESS", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }}
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "TOTAL RESULTS", value: "2,847", icon: BarChart3, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "VERIFIED", value: "2,634", icon: CheckCircle, change: "↑ 92%", bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "PENDING", value: "213", icon: Clock, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "DISPUTED", value: "8", icon: AlertTriangle, bg: "bg-red-50", color: "text-red-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                {s.change && <p className="text-xs text-emerald-600 font-bold mt-1">{s.change}</p>}
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collation Progress */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Collation Progress by Level</h3>
          <Button variant="outline" className="gap-2 border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "POLLING UNITS", value: "2634/2847", collated: 2634, pending: 213, color: "bg-emerald-500" },
            { label: "WARDS", value: "298/325", collated: 298, pending: 27, color: "bg-emerald-500" },
            { label: "LGAS", value: "35/37", collated: 35, pending: 2, color: "bg-emerald-500" },
            { label: "STATE", value: "0/1", collated: 0, pending: 1, color: "bg-gray-300" },
          ].map((level) => (
            <div key={level.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{level.label}</p>
              <p className="text-xl font-black text-gray-900 mt-1">{level.value}</p>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${level.color} rounded-full`} style={{ width: `${level.collated / (level.collated + level.pending) * 100}%` }} />
              </div>
              <div className="flex gap-3 mt-2 text-[10px]">
                <span className="text-emerald-600">{level.collated} Collated</span>
                <span className="text-amber-600">{level.pending} Pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Sample Polling Unit Results</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#666" }} />
              <YAxis tick={{ fontSize: 12, fill: "#666" }} />
              <Tooltip />
              <Bar dataKey="votes" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Party Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ward-Level Results */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Ward-Level Results</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {["Ward", "LGA", "Total Votes", "Registered", "Turnout", "Status"].map((h) => (
                <th key={h} className="text-left p-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {wardResults.map((row, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-3 text-sm font-semibold text-gray-900">{row.ward}</td>
                <td className="p-3 text-sm text-gray-600">{row.lga}</td>
                <td className="p-3 text-sm text-gray-900">{row.votes}</td>
                <td className="p-3 text-sm text-gray-600">{row.registered}</td>
                <td className="p-3 text-sm text-gray-900">{row.turnout}</td>
                <td className="p-3">
                  <span className={`flex items-center gap-1 text-xs font-medium ${row.status === "verified" ? "text-emerald-600" : "text-amber-600"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === "verified" ? "bg-emerald-500" : "bg-amber-500"}`} />
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Senatorial Districts */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Senatorial Districts Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {districts.map((d) => (
            <div key={d.name} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Senatorial District</p>
                  <p className="text-base font-bold text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">{d.senator}</p>
                </div>
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="space-y-1 mt-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">LGAs</span><span className="font-bold text-gray-900">{d.lgas}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Distributed</span><span className="font-bold text-emerald-600">{d.distributed}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Pending</span><span className="font-bold text-amber-600">{d.pending}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminElectionCollation;
