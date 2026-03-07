import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  const { user, loading, rolesLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !rolesLoading && (!user || !isAdmin)) {
      navigate("/admin/login", { replace: true });
    }
  }, [user, loading, rolesLoading, isAdmin, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) return null;

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
