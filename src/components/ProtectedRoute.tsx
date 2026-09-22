import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserData } from "@/hooks/useUserData";
import type { UserRole } from "@/lib/userDataService";
import { dashboardPathForRole, hasOwnDashboard } from "@/lib/roleRoutes";

function RouteSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" aria-live="polite" aria-busy="true">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" role="status">
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserData();
  const location = useLocation();

  if (loading) return <RouteSpinner />;
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />;

  if (profile && !profile.onboardingDone && location.pathname !== "/onboarding" && location.pathname !== "/role-selection") {
    return <Navigate to="/onboarding" replace />;
  }

  if (allowedRoles) {
    if (profileLoading && !profile) return <RouteSpinner />;
    const role = profile?.role ?? "user";
    if (!allowedRoles.includes(role)) {
      return <Navigate to={dashboardPathForRole(role)} replace />;
    }
  }

  // Route every user to their own dashboard: a business role that lands on the
  // generic member dashboard is bounced to its dedicated workspace.
  if (!allowedRoles && location.pathname === "/dashboard" && profile && hasOwnDashboard(profile.role)) {
    return <Navigate to={dashboardPathForRole(profile.role)} replace />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useUserData();

  if (loading) return <RouteSpinner />;
  if (user) {
    if (profileLoading && !profile) return <RouteSpinner />;
    if (profile && !profile.onboardingDone) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to={dashboardPathForRole(profile?.role)} replace />;
  }
  return <>{children}</>;
}
