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
    // "user", "admin", unknown → the member dashboard
    default:           return "/dashboard";
  }
}

/** Business roles have their own dedicated dashboard route. */
export function hasOwnDashboard(role?: UserRole | string | null): boolean {
  return role === "vendor" || role === "trainer" || role === "gym_owner" || role === "influencer";
}
