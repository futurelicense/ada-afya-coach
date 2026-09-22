import type { UserRole } from "@/lib/userDataService";

/**
 * One color per role, reused everywhere a role needs to be visually
 * identified (sidebar badge, role picker, workspace dashboard accents).
 * Vendor/trainer/gym map onto the app's existing secondary/info/success
 * tokens rather than raw Tailwind hues, so they track the design system's
 * light/dark values. Influencer has no existing token to reuse, so it's a
 * literal Tailwind color — but defined once, here, instead of per-file.
 */
export const ROLE_KEYS = ["user", "vendor", "trainer", "gym_owner", "influencer"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

interface RoleTheme {
  label: string;
  icon: string;   // text color for icons/accents
  bg: string;      // tinted background for icon chips
  badge: string;   // pill badge classes (bg + text + border)
  border: string;  // card border accent
}

export const ROLE_THEME: Record<RoleKey, RoleTheme> = {
  user: {
    label: "Member",
    icon: "text-primary",
    bg: "bg-primary/15",
    badge: "bg-primary/20 text-primary border-primary/30",
    border: "border-primary/20",
  },
  vendor: {
    label: "Meal Vendor",
    icon: "text-secondary",
    bg: "bg-secondary/15",
    badge: "bg-secondary/20 text-secondary border-secondary/30",
    border: "border-secondary/20",
  },
  trainer: {
    label: "Trainer",
    icon: "text-info",
    bg: "bg-info/15",
    badge: "bg-info/20 text-info border-info/30",
    border: "border-info/20",
  },
  gym_owner: {
    label: "Gym Owner",
    icon: "text-success",
    bg: "bg-success/15",
    badge: "bg-success/20 text-success border-success/30",
    border: "border-success/20",
  },
  influencer: {
    label: "Influencer",
    icon: "text-pink-400",
    bg: "bg-pink-500/15",
    badge: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    border: "border-pink-500/20",
  },
};

export function roleTheme(role: UserRole | RoleKey): RoleTheme {
  return ROLE_THEME[role as RoleKey] ?? ROLE_THEME.user;
}
