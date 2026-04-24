"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { ListingCategory } from "@/lib/constants/marketplace";
import { LOCATIONS, MILEAGE_RANGES } from "@/lib/constants/filters";
import {
  LANDING_PRICE_OPTIONS,
  LANDING_SEARCH_CATEGORY_CONFIG,
  LANDING_SEARCH_CATEGORY_ORDER,
  LANDING_YEAR_OPTIONS,
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
  Search,
  SlidersHorizontal,
  Sparkles,
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

const HERO_HEADLINES: Record<ListingCategory, string> = {
  car: "Let's Find Your Perfect Car",
  motorbike: "Let's Find Your Perfect Bike",
  van: "Let's Find Your Perfect Van",
  truck: "Let's Find Your Perfect Truck",
  plant_construction: "Let's Find Your Perfect Machine",
  farm_agricultural: "Let's Find Your Perfect Farm Equipment",
};

const HERO_CTA_LABELS: Record<ListingCategory, string> = {
  car: "Find Your Car",
  motorbike: "Find A Bike",
  van: "Find A Van",
  truck: "Find A Truck",
  plant_construction: "Find Equipment",
  farm_agricultural: "Find Machinery",
};

const HERO_YEAR_OPTIONS = LANDING_YEAR_OPTIONS.filter((option) => option.value !== "any");
const HERO_YEAR_FROM_OPTIONS = [{ label: "From", value: "any" }, ...HERO_YEAR_OPTIONS];
const HERO_YEAR_TO_OPTIONS = [{ label: "To", value: "any" }, ...HERO_YEAR_OPTIONS];
const HERO_PRICE_OPTIONS = LANDING_PRICE_OPTIONS.filter((option) => option.value !== "any");
const HERO_PRICE_FROM_OPTIONS = [{ label: "From", value: "any" }, ...HERO_PRICE_OPTIONS];
const HERO_PRICE_TO_OPTIONS = [{ label: "To", value: "any" }, ...HERO_PRICE_OPTIONS];
const HERO_MILEAGE_OPTIONS = MILEAGE_RANGES.map((range, index) => ({
  label: index === 0 ? "Any Mileage" : range.label,
  value:
    index === 0
      ? "any"
      : `${"min" in range && typeof range.min === "number" ? String(range.min) : ""}:${"max" in range && typeof range.max === "number" ? String(range.max) : ""}`,
}));

const PANEL_INPUT_CLASS =
  "h-[42px] w-full rounded-[12px] border border-[#d1d5dc] bg-white px-3.5 text-[14px] text-[#202224] placeholder:text-[#8b93a7] outline-none transition focus:border-primary/70";
const PANEL_ICON_CLASS =
  "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b93a7]";
const PANEL_CHEVRON_CLASS =
  "pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[#8b93a7]";

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
  const [yearFrom, setYearFrom] = React.useState("any");
  const [yearTo, setYearTo] = React.useState("any");
  const [mileageRange, setMileageRange] = React.useState("any");
  const [priceFrom, setPriceFrom] = React.useState("any");
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
    setYearFrom("any");
    setYearTo("any");
    setMileageRange("any");
    setPriceFrom("any");
    setPriceTo("any");
  }, [activeCategory]);

  React.useEffect(() => {
    setModel("");
  }, [make]);

  const formattedCount = React.useMemo(
    () => new Intl.NumberFormat("en-US").format(matchingCount),
    [matchingCount]
  );
  const heroDescription =
    activeCategory === "car"
      ? "Narrow by location, make, model, year and the key car filters from the design."
      : "Start with the essentials here, then open more filters for a tighter match.";
  const mileageBounds = React.useMemo(() => {
    if (mileageRange === "any") {
      return { minMileage: "", maxMileage: "" };
    }

    const [minMileage, maxMileage] = mileageRange.split(":");
    return { minMileage, maxMileage };
  }, [mileageRange]);

  const buildSearchParams = React.useCallback(() => {
    const params = new URLSearchParams();
    const qParts: string[] = [];
    params.set("category", activeCategory);

    if (location !== "any") params.set("location", location);
    if (priceFrom !== "any") params.set("minPrice", priceFrom);
    if (priceTo !== "any") params.set("maxPrice", priceTo);
    if (yearFrom !== "any") params.set("minYear", yearFrom);
    if (yearTo !== "any") params.set("maxYear", yearTo);
    if (mileageBounds.minMileage) params.set("minMileage", mileageBounds.minMileage);
    if (mileageBounds.maxMileage) params.set("maxMileage", mileageBounds.maxMileage);

    if (make.trim() && make !== "any") {
      params.set("make", make.trim());
    }

    if (model.trim() && model !== "any") {
      params.set("model", model.trim());
    }

    switch (activeCategory) {
      case "van":
        params.set("bodyType", "Van");
        break;
      case "motorbike":
        qParts.push("motorbike");
        break;
      case "truck":
        params.set("bodyType", "Truck");
        qParts.push("truck");
        break;
      case "plant_construction":
        qParts.push("plant", "construction");
        break;
      case "farm_agricultural":
        qParts.push("farm", "agricultural");
        break;
      case "car":
      default:
        break;
    }

    const query = qParts.join(" ").trim();
    if (query) {
      params.set("q", query);
    }

    return params;
  }, [
    activeCategory,
    location,
    make,
    mileageBounds.maxMileage,
    mileageBounds.minMileage,
    model,
    priceFrom,
    priceTo,
    yearFrom,
    yearTo,
  ]);

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
      minPrice: priceFrom !== "any" ? priceFrom : "",
      maxPrice: priceTo !== "any" ? priceTo : "",
      location: location !== "any" ? location : "",
      bodyTypes: [],
      minYear: yearFrom !== "any" ? yearFrom : "",
      maxYear: yearTo !== "any" ? yearTo : "",
      minMileage: mileageBounds.minMileage,
      maxMileage: mileageBounds.maxMileage,
    }),
    [location, make, mileageBounds.maxMileage, mileageBounds.minMileage, model, priceFrom, priceTo, yearFrom, yearTo]
  );

  const renderMakeField = () => {
    const MakeIcon = CarFront;

    if (activeConfig.makeMode === "select") {
      return (
        <div className="relative">
          <MakeIcon className={PANEL_ICON_CLASS} />
          <select
            value={make}
            onChange={(event) => setMake(event.target.value)}
            className={`${PANEL_INPUT_CLASS} appearance-none pl-10 pr-10`}
          >
            <option value="any">{`Any ${activeConfig.brandLabel}`}</option>
            {makeSuggestions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className={PANEL_CHEVRON_CLASS}>
            ▾
          </span>
        </div>
      );
    }

    const datalistId = `landing-make-options-${activeCategory}`;
    const placeholder =
      activeConfig.makeMode === "suggested" ? `Any ${activeConfig.brandLabel.toLowerCase()}` : `Enter ${activeConfig.brandLabel.toLowerCase()}`;

    return (
      <div className="relative">
        <MakeIcon className={PANEL_ICON_CLASS} />
        <input
          list={activeConfig.makeMode === "suggested" ? datalistId : undefined}
          value={make === "any" ? "" : make}
          onChange={(event) => setMake(event.target.value || "any")}
          placeholder={placeholder}
          className={`${PANEL_INPUT_CLASS} pl-10`}
        />
        {activeConfig.makeMode === "suggested" ? (
          <datalist id={datalistId}>
            {makeSuggestions.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        ) : null}
      </div>
    );
  };

  const renderModelField = () => {
    const ModelIcon = Search;

    if (activeConfig.modelMode === "select") {
      return (
        <div className="relative">
          <ModelIcon className={PANEL_ICON_CLASS} />
          <select
            value={model || "any"}
            onChange={(event) => setModel(event.target.value === "any" ? "" : event.target.value)}
            disabled={make === "any" || modelsLoading}
            className={`${PANEL_INPUT_CLASS} appearance-none pl-10 pr-10 disabled:cursor-not-allowed disabled:opacity-45`}
          >
            <option value="any">
              {modelsLoading ? "Loading..." : `Any ${activeConfig.modelLabel}`}
            </option>
            {availableModels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className={PANEL_CHEVRON_CLASS}>
            ▾
          </span>
        </div>
      );
    }

    return (
      <div className="relative">
        <ModelIcon className={PANEL_ICON_CLASS} />
        <input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          placeholder={`Any ${activeConfig.modelLabel.toLowerCase()}`}
          className={`${PANEL_INPUT_CLASS} pl-10`}
        />
      </div>
    );
  };

  const renderSelectField = (
    value: string,
    onChange: (nextValue: string) => void,
    options: ReadonlyArray<{ label: string; value: string }>,
    icon: LucideIcon
  ) => {
    const Icon = icon;

    return (
      <div className="relative">
        <Icon className={PANEL_ICON_CLASS} />
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${PANEL_INPUT_CLASS} appearance-none pl-10 pr-10`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={PANEL_CHEVRON_CLASS}>▾</span>
      </div>
    );
  };
  const renderRangeField = (
    fromValue: string,
    onFromChange: (nextValue: string) => void,
    fromOptions: ReadonlyArray<{ label: string; value: string }>,
    toValue: string,
    onToChange: (nextValue: string) => void,
    toOptions: ReadonlyArray<{ label: string; value: string }>
  ) => (
    <div className="grid grid-cols-2 gap-2">
      <div className="relative">
        <select
          value={fromValue}
          onChange={(event) => onFromChange(event.target.value)}
          className={`${PANEL_INPUT_CLASS} appearance-none pr-10`}
        >
          {fromOptions.map((option) => (
            <option key={`${option.label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={PANEL_CHEVRON_CLASS}>▾</span>
      </div>

      <div className="relative">
        <select
          value={toValue}
          onChange={(event) => onToChange(event.target.value)}
          className={`${PANEL_INPUT_CLASS} appearance-none pr-10`}
        >
          {toOptions.map((option) => (
            <option key={`${option.label}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className={PANEL_CHEVRON_CLASS}>▾</span>
      </div>
    </div>
  );

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative h-[340px] overflow-hidden rounded-[32px] sm:h-[410px] md:h-[470px] lg:h-[500px]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/hero-car.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,12,16,0.22)_0%,rgba(12,12,16,0.74)_100%)]" />

          <div className="absolute inset-0 z-10 flex flex-col px-4 pb-6 pt-14 sm:px-6 sm:pt-16 md:pb-8 lg:px-8">
            <div className="flex flex-1 flex-col items-center text-center">
              <h1 className="max-w-4xl text-3xl font-bold italic text-white sm:text-4xl md:text-5xl lg:text-6xl">
                Find your perfect vehicle.
              </h1>
              <p className="mt-3 max-w-2xl text-base text-white/86 sm:text-lg">
                Search cars, vans, bikes, trucks, plant and farm equipment from one marketplace.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-20 sm:-mt-24 md:-mt-28">
          <div className="mx-auto mb-3 flex max-w-[980px] justify-end">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQuickSearchOpen(true)}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-[#d7dbe3] bg-white px-3.5 text-[13px] font-medium text-[#202224] transition hover:border-[#c8cfda] hover:bg-[#f7f9fc]"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Quick search
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-[980px] overflow-hidden rounded-[18px] border border-[#e7ebf1] bg-white shadow-[0_18px_48px_rgba(17,24,39,0.12)]"
          >
            <div className="flex flex-col lg:flex-row">
              <aside className="relative border-b border-[#e7ebf1] bg-[#f7f9fc] lg:w-[74px] lg:border-b-0 lg:border-r lg:bg-transparent">
                <div className="grid grid-cols-3 gap-px bg-[#eef1f6] p-px lg:grid-cols-1 lg:gap-0 lg:bg-transparent lg:p-3">
                  {LANDING_SEARCH_CATEGORY_ORDER.map((category) => {
                    const config = CATEGORY_CONFIG[category];
                    const Icon = config.icon;
                    const isActive = activeCategory === category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setActiveCategory(category)}
                        className={`flex min-h-[45px] items-center justify-center bg-white transition ${
                          isActive
                            ? "text-primary shadow-[inset_0_0_0_1px_rgba(37,99,235,0.12)]"
                            : "text-[#7b8190] hover:text-[#202224]"
                        } lg:h-[45px] lg:rounded-[12px]`}
                        aria-pressed={isActive}
                        title={config.label}
                      >
                        <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={1.8} />
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="flex-1 px-4 py-4 sm:px-5 lg:px-8 lg:py-6">
                <div className="flex flex-col gap-3 border-b border-[#eef1f6] pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-[22px] font-bold italic leading-[1.2] text-[#202224]">
                      {HERO_HEADLINES[activeCategory]}
                    </h2>
                    <p className="mt-1 text-sm text-[#667085]">
                      {heroDescription}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#d7dbe3] bg-[#f7f9fc] px-3 py-1.5 text-[12px] font-semibold text-[#202224]">
                      {formattedCount} {activeConfig.resultLabelPlural} live
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#4d5568]">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className={PANEL_ICON_CLASS} />
                      <select
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        className={`${PANEL_INPUT_CLASS} appearance-none pl-10 pr-10`}
                      >
                        <option value="any">Any Location</option>
                        {LOCATIONS.filter((item) => item !== "All Locations").map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                      <span className={PANEL_CHEVRON_CLASS}>▾</span>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#4d5568]">
                      {activeCategory === "car" ? "Make" : activeConfig.brandLabel}
                    </label>
                    {renderMakeField()}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#4d5568]">
                      {activeCategory === "car" ? "Model" : activeConfig.modelLabel}
                    </label>
                    {renderModelField()}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#4d5568]">
                      Choose Year
                    </label>
                    {renderRangeField(
                      yearFrom,
                      setYearFrom,
                      HERO_YEAR_FROM_OPTIONS,
                      yearTo,
                      setYearTo,
                      HERO_YEAR_TO_OPTIONS
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-4">
                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#4d5568]">
                      Choose Mileage
                    </label>
                    {renderSelectField(
                      mileageRange,
                      setMileageRange,
                      HERO_MILEAGE_OPTIONS,
                      SlidersHorizontal
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[12px] font-semibold text-[#4d5568]">
                      Price Range
                    </label>
                    {renderRangeField(
                      priceFrom,
                      setPriceFrom,
                      HERO_PRICE_FROM_OPTIONS,
                      priceTo,
                      setPriceTo,
                      HERO_PRICE_TO_OPTIONS
                    )}
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="button"
                      onClick={handleMoreFilters}
                      className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[12px] border border-[#d7dbe3] bg-[#f7f9fc] px-4 text-[14px] font-semibold text-[#202224] transition hover:border-[#c8cfda] hover:bg-white"
                    >
                      <SlidersHorizontal className="h-4 w-4 text-primary" />
                      More Filters
                    </button>
                  </div>

                  <div className="flex flex-col justify-end">
                    <button
                      type="submit"
                      className="flex h-[42px] w-full items-center justify-center gap-2 rounded-[12px] bg-primary px-5 text-[14px] font-semibold text-white transition hover:bg-primary/90"
                    >
                      <Search className="h-4 w-4" />
                      {HERO_CTA_LABELS[activeCategory]}
                    </button>
                  </div>
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
