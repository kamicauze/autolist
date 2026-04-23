"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ListingCategory } from "@/lib/constants/marketplace";
import { LOCATIONS } from "@/lib/constants/filters";
import {
  LANDING_PRICE_OPTIONS,
  LANDING_SEARCH_CATEGORY_CONFIG,
  LANDING_SEARCH_CATEGORY_ORDER,
} from "@/lib/constants/landing-search";
import { NON_CAR_REFERENCE_DATA } from "@/lib/constants/non-car-reference-data";
import { useCarModels } from "@/hooks/use-car-models";
import { FilterSheet } from "@/components/search/filter-sheet";
import { QuickSearchDialog } from "./quick-search-dialog";
import {
  Bike,
  BusFront,
  CarFront,
  Construction,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Tractor,
  Truck,
  type LucideIcon,
} from "lucide-react";

type HeroCategoryConfig = {
  label: string;
  icon: LucideIcon;
  brandLabel: string;
  modelLabel: string;
  resultLabelPlural: string;
  makeMode: "select" | "suggested" | "manual";
  modelMode: "select" | "manual";
  primaryField: {
    label: string;
    options: Array<{ label: string; value: string }>;
  };
  secondaryField: {
    label: string;
    options: Array<{ label: string; value: string }>;
  };
};

const CATEGORY_CONFIG: Record<ListingCategory, HeroCategoryConfig> = {
  car: { icon: CarFront, ...LANDING_SEARCH_CATEGORY_CONFIG.car },
  motorbike: { icon: Bike, ...LANDING_SEARCH_CATEGORY_CONFIG.motorbike },
  van: { icon: BusFront, ...LANDING_SEARCH_CATEGORY_CONFIG.van },
  truck: { icon: Truck, ...LANDING_SEARCH_CATEGORY_CONFIG.truck },
  plant_construction: { icon: Construction, ...LANDING_SEARCH_CATEGORY_CONFIG.plant_construction },
  farm_agricultural: { icon: Tractor, ...LANDING_SEARCH_CATEGORY_CONFIG.farm_agricultural },
};

const PANEL_INPUT_CLASS =
  "h-[52px] w-full rounded-[16px] border border-[#d7dbe3] bg-white px-4 text-[16px] text-[#202224] placeholder:text-[#8b93a7] outline-none transition focus:border-primary/70";

interface HeroSearchProps {
  makes: string[];
  totalCount: number;
}

