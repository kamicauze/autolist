import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageGallery } from "@/components/vehicle/image-gallery";
import { CarOverview } from "@/components/vehicle/car-overview";
import { FeaturesList } from "@/components/vehicle/features-list";
import { getAdminListingPreview } from "@/lib/data/admin-listing-preview";
import { getImageUrl } from "@/lib/utils/listings";
import { getListingSupportingMedia } from "@/lib/utils/listing-supporting-media";
import { getListingMetadataDetails, formatListingLabel } from "@/lib/utils/listing-details";
import { getListingDisplayLocation, getListingDisplayTitle } from "@/lib/utils/vehicle-display";
import { LISTING_STATUS_META } from "@/lib/constants/marketplace";

export const metadata = {
  title: "Listing preview | Admin",
  robots: { index: false, follow: false },
};

export default async function AdminListingPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getAdminListingPreview(id);
  if (!listing) notFound();

  const title = getListingDisplayTitle(listing);
  const images = [...(listing.images ?? [])]
    .sort((a, b) => a.image_order - b.image_order)
    .map((image) => getImageUrl(image.r2_key, "hero"));
  const details = getListingMetadataDetails(listing);
  const { videoUrl, documents } = getListingSupportingMedia(listing);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/listings" className="text-sm font-medium text-primary">
          Back to all listings
        </Link>
        <Link href={`/admin/listings/${listing.id}/edit`} className="text-sm font-medium text-primary">
          Edit listing
        </Link>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Admin preview · {LISTING_STATUS_META[listing.status]?.label ?? formatListingLabel(listing.status)}
        <p className="mt-1">Review the submitted details before approving this listing in the review queue.</p>
      </div>
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-2 text-lg font-semibold text-primary">
          {listing.currency} {new Intl.NumberFormat("en-KE").format(listing.price)}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Seller: {listing.dealer?.name || listing.seller?.full_name || "Name not provided"}
        </p>
      </header>
      <ImageGallery images={images} title={title} videoUrl={videoUrl} />
      <CarOverview listing={listing} location={getListingDisplayLocation(listing)} />
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Description</h2>
        <p className="whitespace-pre-wrap text-sm text-gray-700">{listing.description || "No description provided."}</p>
      </section>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Listed features</h2>
        {listing.features?.length ? <FeaturesList features={listing.features} /> : <p className="text-sm text-gray-500">No features provided.</p>}
      </section>
      {Object.keys(details).length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Submitted vehicle details</h2>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="min-w-0">
                <dt className="text-xs text-gray-500">{formatListingLabel(key.replace(/([a-z])([A-Z])/g, "$1 $2"))}</dt>
                <dd className="mt-1 break-words text-sm text-gray-900">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {documents.length > 0 ? (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Supporting documents</h2>
          <ul className="space-y-2">
            {documents.map((document, index) => <li key={`${document.url}-${index}`}>{document.url ? <a href={document.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">{document.name}</a> : <span className="text-sm text-gray-600">{document.name} (file unavailable)</span>}</li>)}
          </ul>
        </section>
      ) : null}
      <Link href="/admin/review" className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">
        Open review queue
      </Link>
    </div>
  );
}
