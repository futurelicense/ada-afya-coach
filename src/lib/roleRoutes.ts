import type { UserRole } from "@/lib/userDataService";

/**
 * The home dashboard route for a given role.
 * Every user lands on the workspace that matches their role after auth / onboarding.
 */
export function dashboardPathForRole(role?: UserRole | string | null): string {
  switch (role) {
    case "vendor":     return "/vendor";
    case "trainer":    return "/trainer";
    case "gym_owner":  return "/gym";
    case "influencer": return "/influencer";
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