export function HeroSearch({ makes, totalCount }: HeroSearchProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = React.useState<ListingCategory>("car");
  const [location, setLocation] = React.useState("any");
  const [make, setMake] = React.useState("any");
  const [model, setModel] = React.useState("");
  const [primaryValue, setPrimaryValue] = React.useState("any");
  const [secondaryValue, setSecondaryValue] = React.useState("any");
  const [priceTo, setPriceTo] = React.useState("any");
  const [isFilterSheetOpen, setIsFilterSheetOpen] = React.useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = React.useState(false);
  const [matchingCount, setMatchingCount] = React.useState(totalCount);

  const activeConfig = CATEGORY_CONFIG[activeCategory];
  const makeSuggestions = React.useMemo(() => {
    if (activeCategory === "car") return makes;
    return NON_CAR_REFERENCE_DATA[activeCategory]?.makes ?? [];
  }, [activeCategory, makes]);

  const { models: availableModels, isLoading: modelsLoading } = useCarModels(
    activeCategory === "car" && make !== "any" ? make : null
  );

  React.useEffect(() => {
    setMake("any");
    setModel("");
    setPrimaryValue("any");
    setSecondaryValue("any");
  }, [activeCategory]);

  React.useEffect(() => {
    setModel("");
  }, [make]);

  const formattedCount = React.useMemo(
    () => new Intl.NumberFormat("en-US").format(matchingCount),
    [matchingCount]
  );

  const buildSearchParams = React.useCallback(() => {
    const params = new URLSearchParams();
    const qParts: string[] = [];
    params.set("category", activeCategory);

    if (location !== "any") params.set("location", location);
    if (priceTo !== "any") params.set("maxPrice", priceTo);

    if (make.trim() && make !== "any") {
      params.set("make", make.trim());
    }

    if (model.trim() && model !== "any") {
      params.set("model", model.trim());
    }

    switch (activeCategory) {
      case "car":
        if (primaryValue !== "any") params.set("bodyType", primaryValue);
        if (secondaryValue !== "any") params.set("minYear", secondaryValue);
        break;
      case "van":
        params.set("bodyType", "Van");
        if (primaryValue !== "any") qParts.push(primaryValue.replaceAll("_", " "));
        if (secondaryValue !== "any") params.set("seats", secondaryValue);
        break;
      case "motorbike":
        qParts.push("motorbike");
        if (primaryValue !== "any") qParts.push(primaryValue);
        if (secondaryValue !== "any") qParts.push(secondaryValue);
        break;
      case "truck":
        params.set("bodyType", "Truck");
        qParts.push("truck");
        if (primaryValue !== "any") qParts.push(primaryValue);
        if (secondaryValue !== "any") qParts.push(secondaryValue);
        break;
      case "plant_construction":
        qParts.push("plant", "construction");
        if (primaryValue !== "any") qParts.push(primaryValue);
        if (secondaryValue !== "any") params.set("minYear", secondaryValue);
        break;
      case "farm_agricultural":
        qParts.push("farm", "agricultural");
        if (primaryValue !== "any") qParts.push(primaryValue.replaceAll("_", " "));
        if (secondaryValue !== "any") params.set("minYear", secondaryValue);
        break;
    }

    const query = qParts.join(" ").trim();
    if (query) {
      params.set("q", query);
    }

    return params;
  }, [activeCategory, location, make, model, priceTo, primaryValue, secondaryValue]);

  const deferredCountQuery = React.useDeferredValue(
    React.useMemo(() => buildSearchParams().toString(), [buildSearchParams])
  );

  React.useEffect(() => {
    const controller = new AbortController();

    const updateCount = async () => {
      try {
        const response = await fetch(`/api/listings/count?${deferredCountQuery}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { count?: number };
        if (typeof data.count === "number") {
          setMatchingCount(data.count);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to update landing listing count:", error);
        }
      }
    };

    void updateCount();

    return () => controller.abort();
  }, [deferredCountQuery]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    router.push(`/search?${buildSearchParams().toString()}`);
  };

  const handleReset = () => {
    setLocation("any");
    setMake("any");
    setModel("");
    setPrimaryValue("any");
    setSecondaryValue("any");
    setPriceTo("any");
  };

  const handleMoreFilters = () => {
    if (activeCategory === "car") {
      setIsFilterSheetOpen(true);
      return;
    }

    router.push(`/search?${buildSearchParams().toString()}`);
  };

  const initialCarFilters = React.useMemo(
    () => ({
      make: make !== "any" ? make : "",
      model,
      maxPrice: priceTo !== "any" ? priceTo : "",
      location: location !== "any" ? location : "",
      bodyTypes: primaryValue !== "any" ? [primaryValue] : [],
      minYear: secondaryValue !== "any" ? secondaryValue : "",
    }),
    [location, make, model, priceTo, primaryValue, secondaryValue]
  );

  const renderMakeField = () => {
    if (activeConfig.makeMode === "select") {
      return (
        <div className="relative">
          <select
            value={make}
            onChange={(event) => setMake(event.target.value)}
            className={`${PANEL_INPUT_CLASS} appearance-none pr-14`}
          >
            <option value="any">Any</option>
            {makeSuggestions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#8b93a7]">
            ▾
          </span>
        </div>
      );
    }

    const datalistId = `landing-make-options-${activeCategory}`;
    const placeholder =
      activeConfig.makeMode === "suggested" ? `Any ${activeConfig.brandLabel.toLowerCase()}` : `Enter ${activeConfig.brandLabel.toLowerCase()}`;

    return (
      <>
        <input
          list={activeConfig.makeMode === "suggested" ? datalistId : undefined}
          value={make === "any" ? "" : make}
          onChange={(event) => setMake(event.target.value || "any")}
          placeholder={placeholder}
          className={PANEL_INPUT_CLASS}
        />
        {activeConfig.makeMode === "suggested" ? (
          <datalist id={datalistId}>
            {makeSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        ) : null}
      </>
    );
  };

  const renderModelField = () => {
    if (activeConfig.modelMode === "select") {
      return (
        <div className="relative">
          <select
            value={model || "any"}
            onChange={(event) => setModel(event.target.value === "any" ? "" : event.target.value)}
            disabled={make === "any" || modelsLoading}
            className={`${PANEL_INPUT_CLASS} appearance-none pr-14 disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <option value="any">
              {modelsLoading ? "Loading..." : make === "any" ? "Any" : "Any"}
            </option>
            {availableModels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#8b93a7]">
            ▾
          </span>
        </div>
      );
    }

    return (
      <input
        value={model}
        onChange={(event) => setModel(event.target.value)}
        placeholder={`Any ${activeConfig.modelLabel.toLowerCase()}`}
        className={PANEL_INPUT_CLASS}
      />
    );
  };

  const renderSelectField = (
    value: string,
    onChange: (nextValue: string) => void,
    options: ReadonlyArray<{ label: string; value: string }>
  ) => (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${PANEL_INPUT_CLASS} appearance-none pr-14`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#8b93a7]">
        ▾
      </span>
    </div>
  );

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative h-[320px] overflow-hidden rounded-[32px] sm:h-[400px] md:h-[460px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,16,0.25)_0%,rgba(12,12,16,0.72)_100%)]" />

          <div className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4 pt-14 text-center sm:pt-16">
            <h1 className="max-w-4xl text-3xl font-bold italic text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Find your perfect vehicle.
            </h1>
            <p className="mt-3 max-w-2xl text-base text-white/86 sm:text-lg">
              Search cars, vans, bikes, trucks, plant and farm equipment from one marketplace.
            </p>
          </div>

          <div className="absolute bottom-[182px] right-4 z-10 sm:bottom-[210px] sm:right-6 md:bottom-[228px]">
            <button
              type="button"
              onClick={() => setIsQuickSearchOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-foreground shadow-lg transition-colors hover:bg-gray-50"
            >
              <Search className="h-4 w-4 text-primary" />
              Quick search
              <span className="rounded border border-gray-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                NEW
              </span>
            </button>
          </div>
        </div>

        <div className="relative z-10 -mt-24 sm:-mt-28 md:-mt-32">
          <form
            onSubmit={handleSearch}
            className="overflow-hidden rounded-[32px] border border-[#e7ebf1] bg-white shadow-[0_24px_64px_rgba(17,24,39,0.12)]"
          >
            <div className="flex flex-col lg:flex-row">
              <aside className="relative border-b border-[#e7ebf1] lg:w-[108px] lg:border-b-0 lg:border-r">
                <div className="grid grid-cols-3 gap-px bg-[#eef1f6] p-px lg:grid-cols-1 lg:bg-transparent lg:p-0">
                  {LANDING_SEARCH_CATEGORY_ORDER.map((category) => {
                    const config = CATEGORY_CONFIG[category];
                    const Icon = config.icon;
                    const isActive = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`flex min-h-[50px] items-center justify-center bg-white transition ${
                          isActive
                            ? "text-primary"
                            : "text-[#7b8190] hover:text-[#202224]"
                        } lg:min-h-[45px]`}
                        aria-pressed={isActive}
                        title={config.label}
                      >
                        <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={1.8} />
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="flex-1 px-5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5">
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-3">
                    <label className="mb-1.5 block text-[15px] font-semibold text-[#202224]">
                      {activeConfig.primaryField.label}
                    </label>
                    {renderSelectField(
                      primaryValue,
                      setPrimaryValue,
                      activeConfig.primaryField.options
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1.5 block text-[15px] font-semibold text-[#202224]">
                      {activeConfig.brandLabel}
                    </label>
                    {renderMakeField()}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1.5 block text-[15px] font-semibold text-[#202224]">
                      {activeConfig.modelLabel}
                    </label>
                    {renderModelField()}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1.5 block text-[15px] font-semibold text-[#202224]">
                      {activeConfig.secondaryField.label}
                    </label>
                    {renderSelectField(
                      secondaryValue,
                      setSecondaryValue,
                      activeConfig.secondaryField.options
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1.5 block text-[15px] font-semibold text-[#202224]">
                      Price until
                    </label>
                    {renderSelectField(priceTo, setPriceTo, LANDING_PRICE_OPTIONS)}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="mb-1.5 block text-[15px] font-semibold text-[#202224]">
                      City or town
                    </label>
                    <div className="relative">
                      <select
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        className={`${PANEL_INPUT_CLASS} appearance-none pr-14`}
                      >
                        <option value="any">Any</option>
                        {LOCATIONS.filter((item) => item !== "All Locations").map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <MapPin className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b93a7]" />
                    </div>
                  </div>

                  <div className="lg:col-span-6 lg:self-end">
                    <button
                      type="submit"
                      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-[16px] bg-primary px-6 text-[16px] font-semibold text-white transition hover:bg-primary/90"
                    >
                      <Search className="h-5 w-5" />
                      {formattedCount} {activeConfig.resultLabelPlural}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 border-t border-[#eef1f6] pt-4 text-[#5f6677] sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 text-[15px] font-medium transition hover:text-[#202224]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleMoreFilters}
                    className="inline-flex items-center gap-2 text-[15px] font-medium transition hover:text-[#202224]"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeCategory === "car" ? "More filters" : `More ${activeConfig.label.toLowerCase()} filters`}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <FilterSheet
        open={isFilterSheetOpen}
        onOpenChange={setIsFilterSheetOpen}
        totalCount={matchingCount}
        makes={makes}
        initialFilters={initialCarFilters}
      />

      <QuickSearchDialog
        open={isQuickSearchOpen}
        onOpenChange={setIsQuickSearchOpen}
      />
    </section>
  );
}
