import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentOverview from "@/components/agent/AgentOverview";
import AgentSubmissions from "@/components/agent/AgentSubmissions";

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, rolesLoading, isAgent } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !rolesLoading && (!user || !isAgent)) {
      navigate("/agent/login", { replace: true });
    }
  }, [user, loading, rolesLoading, isAgent, navigate]);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Verifying agent access…</p>
        </div>
      </div>
    );
  }

  if (!user || !isAgent) return null;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (isMobile) setSidebarOpen(false);
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
              <AgentSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </>
        )
      ) : (
        <AgentSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <AgentOverview onTabChange={handleTabChange} />
        ) : (
          <AgentSubmissions />
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
