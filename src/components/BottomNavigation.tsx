import { Home, Dumbbell, UtensilsCrossed, TrendingUp, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Dumbbell, label: "Workouts", path: "/workouts" },
    { icon: UtensilsCrossed, label: "Nutrition", path: "/nutrition" },
    { icon: TrendingUp, label: "Progress", path: "/analytics" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bottom-nav">
      <div className="h-16 flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl transition-all duration-300",
                "min-w-[60px] relative",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <div className="absolute inset-0 bg-primary/10 rounded-xl animate-scale-in" />
              )}
              <Icon className={cn(
                "w-5 h-5 relative z-10 transition-transform duration-300",
                active && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] font-medium relative z-10",
                active && "font-semibold"
              )}>
                {item.label}
              </span>
              {active && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary pulse-dot" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
