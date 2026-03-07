import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAgents from "@/components/admin/AdminAgents";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminBlogPosts from "@/components/admin/AdminBlogPosts";
import AdminSituationRoom from "@/components/admin/AdminSituationRoom";
import AdminElectionCollation from "@/components/admin/AdminElectionCollation";
import AdminCommunityForum from "@/components/admin/AdminCommunityForum";
import AdminMediaLibrary from "@/components/admin/AdminMediaLibrary";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminSettings from "@/components/admin/AdminSettings";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "users": return <AdminUsers />;
      case "agents": return <AdminAgents />;
      case "situation": return <AdminSituationRoom />;
      case "election": return <AdminElectionCollation />;
      case "events": return <AdminEvents />;
      case "blog": return <AdminBlogPosts />;
      case "forum": return <AdminCommunityForum />;
      case "media": return <AdminMediaLibrary />;
      case "notifications": return <AdminNotifications />;
      case "settings": return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
