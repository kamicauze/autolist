import { AdminVerificationClient } from "@/components/admin/admin-verification-client";
import { getPendingDealerVerifications } from "@/lib/data/dealers";
import { getPendingSellerVerifications } from "@/lib/data/seller-verification";

export default async function AdminVerificationPage() {
  const [dealers, sellers] = await Promise.all([
    getPendingDealerVerifications(),
    getPendingSellerVerifications(),
  ]);

  return <AdminVerificationClient dealers={dealers} sellers={sellers} />;
}
