import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SearchPageClient } from "@/components/search/search-page-client";
import { searchListings, countMatchingListings } from "@/lib/data/listings";
import { getAllMakeNames } from "@/lib/data/car-data";
import { ListingFilters, ListingSort } from "@/lib/types/listing";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 12; // 4 columns x 3 rows

  // Parse array filters (comma-separated)
  const parseArrayParam = (value: string | string[] | undefined): string[] | undefined => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return value.split(",").filter(Boolean);
  };

  // Extract filters from params
  const filters: ListingFilters = {
    q: params.q as string,
    make: params.make as string,
    model: params.model as string,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    minYear: params.minYear ? Number(params.minYear) : undefined,
    maxYear: params.maxYear ? Number(params.maxYear) : undefined,
    bodyType: parseArrayParam(params.bodyType),
    transmission: parseArrayParam(params.transmission),
    fuelType: parseArrayParam(params.fuelType),
    condition: params.condition as ListingFilters["condition"],
    location: params.location as string,
    color: params.color as string,
    seats: params.seats ? Number(params.seats) : undefined,
    doors: params.doors ? Number(params.doors) : undefined,
    driveType: params.driveType as string,
    sellerType: params.sellerType as ListingFilters["sellerType"],
    minMileage: params.minMileage ? Number(params.minMileage) : undefined,
    maxMileage: params.maxMileage ? Number(params.maxMileage) : undefined,
  };

  // Parse sort option
  const sortBy = params.sortBy as string;
  let sort: ListingSort = { field: "created_at", direction: "desc" };

  if (sortBy) {
    switch (sortBy) {
      case "oldest":
        sort = { field: "created_at", direction: "asc" };
        break;
      case "price_low":
        sort = { field: "price", direction: "asc" };
        break;
      case "price_high":
        sort = { field: "price", direction: "desc" };
        break;
      case "year_new":
        sort = { field: "year", direction: "desc" };
        break;
      case "year_old":
        sort = { field: "year", direction: "asc" };
        break;
      case "mileage_low":
        sort = { field: "mileage", direction: "asc" };
        break;
      case "mileage_high":
        sort = { field: "mileage", direction: "desc" };
        break;
      default:
        sort = { field: "created_at", direction: "desc" };
    }
  }

  const [{ listings, total }, totalCount, makes] = await Promise.all([
    searchListings({ filters, page, limit, sort }),
    countMatchingListings(filters),
    getAllMakeNames(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">All cars for sale</h1>
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Browse new and used listings from dealers and private sellers.
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white">
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M12 2L9 7H3l5 4-2 7 6-4 6 4-2-7 5-4h-6L12 2z" />
              </svg>
              <span className="text-sm text-gray-400">Quick search</span>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded">NEW</span>
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          <Suspense fallback={<div className="animate-pulse h-16 bg-gray-200 rounded-lg" />}>
            <SearchPageClient
              listings={listings}
              total={total}
              totalPages={totalPages}
              totalCount={totalCount}
              makes={makes}
            />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
