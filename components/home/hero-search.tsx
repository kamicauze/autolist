"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";
import {
  LOCATIONS,
  YEARS,
  MILEAGE_RANGES,
} from "@/lib/constants/filters";
import { useCarModels } from "@/hooks/use-car-models";
import { FilterSheet } from "@/components/search/filter-sheet";

const PRICE_OPTIONS = [
  { label: "500,000", value: "500000" },
  { label: "1,000,000", value: "1000000" },
  { label: "2,000,000", value: "2000000" },
  { label: "3,000,000", value: "3000000" },
  { label: "5,000,000", value: "5000000" },
  { label: "7,000,000", value: "7000000" },
  { label: "10,000,000", value: "10000000" },
  { label: "15,000,000", value: "15000000" },
  { label: "20,000,000", value: "20000000" },
  { label: "30,000,000", value: "30000000" },
  { label: "50,000,000", value: "50000000" },
];

interface HeroSearchProps {
  makes: string[];
  totalCount: number;
}

export function HeroSearch({ makes, totalCount }: HeroSearchProps) {
  const router = useRouter();
  const [location, setLocation] = React.useState("any");
  const [make, setMake] = React.useState("any");
  const [model, setModel] = React.useState("any");
  const [yearFrom, setYearFrom] = React.useState("any");
  const [yearTo, setYearTo] = React.useState("any");
  const [mileage, setMileage] = React.useState("any");
  const [priceFrom, setPriceFrom] = React.useState("any");
  const [priceTo, setPriceTo] = React.useState("any");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);

  const { models: availableModels, isLoading: modelsLoading } = useCarModels(
    make !== "any" ? make : null
  );

  React.useEffect(() => {
    setModel("any");
  }, [make]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (location !== "any") params.set("location", location);
    if (make !== "any") params.set("make", make);
    if (model !== "any") params.set("model", model);
    if (yearFrom !== "any") params.set("minYear", yearFrom);
    if (yearTo !== "any") params.set("maxYear", yearTo);

    if (mileage !== "any") {
      const mileageOption = MILEAGE_RANGES.find((r) => r.label === mileage);
      if (mileageOption && "max" in mileageOption) {
        params.set("maxMileage", String(mileageOption.max));
      }
      if (mileageOption && "min" in mileageOption) {
        params.set("minMileage", String(mileageOption.min));
      }
    }

    if (priceFrom !== "any") params.set("minPrice", priceFrom);
    if (priceTo !== "any") params.set("maxPrice", priceTo);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative h-[320px] overflow-hidden rounded-2xl sm:h-[400px] sm:rounded-3xl md:h-[460px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/30" />

          {/* Hero text overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl font-bold italic text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Find your perfect car.
            </h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">
              Get the best price for new, used, and verified cars.
            </p>
          </div>

          {/* Quick search pill */}
          <div className="absolute bottom-28 right-4 z-10 sm:bottom-32 sm:right-6 md:bottom-36">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-lg hover:bg-gray-50 transition-colors"
            >
              <svg
                className="h-4 w-4 text-primary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 3l1.5 4.5H18l-3.5 2.5L16 14.5 12 12l-4 2.5 1.5-4.5L6 7.5h4.5z" />
              </svg>
              Quick search
              <span className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                NEW
              </span>
              <Search className="h-4 w-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="relative z-10 -mt-24 sm:-mt-28 md:-mt-32">
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-5xl rounded-2xl border border-border bg-white p-5 shadow-xl sm:p-6"
          >
            {/* Title */}
            <h2 className="text-lg font-bold italic text-foreground sm:text-xl">
              Let&apos;s Find Your Perfect Car
            </h2>

            {/* Row 1: Location, Make, Model, Choose Year */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  Location
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-11">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Any Location" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    {LOCATIONS.filter((l) => l !== "All Locations").map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  Make
                </label>
                <Select value={make} onValueChange={setMake}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Make" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Make</SelectItem>
                    {makes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  Model
                </label>
                <Select
                  value={model}
                  onValueChange={setModel}
                  disabled={make === "any" || modelsLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={modelsLoading ? "Loading..." : "Any Model"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Model</SelectItem>
                    {availableModels.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  Choose Year
                </label>
                <div className="flex gap-2">
                  <Select value={yearFrom} onValueChange={setYearFrom}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">From</SelectItem>
                      {YEARS.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={yearTo} onValueChange={setYearTo}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">To</SelectItem>
                      {YEARS.map((year) => (
                        <SelectItem key={`to-${year}`} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Row 2: Choose Mileage, Price Range, More Filters, Find Your Car */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  Choose Mileage
                </label>
                <Select value={mileage} onValueChange={setMileage}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Mileage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Mileage</SelectItem>
                    {MILEAGE_RANGES.filter((r) => r.label !== "Any Km").map((range) => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-muted-foreground">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <Select value={priceFrom} onValueChange={setPriceFrom}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">From</SelectItem>
                      {PRICE_OPTIONS.map((opt) => (
                        <SelectItem key={`from-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={priceTo} onValueChange={setPriceTo}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">To</SelectItem>
                      {PRICE_OPTIONS.map((opt) => (
                        <SelectItem key={`to-${opt.value}`} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* More Filters button */}
              <div className="space-y-1.5">
                <div
                  aria-hidden="true"
                  className="hidden select-none text-[13px] font-medium text-transparent lg:block"
                >
                  &nbsp;
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
                  onClick={() => setIsFilterSheetOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  More Filters
                </Button>
              </div>

              {/* Find Your Car button */}
              <div className="space-y-1.5">
                <div
                  aria-hidden="true"
                  className="hidden select-none text-[13px] font-medium text-transparent lg:block"
                >
                  &nbsp;
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full gap-2 rounded-xl text-sm font-semibold"
                >
                  <Search className="h-4 w-4" />
                  Find Your Car
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <FilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        totalCount={totalCount}
        makes={makes}
      />
    </section>
  );
}
