import { notFound } from "next/navigation";
import { ListingWizardV2 } from "@/components/dashboard/wizard/listing-wizard-v2";
import { getAdminListingById } from "@/lib/actions/listings";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

type AdminEditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminEditListingPage({ params }: AdminEditListingPageProps) {
  const { id } = await params;
  const result = await getAdminListingById(id);

  if ("error" in result || !result.data) {
    notFound();
  }

  return (
    <ListingWizardV2
      initialListing={result.data}
      googleMapsApiKey={getGoogleMapsApiKey()}
      mode="admin"
    />
  );
}
