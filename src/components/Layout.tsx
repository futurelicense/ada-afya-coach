import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { ReactNode } from "react";
import wefitLogo from "@/assets/wefit-logo.png";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full smooth-scroll overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top header */}
          <header className="h-14 md:h-16 border-b border-border/50 glass flex items-center px-3 md:px-6 sticky top-0 z-10 transition-smooth">
            <SidebarTrigger className="mr-3 md:mr-4 w-8 h-8 rounded-lg hover:bg-muted transition-colors" aria-label="Toggle sidebar" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <img src={wefitLogo} alt="WeFit" className="w-4 h-4 object-contain" />
              </div>
              <span className="font-display font-bold text-base md:text-lg text-gradient truncate">WeFit</span>
            </div>
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 p-3 sm:p-4 md:p-6 bg-background overflow-x-hidden animate-fade-in pb-24 md:pb-8"
          >
            {children}
          </main>

          <BottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}
