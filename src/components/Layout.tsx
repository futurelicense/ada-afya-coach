import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
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
          <header className="h-16 border-b bg-card flex items-center px-4 md:px-6 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-lg md:text-xl font-bold text-gradient">AI-Powered Wellness Coach</h2>
          </header>
          <main className="flex-1 p-4 md:p-6 bg-background overflow-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
