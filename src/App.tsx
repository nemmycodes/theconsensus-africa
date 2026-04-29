import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LoginPortal from "./pages/LoginPortal";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import RoleRegister from "./pages/RoleRegister";
import Donate from "./pages/Donate";
import ElectionForm from "./pages/ElectionForm";
import ElectionPrimariesForm from "./pages/ElectionPrimariesForm";
import SituationRoom from "./pages/SituationRoom";
import SituationFeedRoom from "./pages/SituationFeedRoom";
import SituationRoomLogin from "./pages/SituationRoomLogin";
import Blog from "./pages/Blog";
import Events from "./pages/Events";
import Discuss from "./pages/Discuss";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import AgentLogin from "./pages/AgentLogin";
import AgentDashboard from "./pages/AgentDashboard";
import MemberDashboard from "./pages/MemberDashboard";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import KefCares from "./pages/KefCares";
import KefCaresDashboard from "./pages/KefCaresDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const CtrlQListener = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "q") {
        e.preventDefault();
        navigate("/admin");
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        navigate("/super-admin");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CtrlQListener />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<LoginPortal />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/join" element={<Onboarding />} />
            <Route path="/join/role/:role" element={<RoleRegister />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/election-form" element={<ElectionForm />} />
            <Route path="/election-form/primaries" element={<ElectionPrimariesForm />} />
            <Route path="/situation-room" element={<SituationRoom />} />
            <Route path="/situation-room/login" element={<SituationRoomLogin />} />
            <Route path="/situation-room/feed" element={<SituationFeedRoom />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/events" element={<Events />} />
            <Route path="/discuss" element={<Discuss />} />
            <Route path="/kef-cares" element={<KefCares />} />
            <Route path="/kef-cares/dashboard" element={<KefCaresDashboard />} />
            <Route path="/dashboard" element={<MemberDashboard />} />
            <Route path="/agent/login" element={<AgentLogin />} />
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/super-admin/login" element={<SuperAdminLogin />} />
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
