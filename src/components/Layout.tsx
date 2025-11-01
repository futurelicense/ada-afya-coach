import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full smooth-scroll">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 md:h-16 border-b bg-card flex items-center px-3 md:px-6 sticky top-0 z-10 backdrop-blur-sm bg-card/95 transition-smooth">
            <SidebarTrigger className="mr-2 md:mr-4" />
            <h2 className="text-base md:text-lg lg:text-xl font-bold text-gradient truncate">AI-Powered Wellness Coach</h2>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 bg-background overflow-auto animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
