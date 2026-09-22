import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
}

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  compact?: boolean;
  className?: string;
}

/** Shared empty-state block: icon + title + optional description/CTA, so every "nothing here yet" screen looks and reads the same way. */
export function EmptyState({ icon: Icon, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "py-6 px-4" : "py-10 px-4", className)}>
      <div className={cn("rounded-2xl bg-muted flex items-center justify-center mb-3", compact ? "h-9 w-9" : "h-12 w-12")}>
        <Icon className={cn("text-muted-foreground", compact ? "h-4 w-4" : "h-6 w-6")} />
      </div>
      <p className="text-sm font-medium">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>}
      {action && (
        <Button asChild={!!action.to} size="sm" variant="outline" className="mt-4" onClick={action.onClick}>
          {action.to ? <Link to={action.to}>{action.label}</Link> : <span>{action.label}</span>}
        </Button>
      )}
    </div>
  );
}
