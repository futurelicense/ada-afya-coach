import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { Layout } from "./components/Layout";
import { FloatingAIChat } from "./components/FloatingAIChat";
import { AuthProvider } from "./contexts/AuthContext";
import { trackPageView } from "./lib/analytics";

// Eagerly load critical path pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy-load everything else
const Onboarding           = lazy(() => import("./pages/Onboarding"));
const Dashboard            = lazy(() => import("./pages/Dashboard"));
const Workouts             = lazy(() => import("./pages/Workouts"));
const Nutrition            = lazy(() => import("./pages/Nutrition"));
const Analytics            = lazy(() => import("./pages/Analytics"));
const Community            = lazy(() => import("./pages/Community"));
const Explore              = lazy(() => import("./pages/Explore"));
const Profile              = lazy(() => import("./pages/Profile"));
const RoleSelection        = lazy(() => import("./pages/RoleSelection"));
const VendorDashboard      = lazy(() => import("./pages/VendorDashboard"));
const TrainerDashboard     = lazy(() => import("./pages/TrainerDashboard"));
const GymOwnerDashboard    = lazy(() => import("./pages/GymOwnerDashboard"));
const InfluencerDashboard  = lazy(() => import("./pages/InfluencerDashboard"));
const About                = lazy(() => import("./pages/About"));
const Blog                 = lazy(() => import("./pages/Blog"));
const Careers              = lazy(() => import("./pages/Careers"));
const Pricing              = lazy(() => import("./pages/Pricing"));

function PageViewTracker() {
  const { pathname } = useLocation();
  useEffect(() => { trackPageView(pathname); }, [pathname]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" aria-live="polite" aria-busy="true">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" role="status">
        <span className="sr-only">Loading page…</span>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <PageViewTracker />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                  <Route path="/"                        element={<Index />} />
                  <Route path="/auth"                    element={<Auth />} />
                  <Route path="/onboarding"              element={<Onboarding />} />
                  <Route path="/role-selection"          element={<RoleSelection />} />
                  <Route path="/about"                   element={<About />} />
                  <Route path="/blog"                    element={<Blog />} />
                  <Route path="/careers"                 element={<Careers />} />
                  <Route path="/pricing"                 element={<Pricing />} />
                  <Route path="/dashboard"               element={<Layout><Dashboard /></Layout>} />
                  <Route path="/vendor-dashboard"        element={<Layout><VendorDashboard /></Layout>} />
                  <Route path="/trainer-dashboard"       element={<Layout><TrainerDashboard /></Layout>} />
                  <Route path="/gym-owner-dashboard"     element={<Layout><GymOwnerDashboard /></Layout>} />
                  <Route path="/influencer-dashboard"    element={<Layout><InfluencerDashboard /></Layout>} />
                  <Route path="/workouts"                element={<Layout><Workouts /></Layout>} />
                  <Route path="/nutrition"               element={<Layout><Nutrition /></Layout>} />
                  <Route path="/analytics"               element={<Layout><Analytics /></Layout>} />
                  <Route path="/explore"                 element={<Layout><Explore /></Layout>} />
                  <Route path="/community"               element={<Layout><Community /></Layout>} />
                  <Route path="/profile"                 element={<Layout><Profile /></Layout>} />
                  <Route path="*"                        element={<NotFound />} />
              </Routes>
            </Suspense>
            <FloatingAIChat />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
