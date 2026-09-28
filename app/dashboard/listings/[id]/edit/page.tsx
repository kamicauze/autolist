import { notFound } from "next/navigation";
import { ListingWizardV2 } from "@/components/dashboard/wizard/listing-wizard-v2";
import { getMyListingById } from "@/lib/actions/listings";
import { getMySalesAgents } from "@/lib/data/sales-agents";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const [result, { agents }] = await Promise.all([getMyListingById(id), getMySalesAgents()]);

  if ("error" in result || !result.data) {
    notFound();
  }

  const salesReps = agents
    .filter((agent) => agent.status === "active")
    .map((agent) => ({ id: agent.id, name: agent.name }));

  return (
    <ListingWizardV2
      initialListing={result.data}
      googleMapsApiKey={getGoogleMapsApiKey()}
      salesReps={salesReps}
    />
  );
}
