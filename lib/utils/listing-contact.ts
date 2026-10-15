import type { Listing } from "@/lib/types/listing";
import { getListingMetadataBoolean, getListingMetadataString } from "./listing-details";

export function getPrivateListingContact(listing: Pick<Listing, "metadata">) {
  const phoneNumber = getListingMetadataString(listing, "phoneNumber");
  const canCall = getListingMetadataBoolean(listing, "allowPhoneCalls") !== false &&
    getListingMetadataBoolean(listing, "hidePhoneNumber") !== true;
  const canWhatsApp = getListingMetadataBoolean(listing, "whatsappEnabled") !== false;

  return {
    phoneNumber: canCall ? phoneNumber : null,
    whatsappNumber: canWhatsApp
      ? getListingMetadataString(listing, "whatsappNumber") || phoneNumber
      : null,
  };
}
