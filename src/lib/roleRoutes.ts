import type { UserRole } from "@/lib/userDataService";

/**
 * The home dashboard route for a given role.
 * Every user lands on the workspace that matches their role after auth / onboarding.
 */
export function dashboardPathForRole(role?: UserRole | string | null): string {
  switch (role) {
    case "vendor":     return "/vendor-dashboard";
    case "trainer":    return "/trainer-dashboard";
    case "gym_owner":  return "/gym-owner-dashboard";
    case "influencer": return "/influencer-dashboard";
    case "admin":      return "/admin";
    // "user", unknown → the member dashboard
    default:           return "/dashboard";
  }
}

/** Roles that have their own dedicated dashboard route (not the member dashboard). */
export function hasOwnDashboard(role?: UserRole | string | null): boolean {
  return role === "vendor" || role === "trainer" || role === "gym_owner"
      || role === "influencer" || role === "admin";
}
