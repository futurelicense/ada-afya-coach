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
    <div className={cn("relative overflow-hidden rounded-[1.35rem] border border-primary/10 shadow-card min-h-[190px]", className)}
         style={{ background: "linear-gradient(110deg, hsl(150 55% 96%) 0%, hsl(145 52% 92%) 55%, hsl(158 48% 88%) 100%)" }}>
      <div className="absolute -top-16 -right-16 w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-secondary/10 rounded-full blur-[80px] pointer-events-none float" style={{ animationDelay: "2s" }} />
      <div className="absolute -bottom-10 left-[42%] h-32 w-32 rounded-full bg-white/25" />
      <div className="absolute -top-10 right-1/4 h-24 w-24 rounded-full border-[18px] border-white/20" />

      {image && (
        <div className="absolute inset-y-0 right-[12%] hidden w-[38%] lg:block">
          <img src={image} alt="" className="h-full w-full object-cover object-center mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#eaf9f1] via-transparent to-transparent" />
        </div>
      )}

      <div className="relative z-10 flex min-h-[190px] flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div className="space-y-3 flex-1 max-w-[58%] max-lg:max-w-full">
          <h1 className="text-3xl lg:text-[2.65rem] leading-none font-display font-black tracking-tight text-[#10233f]">{title}</h1>
          <p className="text-muted-foreground text-sm lg:text-base max-w-xl">{subtitle}</p>
          {pills && pills.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {pills.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1.5 text-xs font-medium text-[#294056]">
                  <Icon className="h-3.5 w-3.5 text-primary" /> {label}
                </span>
              ))}
            </div>
          )}
          {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
        </div>

        {(scriptText || quote) && (
          <div className="hidden lg:flex w-[18%] flex-col items-center gap-3 shrink-0 text-center">
            {scriptText && <span className="font-script text-2xl leading-tight text-primary -rotate-2">{scriptText}</span>}
            {quote && (
              <p className="max-w-[10rem] text-xs leading-snug text-muted-foreground">"{quote}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
