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
  const { user, loading, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SRTab>("home");
  const canSeeUsers = isAdmin || isSuperAdmin;

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

  useEffect(() => {
    const restricted: SRTab[] = ["users", "settings"];
    if (restricted.includes(tab) && !canSeeUsers) setTab("home");
  }, [tab, canSeeUsers]);

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
      {tab === "users" && canSeeUsers && <SRUsers />}
      {tab === "settings" && canSeeUsers && <SRSettings />}
    </SituationLayout>
  );
};

export default SituationFeedRoom;
