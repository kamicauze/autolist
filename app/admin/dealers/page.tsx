import { AdminDealersClient } from "@/components/admin/admin-dealers-client";
import { getPendingDealerVerifications } from "@/lib/data/dealers";

export default async function AdminDealersPage() {
  const dealers = await getPendingDealerVerifications();

  return <AdminDealersClient dealers={dealers} />;
}
