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
import { getDashboardAccountContext } from "@/lib/data/dashboard-account";
import { createClient } from "@/lib/supabase/server";
import { getListingDisplayTitle } from "@/lib/utils/vehicle-display";

export default async function DashboardListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [
    { data: listings },
    availableBidListings,
    dealerOffers,
    receivedOffers,
    salesAgents,
    viewerRepContext,
    approvedDealer,
    accountContext,
  ] = await Promise.all([
    getMyListings(),
    getAvailableBidListingsForCurrentDealer(),
    getMyDealerOffers(),
    getOffersReceivedByCurrentSeller(),
    getMySalesAgents(),
    getSalesAgentViewerContext(),
    getCurrentApprovedDealer(),
    user ? getDashboardAccountContext(supabase, user.id) : null,
  ]);

  const isSalesAgentView = Boolean(viewerRepContext);
  const salesReps = salesAgents.agents
    .filter((agent) => agent.status === "active")
    .map((agent) => ({ id: agent.id, name: agent.name }));

  const initialBidTab = view === "available-bids" && approvedDealer
    ? "available-bids"
    : view === "your-bids" && approvedDealer
      ? "your-bids"
      : view === "received-offers"
        ? "received-offers"
        : undefined;

  return (
    <MyListings
      key={initialBidTab ?? "listings"}
      initialBidTab={initialBidTab}
      listings={listings || []}
      salesReps={salesReps}
      isSalesAgentView={isSalesAgentView}
      isPrivateSeller={accountContext?.profileRole === "seller"}
      canBid={Boolean(approvedDealer)}
      availableBids={availableBidListings.map((listing) => ({
        id: listing.id,
        listingId: listing.id,
        listing,
        sellerNote: listing.offer_settings.seller_note,
        minimumOfferAmount: listing.offer_settings.minimum_offer_amount,
        expiresAt: listing.offer_settings.expires_at,
        listingTitle: getListingDisplayTitle(listing),
        buyerName: listing.seller?.full_name || "Seller",
        amount: listing.price,
        status: "Open",
        createdAt: listing.offer_settings.updated_at || listing.created_at,
        year: listing.year,
        mileage: listing.mileage,
        condition: listing.condition?.replace(/_/g, " ") || null,
        description: listing.description,
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
        listing: offer.listing,
        sellerNote: offer.listing?.offer_settings?.seller_note,
        minimumOfferAmount: offer.listing?.offer_settings?.minimum_offer_amount,
        expiresAt: offer.listing?.offer_settings?.expires_at,
        listingTitle: offer.listing
          ? getListingDisplayTitle(offer.listing)
          : "Listing offer",
        buyerName: offer.dealer?.name || "Your dealership",
        amount: offer.amount,
        status: offer.status,
        createdAt: offer.created_at,
        canWithdraw: offer.status === "pending" || offer.status === "countered",
        canEditOffer: Boolean(offer.listing) && (offer.status === "pending" || offer.status === "countered"),
      }))}
      receivedOffers={receivedOffers.map((offer) => ({
        id: offer.id,
        listingId: offer.listing_id,
        listing: offer.listing,
        sellerNote: offer.listing?.offer_settings?.seller_note,
        minimumOfferAmount: offer.listing?.offer_settings?.minimum_offer_amount,
        expiresAt: offer.listing?.offer_settings?.expires_at,
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
