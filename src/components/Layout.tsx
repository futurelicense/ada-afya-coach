import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { BottomNavigation } from "./BottomNavigation";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full smooth-scroll overflow-x-hidden">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b glass flex items-center px-3 md:px-6 sticky top-0 z-10 shadow-sm transition-smooth">
            <SidebarTrigger className="mr-2 md:mr-4 hover-scale" />
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-gradient truncate">FitNaija Coach</h2>
          </header>
          <main className="flex-1 p-2 sm:p-3 md:p-6 bg-background overflow-x-hidden animate-fade-in pb-20 md:pb-6">
            {children}
          </main>
          <BottomNavigation />
        </div>
      </div>
    </SidebarProvider>
  );
}
