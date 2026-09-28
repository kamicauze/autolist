"use client";

import { Clock3, Heart, ListOrdered, Star, type LucideIcon } from "lucide-react";
import type { Icon3DTone } from "@/components/ui/icon-3d";
import type { Icon3DAssetKey } from "@/lib/constants/icon-3d-assets";
import { SellerStatCard } from "./seller-dashboard-ui";

// Icon components can't be passed from a server component, so the dashboard
// page sends an icon key and the icon is resolved on the client.
const DASHBOARD_STAT_ICONS = {
  listings: ListOrdered,
  pending: Clock3,
  favorites: Heart,
  reviews: Star,
} satisfies Record<string, LucideIcon>;

export type DashboardStat = {
  label: string;
  value: string;
  icon: keyof typeof DASHBOARD_STAT_ICONS;
  asset?: Icon3DAssetKey;
  tone?: Icon3DTone;
  note?: string;
};

export function DashboardStatCards({ stats }: { stats: DashboardStat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
      {stats.map(({ icon, ...item }) => (
        <SellerStatCard key={item.label} icon={DASHBOARD_STAT_ICONS[icon]} {...item} />
      ))}
    </div>
  );
}
