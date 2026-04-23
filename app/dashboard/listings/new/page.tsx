import { ListingWizardV2 } from "@/components/dashboard/wizard/listing-wizard-v2";
import { getGoogleMapsApiKey } from "@/lib/server/google-maps";

export default function NewListingPage() {
  return <ListingWizardV2 googleMapsApiKey={getGoogleMapsApiKey()} />;
}
