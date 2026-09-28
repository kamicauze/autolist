import { ListingWizardV2 } from "@/components/dashboard/wizard/listing-wizard-v2";
import { getMySalesAgents } from "@/lib/data/sales-agents";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

export default async function NewListingPage() {
  const { agents } = await getMySalesAgents();
  const salesReps = agents
    .filter((agent) => agent.status === "active")
    .map((agent) => ({ id: agent.id, name: agent.name }));

  return <ListingWizardV2 googleMapsApiKey={getGoogleMapsApiKey()} salesReps={salesReps} />;
}
