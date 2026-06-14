"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Ban, LockOpen } from "lucide-react";
import { setUserAccountDeactivated } from "@/lib/actions/admin-users";

export function AdminUserDeactivateControl({
  userId,
  isDeactivated,
}: {
  userId: string;
  isDeactivated: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);

  const nextDeactivated = !isDeactivated;

  const handleClick = () => {
    const confirmed = window.confirm(
      nextDeactivated
        ? "Deactivate this account? The user will be signed out and unable to log in."
        : "Reactivate this account? The user will be able to log in again."
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await setUserAccountDeactivated(userId, nextDeactivated);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={
          "inline-flex h-10 items-center gap-2 rounded-[12px] border px-4 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 " +
          (isDeactivated
            ? "border-[#bbf7d0] bg-white text-[#16a34a] hover:bg-[#f0fdf4]"
            : "border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fff1f2]")
        }
      >
        {isDeactivated ? <LockOpen className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
        {isPending
          ? "Saving..."
          : isDeactivated
            ? "Reactivate account"
            : "Deactivate account"}
      </button>
      {error ? <span className="text-[12px] text-[#dc2626]">{error}</span> : null}
    </div>
  );
}
