import { getActiveCmsSpecialOffers } from "@/lib/data/cms-special-offers";
import { PublicSpecialOffersList } from "./public-special-offers-client";

export async function PublicSpecialOffers({
  limit = 3,
  className,
}: {
  limit?: number;
  className?: string;
}) {
  const offers = await getActiveCmsSpecialOffers(limit);

  if (offers.length === 0) return null;

  return <PublicSpecialOffersList offers={offers} className={className} />;
}
