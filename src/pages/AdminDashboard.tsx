import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAgents from "@/components/admin/AdminAgents";
import AdminData from "@/components/admin/AdminData";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminLocations from "@/components/admin/AdminLocations";
import AdminUpdates from "@/components/admin/AdminUpdates";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "users": return <AdminUsers />;
      case "agents": return <AdminAgents />;
      case "data": return <AdminData />;
      case "events": return <AdminEvents />;
      case "locations": return <AdminLocations />;
      case "updates": return <AdminUpdates />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
