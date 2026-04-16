import { notFound } from "next/navigation";
import { ListingWizardV2 } from "@/components/dashboard/wizard/listing-wizard-v2";
import { getMyListingById } from "@/lib/actions/listings";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const result = await getMyListingById(id);

  if ("error" in result || !result.data) {
    notFound();
  }

  return <ListingWizardV2 initialListing={result.data} />;
}
