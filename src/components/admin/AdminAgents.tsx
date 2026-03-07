import AdminHeader from "./AdminHeader";
import { useState } from "react";
import { Shield, TrendingUp, Users, Award, ArrowUp } from "lucide-react";

const topPerformers = [
  { rank: 1, name: "Sarah Okonkwo", region: "Plateau North", reports: 892, accuracy: "98%", response: "12 min" },
  { rank: 2, name: "John Danladi", region: "Plateau Central", reports: 1124, accuracy: "97%", response: "15 min" },
  { rank: 3, name: "Grace Ayuba", region: "Plateau South", reports: 831, accuracy: "96%", response: "18 min" },
  { rank: 4, name: "David Gowon", region: "Barkin Ladi", reports: 674, accuracy: "95%", response: "14 min" },
  { rank: 5, name: "Ruth Choji", region: "Jos South", reports: 543, accuracy: "94%", response: "16 min" },
];

const hierarchy = [
  { name: "Dr. Emmanuel Bako", role: "National Coordinator", supervised: 37, reports: 2847, score: "96%", initials: "DEB", color: "bg-amber-700" },
];

const stateCoords = [
  { name: "Sarah Okonkwo", role: "Plateau North Coordinator", lgas: 12, reports: 892, score: "94%", initials: "SO", color: "bg-emerald-700" },
  { name: "John Danladi", role: "Plateau Central Coordinator", lgas: 15, reports: 1124, score: "98%", initials: "JD", color: "bg-emerald-700" },
  { name: "Grace Ayuba", role: "Plateau South Coordinator", lgas: 10, reports: 831, score: "92%", initials: "GA", color: "bg-emerald-700" },
];

const filterTabs = ["All", "National", "State", "LGA", "Ward"];

const AdminAgents = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div>
      <AdminHeader title="Agents" subtitle="Manage field agents, hierarchies, and performance metrics" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "ACTIVE AGENTS", value: "384", icon: Shield, change: "+12%", bg: "bg-blue-50", color: "text-blue-600" },
          { label: "NATIONAL COORDINATORS", value: "1", icon: Award, bg: "bg-amber-50", color: "text-amber-600" },
          { label: "STATE COORDINATORS", value: "37", icon: Users, bg: "bg-emerald-50", color: "text-emerald-600" },
          { label: "AVG PERFORMANCE", value: "94%", icon: TrendingUp, change: "+3%", bg: "bg-emerald-50", color: "text-emerald-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{s.value}</p>
                {s.change && (
                  <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                    <ArrowUp className="w-3 h-3" /> {s.change}
                  </p>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === tab
                ? "bg-emerald-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Hierarchy + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Agent Hierarchy */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Agent Hierarchy</h3>

          {/* National Coordinator */}
          {hierarchy.map((h) => (
            <div key={h.name} className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${h.color} text-white flex items-center justify-center text-xs font-bold`}>
                    {h.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{h.name}</p>
                    <p className="text-xs text-gray-500">{h.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-center">
                  <div><p className="text-sm font-bold text-gray-900">{h.supervised}</p><p className="text-[10px] text-gray-500">Supervised</p></div>
                  <div><p className="text-sm font-bold text-gray-900">{h.reports}</p><p className="text-[10px] text-gray-500">Reports</p></div>
                  <div><p className="text-sm font-bold text-emerald-600">{h.score}</p><p className="text-[10px] text-gray-500">Performance</p></div>
                </div>
              </div>
            </div>
          ))}

          {/* State Coordinators */}
          <div className="space-y-3 ml-6 border-l-2 border-emerald-200 pl-4">
            {stateCoords.map((coord) => (
              <div key={coord.name} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${coord.color} text-white flex items-center justify-center text-xs font-bold`}>
                      {coord.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{coord.name}</p>
                      <p className="text-xs text-gray-500">{coord.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-center">
                    <div><p className="text-sm font-bold text-gray-900">{coord.lgas}</p><p className="text-[10px] text-gray-500">LGAs</p></div>
                    <div><p className="text-sm font-bold text-gray-900">{coord.reports}</p><p className="text-[10px] text-gray-500">Reports</p></div>
                    <div><p className="text-sm font-bold text-emerald-600">{coord.score}</p><p className="text-[10px] text-gray-500">Score</p></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4">Top Performers</h3>
          <div className="space-y-4">
            {topPerformers.map((perf) => (
              <div key={perf.rank} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    #{perf.rank}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{perf.name}</p>
                    <p className="text-xs text-gray-500">{perf.region}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><p className="text-[10px] text-gray-500">Reports</p><p className="text-sm font-black text-gray-900">{perf.reports}</p></div>
                  <div><p className="text-[10px] text-gray-500">Accuracy</p><p className="text-sm font-black text-emerald-600">{perf.accuracy}</p></div>
                  <div><p className="text-[10px] text-gray-500">Response</p><p className="text-sm font-black text-gray-900">{perf.response}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAgents;
