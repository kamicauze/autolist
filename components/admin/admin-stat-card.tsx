import type { LucideIcon } from "lucide-react";
import { Icon3D, Illustration3D } from "@/components/ui/icon-3d";
import type { Icon3DAssetKey } from "@/lib/constants/icon-3d-assets";

export function AdminStatCard({
  label,
  value,
  icon,
  asset,
  note,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  asset?: Icon3DAssetKey;
  note?: string;
}) {
  return (
    <div className="rounded-[16px] bg-[#fff7ed] px-5 py-4">
      <div className="flex items-center gap-4">
        {asset ? (
          <Illustration3D asset={asset} fallbackIcon={icon} className="h-12 w-12" />
        ) : (
          <Icon3D icon={icon} variant="soft" size="lg" />
        )}
        <div className="min-w-0">
          <p className="text-[14px] font-medium text-[#1f2937]">{label}</p>
          <div className="mt-1 flex items-center gap-3">
            <p className="font-heading text-[18px] font-semibold text-[#111827]">{value}</p>
            {note ? <span className="text-[13px] font-medium text-[#22c55e]">{note}</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
