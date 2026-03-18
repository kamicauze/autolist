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
import { Search, SlidersHorizontal } from "lucide-react";
import {
  LOCATIONS,
  YEARS,
  CONDITIONS,
  MILEAGE_RANGES,
  PRICE_RANGES,
} from "@/lib/constants/filters";
import { useCarModels } from "@/hooks/use-car-models";
import { FilterSheet } from "@/components/search/filter-sheet";

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
  const [priceRange, setPriceRange] = React.useState("any");
  const [usage, setUsage] = React.useState("any");
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
    if (usage !== "any") params.set("condition", usage);

    if (mileage !== "any") {
      const mileageOption = MILEAGE_RANGES.find((r) => r.label === mileage);
      if (mileageOption && "max" in mileageOption) {
        params.set("maxMileage", String(mileageOption.max));
      }
      if (mileageOption && "min" in mileageOption) {
        params.set("minMileage", String(mileageOption.min));
      }
    }

    if (priceRange !== "any") {
      const priceOption = PRICE_RANGES.find((r) => r.label === priceRange);
      if (priceOption) {
        if (priceOption.min) params.set("minPrice", String(priceOption.min));
        if (priceOption.max) params.set("maxPrice", String(priceOption.max));
      }
    }

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
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 -mt-24 sm:-mt-28 md:-mt-32">
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-5xl rounded-2xl border border-border bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Let&apos;s Find Your Perfect Car
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search from thousands of cars available on Autolist.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="hidden gap-2 rounded-lg md:inline-flex"
                onClick={() => setIsFilterSheetOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                All filters
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Location
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">All Locations</SelectItem>
                    {LOCATIONS.filter((l) => l !== "All Locations").map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Car Model
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
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Price Range
                </label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Price</SelectItem>
                    {PRICE_RANGES.map((range) => (
                      <SelectItem key={range.label} value={range.label}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Usage
                </label>
                <Select value={usage} onValueChange={setUsage}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Condition</SelectItem>
                    {CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <div
                  aria-hidden="true"
                  className="select-none text-xs font-medium uppercase tracking-wider text-transparent"
                >
                  Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 gap-2 rounded-xl text-sm font-semibold md:hidden"
                    onClick={() => setIsFilterSheetOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                  <Button
                    type="submit"
                    className="col-span-1 h-11 w-full gap-2 rounded-xl text-sm font-semibold md:col-span-2"
                  >
                    <Search className="h-4 w-4" />
                    Find Your Car
                  </Button>
                </div>
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
