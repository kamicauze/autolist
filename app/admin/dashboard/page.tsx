import { getPendingListings } from "@/lib/actions/listings";
import { getPendingDealerVerifications } from "@/lib/data/dealers";
import { AdminDashboardPage } from "@/components/admin/admin-static-pages";

export default async function AdminDashboardRoute() {
  const [{ data: listings }, dealers] = await Promise.all([
    getPendingListings(),
    getPendingDealerVerifications(),
  ]);

  return (
    <AdminDashboardPage
      pendingListings={listings?.length ?? 0}
      pendingDealers={dealers.length}
    />
  );
}
