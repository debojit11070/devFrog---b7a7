import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconTone = {
  brand: "bg-gradient-to-br from-secondary to-accent text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-primary/10 text-primary",
} as const;

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof iconTone;
}) {
  return (
    <Card className="flex items-start gap-4 p-5 transition-shadow hover:shadow-raised">
      <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", iconTone[tone])}>
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </Card>
  );
}
