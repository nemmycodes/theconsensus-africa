import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import MemberSidebar from "@/components/member/MemberSidebar";
import MemberHeader from "@/components/member/MemberHeader";
import MemberOverview from "@/components/member/MemberOverview";
import MemberSituationRoom from "@/components/member/MemberSituationRoom";
import MemberSubmitReport from "@/components/member/MemberSubmitReport";
import MemberEvents from "@/components/member/MemberEvents";
import MemberForum from "@/components/member/MemberForum";
import MemberProfile from "@/components/member/MemberProfile";
import MemberSettings from "@/components/member/MemberSettings";
import MemberNotifications from "@/components/member/MemberNotifications";

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <MemberOverview onTabChange={setActiveTab} />;
      case "situation": return <MemberSituationRoom onTabChange={setActiveTab} />;
      case "report": return <MemberSubmitReport />;
      case "events": return <MemberEvents />;
      case "forum": return <MemberForum />;
      case "notifications": return <MemberNotifications />;
      case "profile": return <MemberProfile />;
      case "settings": return <MemberSettings />;
      default: return <MemberOverview onTabChange={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex">
      <MemberSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <MemberHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;
