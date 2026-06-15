import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import MemberSidebar from "@/components/member/MemberSidebar";
import MemberHeader from "@/components/member/MemberHeader";
import MemberOverview from "@/components/member/MemberOverview";

import MemberSubmitReport from "@/components/member/MemberSubmitReport";
import MemberEvents from "@/components/member/MemberEvents";
import MemberForum from "@/components/member/MemberForum";
import MemberProfile from "@/components/member/MemberProfile";
import MemberSettings from "@/components/member/MemberSettings";
import MemberNotifications from "@/components/member/MemberNotifications";
import MemberApplyAgent from "@/components/member/MemberApplyAgent";
import MemberApplyAspirant from "@/components/member/MemberApplyAspirant";
import MemberApplyVolunteer from "@/components/member/MemberApplyVolunteer";
import MemberPvcSurvey from "@/components/member/MemberPvcSurvey";

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [surveyChecked, setSurveyChecked] = useState(false);
  const [surveyDone, setSurveyDone] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("pvc_surveys").select("id").eq("user_id", user.id).maybeSingle();
      const done = !!data;
      setSurveyDone(done);
      setSurveyChecked(true);
      if (!done) setActiveTab("pvc-survey");
    })();
  }, [user]);

  if (loading || (user && !surveyChecked)) {
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

  const handleTabChange = (tab: string) => {
    // Gate: if survey not done, force them to stay on survey
    if (!surveyDone && tab !== "pvc-survey") {
      setActiveTab("pvc-survey");
    } else {
      setActiveTab(tab);
    }
    if (isMobile) setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <MemberOverview onTabChange={handleTabChange} />;
      case "pvc-survey": return <MemberPvcSurvey onCompleted={() => { setSurveyDone(true); setActiveTab("dashboard"); }} />;
      case "report": return <MemberSubmitReport />;
      case "events": return <MemberEvents />;
      case "forum": return <MemberForum />;
      case "apply-agent": return <MemberApplyAgent />;
      case "apply-aspirant": return <MemberApplyAspirant />;
      case "apply-volunteer": return <MemberApplyVolunteer />;
      case "notifications": return <MemberNotifications />;
      case "profile": return <MemberProfile />;
      case "settings": return <MemberSettings />;
      default: return <MemberOverview onTabChange={handleTabChange} />;
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
              <MemberSidebar activeTab={activeTab} onTabChange={handleTabChange} />
            </div>
          </>
        )
      ) : (
        <MemberSidebar activeTab={activeTab} onTabChange={handleTabChange} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <MemberHeader />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default MemberDashboard;
