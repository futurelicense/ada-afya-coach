import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { ReactNode } from "react";
import wefitLogo from "@/assets/wefit-logo.png";
import { Bell, Search, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useUserData } from "@/hooks/useUserData";
import { useNavigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { profile } = useUserData();
  const initials = profile?.name
    ? profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "WF";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full smooth-scroll overflow-x-hidden bg-[#f7fbfa]">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top header */}
          <header className="min-h-14 md:min-h-[68px] border-b border-emerald-950/[0.06] bg-white/95 backdrop-blur-xl flex items-center gap-3 px-3 md:px-5 pt-[env(safe-area-inset-top)] sticky top-0 z-30">
            <SidebarTrigger className="w-9 h-9 rounded-xl border border-border/70 hover:bg-muted transition-colors" aria-label="Toggle sidebar" />
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('wefit:open-ada'))}
              className="md:hidden w-9 h-9 rounded-xl border border-border/70 hover:bg-muted transition-colors flex items-center justify-center"
              aria-label="Ask Coach Ada"
            >
              <Sparkles className="h-4 w-4 text-primary" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <img src={wefitLogo} alt="WeFit" className="w-4 h-4 object-contain" />
              </div>
              <span className="font-display font-extrabold text-base md:text-lg text-foreground truncate">WeFit</span>
              <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary sm:inline-flex">Beta</span>
            </div>
            <form
              className="relative hidden md:block w-full max-w-md ml-5"
              onSubmit={(event) => {
                event.preventDefault();
                const query = new FormData(event.currentTarget).get("q")?.toString().trim() ?? "";
                navigate(query ? `/explore?q=${encodeURIComponent(query)}` : "/explore");
              }}
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="q"
                aria-label="Search WeFit"
                placeholder="Search gyms, trainers, meals, or creators..."
                className="h-10 pl-10 rounded-xl border-0 bg-muted/65 focus-visible:ring-1"
              />
            </form>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                className="grid h-9 w-9 place-items-center rounded-xl hover:bg-muted"
                aria-label="Notification settings"
                onClick={() => navigate("/profile")}
              >
                <Bell className="h-4.5 w-4.5" />
              </button>
              <Avatar className="h-9 w-9 border border-primary/15">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 bg-[#f7fbfa] overflow-x-hidden animate-fade-in pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8"
          >
            {children}
          </main>

          <BottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}
