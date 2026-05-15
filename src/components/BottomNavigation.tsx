import { Home, Dumbbell, UtensilsCrossed, BarChart3, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home,          label: "Home",      path: "/dashboard" },
  { icon: Dumbbell,      label: "Workouts",  path: "/workouts" },
  { icon: UtensilsCrossed, label: "Nutrition", path: "/nutrition" },
  { icon: BarChart3,     label: "Analytics", path: "/analytics" },
  { icon: User,          label: "Profile",   path: "/profile" },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <div className="h-[4.25rem] flex items-center justify-around px-1">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path;
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
      </div>
    </nav>
  );
}
