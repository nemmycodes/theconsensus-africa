import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SituationLayout, { SRTab } from "@/components/situation-room/SituationLayout";
import SROverview from "@/components/situation-room/SROverview";
import SRCollation from "@/components/situation-room/SRCollation";
import SRReports from "@/components/situation-room/SRReports";
import SRUsers from "@/components/situation-room/SRUsers";
import SRSettings from "@/components/situation-room/SRSettings";
import SituationFeed from "@/components/situation/SituationFeed";

const SituationFeedRoom = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SRTab>("home");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/situation-room/login", { replace: true });
      return;
    }
    if (!sessionStorage.getItem("sr_self_role")) {
      navigate("/situation-room/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading || !user) return null;

  return (
    <SituationLayout active={tab} onChange={setTab}>
      {tab === "home" && (
        <div className="space-y-8">
          <SituationFeed />
          <SROverview />
        </div>
      )}
      {tab === "collation" && <SRCollation />}
      {tab === "reports" && <SRReports />}
      {tab === "users" && <SRUsers />}
      {tab === "settings" && <SRSettings />}
    </SituationLayout>
  );
};

export default SituationFeedRoom;
