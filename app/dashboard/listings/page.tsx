import { getMyListings } from "@/lib/actions/listings";
import { MyListings } from "@/components/dashboard/listings/my-listings";
import {
  getAvailableBidListingsForCurrentDealer,
  getCurrentApprovedDealer,
  getMyDealerOffers,
  getOffersReceivedByCurrentSeller,
} from "@/lib/data/offers";
import { getMySalesAgents } from "@/lib/data/sales-agents";
import { getSalesAgentViewerContext } from "@/lib/data/sales-agent-permissions";
import { getListingDisplayTitle } from "@/lib/utils/vehicle-display";

export default async function DashboardListingsPage() {
  const [
    { data: listings },
    availableBidListings,
    dealerOffers,
    receivedOffers,
    salesAgents,
    viewerRepContext,
    approvedDealer,
  ] = await Promise.all([
    getMyListings(),
    getAvailableBidListingsForCurrentDealer(),
    getMyDealerOffers(),
    getOffersReceivedByCurrentSeller(),
    getMySalesAgents(),
    getSalesAgentViewerContext(),
    getCurrentApprovedDealer(),
  ]);

  const isSalesAgentView = Boolean(viewerRepContext);
  const salesReps = salesAgents.agents
    .filter((agent) => agent.status === "active")
    .map((agent) => ({ id: agent.id, name: agent.name }));

  return (
    <MyListings
      listings={listings || []}
      salesReps={salesReps}
      isSalesAgentView={isSalesAgentView}
      canBid={Boolean(approvedDealer)}
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
        description: listing.offer_settings.seller_note || listing.description,
        contactEmail:
          typeof listing.metadata?.contactEmail === "string"
            ? listing.metadata.contactEmail
            : null,
        contactPhone:
          typeof listing.metadata?.phoneNumber === "string"
            ? listing.metadata.phoneNumber
            : null,
        canMakeOffer: true,
      }))}
      yourBids={dealerOffers.map((offer) => ({
        id: offer.id,
        listingId: offer.listing_id,
        listingTitle: offer.listing
          ? getListingDisplayTitle(offer.listing)
          : "Listing offer",
        buyerName: offer.dealer?.name || "Your dealership",
        amount: offer.amount,
        status: offer.status,
        createdAt: offer.created_at,
        canWithdraw: offer.status === "pending" || offer.status === "countered",
      }))}
      receivedOffers={receivedOffers.map((offer) => ({
        id: offer.id,
        listingId: offer.listing_id,
        listingTitle: offer.listing
          ? getListingDisplayTitle(offer.listing)
          : "Listing offer",
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
