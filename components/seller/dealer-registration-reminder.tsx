import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DealerRegistrationReminder({ showAction = true }: { showAction?: boolean }) {
  return (
    <aside
      aria-label="Incomplete dealer profile"
      className={cn(
        "rounded-xl border border-[#f3d7a4] bg-[#fff7e8] p-4 text-[#924500]",
        showAction && "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
      )}
    >
      <div className="flex items-start gap-2.5">
        <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
        <div>
          <p className="font-bold">Your profile is incomplete</p>
          <p className="mt-1 text-sm">
            {showAction
              ? "Finish verification whenever you’re ready. You can keep adding listings."
              : "Finish verification to apply for the verified dealer badge."}
          </p>
        </div>
      </div>
      {showAction && (
        <Button asChild variant="outline" className="h-11 shrink-0 rounded-lg bg-white font-bold">
          <Link href="/dashboard/verification">Finish verification</Link>
        </Button>
      )}
    </aside>
  );
}
