"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAKES, LOCATIONS, PRICE_RANGES } from "@/lib/constants/filters";
import { IconSearch } from "@/components/ui/icons";

// Model options per make (simplified)
const MODELS: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "RAV4", "Land Cruiser", "Hilux", "Prado", "Harrier", "Vitz", "Axio"],
  Nissan: ["Note", "X-Trail", "Juke", "Serena", "Navara", "Tiida", "Sylphy", "Patrol"],
  BMW: ["X1", "X3", "X5", "3 Series", "5 Series", "7 Series", "1 Series"],
  "Mercedes-Benz": ["C-Class", "E-Class", "GLE", "GLC", "A-Class", "S-Class"],
  Mazda: ["Demio", "CX-5", "CX-3", "Axela", "Atenza"],
  Subaru: ["Forester", "Outback", "Impreza", "Legacy", "XV"],
  Honda: ["Fit", "Vezel", "CR-V", "Civic", "Accord"],
  Volkswagen: ["Golf", "Tiguan", "Polo", "Touareg", "Passat"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
  "Land Rover": ["Range Rover", "Discovery", "Defender", "Evoque", "Sport"],
};

interface QuickFilterBarProps {
  onOpenFilters: () => void;
}

export function QuickFilterBar({ onOpenFilters }: QuickFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

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

  const availableModels = currentMake ? (MODELS[currentMake] || []) : [];

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3 flex-1">
          {/* County / Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
            <Select
              value={currentLocation || "all"}
              onValueChange={(val) => updateFilter("location", val === "all" ? null : val)}
            >
              <SelectTrigger className="w-[160px] pl-9">
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

          {/* Model */}
          <Select
            value={currentModel || "all"}
            onValueChange={(val) => updateFilter("model", val === "all" ? null : val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Model" />
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

          {/* Price Range */}
          <Select value={getPriceRangeValue()} onValueChange={updatePriceRange}>
            <SelectTrigger className="w-[140px]">
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onOpenFilters}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>

          <Button onClick={handleSearch} className="gap-2 bg-primary hover:bg-primary/90">
            Search
            <IconSearch className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
