"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Banknote, CarFront, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LOCATIONS, PRICE_RANGES } from "@/lib/constants/filters";
import { IconSearch } from "@/components/ui/icons";
import { useCarModels } from "@/hooks/use-car-models";

interface QuickFilterBarProps {
  makes: string[];
  onOpenFilters: () => void;
}

export function QuickFilterBar({ makes, onOpenFilters }: QuickFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  // Get current filter values
  const currentMake = searchParams.get("make") || "";
  const currentModel = searchParams.get("model") || "";
  const currentLocation = searchParams.get("location") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  // Calculate price range value
  const getPriceRangeValue = () => {
    if (!currentMinPrice && !currentMaxPrice) return "all";
    const min = Number(currentMinPrice) || 0;
    const max = Number(currentMaxPrice) || Infinity;
    const range = PRICE_RANGES.find(
      (r) => r.min === min && (r.max === max || (r.max === undefined && max === Infinity))
    );
    return range ? `${range.min}-${range.max || ""}` : "all";
  };

  const { models: availableModels, isLoading: modelsLoading } = useCarModels(currentMake || null);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Clear model when make changes
    if (key === "make") {
      params.delete("model");
    }

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const updatePriceRange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value === "all") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      const [min, max] = value.split("-");
      if (min) params.set("minPrice", min);
      else params.delete("minPrice");
      if (max) params.set("maxPrice", max);
      else params.delete("maxPrice");
    }

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const triggerClass =
    "h-11 w-full rounded-[14px] border-[#d8dde6] bg-white pl-9 pr-8 text-[14px] text-[#202224] shadow-sm";

  return (
    <div className="rounded-[22px] border border-[#e7ebf1] bg-white p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        {/* Filter Dropdowns */}
        <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
          {/* County / Location */}
          <div className="relative min-w-0">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Select
              value={currentLocation || "all"}
              onValueChange={(val) => updateFilter("location", val === "all" ? null : val)}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="County" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Counties</SelectItem>
                {LOCATIONS.filter((l) => l !== "All Locations").map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Make */}
          <div className="relative min-w-0">
            <CarFront className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Select
              value={currentMake || "all"}
              onValueChange={(val) => updateFilter("make", val === "all" ? null : val)}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model */}
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Select
              value={currentModel || "all"}
              onValueChange={(val) => updateFilter("model", val === "all" ? null : val)}
              disabled={!currentMake || modelsLoading}
            >
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder={modelsLoading ? "Loading…" : "Model"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="relative min-w-0">
            <Banknote className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Select value={getPriceRangeValue()} onValueChange={updatePriceRange}>
              <SelectTrigger className={triggerClass}>
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any Price</SelectItem>
                {PRICE_RANGES.map((range) => (
                  <SelectItem
                    key={`${range.min}-${range.max}`}
                    value={`${range.min}-${range.max || ""}`}
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center lg:justify-end">
          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="h-11 gap-2 rounded-[14px] border-[#d8dde6] px-4"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <Button
            onClick={handleSearch}
            className="h-11 gap-2 rounded-[14px] bg-primary px-4 hover:bg-primary/90"
          >
            Search
            <IconSearch className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
