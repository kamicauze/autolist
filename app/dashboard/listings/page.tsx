import { getMyListings } from "@/lib/actions/listings";
import { MyListings } from "@/components/dashboard/listings/my-listings";
import {
  getAvailableBidListingsForCurrentDealer,
  getMyDealerOffers,
  getOffersReceivedByCurrentSeller,
} from "@/lib/data/offers";
import { getListingDisplayTitle } from "@/lib/utils/vehicle-display";

export default async function DashboardListingsPage() {
  const [{ data: listings }, availableBidListings, dealerOffers, receivedOffers] = await Promise.all([
    getMyListings(),
    getAvailableBidListingsForCurrentDealer(),
    getMyDealerOffers(),
    getOffersReceivedByCurrentSeller(),
  ]);

  return (
    <MyListings
      listings={listings || []}
      availableBids={availableBidListings.map((listing) => ({
        id: listing.id,
        listingId: listing.id,
        listingTitle: getListingDisplayTitle(listing),
        buyerName: listing.seller?.full_name || "Seller",
        amount: listing.offer_settings.minimum_offer_amount || listing.price,
        status: "Open",
        createdAt: listing.offer_settings.updated_at || listing.created_at,
        year: listing.year,
        mileage: listing.mileage,
        condition: listing.condition?.replace(/_/g, " ") || null,
        description: listing.description,
        contactEmail: listing.dealer?.email || null,
        contactPhone: listing.dealer?.mobile || listing.dealer?.whatsapp || null,
        canMakeOffer: true,
      }))}
      yourBids={dealerOffers.map((offer) => ({
        id: offer.id,
        listingId: offer.listing_id,
        listingTitle: offer.listing ? getListingDisplayTitle(offer.listing) : "Listing offer",
        buyerName: offer.dealer?.name || "Your dealership",
        amount: offer.amount,
        status: offer.status,
        createdAt: offer.created_at,
        canWithdraw: offer.status === "pending" || offer.status === "countered",
      }))}
      receivedOffers={receivedOffers.map((offer) => ({
        id: offer.id,
        listingId: offer.listing_id,
        listingTitle: offer.listing ? getListingDisplayTitle(offer.listing) : "Listing offer",
        buyerName: offer.dealer?.name || "Dealer",
        amount: offer.amount,
        status: offer.status,
        createdAt: offer.created_at,
        canAccept: offer.status === "pending" || offer.status === "countered",
        canReject: offer.status === "pending" || offer.status === "countered",
        canCounter: offer.status === "pending" || offer.status === "countered",
      }))}
    />
  );
}
