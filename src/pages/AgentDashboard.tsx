import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgentOverview from "@/components/agent/AgentOverview";
import AgentSubmissions from "@/components/agent/AgentSubmissions";

const AgentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading, rolesLoading, isAgent } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <AgentSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <AgentOverview onTabChange={setActiveTab} />
        ) : (
          <AgentSubmissions />
        )}
      </main>
    </div>
  );
};

export default AgentDashboard;
