import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import SuperAdminSidebar from "@/components/super-admin/SuperAdminSidebar";
import SuperAdminOverview from "@/components/super-admin/SuperAdminOverview";
import SuperAdminAnalytics from "@/components/super-admin/SuperAdminAnalytics";
import SuperAdminActivityLog from "@/components/super-admin/SuperAdminActivityLog";
import SuperAdminAccountManagement from "@/components/super-admin/SuperAdminAccountManagement";
import SuperAdminWebsiteCMS from "@/components/super-admin/SuperAdminWebsiteCMS";
import SuperAdminSiteEditor from "@/components/super-admin/SuperAdminSiteEditor";
import SuperAdminContactMessages from "@/components/super-admin/SuperAdminContactMessages";
import SuperAdminDataExport from "@/components/super-admin/SuperAdminDataExport";
import AdminSituationRoom from "@/components/admin/AdminSituationRoom";
import AdminElectionCollation from "@/components/admin/AdminElectionCollation";
import AdminEvents from "@/components/admin/AdminEvents";
import AdminBlogPosts from "@/components/admin/AdminBlogPosts";
import AdminCommunityForum from "@/components/admin/AdminCommunityForum";
import AdminMediaLibrary from "@/components/admin/AdminMediaLibrary";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminKefCares from "@/components/admin/AdminKefCares";
import AdminManifestoContributions from "@/components/admin/AdminManifestoContributions";

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, rolesLoading, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !rolesLoading && (!user || !isSuperAdmin)) {
      navigate("/super-admin/login", { replace: true });
    }
  }, [user, loading, rolesLoading, isSuperAdmin, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-[#050a15] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Verifying super admin access…</p>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) return null;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <SuperAdminOverview onTabChange={handleTabChange} />;
      case "analytics": return <SuperAdminAnalytics />;
      case "activity": return <SuperAdminActivityLog />;
      case "users": return <SuperAdminAccountManagement filter="all" />;
      case "agents": return <SuperAdminAccountManagement filter="agents" />;
      case "admins": return <SuperAdminAccountManagement filter="admins" />;
      case "website": return <SuperAdminWebsiteCMS />;
      case "site-editor": return <SuperAdminSiteEditor />;
      case "messages": return <SuperAdminContactMessages />;
      case "situation": return <AdminSituationRoom />;
      case "election": return <AdminElectionCollation />;
      case "events": return <AdminEvents />;
      case "blog": return <AdminBlogPosts />;
      case "forum": return <AdminCommunityForum />;
      case "manifesto": return <AdminManifestoContributions />;
      case "media": return <AdminMediaLibrary />;
      case "notifications": return <AdminNotifications />;
      case "kef-cares": return <AdminKefCares />;
      case "data-export": return <SuperAdminDataExport />;
      case "settings": return <AdminSettings />;
      default: return <SuperAdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex relative">
      {isMobile && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-3 left-3 z-[60] w-10 h-10 bg-[#050a15] border border-amber-500/30 rounded-lg flex items-center justify-center shadow-lg text-amber-400"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      )}

      {isMobile ? (
        <>
          <div
            className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`fixed left-0 top-0 bottom-0 z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <SuperAdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        </>
      ) : (
        <SuperAdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <main className="flex-1 p-3 md:p-8 pt-16 md:pt-8 overflow-y-auto w-full max-w-full">
        <div className="max-w-full overflow-x-hidden">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
