import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { FloatingAIChat } from "./components/FloatingAIChat";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Analytics from "./pages/Analytics";
import Community from "./pages/Community";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import RoleSelection from "./pages/RoleSelection";
import VendorDashboard from "./pages/VendorDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import GymOwnerDashboard from "./pages/GymOwnerDashboard";
import InfluencerDashboard from "./pages/InfluencerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/vendor-dashboard" element={<Layout><VendorDashboard /></Layout>} />
          <Route path="/trainer-dashboard" element={<Layout><TrainerDashboard /></Layout>} />
          <Route path="/gym-owner-dashboard" element={<Layout><GymOwnerDashboard /></Layout>} />
          <Route path="/influencer-dashboard" element={<Layout><InfluencerDashboard /></Layout>} />
          <Route path="/workouts" element={<Layout><Workouts /></Layout>} />
          <Route path="/nutrition" element={<Layout><Nutrition /></Layout>} />
          <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
          <Route path="/explore" element={<Layout><Explore /></Layout>} />
          <Route path="/community" element={<Layout><Community /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingAIChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
