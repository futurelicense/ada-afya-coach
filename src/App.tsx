import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ScrollToTop } from "./components/ScrollToTop";
import { Layout } from "./components/Layout";
import { FloatingAIChat } from "./components/FloatingAIChat";
import { AuthProvider } from "./contexts/AuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute, GuestOnly } from "./components/ProtectedRoute";
import { PaymentReturnHandler } from "./components/PaymentReturnHandler";
import { trackPageView } from "./lib/analytics";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const Onboarding           = lazy(() => import("./pages/Onboarding"));
const Dashboard            = lazy(() => import("./pages/Dashboard"));
const Workouts             = lazy(() => import("./pages/Workouts"));
const Nutrition            = lazy(() => import("./pages/Nutrition"));
const Analytics            = lazy(() => import("./pages/Analytics"));
const Community            = lazy(() => import("./pages/Community"));
const Explore              = lazy(() => import("./pages/Explore"));
const Profile              = lazy(() => import("./pages/Profile"));
const RoleSelection        = lazy(() => import("./pages/RoleSelection"));
const VendorWorkspace      = lazy(() => import("./pages/VendorWorkspace"));
const TrainerWorkspace     = lazy(() => import("./pages/TrainerWorkspace"));
const GymWorkspace         = lazy(() => import("./pages/GymWorkspace"));
const InfluencerWorkspace  = lazy(() => import("./pages/InfluencerWorkspace"));
const AdminDashboard       = lazy(() => import("./pages/AdminDashboard"));
const CreatorProfile       = lazy(() => import("./pages/CreatorProfile"));
const About                = lazy(() => import("./pages/About"));
const Blog                 = lazy(() => import("./pages/Blog"));
const Careers              = lazy(() => import("./pages/Careers"));
const Pricing              = lazy(() => import("./pages/Pricing"));
const Privacy              = lazy(() => import("./pages/Privacy"));
const Terms                = lazy(() => import("./pages/Terms"));
const Security             = lazy(() => import("./pages/Security"));
const ResetPassword        = lazy(() => import("./pages/ResetPassword"));

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

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <PageViewTracker />
              <PaymentReturnHandler />
              <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path="/"                        element={<Index />} />
                    <Route path="/auth"                    element={<GuestOnly><Auth /></GuestOnly>} />
                    <Route path="/reset-password"          element={<ResetPassword />} />
                    <Route path="/onboarding"              element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                    <Route path="/role-selection"          element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
                    <Route path="/about"                   element={<About />} />
                    <Route path="/blog"                    element={<Blog />} />
                    <Route path="/careers"                 element={<Careers />} />
                    <Route path="/pricing"                 element={<Pricing />} />
                    <Route path="/privacy"                 element={<Privacy />} />
                    <Route path="/terms"                   element={<Terms />} />
                    <Route path="/security"                element={<Security />} />
                    <Route path="/creator/:id"            element={<CreatorProfile />} />
                    <Route path="/dashboard"               element={<AppShell><Dashboard /></AppShell>} />
                    <Route path="/vendor"                 element={<ProtectedRoute allowedRoles={["vendor"]}><Layout><VendorWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/vendor/:section"         element={<ProtectedRoute allowedRoles={["vendor"]}><Layout><VendorWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/trainer"                element={<ProtectedRoute allowedRoles={["trainer"]}><Layout><TrainerWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/trainer/:section"        element={<ProtectedRoute allowedRoles={["trainer"]}><Layout><TrainerWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/gym"                    element={<ProtectedRoute allowedRoles={["gym_owner"]}><Layout><GymWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/gym/:section"            element={<ProtectedRoute allowedRoles={["gym_owner"]}><Layout><GymWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/influencer"             element={<ProtectedRoute allowedRoles={["influencer"]}><Layout><InfluencerWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/influencer/:section"     element={<ProtectedRoute allowedRoles={["influencer"]}><Layout><InfluencerWorkspace /></Layout></ProtectedRoute>} />
                    <Route path="/admin"                  element={<ProtectedRoute allowedRoles={["admin"]}><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
                    {/* legacy dashboard paths */}
                    <Route path="/vendor-dashboard"        element={<Navigate to="/vendor" replace />} />
                    <Route path="/trainer-dashboard"       element={<Navigate to="/trainer" replace />} />
                    <Route path="/gym-owner-dashboard"     element={<Navigate to="/gym" replace />} />
                    <Route path="/influencer-dashboard"    element={<Navigate to="/influencer" replace />} />
                    <Route path="/workouts"                element={<AppShell><Workouts /></AppShell>} />
                    <Route path="/nutrition"               element={<AppShell><Nutrition /></AppShell>} />
                    <Route path="/analytics"               element={<AppShell><Analytics /></AppShell>} />
                    <Route path="/explore"                 element={<AppShell><Explore /></AppShell>} />
                    <Route path="/community"               element={<AppShell><Community /></AppShell>} />
                    <Route path="/profile"                 element={<AppShell><Profile /></AppShell>} />
                    <Route path="*"                        element={<NotFound />} />
                </Routes>
              </Suspense>
              <FloatingAIChat />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
