import { getListingInteractionTotals } from "@/lib/data/listing-interactions";

export async function ListingInteractionInsights({ listingIds }: { listingIds: string[] | null }) {
  const totals = listingIds ? await getListingInteractionTotals(listingIds) : null;
  return (
    <section aria-labelledby="contact-clicks-title" className="rounded-[24px] border border-[#ededed] bg-white p-5 lg:p-6">
      <h2 id="contact-clicks-title" className="font-heading text-2xl font-semibold text-[#202224]">Contact clicks</h2>
      <p className="mt-2 text-sm text-gray-600">Buyer interest across the listings you manage.</p>
      {totals ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Call clicks", key: "call_clicks" as const },
            { label: "Financing form opens", key: "financing_clicks" as const },
          ].map(metric => (
            <div key={metric.key} className="rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">{metric.label}</h3>
              <dl className="mt-4 grid grid-cols-3 gap-2">
                {[{ days: 1, label: "Today" }, { days: 7, label: "Last 7 days" }, { days: 30, label: "Last 30 days" }].map(period => (
                  <div key={period.days}>
                    <dt className="text-xs text-gray-600">{period.label}</dt>
                    <dd className="mt-1 text-2xl font-bold text-gray-900">{Number(totals.find(row => row.days === period.days)?.[metric.key] ?? 0).toLocaleString("en-KE")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      ) : <p role="status" className="mt-5 text-sm text-gray-600">Contact click analytics are unavailable right now. Please try again later.</p>}
      <p className="mt-4 text-xs leading-5 text-gray-600">Each visitor counts once per listing, action and Nairobi calendar day. Call clicks count the revealed phone link being activated; they do not confirm a completed call. Financing opens do not count as submitted requests or approvals. Tracking starts with this release.</p>
    </section>
  );
}
