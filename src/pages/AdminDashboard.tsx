import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
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
import AdminKefCares from "@/components/admin/AdminKefCares";
import AdminApplications from "@/components/admin/AdminApplications";
import AdminManifestoContributions from "@/components/admin/AdminManifestoContributions";
import AdminSupportGroups from "@/components/admin/AdminSupportGroups";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, rolesLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "users": return <AdminUsers />;
      case "agents": return <AdminAgents />;
      case "applications": return <AdminApplications />;
      case "situation": return <AdminSituationRoom />;
      case "election": return <AdminElectionCollation />;
      case "events": return <AdminEvents />;
      case "blog": return <AdminBlogPosts />;
      case "forum": return <AdminCommunityForum />;
      case "manifesto": return <AdminManifestoContributions />;
      case "support-groups": return <AdminSupportGroups />;
      case "media": return <AdminMediaLibrary />;
      case "notifications": return <AdminNotifications />;
      case "kef-cares": return <AdminKefCares />;
      case "settings": return <AdminSettings />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex relative">
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-[60] w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-md"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {isMobile ? (
        sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 z-50">
              <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </>
        )
      ) : (
        <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
