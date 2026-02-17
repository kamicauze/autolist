"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Constants for filter options
const MAKES = [
  "Toyota",
  "Nissan",
  "Mazda",
  "Subaru",
  "Mercedes-Benz",
  "BMW",
  "Audi",
  "Volkswagen",
  "Land Rover",
  "Honda",
  "Mitsubishi",
  "Ford",
  "Suzuki",
  "Porsche",
  "Lexus",
  "Hyundai",
  "Kia",
  "Volvo",
  "Jeep",
  "Isuzu",
];

const BODY_TYPES = [
  "SUV",
  "Sedan",
  "Hatchback",
  "Pickup",
  "Coupe",
  "Convertible",
  "Van",
  "Wagon",
  "Crossover",
  "Bus",
  "Truck",
];

const TRANSMISSIONS = ["Automatic", "Manual", "CVT", "AMT", "Dual Clutch"];
const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const CONDITIONS = [
  { value: "foreign_used", label: "Foreign Used" },
  { value: "locally_used", label: "Locally Used" },
  { value: "new", label: "Brand New" },
];

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Helper to update URL params
  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset page on filter change
    params.set("page", "1");

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.push("/search");
    });
  };

  // Get current values
  const currentMake = searchParams.get("make");
  const currentModel = searchParams.get("model") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentMinYear = searchParams.get("minYear");
  const currentMaxYear = searchParams.get("maxYear");
  const currentBodyType = searchParams.get("bodyType");
  const currentTransmission = searchParams.get("transmission");
  const currentFuelType = searchParams.get("fuelType");
  const currentCondition = searchParams.get("condition");

  const hasActiveFilters = searchParams.toString().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Make */}
      <div className="space-y-2">
        <Label>Make</Label>
        <Select
          value={currentMake || "all"}
          onValueChange={(val) => updateFilter("make", val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Makes" />
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
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label>Model</Label>
        <Input
          placeholder="e.g. Harrier"
          defaultValue={currentModel}
          onBlur={(e) => updateFilter("model", e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateFilter("model", e.currentTarget.value);
            }
          }}
        />
      </div>

      <Separator />

      {/* Price Range */}
      <div className="space-y-2">
        <Label>Price Range (Ksh)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice}
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
          />
          <Input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Year Range */}
      <div className="space-y-2">
        <Label>Year Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            value={currentMinYear || "any"}
            onValueChange={(val) => updateFilter("minYear", val === "any" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Min Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={`min-${year}`} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={currentMaxYear || "any"}
            onValueChange={(val) => updateFilter("maxYear", val === "any" ? null : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Max Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={`max-${year}`} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Body Type */}
      <div className="space-y-2">
        <Label>Body Type</Label>
        <Select
          value={currentBodyType || "all"}
          onValueChange={(val) => updateFilter("bodyType", val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Body Types" />
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
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label>Condition</Label>
        <Select
          value={currentCondition || "all"}
          onValueChange={(val) => updateFilter("condition", val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Condition</SelectItem>
            {CONDITIONS.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Transmission */}
      <div className="space-y-2">
        <Label>Transmission</Label>
        <Select
          value={currentTransmission || "all"}
          onValueChange={(val) => updateFilter("transmission", val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {TRANSMISSIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-2">
        <Label>Fuel Type</Label>
        <Select
          value={currentFuelType || "all"}
          onValueChange={(val) => updateFilter("fuelType", val === "all" ? null : val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {FUEL_TYPES.map((f) => (
              <SelectItem key={f} value={f}>
                {f}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
