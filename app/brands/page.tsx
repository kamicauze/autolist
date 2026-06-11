import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { getBrandInitials, getBrandLogo } from "@/lib/constants/brand-logos";
import { ALL_MAKES } from "@/lib/constants/car-data";

export default function BrandsPage() {
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
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Browse by Brands
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600 sm:text-base">
              Pick a brand to view only matching vehicles, then refine the result with price,
              year, body type, color, seller type, and advanced filters.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {ALL_MAKES.map((make) => {
              const logo = getBrandLogo(make);

              return (
                <Link
                  key={make}
                  href={`/search?category=car&make=${encodeURIComponent(make)}`}
                  className="group overflow-hidden rounded-[6px] border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-24 items-center justify-center px-5 py-4 sm:h-28">
                    {logo.src ? (
                      <Image
                        src={logo.src}
                        alt={make}
                        width={86}
                        height={58}
                        className="max-h-14 w-auto object-contain"
                      />
                    ) : (
                      <span
                        className={`flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-lg font-bold ${logo.colorClass}`}
                      >
                        {getBrandInitials(make)}
                      </span>
                    )}
                  </div>
                  <div className="border-t border-gray-200 px-3 py-3 text-center">
                    <span className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-gray-600 transition group-hover:text-primary">
                      {make}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
