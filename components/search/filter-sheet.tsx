"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FilterChip } from "@/components/ui/filter-chip";
import { Switch } from "@/components/ui/switch";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ChevronDown } from "lucide-react";
import {
  TRANSMISSIONS,
  FUEL_TYPES,
  CONDITIONS,
  COLORS,
  SEATS_OPTIONS,
  DOORS_OPTIONS,
  DRIVE_TYPES,
  SELLER_TYPES,
  LOCATIONS,
  YEARS,
  SORT_OPTIONS,
} from "@/lib/constants/filters";
import type { ListingCategory } from "@/lib/constants/marketplace";
import { getCategoryFilterConfig } from "@/lib/utils/listing-category";

interface FilterSheetProps {
  makes: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalCount: number;
  category?: ListingCategory;
  initialFilters?: Partial<{
    make: string;
    model: string;
    minPrice: string;
    maxPrice: string;
    location: string;
    condition: string;
    bodyTypes: string[];
    minYear: string;
    maxYear: string;
    minMileage: string;
    maxMileage: string;
    transmissions: string[];
    fuelTypes: string[];
    color: string;
    seats: string;
    doors: string;
    driveType: string;
    sellerTypes: string[];
    verifiedOnly: boolean;
    sortBy: string;
  }>;
}

export function FilterSheet({
  makes,
  open,
  onOpenChange,
  totalCount,
  category,
  initialFilters,
}: FilterSheetProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const categoryConfig = getCategoryFilterConfig(category);

  const buildFiltersFromParams = useCallback(() => ({
    make: initialFilters?.make || searchParams.get("make") || "",
    model: initialFilters?.model || searchParams.get("model") || "",
    minPrice: initialFilters?.minPrice || searchParams.get("minPrice") || "",
    maxPrice: initialFilters?.maxPrice || searchParams.get("maxPrice") || "",
    location: initialFilters?.location || searchParams.get("location") || "",
    condition: initialFilters?.condition || searchParams.get("condition") || "",
    bodyTypes: initialFilters?.bodyTypes || searchParams.get("bodyType")?.split(",").filter(Boolean) || [],
    minYear: initialFilters?.minYear || searchParams.get("minYear") || "",
    maxYear: initialFilters?.maxYear || searchParams.get("maxYear") || "",
    minMileage: initialFilters?.minMileage || searchParams.get("minMileage") || "",
    maxMileage: initialFilters?.maxMileage || searchParams.get("maxMileage") || "",
    transmissions: initialFilters?.transmissions || searchParams.get("transmission")?.split(",").filter(Boolean) || [],
    fuelTypes: initialFilters?.fuelTypes || searchParams.get("fuelType")?.split(",").filter(Boolean) || [],
    color: initialFilters?.color || searchParams.get("color") || "",
    seats: initialFilters?.seats || searchParams.get("seats") || "",
    doors: initialFilters?.doors || searchParams.get("doors") || "",
    driveType: initialFilters?.driveType || searchParams.get("driveType") || "",
    sellerTypes: initialFilters?.sellerTypes || searchParams.get("sellerType")?.split(",").filter(Boolean) || [],
    verifiedOnly: initialFilters?.verifiedOnly ?? (searchParams.get("verifiedOnly") === "true"),
    sortBy: initialFilters?.sortBy || searchParams.get("sortBy") || "newest",
  }), [searchParams, initialFilters]);

  // Local state for filters (applied on "Search" click)
  const [localFilters, setLocalFilters] = useState(buildFiltersFromParams);

  // Sync local state with URL params or initialFilters when sheet opens
  useEffect(() => {
    if (open) {
      setLocalFilters(buildFiltersFromParams());
    }
  }, [open, buildFiltersFromParams]);

  const toggleArrayFilter = useCallback((
    key: "bodyTypes" | "transmissions" | "fuelTypes" | "sellerTypes",
    value: string
  ) => {
    setLocalFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  }, []);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    // Make & Model
    if (localFilters.make) params.set("make", localFilters.make);
    else params.delete("make");
    if (localFilters.model) params.set("model", localFilters.model);
    else params.delete("model");

    // Location
    if (localFilters.location && localFilters.location !== "All Locations") {
      params.set("location", localFilters.location);
    } else {
      params.delete("location");
    }

    // Sort
    if (localFilters.sortBy && localFilters.sortBy !== "newest") {
      params.set("sortBy", localFilters.sortBy);
    } else {
      params.delete("sortBy");
    }

    // Condition
    if (localFilters.condition) params.set("condition", localFilters.condition);
    else params.delete("condition");

    // Years
    if (localFilters.minYear) params.set("minYear", localFilters.minYear);
    else params.delete("minYear");
    if (localFilters.maxYear) params.set("maxYear", localFilters.maxYear);
    else params.delete("maxYear");

    // Price
    if (localFilters.minPrice) params.set("minPrice", localFilters.minPrice);
    else params.delete("minPrice");
    if (localFilters.maxPrice) params.set("maxPrice", localFilters.maxPrice);
    else params.delete("maxPrice");

    // Mileage
    if (localFilters.minMileage) params.set("minMileage", localFilters.minMileage);
    else params.delete("minMileage");
    if (localFilters.maxMileage) params.set("maxMileage", localFilters.maxMileage);
    else params.delete("maxMileage");

    // Body Types (array)
    if (localFilters.bodyTypes.length > 0) {
      params.set("bodyType", localFilters.bodyTypes.join(","));
    } else {
      params.delete("bodyType");
    }

    // Transmission (array)
    if (localFilters.transmissions.length > 0) {
      params.set("transmission", localFilters.transmissions.join(","));
    } else {
      params.delete("transmission");
    }

    // Advanced: Color
    if (localFilters.color) params.set("color", localFilters.color);
    else params.delete("color");

    // Advanced: Fuel Type (array)
    if (localFilters.fuelTypes.length > 0) {
      params.set("fuelType", localFilters.fuelTypes.join(","));
    } else {
      params.delete("fuelType");
    }

    // Advanced: Seats
    if (localFilters.seats) params.set("seats", localFilters.seats);
    else params.delete("seats");

    // Advanced: Doors
    if (localFilters.doors) params.set("doors", localFilters.doors);
    else params.delete("doors");

    // Advanced: Drive Type
    if (localFilters.driveType) params.set("driveType", localFilters.driveType);
    else params.delete("driveType");

    // Advanced: Seller Type
    if (localFilters.sellerTypes.length === 1) {
      params.set("sellerType", localFilters.sellerTypes[0]);
    } else {
      params.delete("sellerType");
    }

    // Verified Only
    if (localFilters.verifiedOnly) params.set("verifiedOnly", "true");
    else params.delete("verifiedOnly");

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
      onOpenChange(false);
    });
  };

  const resetFilters = () => {
    setLocalFilters({
      make: "",
      model: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      condition: "",
      bodyTypes: [],
      minYear: "",
      maxYear: "",
      minMileage: "",
      maxMileage: "",
      transmissions: [],
      fuelTypes: [],
      color: "",
      seats: "",
      doors: "",
      driveType: "",
      sellerTypes: [],
      verifiedOnly: false,
      sortBy: "newest",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>Filter search</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Make */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Make</Label>
            <Select
              value={localFilters.make || "all"}
              onValueChange={(val) =>
                setLocalFilters((p) => ({ ...p, make: val === "all" ? "" : val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Makes" />
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
          <div className="space-y-3">
            <Label className="text-sm font-medium">Model</Label>
            <Input
              placeholder="e.g. Harrier, X5, A4"
              value={localFilters.model}
              onChange={(e) =>
                setLocalFilters((p) => ({ ...p, model: e.target.value }))
              }
            />
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Location</Label>
            <Select
              value={localFilters.location || "All Locations"}
              onValueChange={(val) => setLocalFilters((p) => ({ ...p, location: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Sort By */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sort by</Label>
            <Select
              value={localFilters.sortBy}
              onValueChange={(val) => setLocalFilters((p) => ({ ...p, sortBy: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Newest First" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* ── FILTERS ── */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Filters</h3>
          </div>

          {/* 1. Condition */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Condition</Label>
            <div className="flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <FilterChip
                  key={c.value}
                  selected={localFilters.condition === c.value}
                  onClick={() =>
                    setLocalFilters((p) => ({
                      ...p,
                      condition: p.condition === c.value ? "" : c.value,
                    }))
                  }
                  size="sm"
                >
                  {c.label}
                </FilterChip>
              ))}
            </div>
          </div>

          {/* 2. Year */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Year</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={localFilters.minYear || "any"}
                onValueChange={(val) =>
                  setLocalFilters((p) => ({ ...p, minYear: val === "any" ? "" : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Min</SelectItem>
                  {YEARS.map((year) => (
                    <SelectItem key={`min-${year}`} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={localFilters.maxYear || "any"}
                onValueChange={(val) =>
                  setLocalFilters((p) => ({ ...p, maxYear: val === "any" ? "" : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Max Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Max</SelectItem>
                  {YEARS.map((year) => (
                    <SelectItem key={`max-${year}`} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 3. Price */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Price</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={localFilters.minPrice || "any"}
                onValueChange={(val) =>
                  setLocalFilters((p) => ({ ...p, minPrice: val === "any" ? "" : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Min Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Min</SelectItem>
                  <SelectItem value="100000">Ksh 100K</SelectItem>
                  <SelectItem value="500000">Ksh 500K</SelectItem>
                  <SelectItem value="1000000">Ksh 1M</SelectItem>
                  <SelectItem value="2000000">Ksh 2M</SelectItem>
                  <SelectItem value="5000000">Ksh 5M</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={localFilters.maxPrice || "any"}
                onValueChange={(val) =>
                  setLocalFilters((p) => ({ ...p, maxPrice: val === "any" ? "" : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Max Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Max</SelectItem>
                  <SelectItem value="500000">Ksh 500K</SelectItem>
                  <SelectItem value="1000000">Ksh 1M</SelectItem>
                  <SelectItem value="2000000">Ksh 2M</SelectItem>
                  <SelectItem value="5000000">Ksh 5M</SelectItem>
                  <SelectItem value="10000000">Ksh 10M</SelectItem>
                  <SelectItem value="20000000">Ksh 20M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 4. Mileage */}
          {categoryConfig.showMileage && <div className="space-y-3">
            <Label className="text-sm font-medium">Mileage</Label>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={localFilters.minMileage || "any"}
                onValueChange={(val) =>
                  setLocalFilters((p) => ({ ...p, minMileage: val === "any" ? "" : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Km" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Km</SelectItem>
                  <SelectItem value="10000">10,000 km</SelectItem>
                  <SelectItem value="30000">30,000 km</SelectItem>
                  <SelectItem value="50000">50,000 km</SelectItem>
                  <SelectItem value="100000">100,000 km</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={localFilters.maxMileage || "any"}
                onValueChange={(val) =>
                  setLocalFilters((p) => ({ ...p, maxMileage: val === "any" ? "" : val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Km" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Km</SelectItem>
                  <SelectItem value="30000">30,000 km</SelectItem>
                  <SelectItem value="50000">50,000 km</SelectItem>
                  <SelectItem value="100000">100,000 km</SelectItem>
                  <SelectItem value="150000">150,000 km</SelectItem>
                  <SelectItem value="200000">200,000 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>}

          {/* 5. Body Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{categoryConfig.bodyTypeLabel}</Label>
            {categoryConfig.bodyTypeGroups ? (
              <div className="space-y-4">
                {categoryConfig.bodyTypeGroups.map((group) => (
                  <div key={group.label} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((type) => (
                        <FilterChip
                          key={`${group.label}-${type.value}`}
                          selected={localFilters.bodyTypes.includes(type.value)}
                          onClick={() => toggleArrayFilter("bodyTypes", type.value)}
                          size="sm"
                        >
                          {type.label}
                        </FilterChip>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {categoryConfig.bodyTypes.map((type) => (
                  <FilterChip
                    key={type.value}
                    selected={localFilters.bodyTypes.includes(type.value)}
                    onClick={() => toggleArrayFilter("bodyTypes", type.value)}
                    size="sm"
                  >
                    {type.label}
                  </FilterChip>
                ))}
              </div>
            )}
          </div>

          {/* 6. Transmission */}
          {categoryConfig.showTransmission && <div className="space-y-3">
            <Label className="text-sm font-medium">Transmission</Label>
            <div className="flex flex-wrap gap-2">
              {TRANSMISSIONS.map((t) => (
                <FilterChip
                  key={t}
                  selected={localFilters.transmissions.includes(t)}
                  onClick={() => toggleArrayFilter("transmissions", t)}
                  size="sm"
                >
                  {t}
                </FilterChip>
              ))}
            </div>
          </div>}

          <Separator />

          {/* ── ADVANCED FILTERS ── */}
          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Advanced Filters</h3>
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-6 pt-4">
                {/* 1. Color */}
                {categoryConfig.showColor && <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Color</Label>
                  <Select
                    value={localFilters.color || "any"}
                    onValueChange={(val) =>
                      setLocalFilters((p) => ({ ...p, color: val === "any" ? "" : val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Color</SelectItem>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>}

                {/* 2. Fuel Type */}
                {categoryConfig.showFuel && <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Fuel Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {FUEL_TYPES.map((f) => (
                      <FilterChip
                        key={f}
                        selected={localFilters.fuelTypes.includes(f)}
                        onClick={() => toggleArrayFilter("fuelTypes", f)}
                        size="sm"
                      >
                        {f}
                      </FilterChip>
                    ))}
                  </div>
                </div>}

                {/* 3. Seats */}
                {categoryConfig.showSeats && <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Seats</Label>
                  <div className="flex flex-wrap gap-2">
                    {SEATS_OPTIONS.map((s) => (
                      <FilterChip
                        key={s.value}
                        selected={localFilters.seats === s.value.toString()}
                        onClick={() =>
                          setLocalFilters((p) => ({
                            ...p,
                            seats: p.seats === s.value.toString() ? "" : s.value.toString(),
                          }))
                        }
                        size="sm"
                      >
                        {s.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>}

                {/* 4. Doors */}
                {categoryConfig.showDoors && <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Doors</Label>
                  <div className="flex flex-wrap gap-2">
                    {DOORS_OPTIONS.map((d) => (
                      <FilterChip
                        key={d.value}
                        selected={localFilters.doors === d.value.toString()}
                        onClick={() =>
                          setLocalFilters((p) => ({
                            ...p,
                            doors: p.doors === d.value.toString() ? "" : d.value.toString(),
                          }))
                        }
                        size="sm"
                      >
                        {d.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>}

                {/* 5. Drive Type */}
                {categoryConfig.showDriveType && <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Drive Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {DRIVE_TYPES.map((dt) => (
                      <FilterChip
                        key={dt.value}
                        selected={localFilters.driveType === dt.value}
                        onClick={() =>
                          setLocalFilters((p) => ({
                            ...p,
                            driveType: p.driveType === dt.value ? "" : dt.value,
                          }))
                        }
                        size="sm"
                      >
                        {dt.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>}

                {/* 6. Seller Type */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600">Seller Type</Label>
                  <div className="flex flex-wrap gap-2">
                    {SELLER_TYPES.map((s) => (
                      <FilterChip
                        key={s.value}
                        selected={localFilters.sellerTypes.includes(s.value)}
                        onClick={() => toggleArrayFilter("sellerTypes", s.value)}
                        size="sm"
                      >
                        {s.label}
                      </FilterChip>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Separator />

          {/* Verified Listings Only */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Verified Listings Only</Label>
            <Switch
              checked={localFilters.verifiedOnly}
              onCheckedChange={(checked) =>
                setLocalFilters((p) => ({ ...p, verifiedOnly: checked }))
              }
            />
          </div>
        </div>

        <SheetFooter>
          <Button variant="ghost" onClick={resetFilters} className="text-gray-500">
            Reset all
          </Button>
          <Button onClick={applyFilters} disabled={isPending} className="flex-1">
            Search {totalCount.toLocaleString()} {categoryConfig.resultLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
