import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
}: StatsCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-white p-4 shadow-sm">
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
          iconBg
        )}
      >
        <Icon className={cn("h-6 w-6", iconColor)} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
