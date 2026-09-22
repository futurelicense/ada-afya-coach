import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface HeroPill {
  icon: LucideIcon;
  label: string;
}

interface PageHeroProps {
  title: string;
  subtitle: string;
  pills?: HeroPill[];
  scriptText?: string;
  quote?: string;
  image?: string;
  actions?: ReactNode;
  className?: string;
}

/** Shared banner used at the top of every member-facing page: soft green gradient, dot texture, floating photo + hand-written caption + quote chip on desktop. */
export function PageHero({ title, subtitle, pills, scriptText, quote, image, actions, className }: PageHeroProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl shadow-premium border border-primary/10", className)}
         style={{ background: "linear-gradient(135deg, hsl(150 45% 94%) 0%, hsl(140 40% 90%) 100%)" }}>
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary/15 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-secondary/10 rounded-full blur-[80px] pointer-events-none float" style={{ animationDelay: "2s" }} />
      <div className="absolute inset-0 opacity-[0.05]"
           style={{ backgroundImage: "radial-gradient(circle at 2px 2px, hsl(158 60% 20%) 1px, transparent 0)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 flex-1">
          <h1 className="text-3xl lg:text-4xl font-display font-black text-foreground">{title}</h1>
          <p className="text-muted-foreground text-base lg:text-lg max-w-xl">{subtitle}</p>
          {pills && pills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {pills.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 bg-white/70 border border-border rounded-full px-3 py-1.5 text-xs font-medium shadow-card">
                  <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                </span>
              ))}
            </div>
          )}
          {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
        </div>

        {image && (
          <div className="hidden lg:flex flex-col items-center gap-2 shrink-0">
            {scriptText && <span className="font-script text-2xl text-primary -rotate-2">{scriptText}</span>}
            <div className="relative w-40 h-40 rounded-2xl overflow-hidden shadow-premium border-4 border-white">
              <img src={image} alt="" className="w-full h-full object-cover" />
            </div>
            {quote && (
              <div className="glass rounded-xl px-3 py-2 text-center max-w-[10rem] -mt-4 shadow-card">
                <p className="text-[11px] text-muted-foreground leading-snug">"{quote}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
