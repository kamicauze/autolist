import { AdminPlaceholderPage } from "@/components/admin/admin-placeholder-page";

export default function AdminSpecialOffersRoute() {
  return (
    <AdminPlaceholderPage
      title="Special Offers"
      description="Special offers are still feature work. The old page displayed static promo cards and buttons with no backend mutations."
      nextSteps={[
        "Define offer lifecycle, eligibility, and redemption rules.",
        "Back the admin table with real offer records and status changes.",
        "Add exposure reporting once offers are actually served to users.",
      ]}
    />
  );
}
