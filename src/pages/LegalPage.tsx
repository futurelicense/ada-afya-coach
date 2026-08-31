import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <span className="font-bold text-lg text-gradient ml-auto">WeFit</span>
          </div>
        </div>
      </nav>
      <article className="pt-24 pb-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
        <p className="text-xs text-muted-foreground">Last updated: 29 August 2026</p>
        <div className="prose prose-invert max-w-none space-y-4 text-sm text-muted-foreground leading-relaxed">
          {children}
        </div>
      </article>
    </div>
  );
}
