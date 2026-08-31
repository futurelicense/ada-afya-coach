"use client";

import {
  Dumbbell, Utensils, User, Users, Activity, BarChart3, Compass,
  Store, Building2, TrendingUp, LogOut, ChevronRight, Sparkles, Shield,
  Package, Inbox, CalendarDays, Clock, Radio, Share2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import wefitLogo from "@/assets/wefit-logo.png";
import { useUserData } from "@/hooks/useUserData";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = { title: string; url: string; icon: typeof Activity; end?: boolean };

const userNavItems: NavItem[] = [
  { title: "Dashboard",  url: "/dashboard",  icon: Activity, end: true },
  { title: "Workouts",   url: "/workouts",   icon: Dumbbell },
  { title: "Nutrition",  url: "/nutrition",  icon: Utensils },
  { title: "Analytics",  url: "/analytics",  icon: BarChart3 },
  { title: "Explore",    url: "/explore",    icon: Compass },
  { title: "Community",  url: "/community",  icon: Users },
  { title: "Profile",    url: "/profile",    icon: User },
];
const vendorNavItems: NavItem[] = [
  { title: "Dashboard", url: "/vendor",          icon: Store, end: true },
  { title: "Menu",      url: "/vendor/menu",     icon: Utensils },
  { title: "Orders",    url: "/vendor/orders",   icon: Package },
  { title: "Listing",   url: "/vendor/listing",  icon: Compass },
  { title: "Requests",  url: "/vendor/requests", icon: Inbox },
  { title: "Explore",   url: "/explore",         icon: Compass },
  { title: "Profile",   url: "/profile",         icon: User },
];
const trainerNavItems: NavItem[] = [
  { title: "Dashboard",    url: "/trainer",             icon: Dumbbell, end: true },
  { title: "Bookings",     url: "/trainer/bookings",    icon: CalendarDays },
  { title: "Clients",      url: "/trainer/clients",     icon: Users },
  { title: "Availability", url: "/trainer/availability", icon: Clock },
  { title: "Go Live",      url: "/trainer/live",        icon: Radio },
  { title: "Listing",      url: "/trainer/listing",     icon: Compass },
  { title: "Requests",     url: "/trainer/requests",    icon: Inbox },
  { title: "Profile",      url: "/profile",             icon: User },
];
const gymOwnerNavItems: NavItem[] = [
  { title: "Dashboard", url: "/gym",          icon: Building2, end: true },
  { title: "Members",   url: "/gym/members",  icon: Users },
  { title: "Plans",     url: "/gym/plans",    icon: BarChart3 },
  { title: "Listing",   url: "/gym/listing",  icon: Compass },
  { title: "Requests",  url: "/gym/requests", icon: Inbox },
  { title: "Profile",   url: "/profile",      icon: User },
];
const influencerNavItems: NavItem[] = [
  { title: "Dashboard",    url: "/influencer",              icon: TrendingUp, end: true },
  { title: "Content",      url: "/influencer/content",      icon: Activity },
  { title: "Followers",    url: "/influencer/followers",    icon: Users },
  { title: "Partnerships", url: "/influencer/partnerships", icon: Share2 },
  { title: "Listing",      url: "/influencer/listing",      icon: Compass },
  { title: "Requests",     url: "/influencer/requests",     icon: Inbox },
  { title: "Profile",      url: "/profile",                 icon: User },
];
const adminNavItems: NavItem[] = [
  { title: "Admin",     url: "/admin",     icon: Shield },
  { title: "Explore",   url: "/explore",   icon: Compass },
  { title: "Community", url: "/community", icon: Users },
  { title: "Profile",   url: "/profile",   icon: User },
];

const roleConfig: Record<string, { label: string; badge: string; navItems: NavItem[] }> = {
  vendor:      { label: "Meal Vendor",  badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",   navItems: vendorNavItems },
  trainer:     { label: "Trainer",      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",       navItems: trainerNavItems },
  "gym-owner": { label: "Gym Owner",    badge: "bg-green-500/20 text-green-400 border-green-500/30",    navItems: gymOwnerNavItems },
  influencer:  { label: "Influencer",   badge: "bg-pink-500/20 text-pink-400 border-pink-500/30",       navItems: influencerNavItems },
  admin:       { label: "Admin",        badge: "bg-red-500/20 text-red-400 border-red-500/30",          navItems: adminNavItems },
  user:        { label: "Member",       badge: "bg-primary/20 text-primary border-primary/30",          navItems: userNavItems },
};

export function AppSidebar() {
  const { state }  = useSidebar();
  const collapsed  = state === "collapsed";
  const navigate   = useNavigate();
  const { profile } = useUserData();
  const { signOut } = useAuth();

  const roleKey =
    profile?.role === "gym_owner" ? "gym-owner" :
    profile?.role && profile.role in roleConfig ? profile.role :
    "user";
  const config = roleConfig[roleKey] ?? roleConfig["user"];

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="bg-sidebar">
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 pt-5 pb-4 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <img src={wefitLogo} alt="WeFit" className="w-5 h-5 object-contain" />
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-lg text-gradient">WeFit</span>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="px-4 pb-3">
            <Badge className={`text-xs ${config.badge}`}>{config.label}</Badge>
          </div>
        )}

        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-muted-foreground/60 text-[10px] uppercase tracking-widest px-4 mb-1">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {config.navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-primary/15 text-primary font-semibold shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.2)]"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Upgrade nudge */}
        {!collapsed && (
          <div className="mx-3 mt-auto mb-2">
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <p className="text-xs font-semibold text-primary">Pro features</p>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Unlock AI Coach, Live Streams & unlimited workouts.
              </p>
              <Button
                size="sm"
                className="w-full text-xs h-7 shadow-glow"
                onClick={() => navigate("/pricing")}
              >
                Upgrade — ₦2,500/mo
              </Button>
            </div>
          </div>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost" size="icon"
              className="w-8 h-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
              onClick={async () => { await signOut(); navigate("/auth"); }}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-1">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{profile?.name || "User"}</p>
                <p className="text-xs text-muted-foreground/60 truncate">{config.label}</p>
              </div>
              <Button
                variant="ghost" size="icon"
                className="w-7 h-7 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={async () => { await signOut(); navigate("/auth"); }}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button
              variant="ghost" size="sm"
              className="w-full text-muted-foreground/50 hover:text-foreground hover:bg-sidebar-accent justify-between text-xs h-7"
              onClick={() => navigate("/role-selection")}
            >
              Switch role <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
