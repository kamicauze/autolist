"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAKES, BODY_TYPES, PRICE_RANGES } from "@/lib/constants/filters";
import { IconSearch } from "@/components/ui/icons";

interface QuickFilterBarProps {
  onOpenFilters: () => void;
}

export function QuickFilterBar({ onOpenFilters }: QuickFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get current filter values
  const currentMake = searchParams.get("make") || "";
  const currentBodyType = searchParams.get("bodyType") || "";
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

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
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

  const clearAllFilters = () => {
    startTransition(() => {
      router.push("/search");
    });
  };

  const hasActiveFilters = searchParams.toString().replace(/page=\d+&?/g, "").length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3 flex-1">
          {/* Make */}
          <Select
            value={currentMake || "all"}
            onValueChange={(val) => updateFilter("make", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Make" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Makes</SelectItem>
              {MAKES.map((make) => (
                <SelectItem key={make} value={make}>
                  {make}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Body Type */}
          <Select
            value={currentBodyType || "all"}
            onValueChange={(val) => updateFilter("bodyType", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Body Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Body Types</SelectItem>
              {BODY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={getPriceRangeValue()} onValueChange={updatePriceRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Price Range" />
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            More Filters
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="gap-1 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}

          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <IconSearch className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
