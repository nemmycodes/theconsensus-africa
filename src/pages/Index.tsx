import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import EventsSection from "@/components/EventsSection";
import NewsSection from "@/components/NewsSection";
import CtaBanner from "@/components/CtaBanner";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import AiChatWidget from "@/components/AiChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <EventsSection />
      <NewsSection />
      <CtaBanner />
      <FaqSection />
      <Footer />
      <AiChatWidget />
    </div>
  );
};

export default Index;
