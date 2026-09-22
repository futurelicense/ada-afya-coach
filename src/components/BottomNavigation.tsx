import {
  Home, Dumbbell, UtensilsCrossed, MoreHorizontal, Compass, Users,
  CalendarDays, User, BarChart3, Radio, Package, Store, Building2,
  TrendingUp, Shield, Clock, Inbox, Share2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/useUserData";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const DASHBOARDS: Record<string, string> = {
  vendor: "/vendor",
  trainer: "/trainer",
  gym_owner: "/gym",
  influencer: "/influencer",
  admin: "/admin",
};

type MobileNavItem = { icon: typeof Home; label: string; path: string };

function navigationForRole(role: string | undefined, homePath: string) {
  const shared: MobileNavItem[] = [
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Compass, label: "Explore", path: "/explore" },
    { icon: Users, label: "Community", path: "/community" },
    { icon: CalendarDays, label: "My Bookings", path: "/my-bookings" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const byRole: Record<string, { primary: MobileNavItem[]; more: MobileNavItem[] }> = {
    vendor: {
      primary: [
        { icon: Store, label: "Workspace", path: homePath },
        { icon: Package, label: "Orders", path: "/vendor/orders" },
        { icon: UtensilsCrossed, label: "Menu", path: "/vendor/menu" },
        { icon: Compass, label: "Explore", path: "/explore" },
      ],
      more: [
        { icon: Compass, label: "Listing", path: "/vendor/listing" },
        { icon: Inbox, label: "Requests", path: "/vendor/requests" },
        ...shared.filter(item => item.path !== "/explore"),
      ],
    },
    trainer: {
      primary: [
        { icon: Dumbbell, label: "Workspace", path: homePath },
        { icon: CalendarDays, label: "Bookings", path: "/trainer/bookings" },
        { icon: Clock, label: "Availability", path: "/trainer/availability" },
        { icon: Radio, label: "Go Live", path: "/trainer/live" },
      ],
      more: [
        { icon: Users, label: "Clients", path: "/trainer/clients" },
        { icon: Compass, label: "Listing", path: "/trainer/listing" },
        { icon: Inbox, label: "Requests", path: "/trainer/requests" },
        ...shared,
      ],
    },
    gym_owner: {
      primary: [
        { icon: Building2, label: "Workspace", path: homePath },
        { icon: Users, label: "Members", path: "/gym/members" },
        { icon: BarChart3, label: "Plans", path: "/gym/plans" },
        { icon: Compass, label: "Explore", path: "/explore" },
      ],
      more: [
        { icon: Compass, label: "Listing", path: "/gym/listing" },
        { icon: Inbox, label: "Requests", path: "/gym/requests" },
        ...shared.filter(item => item.path !== "/explore"),
      ],
    },
    influencer: {
      primary: [
        { icon: TrendingUp, label: "Workspace", path: homePath },
        { icon: Share2, label: "Content", path: "/influencer/content" },
        { icon: Users, label: "Followers", path: "/influencer/followers" },
        { icon: Compass, label: "Explore", path: "/explore" },
      ],
      more: [
        { icon: Share2, label: "Partnerships", path: "/influencer/partnerships" },
        { icon: Compass, label: "Listing", path: "/influencer/listing" },
        { icon: Inbox, label: "Requests", path: "/influencer/requests" },
        ...shared.filter(item => item.path !== "/explore"),
      ],
    },
    admin: {
      primary: [
        { icon: Shield, label: "Admin", path: homePath },
        { icon: Compass, label: "Explore", path: "/explore" },
        { icon: Users, label: "Community", path: "/community" },
        { icon: User, label: "Profile", path: "/profile" },
      ],
      more: shared.filter(item => !["/explore", "/community", "/profile"].includes(item.path)),
    },
  };

  return byRole[role ?? ""] ?? {
    primary: [
      { icon: Home, label: "Home", path: homePath },
      { icon: Dumbbell, label: "Workouts", path: "/workouts" },
      { icon: UtensilsCrossed, label: "Nutrition", path: "/nutrition" },
      { icon: Compass, label: "Explore", path: "/explore" },
    ],
    more: shared.filter(item => item.path !== "/explore"),
  };
}

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserData();
  const homePath = DASHBOARDS[profile?.role ?? ""] ?? "/dashboard";
  const { primary: navItems, more: moreItems } = navigationForRole(profile?.role, homePath);
  const moreActive = moreItems.some((item) => location.pathname.startsWith(item.path));

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="h-[4.25rem] flex items-center justify-around px-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(`${item.path}/`));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className="relative flex flex-col items-center justify-center gap-1 w-14 py-1.5 rounded-2xl transition-all duration-300 active:scale-90"
            >
              {/* Active pill background */}
              {active && (
                <div className="absolute inset-0 rounded-2xl bg-primary/15 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)] animate-scale-in" />
              )}

              {/* Active indicator dot above icon */}
              {active && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary" />
              )}

              <item.icon
                className={cn(
                  "w-5 h-5 relative z-10 transition-all duration-300",
                  active ? "text-primary scale-110" : "text-muted-foreground/60"
                )}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span
                className={cn(
                  "text-[9px] font-medium relative z-10 transition-all duration-300 leading-none",
                  active ? "text-primary font-semibold" : "text-muted-foreground/50"
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        <Sheet>
          <SheetTrigger asChild>
            <button
              aria-label="More navigation options"
              aria-current={moreActive ? "page" : undefined}
              className="relative flex w-14 flex-col items-center justify-center gap-1 rounded-2xl py-1.5 transition-all duration-300 active:scale-90"
            >
              {moreActive && <div className="absolute inset-0 rounded-2xl bg-primary/15 shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.25)]" />}
              <MoreHorizontal className={cn("relative z-10 h-5 w-5", moreActive ? "text-primary" : "text-muted-foreground/60")} />
              <span className={cn("relative z-10 text-[9px] font-medium leading-none", moreActive ? "text-primary" : "text-muted-foreground/50")}>More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-3xl pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
            <SheetHeader className="text-left">
              <SheetTitle>More from WeFit</SheetTitle>
              <SheetDescription>All tools available for your current role.</SheetDescription>
            </SheetHeader>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {moreItems.map((item) => (
                <SheetClose asChild key={item.path}>
                  <button onClick={() => navigate(item.path)} className="flex min-h-14 items-center gap-3 rounded-xl border bg-card p-3 text-left hover:bg-muted">
                    <item.icon className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </SheetClose>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
