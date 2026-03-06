"use client";

import {
  Home, Dumbbell, Utensils, User, Users, Activity, BarChart3, Compass,
  Store, Building2, TrendingUp, LogOut, ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import wefitLogo from "@/assets/wefit-logo.png";
import { useUserData } from "@/hooks/useUserData";

const userNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: Activity },
  { title: "Workouts", url: "/workouts", icon: Dumbbell },
  { title: "Nutrition", url: "/nutrition", icon: Utensils },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Community", url: "/community", icon: Users },
  { title: "Profile", url: "/profile", icon: User },
];

const vendorNavItems = [
  { title: "Vendor Dashboard", url: "/vendor-dashboard", icon: Store },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Profile", url: "/profile", icon: User },
];

const trainerNavItems = [
  { title: "Trainer Dashboard", url: "/trainer-dashboard", icon: Dumbbell },
  { title: "Workouts", url: "/workouts", icon: Activity },
  { title: "Community", url: "/community", icon: Users },
  { title: "Profile", url: "/profile", icon: User },
];

const gymOwnerNavItems = [
  { title: "Gym Dashboard", url: "/gym-owner-dashboard", icon: Building2 },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Explore", url: "/explore", icon: Compass },
  { title: "Profile", url: "/profile", icon: User },
];

const influencerNavItems = [
  { title: "Influencer Hub", url: "/influencer-dashboard", icon: TrendingUp },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Community", url: "/community", icon: Users },
  { title: "Profile", url: "/profile", icon: User },
];

const roleConfig: Record<string, { label: string; color: string; navItems: typeof userNavItems }> = {
  vendor:     { label: "Meal Vendor",    color: "bg-orange-500",  navItems: vendorNavItems },
  trainer:    { label: "Trainer",        color: "bg-blue-500",    navItems: trainerNavItems },
  "gym-owner":{ label: "Gym Owner",      color: "bg-green-500",   navItems: gymOwnerNavItems },
  influencer: { label: "Influencer",     color: "bg-purple-500",  navItems: influencerNavItems },
  user:       { label: "Member",         color: "bg-primary",     navItems: userNavItems },
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { profile } = useUserData();

  const role = (typeof window !== "undefined" ? localStorage.getItem("userRole") : null) || "user";
  const config = roleConfig[role] ?? roleConfig["user"];
  const navItems = config.navItems;

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/role-selection");
  };

  return (
    <Sidebar collapsible="icon" className="bg-slate-950 border-r border-slate-800">
      <SidebarContent className="bg-slate-950">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <img
            src={wefitLogo}
            alt="WeFit"
            className={`${collapsed ? "w-6 h-6" : "w-8 h-8"} object-contain`}
          />
          {!collapsed && <h1 className="font-bold text-xl text-gradient">WeFit</h1>}
        </div>

        {/* Role label */}
        {!collapsed && (
          <div className="px-4 pb-2">
            <Badge className={`${config.color} text-white text-xs`}>{config.label}</Badge>
          </div>
        )}

        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider">Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-smooth ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User info footer */}
      <SidebarFooter className="bg-slate-950 border-t border-slate-800 p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className={`${config.color} text-white text-xs`}>{initials}</AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-slate-800"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9 flex-shrink-0">
              <AvatarFallback className={`${config.color} text-white text-xs font-semibold`}>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name || "User"}</p>
              <p className="text-xs text-slate-400 truncate">{config.label}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-slate-400 hover:text-red-400 hover:bg-slate-800 flex-shrink-0"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-2 text-slate-400 hover:text-white hover:bg-slate-800 justify-between text-xs"
            onClick={() => navigate("/role-selection")}
          >
            Switch Role <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
