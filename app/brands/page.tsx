import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ALL_MAKES } from "@/lib/constants/car-data";

function groupMakesByInitial(makes: string[]) {
  return makes.reduce<Record<string, string[]>>((groups, make) => {
    const initial = make.charAt(0).toUpperCase();
    groups[initial] = groups[initial] ? [...groups[initial], make] : [make];
    return groups;
  }, {});
}

export default function BrandsPage() {
  const groupedMakes = groupMakesByInitial(ALL_MAKES);
  const initials = Object.keys(groupedMakes).sort();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Brands" },
            ]}
            className="mb-6"
          />

          <div className="mb-8 max-w-3xl">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
              Browse by brand
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              All car brands
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              Pick a brand to view only matching vehicles, then refine the result with price,
              year, body type, color, seller type, and advanced filters.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {initials.map((initial) => (
              <section
                key={initial}
                className="rounded-[16px] border border-gray-200 bg-[#fbfcfe] p-5"
              >
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {initial}
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {groupedMakes[initial].map((make) => (
                    <Link
                      key={make}
                      href={`/search?category=car&make=${encodeURIComponent(make)}`}
                      className="rounded-[10px] border border-transparent px-3 py-2 text-sm font-medium text-gray-800 transition hover:border-primary/20 hover:bg-white hover:text-primary"
                    >
                      {make}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
