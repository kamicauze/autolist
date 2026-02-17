import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { getApprovedDealers } from "@/lib/data/dealers";

export default async function DealersPage() {
  const dealers = await getApprovedDealers(24);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Dealers" },
            ]}
            className="mb-4"
          />

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Verified Dealers</h1>
            <p className="mt-2 text-sm text-gray-600">
              Browse approved Autolist dealers and explore their inventory.
            </p>
          </div>

          {dealers.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
              No approved dealers found yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dealers.map((dealer) => (
                <article
                  key={dealer.id}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <h2 className="text-lg font-semibold text-gray-900">{dealer.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{dealer.city || "Kenya"}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600">
                    {dealer.about_text || "Verified dealer profile on Autolist."}
                  </p>
                  <div className="mt-4">
                    <Button asChild size="sm">
                      <Link href={`/dealers/${dealer.id}`}>View dealer page</Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
