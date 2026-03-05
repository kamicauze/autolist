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
import { Search } from "lucide-react";
import {
  LOCATIONS,
  YEARS,
  CONDITIONS,
  MILEAGE_RANGES,
  PRICE_RANGES,
} from "@/lib/constants/filters";
import { useCarModels } from "@/hooks/use-car-models";

interface HeroSearchProps {
  makes: string[];
}

export function HeroSearch({ makes }: HeroSearchProps) {
  const router = useRouter();
  const [location, setLocation] = React.useState("any");
  const [make, setMake] = React.useState("any");
  const [model, setModel] = React.useState("any");
  const [yearFrom, setYearFrom] = React.useState("any");
  const [yearTo, setYearTo] = React.useState("any");
  const [mileage, setMileage] = React.useState("any");
  const [priceRange, setPriceRange] = React.useState("any");
  const [usage, setUsage] = React.useState("any");

  const { models: availableModels, isLoading: modelsLoading } = useCarModels(
    make !== "any" ? make : null
  );

  // Reset model when make changes
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

    // Handle mileage
    if (mileage !== "any") {
      const mileageOption = MILEAGE_RANGES.find(
        (r) => r.label === mileage
      );
      if (mileageOption && "max" in mileageOption) {
        params.set("maxMileage", String(mileageOption.max));
      }
      if (mileageOption && "min" in mileageOption) {
        params.set("minMileage", String(mileageOption.min));
      }
    }

    // Handle price range
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
      {/* Hero Image */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative h-[320px] sm:h-[400px] md:h-[460px] overflow-hidden rounded-2xl sm:rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('/hero-car.jpg')` }}
          />
          {/* Subtle bottom gradient so the search card is legible */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent rounded-b-2xl sm:rounded-b-3xl" />
        </div>

        {/* Search Card — overlaps the bottom edge of the hero */}
        <div className="relative z-10 -mt-24 sm:-mt-28 md:-mt-32">
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-5xl rounded-2xl border border-border bg-white p-5 sm:p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-foreground sm:text-xl">
              Let&apos;s Find Your Perfect Car
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search from thousands of cars available on Autolist
            </p>

            {/* Row 1: Location, Brand, Model, Year */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Location
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">All Locations</SelectItem>
                    {LOCATIONS.filter((l) => l !== "All Locations").map(
                      (loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Brand Name
                </label>
                <Select value={make} onValueChange={setMake}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Brand</SelectItem>
                    {makes.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Car Model */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Car Model
                </label>
                <Select
                  value={model}
                  onValueChange={setModel}
                  disabled={make === "any" || modelsLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={modelsLoading ? "Loading…" : "Any Model"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Model</SelectItem>
                    {availableModels.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Choose Year
                </label>
                <div className="flex gap-2">
                  <Select value={yearFrom} onValueChange={setYearFrom}>
                    <SelectTrigger className="h-11 flex-1">
                      <SelectValue placeholder="From" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">From</SelectItem>
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
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
                      {YEARS.map((y) => (
                        <SelectItem key={y} value={String(y)}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Row 2: Mileage, Price Range, Usage, Search Button */}
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Mileage */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Choose Mileage
                </label>
                <Select value={mileage} onValueChange={setMileage}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Mileage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Mileage</SelectItem>
                    {MILEAGE_RANGES.filter(
                      (r) => r.label !== "Any Km"
                    ).map((r) => (
                      <SelectItem key={r.label} value={r.label}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Price Range
                </label>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Price</SelectItem>
                    {PRICE_RANGES.map((r) => (
                      <SelectItem key={r.label} value={r.label}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Usage / Condition */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Usage
                </label>
                <Select value={usage} onValueChange={setUsage}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Any Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Condition</SelectItem>
                    {CONDITIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Button */}
              <div className="flex items-end">
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
    </section>
  );
}
