import type { LucideIcon } from "lucide-react";
import { PageHero } from "@/components/PageHero";

export function RolePageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <PageHero
      title={title}
      subtitle={subtitle}
      className="min-h-[148px] [&>div:last-child]:min-h-[148px] [&>div:last-child]:p-6"
    />
  );
}

export function RoleStatGrid({ items }: { items: { label: string; value: string; icon: LucideIcon }[] }) {
  const columns = items.length >= 4 ? "lg:grid-cols-4" : items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid grid-cols-2 gap-3 ${columns}`}>
      {items.map(({ label, value, icon: Icon }) => (
        <div key={label} className="rounded-2xl border border-emerald-950/[0.06] bg-white p-4 shadow-card">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <p className="text-2xl font-black tracking-tight text-[#10233f]">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
}
