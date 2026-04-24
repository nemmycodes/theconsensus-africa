import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SituationFeed from "@/components/situation/SituationFeed";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SituationFeedRoom = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-6">
        <Button variant="ghost" size="sm" onClick={() => navigate("/situation-room")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Situation Room
        </Button>
      </div>
      <SituationFeed />
      <Footer />
    </div>
  );
};

export default SituationFeedRoom;

