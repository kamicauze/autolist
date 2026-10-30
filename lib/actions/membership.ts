"use server";

import type { SellerPackagePlanId } from "@/lib/types/membership";

export async function activateSellerPackagePlan(planId: SellerPackagePlanId) {
  // Keep the existing action contract while purchases are paused for the pilot.
  void planId;
  return {
    error: "Paid packages are unavailable during the free pilot. You can create and submit listings without purchasing a package.",
  };
}
