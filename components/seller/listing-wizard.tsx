"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { FilterChip } from "@/components/ui/filter-chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/ui/dropzone";
import {
  CarFront,
  Bus,
  Bike,
  Truck,
  Tractor,
  Construction,
} from "lucide-react";
import {
  LISTING_AVAILABILITY_OPTIONS,
  LISTING_CATEGORY_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURES_BY_CATEGORY,
  LISTING_WIZARD_STEPS,
  KENYA_CITIES,
  type ListingCategory,
  type ListingFeatureOption,
} from "@/lib/constants/marketplace";
import {
  getListingBodyType,
  getPersistedListingDetails,
} from "@/lib/utils/listing-category";
import {
  FARM_CATEGORY_OPTIONS,
  getFarmSubcategoryOptions,
} from "@/lib/constants/farm-taxonomy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WizardShell } from "@/components/seller/wizard-shell";
import { createListing } from "@/lib/actions/listings";
import type { ListingFormData } from "@/lib/validations/listing";

type DetailFieldKey =
  | "make"
  | "model"
  | "year"
  | "engineType"
  | "transmission"
  | "driveType"
  | "mileage"
  | "bodyType"
  | "bodyStyle"
  | "loadCapacity"
  | "engineCapacity"
  | "fuelType"
  | "fuelSystem"
  | "bikeType"
  | "color"
  | "seats"
  | "axleConfiguration"
  | "equipmentType"
  | "operatingHours"
  | "operatingWeight"
  | "operationalStatus"
  | "powerOutput"
  | "usageType"
  | "farmCategory";

type DetailField = {
  key: DetailFieldKey;
  label: string;
  type: "text" | "number" | "select";
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
};

type ListingDraft = {
  category: ListingCategory | "";
  title: string;
  condition: (typeof LISTING_CONDITION_OPTIONS)[number]["value"];
  priceKes: string;
  negotiable: boolean;
  country: string;
  cityTown: string;
  locationArea: string;
  description: string;
  availability: (typeof LISTING_AVAILABILITY_OPTIONS)[number]["value"];
  details: Record<DetailFieldKey, string>;
  selectedFeatureIds: string[];
  coverImageName: string | null;
  galleryImageNames: string[];
  coverFromGalleryIndex: number | null;
  documentNames: string[];
  videoUrl: string;
  sellerType: "dealer" | "individual";
  useDealerAutoFill: boolean;
  contactName: string;
  phoneNumber: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  allowPhoneCalls: boolean;
  hidePhoneNumber: boolean;
};

const DETAIL_FIELDS_BY_CATEGORY: Record<ListingCategory, DetailField[]> = {
  car: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Toyota" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "Corolla" },
    { key: "year", label: "Year of Manufacture", type: "number", required: true, placeholder: "2021" },
    {
      key: "engineType",
      label: "Engine Type",
      type: "select",
      required: true,
      options: [
        { value: "petrol", label: "Petrol" },
        { value: "diesel", label: "Diesel" },
        { value: "hybrid", label: "Hybrid" },
        { value: "electric", label: "Electric" },
      ],
    },
    {
      key: "transmission",
      label: "Transmission",
      type: "select",
      required: true,
      options: [
        { value: "automatic", label: "Automatic" },
        { value: "manual", label: "Manual" },
      ],
    },
    {
      key: "driveType",
      label: "Drive Type",
      type: "select",
      required: true,
      options: [
        { value: "fwd", label: "FWD" },
        { value: "rwd", label: "RWD" },
        { value: "awd", label: "AWD" },
        { value: "4wd", label: "4WD" },
      ],
    },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "58000" },
    {
      key: "bodyType",
      label: "Body Type",
      type: "select",
      required: true,
      options: [
        { value: "sedan", label: "Sedan" },
        { value: "suv", label: "SUV" },
        { value: "hatchback", label: "Hatchback" },
        { value: "wagon", label: "Wagon" },
        { value: "coupe", label: "Coupe" },
      ],
    },
    { key: "color", label: "Color", type: "text", required: true, placeholder: "Pearl White" },
    { key: "seats", label: "Number of Seats", type: "number", required: true, placeholder: "5" },
  ],
  van: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Toyota" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "Hiace" },
    { key: "year", label: "Year of Manufacture", type: "number", required: true, placeholder: "2021" },
    {
      key: "fuelType",
      label: "Fuel Type",
      type: "select",
      required: true,
      options: [
        { value: "petrol", label: "Petrol" },
        { value: "diesel", label: "Diesel" },
        { value: "electric", label: "Electric" },
      ],
    },
    {
      key: "transmission",
      label: "Transmission",
      type: "select",
      required: true,
      options: [
        { value: "automatic", label: "Automatic" },
        { value: "manual", label: "Manual" },
      ],
    },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "110000" },
    {
      key: "bodyStyle",
      label: "Body Style",
      type: "select",
      required: true,
      options: [
        { value: "panel_van", label: "Panel Van" },
        { value: "pickup", label: "Pickup" },
        { value: "minibus", label: "Minibus" },
        { value: "passenger_van", label: "Passenger Van" },
      ],
    },
    { key: "loadCapacity", label: "Load Capacity (Optional)", type: "number", required: false, placeholder: "1200" },
    { key: "color", label: "Color", type: "text", required: true, placeholder: "Silver" },
    { key: "seats", label: "Number of Seats", type: "number", required: true, placeholder: "14" },
  ],
  motorbike: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Honda" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "CBR250R" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2020" },
    { key: "engineCapacity", label: "Engine Capacity (cc)", type: "number", required: true, placeholder: "250" },
    {
      key: "bikeType",
      label: "Bike Type",
      type: "select",
      required: true,
      options: [
        { value: "street", label: "Street" },
        { value: "cruiser", label: "Cruiser" },
        { value: "off_road", label: "Off-road" },
        { value: "scooter", label: "Scooter" },
      ],
    },
    {
      key: "fuelSystem",
      label: "Fuel System",
      type: "select",
      required: true,
      options: [
        { value: "carburetor", label: "Carburetor" },
        { value: "fuel_injection", label: "Fuel Injection" },
      ],
    },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "12000" },
  ],
  truck: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Isuzu" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "FVR" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2019" },
    {
      key: "fuelType",
      label: "Fuel Type",
      type: "select",
      required: true,
      options: [
        { value: "petrol", label: "Petrol" },
        { value: "diesel", label: "Diesel" },
      ],
    },
    {
      key: "transmission",
      label: "Transmission",
      type: "select",
      required: true,
      options: [
        { value: "automatic", label: "Automatic" },
        { value: "manual", label: "Manual" },
      ],
    },
    { key: "mileage", label: "Mileage", type: "number", required: true, placeholder: "145000" },
    {
      key: "axleConfiguration",
      label: "Axle Configuration",
      type: "select",
      required: true,
      options: [
        { value: "4x2", label: "4x2" },
        { value: "6x2", label: "6x2" },
        { value: "6x4", label: "6x4" },
        { value: "8x4", label: "8x4" },
      ],
    },
    {
      key: "bodyType",
      label: "Body Type",
      type: "select",
      required: true,
      options: [
        { value: "box", label: "Box" },
        { value: "flatbed", label: "Flatbed" },
        { value: "tipper", label: "Tipper" },
        { value: "tractor_head", label: "Tractor Head" },
      ],
    },
    { key: "loadCapacity", label: "Load Capacity (Optional)", type: "number", required: false, placeholder: "18" },
  ],
  plant_construction: [
    {
      key: "equipmentType",
      label: "Equipment Type",
      type: "select",
      required: true,
      options: [
        { value: "excavator", label: "Excavator" },
        { value: "bulldozer", label: "Bulldozer" },
        { value: "crane", label: "Crane" },
        { value: "loader", label: "Loader" },
      ],
    },
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Caterpillar" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "320D" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2018" },
    { key: "operatingHours", label: "Hours Used", type: "number", required: true, placeholder: "6400" },
    { key: "operatingWeight", label: "Operating Weight (Optional)", type: "number", required: false, placeholder: "22000" },
    {
      key: "operationalStatus",
      label: "Operational Status",
      type: "select",
      required: true,
      options: [
        { value: "working", label: "Working" },
        { value: "needs_repair", label: "Needs Repair" },
      ],
    },
  ],
  farm_agricultural: [
    {
      key: "farmCategory",
      label: "Farm Category",
      type: "select",
      required: true,
      options: FARM_CATEGORY_OPTIONS,
    },
    {
      key: "equipmentType",
      label: "Subcategory",
      type: "select",
      required: true,
      options: [],
    },
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Massey Ferguson" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "MF 385" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2019" },
    { key: "operatingHours", label: "Hours Used", type: "number", required: true, placeholder: "1200" },
    { key: "powerOutput", label: "Horsepower / Capacity (Optional)", type: "number", required: false, placeholder: "85" },
    {
      key: "operationalStatus",
      label: "Operational Status",
      type: "select",
      required: true,
      options: [
        { value: "working", label: "Working" },
        { value: "needs_repair", label: "Needs Repair" },
      ],
    },
  ],
};

const MARKET_BENCHMARKS: Record<ListingCategory, [number, number]> = {
  car: [1_500_000, 4_500_000],
  van: [1_800_000, 5_200_000],
  motorbike: [120_000, 850_000],
  truck: [3_500_000, 12_000_000],
  plant_construction: [4_000_000, 22_000_000],
  farm_agricultural: [900_000, 8_500_000],
};

const DEFAULT_DRAFT: ListingDraft = {
  category: "",
  title: "",
  condition: "locally_used",
  priceKes: "",
  negotiable: true,
  country: "Kenya",
  cityTown: "",
  locationArea: "",
  description: "",
  availability: "available",
  details: {
    make: "",
    model: "",
    year: "",
    engineType: "",
    transmission: "",
    driveType: "",
    mileage: "",
    bodyType: "",
    bodyStyle: "",
    loadCapacity: "",
    engineCapacity: "",
    fuelType: "",
    fuelSystem: "",
    bikeType: "",
    color: "",
    seats: "",
    axleConfiguration: "",
    equipmentType: "",
    operatingHours: "",
    operatingWeight: "",
    operationalStatus: "",
    powerOutput: "",
    usageType: "",
    farmCategory: "",
  },
  selectedFeatureIds: [],
  coverImageName: null,
  galleryImageNames: [],
  coverFromGalleryIndex: null,
  documentNames: [],
  videoUrl: "",
  sellerType: "individual",
  useDealerAutoFill: false,
  contactName: "",
  phoneNumber: "",
  whatsappEnabled: true,
  whatsappNumber: "",
  allowPhoneCalls: true,
  hidePhoneNumber: false,
};

const MAX_DESCRIPTION_LENGTH = 800;
const MAX_TITLE_LENGTH = 120;
const MIN_TOTAL_IMAGES = 3;
const MAX_GALLERY_IMAGES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const PHONE_REGEX = /^\+?[0-9]{8,15}$/;
const FEATURE_PRESET_IDS = ["popular", "safety", "driver_assist"] as const;
type FeaturePresetId = (typeof FEATURE_PRESET_IDS)[number];

const FEATURE_PRESET_LABELS: Record<FeaturePresetId, string> = {
  popular: "Popular package",
  safety: "Safety package",
  driver_assist: "Driver assist package",
};

const POPULAR_FEATURE_KEYWORDS = [
  "air conditioning",
  "abs",
  "airbag",
  "bluetooth",
  "apple carplay",
  "android auto",
  "navigation",
  "rear parking camera",
  "cruise control",
  "traction control",
  "stability control",
] as const;

const SAFETY_FEATURE_KEYWORDS = [
  "safety",
  "airbag",
  "abs",
  "brake",
  "collision",
  "stability",
  "traction",
  "lane",
  "blind spot",
  "immobil",
  "tpms",
  "seat belt",
] as const;

const DRIVER_ASSIST_FEATURE_KEYWORDS = [
  "assist",
  "cruise",
  "parking",
  "camera",
  "sensor",
  "monitor",
  "telematics",
  "autonomous",
  "navigation",
  "gps",
  "lane",
  "traffic",
] as const;

const DETAIL_TEST_IDS: Partial<Record<DetailFieldKey, string>> = {
  make: "listing-make",
  model: "listing-model",
  year: "listing-year",
  mileage: "listing-mileage",
  transmission: "listing-transmission",
  fuelType: "listing-fuel",
  engineType: "listing-engine-type",
  driveType: "listing-drive-type",
  bodyType: "listing-body-type",
  bodyStyle: "listing-body-style",
  color: "listing-color",
  seats: "listing-seats",
  engineCapacity: "listing-engine-capacity",
  fuelSystem: "listing-fuel-system",
  bikeType: "listing-bike-type",
  axleConfiguration: "listing-axle-configuration",
  loadCapacity: "listing-load-capacity",
  operatingHours: "listing-hours-used",
  operatingWeight: "listing-operating-weight",
  operationalStatus: "listing-operational-status",
};

function formatKES(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "-";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPriceInput(value: string): string {
  // Remove non-numeric characters except for the number itself
  const numericValue = value.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("en-KE").format(Number(numericValue));
}

function unformatPrice(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.replace(/\s+/g, ""));
}

function normalizeFeatureSearchValue(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ");
}

function featureMatchesQuery(feature: ListingFeatureOption, query: string) {
  if (!query) return true;
  const haystack = [feature.label, feature.id, ...(feature.aliases ?? [])]
    .map((entry) => normalizeFeatureSearchValue(entry))
    .join(" ");
  return haystack.includes(query);
}

function pickFeaturesByKeywords(
  features: ListingFeatureOption[],
  keywords: readonly string[],
  minimumFallbackCount = 0
) {
  const unique = new Map<string, ListingFeatureOption>();
  features.forEach((feature) => {
    const searchValue = normalizeFeatureSearchValue(
      [feature.label, feature.id, ...(feature.aliases ?? [])].join(" ")
    );
    if (keywords.some((keyword) => searchValue.includes(keyword))) {
      unique.set(feature.id, feature);
    }
  });
  if (unique.size < minimumFallbackCount) {
    features.slice(0, minimumFallbackCount - unique.size).forEach((feature) => {
      unique.set(feature.id, feature);
    });
  }
  return Array.from(unique.values());
}

function getMarketIndicator(category: ListingCategory | "", priceKes: string) {
  if (!category) return { label: "Select a category", tone: "outline" as const, note: "Category required." };
  const amount = Number(priceKes);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { label: "Enter listing price", tone: "outline" as const, note: "Price required to estimate market range." };
  }

  const [min, max] = MARKET_BENCHMARKS[category];
  if (amount < min) {
    return { label: "Below Market", tone: "success" as const, note: `Typical range ${formatKES(String(min))} - ${formatKES(String(max))}.` };
  }
  if (amount > max) {
    return { label: "Above Market", tone: "warning" as const, note: `Typical range ${formatKES(String(min))} - ${formatKES(String(max))}.` };
  }
  return { label: "Within Market", tone: "info" as const, note: `Typical range ${formatKES(String(min))} - ${formatKES(String(max))}.` };
}

const CATEGORY_ICONS: Record<ListingCategory, React.ElementType> = {
  car: CarFront,
  van: Bus,
  motorbike: Bike,
  truck: Truck,
  plant_construction: Construction,
  farm_agricultural: Tractor,
};

const DRAFT_STORAGE_KEY = "autolist_listing_draft";

export function ListingWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [createdListingId, setCreatedListingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ListingDraft>(DEFAULT_DRAFT);
  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [featureQuery, setFeatureQuery] = React.useState("");
  const [showFeatureIds, setShowFeatureIds] = React.useState(false);
  const [expandedFeatureGroups, setExpandedFeatureGroups] = React.useState<Record<string, boolean>>({});
  const [presetUndoSelection, setPresetUndoSelection] = React.useState<string[] | null>(null);
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);
  const [draftSavedAt, setDraftSavedAt] = React.useState<Date | null>(null);
  const [showDraftSaved, setShowDraftSaved] = React.useState(false);

  // Local state for file objects to support previews
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);

  // Auto-save draft to localStorage with indicator
  React.useEffect(() => {
    if (draft.category) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setDraftSavedAt(new Date());
      setShowDraftSaved(true);
      const timer = setTimeout(() => setShowDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [draft]);

  // Restore draft from localStorage on mount (merge with defaults to fill missing values)
  React.useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as Partial<ListingDraft>;
        if (parsed.category) {
          // Merge with defaults to ensure all required fields have values
          // Use default value if saved value is empty string
          setDraft({
            ...DEFAULT_DRAFT,
            ...parsed,
            // Restore country with fallback to default if empty
            country: parsed.country?.trim() || DEFAULT_DRAFT.country,
            details: {
              ...DEFAULT_DRAFT.details,
              ...(parsed.details || {}),
            },
          });
        }
      } catch {
        // Invalid saved draft, ignore
      }
    }
  }, []);

  // Clear draft from localStorage after successful submission
  const clearSavedDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
  };

  // Auto-generate title from vehicle details
  const generateTitle = React.useCallback(() => {
    const { make, model, year } = draft.details;
    if (!make && !model && !year) return "";

    const conditionLabel = LISTING_CONDITION_OPTIONS.find(
      (opt) => opt.value === draft.condition
    )?.label || "";

    const parts = [year, make, model].filter(Boolean);
    if (parts.length === 0) return "";

    return `${parts.join(" ")}${conditionLabel ? ` - ${conditionLabel}` : ""}`;
  }, [draft.details, draft.condition]);

  // Suggest title when vehicle details change (only if title is empty or matches previous auto-generated)
  const [lastAutoTitle, setLastAutoTitle] = React.useState("");
  const currentAutoTitle = generateTitle();

  React.useEffect(() => {
    if (currentAutoTitle && (!draft.title || draft.title === lastAutoTitle)) {
      updateField("title", currentAutoTitle);
      setLastAutoTitle(currentAutoTitle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAutoTitle, draft.title]);

  const isLastStep = activeStep === LISTING_WIZARD_STEPS.length - 1;
  const selectedCategoryFields = draft.category ? DETAIL_FIELDS_BY_CATEGORY[draft.category] : [];
  const selectedFeatureGroups = draft.category ? LISTING_FEATURES_BY_CATEGORY[draft.category] : null;
  const selectedFeatureGroupDefinition = draft.category
    ? LISTING_FEATURE_GROUPS_BY_CATEGORY[draft.category]
    : null;
  const selectedFeatureIdSet = React.useMemo(
    () => new Set(draft.selectedFeatureIds),
    [draft.selectedFeatureIds]
  );
  const normalizedFeatureQuery = React.useMemo(
    () => normalizeFeatureSearchValue(featureQuery),
    [featureQuery]
  );
  const marketIndicator = getMarketIndicator(draft.category, draft.priceKes);

  const allVisibleFeatureGroups = React.useMemo(() => {
    if (!selectedFeatureGroups || !selectedFeatureGroupDefinition) return [];

    return selectedFeatureGroupDefinition.order
      .map((groupKey) => {
        const groupFeatures = selectedFeatureGroups[groupKey] ?? [];
        if (groupFeatures.length === 0) return null;

        const visibleFeatures = normalizedFeatureQuery
          ? groupFeatures.filter((feature) => featureMatchesQuery(feature, normalizedFeatureQuery))
          : groupFeatures;

        if (normalizedFeatureQuery && visibleFeatures.length === 0) return null;

        const selectedCount = groupFeatures.filter((feature) =>
          selectedFeatureIdSet.has(feature.id)
        ).length;

        return {
          key: groupKey,
          label: selectedFeatureGroupDefinition.labels[groupKey] ?? groupKey,
          allFeatures: groupFeatures,
          visibleFeatures,
          selectedCount,
        };
      })
      .filter((group): group is NonNullable<typeof group> => Boolean(group));
  }, [
    normalizedFeatureQuery,
    selectedFeatureGroupDefinition,
    selectedFeatureGroups,
    selectedFeatureIdSet,
  ]);

  const allCategoryFeatures = React.useMemo(() => {
    if (!selectedFeatureGroupDefinition || !selectedFeatureGroups) return [];
    return selectedFeatureGroupDefinition.order.flatMap((groupKey) => {
      return selectedFeatureGroups[groupKey] ?? [];
    });
  }, [selectedFeatureGroupDefinition, selectedFeatureGroups]);

  React.useEffect(() => {
    if (!selectedFeatureGroupDefinition) {
      setExpandedFeatureGroups({});
      return;
    }
    setExpandedFeatureGroups((prev) => {
      const next: Record<string, boolean> = {};
      selectedFeatureGroupDefinition.order.forEach((groupKey, index) => {
        next[groupKey] = prev[groupKey] ?? index === 0;
      });
      return next;
    });
  }, [selectedFeatureGroupDefinition]);

  React.useEffect(() => {
    setFeatureQuery("");
    setPresetUndoSelection(null);
  }, [draft.category]);

  React.useEffect(() => {
    if (!normalizedFeatureQuery) return;
    setExpandedFeatureGroups((prev) => {
      const next = { ...prev };
      allVisibleFeatureGroups.forEach((group) => {
        next[group.key] = true;
      });
      return next;
    });
  }, [allVisibleFeatureGroups, normalizedFeatureQuery]);

  const updateField = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetailField = (key: DetailFieldKey, value: string) => {
    setDraft((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [key]: value,
        ...(key === "farmCategory" ? { equipmentType: "" } : {}),
      },
    }));
  };

  const toggleFeature = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      selectedFeatureIds: prev.selectedFeatureIds.includes(id)
        ? prev.selectedFeatureIds.filter((featureId) => featureId !== id)
        : [...prev.selectedFeatureIds, id],
    }));
    setPresetUndoSelection(null);
  };

  const setFeatureSelection = (
    featureIds: string[],
    mode: "add" | "remove",
    resetPresetUndo = true
  ) => {
    if (featureIds.length === 0) return;

    setDraft((prev) => {
      const selection = new Set(prev.selectedFeatureIds);
      if (mode === "add") {
        featureIds.forEach((featureId) => selection.add(featureId));
      } else {
        featureIds.forEach((featureId) => selection.delete(featureId));
      }
      return {
        ...prev,
        selectedFeatureIds: Array.from(selection),
      };
    });
    if (resetPresetUndo) {
      setPresetUndoSelection(null);
    }
  };

  const toggleFeatureGroupExpansion = (groupKey: string) => {
    setExpandedFeatureGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const clearFeatureSelection = () => {
    updateField("selectedFeatureIds", []);
    setPresetUndoSelection(null);
  };

  const applyFeaturePreset = (presetId: FeaturePresetId) => {
    if (
      !selectedFeatureGroupDefinition ||
      !selectedFeatureGroups ||
      allCategoryFeatures.length === 0
    ) {
      return;
    }

    const groupedFeatures = allCategoryFeatures;

    let presetFeatures: ListingFeatureOption[] = [];

    if (presetId === "popular") {
      presetFeatures = pickFeaturesByKeywords(groupedFeatures, POPULAR_FEATURE_KEYWORDS, 10);
    } else if (presetId === "safety") {
      const safetyGroups = selectedFeatureGroupDefinition.order
        .filter((groupKey) => groupKey.includes("safety"))
        .flatMap((groupKey) => selectedFeatureGroups[groupKey] ?? []);
      const byKeywords = pickFeaturesByKeywords(groupedFeatures, SAFETY_FEATURE_KEYWORDS);
      presetFeatures = [...safetyGroups, ...byKeywords].filter(
        (feature, index, collection) =>
          collection.findIndex((candidate) => candidate.id === feature.id) === index
      );
    } else if (presetId === "driver_assist") {
      const assistGroups = selectedFeatureGroupDefinition.order
        .filter(
          (groupKey) =>
            groupKey.includes("technology") ||
            groupKey.includes("control") ||
            groupKey.includes("telematics")
        )
        .flatMap((groupKey) => selectedFeatureGroups[groupKey] ?? []);
      const byKeywords = pickFeaturesByKeywords(groupedFeatures, DRIVER_ASSIST_FEATURE_KEYWORDS);
      presetFeatures = [...assistGroups, ...byKeywords].filter(
        (feature, index, collection) =>
          collection.findIndex((candidate) => candidate.id === feature.id) === index
      );
    }

    if (presetFeatures.length === 0) return;

    setPresetUndoSelection([...draft.selectedFeatureIds]);
    setFeatureSelection(
      presetFeatures.map((feature) => feature.id),
      "add",
      false
    );
  };

  const undoFeaturePreset = () => {
    if (!presetUndoSelection) return;
    updateField("selectedFeatureIds", presetUndoSelection);
    setPresetUndoSelection(null);
  };

  const handleCoverSelection = (files: File[]) => {
    const file = files[0];
    if (!file) {
      updateField("coverImageName", null);
      setCoverFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setMediaError("Cover image exceeds 10MB limit.");
      return;
    }
    setMediaError(null);
    updateField("coverImageName", file.name);
    setCoverFile(file);
  };

  const handleGallerySelection = (newFiles: File[]) => {
    if (galleryFiles.length + newFiles.length > MAX_GALLERY_IMAGES) {
      setMediaError(`Gallery supports up to ${MAX_GALLERY_IMAGES} images.`);
      return;
    }

    const oversized = newFiles.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setMediaError(`"${oversized.name}" exceeds 10MB limit.`);
      return;
    }

    setMediaError(null);
    const updatedGalleryFiles = [...galleryFiles, ...newFiles];
    setGalleryFiles(updatedGalleryFiles);
    
    setDraft((prev) => ({
      ...prev,
      galleryImageNames: updatedGalleryFiles.map((file) => file.name),
      coverFromGalleryIndex:
        prev.coverFromGalleryIndex !== null &&
        prev.coverFromGalleryIndex < updatedGalleryFiles.length
          ? prev.coverFromGalleryIndex
          : updatedGalleryFiles.length > 0
            ? 0
            : null,
    }));
  };

  const removeGalleryFile = (fileToRemove: File) => {
    const updatedGalleryFiles = galleryFiles.filter(f => f !== fileToRemove);
    setGalleryFiles(updatedGalleryFiles);
    
    setDraft((prev) => {
        const newNames = updatedGalleryFiles.map(f => f.name);
        
        let newCoverIndex = prev.coverFromGalleryIndex;
        if (newCoverIndex !== null && newCoverIndex >= newNames.length) {
            newCoverIndex = newNames.length > 0 ? 0 : null;
        }

        return {
            ...prev,
            galleryImageNames: newNames,
            coverFromGalleryIndex: newCoverIndex
        };
    });
  };

  const handleDocumentSelection = (newFiles: File[]) => {
    const oversized = newFiles.find((file) => file.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      setMediaError(`"${oversized.name}" exceeds 10MB limit.`);
      return;
    }
    setMediaError(null);
    const updatedFiles = [...documentFiles, ...newFiles];
    setDocumentFiles(updatedFiles);
    setDraft((prev) => ({
      ...prev,
      documentNames: updatedFiles.map((file) => file.name),
    }));
  };

  const removeDocumentFile = (fileToRemove: File) => {
      const updatedFiles = documentFiles.filter(f => f !== fileToRemove);
      setDocumentFiles(updatedFiles);
      setDraft((prev) => ({
          ...prev,
          documentNames: updatedFiles.map(f => f.name)
      }));
  };

  const moveGalleryImage = (index: number, direction: "up" | "down") => {
    setDraft((prev) => {
      const toIndex = direction === "up" ? index - 1 : index + 1;
      if (toIndex < 0 || toIndex >= prev.galleryImageNames.length) return prev;
      
      const reorderedNames = [...prev.galleryImageNames];
      [reorderedNames[index], reorderedNames[toIndex]] = [reorderedNames[toIndex], reorderedNames[index]];
      
      const reorderedFiles = [...galleryFiles];
      [reorderedFiles[index], reorderedFiles[toIndex]] = [reorderedFiles[toIndex], reorderedFiles[index]];
      setGalleryFiles(reorderedFiles);

      let coverFromGalleryIndex = prev.coverFromGalleryIndex;
      if (coverFromGalleryIndex === index) coverFromGalleryIndex = toIndex;
      else if (coverFromGalleryIndex === toIndex) coverFromGalleryIndex = index;

      return {
        ...prev,
        galleryImageNames: reorderedNames,
        coverFromGalleryIndex,
      };
    });
  };

  const applyDealerAutofill = (enabled: boolean) => {
    if (!enabled) {
      setDraft((prev) => ({ ...prev, useDealerAutoFill: false }));
      return;
    }
    setDraft((prev) => ({
      ...prev,
      useDealerAutoFill: true,
      sellerType: "dealer",
      contactName: "Dealer Primary Contact",
      phoneNumber: "+254700123456",
      whatsappNumber: "+254700123456",
      whatsappEnabled: true,
    }));
  };

  const mediaValidationError = React.useMemo(() => {
    const totalImages = (draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length;
    if (totalImages < MIN_TOTAL_IMAGES) return `Minimum ${MIN_TOTAL_IMAGES} photos required.`;
    if (!draft.coverImageName && draft.coverFromGalleryIndex === null) {
      return "Select a cover image upload or choose one from gallery.";
    }
    if (draft.galleryImageNames.length > MAX_GALLERY_IMAGES) {
      return `Gallery supports up to ${MAX_GALLERY_IMAGES} images.`;
    }
    return mediaError;
  }, [draft.coverFromGalleryIndex, draft.coverImageName, draft.galleryImageNames.length, mediaError]);

  const sellerValidationError = React.useMemo(() => {
    if (!draft.contactName.trim() || !draft.phoneNumber.trim()) {
      return "Contact name and phone number are required.";
    }
    if (!isValidPhone(draft.phoneNumber)) {
      return "Phone number format is invalid.";
    }
    if (draft.whatsappEnabled) {
      if (!draft.whatsappNumber.trim()) {
        return "WhatsApp number is required when WhatsApp is enabled.";
      }
      if (!isValidPhone(draft.whatsappNumber)) {
        return "WhatsApp number format is invalid.";
      }
    }
    return null;
  }, [draft.contactName, draft.phoneNumber, draft.whatsappEnabled, draft.whatsappNumber]);

  const canContinue = React.useMemo(() => {
    if (activeStep === 0) return Boolean(draft.category);

    if (activeStep === 1) {
      return Boolean(
        draft.title.trim().length > 0 &&
        draft.title.trim().length <= MAX_TITLE_LENGTH &&
          draft.priceKes &&
          Number(draft.priceKes) > 0 &&
          draft.country.trim() &&
          draft.cityTown.trim() &&
          draft.locationArea.trim() &&
          draft.description.trim().length > 0 &&
          draft.description.trim().length <= MAX_DESCRIPTION_LENGTH
      );
    }

    if (activeStep === 2) {
      if (!draft.category) return false;
      return DETAIL_FIELDS_BY_CATEGORY[draft.category]
        .filter((field) => field.required)
        .every((field) => draft.details[field.key].trim().length > 0);
    }

    if (activeStep === 3) return draft.selectedFeatureIds.length > 0;
    if (activeStep === 4) return !mediaValidationError;

    if (activeStep === 5) {
      return !sellerValidationError;
    }

    return true;
  }, [activeStep, draft, mediaValidationError, sellerValidationError]);

  const handleContinue = async () => {
    if (!canContinue) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);

    if (isLastStep) {
      // Transform draft data to match the server schema
      const listingData: ListingFormData = {
        category: draft.category as ListingCategory,
        make: draft.details.make || "",
        model: draft.details.model || "",
        year: parseInt(draft.details.year) || new Date().getFullYear(),
        price: parseFloat(draft.priceKes.replace(/,/g, "")) || 0,
        currency: "KES",
        mileage: draft.details.mileage ? parseInt(draft.details.mileage) : undefined,
        condition: draft.condition as "new" | "locally_used" | "foreign_used",
        description: draft.description,
        features: draft.selectedFeatureIds,
        body_type: getListingBodyType(draft.details),
        transmission: draft.details.transmission || undefined,
        fuel_type: draft.details.engineType || draft.details.fuelType || undefined,
        color: draft.details.color || undefined,
        metadata: { details: getPersistedListingDetails(draft.details) },
      };

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await createListing(listingData);

        if (result.error) {
          const errorMessage = typeof result.error === "string"
            ? result.error
            : "Validation failed. Please check your inputs.";
          setSubmitError(errorMessage);
          setIsSubmitting(false);
          return;
        }

        if ("success" in result && result.success && "data" in result && result.data) {
          setCreatedListingId(result.data.id);
          clearSavedDraft();
          setSubmitted(true);
        }
      } catch (error) {
        setSubmitError("An unexpected error occurred. Please try again.");
        console.error("Listing submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setActiveStep((prev) => Math.min(prev + 1, LISTING_WIZARD_STEPS.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const draftSavedIndicator = showDraftSaved ? " • Draft saved" : "";
  const footerMeta =
    activeStep === 3
      ? `${draft.selectedFeatureIds.length} features selected${draftSavedIndicator}`
      : activeStep === 4
        ? `${(draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length} photos attached${draftSavedIndicator}`
        : `Step ${activeStep + 1} of ${LISTING_WIZARD_STEPS.length}${draftSavedIndicator}`;

  if (submitted) {
    return (
      <section
        className="rounded-2xl border border-info/20 bg-gradient-to-br from-info/10 via-white to-primary/10 p-8"
        data-testid="listing-submit-success"
      >
        <div className="mx-auto max-w-2xl space-y-5 text-center">
          <Badge variant="info" className="mx-auto w-fit">
            Submitted Successfully
          </Badge>
          <h2 className="text-3xl font-bold text-foreground">Listing sent for moderation</h2>
          <p className="text-muted-foreground">
            Current status: <span className="font-semibold text-foreground">Pending Approval</span>.
            Listing becomes public after admin approval.
          </p>
          <div className="rounded-xl border border-border bg-white p-4 text-left text-sm">
            <p className="font-semibold text-foreground">Post-submission lifecycle</p>
            <p className="mt-2 text-muted-foreground">Pending Approval → Approved → Rejected (with reason)</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/dashboard/listings">View My Listings</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <WizardShell
      title="Add Listing"
      description="Unified listing form for Cars, Vans, Motorbikes, Trucks, Plant & Construction, and Farm & Agricultural."
      steps={LISTING_WIZARD_STEPS}
      activeStep={activeStep}
      testId="listing-wizard"
      footerMeta={footerMeta}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            disabled={activeStep === 0 || isSubmitting}
            onClick={handleBack}
            data-testid="listing-wizard-back"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            disabled={isSubmitting}
            data-testid="listing-wizard-next"
          >
            {isSubmitting ? "Submitting..." : isLastStep ? "Submit Listing" : "Continue"}
          </Button>
        </>
      }
    >
      {/* Error Display */}
      {submitError && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <p className="font-semibold">Submission Error</p>
          <p className="mt-1">{submitError}</p>
        </div>
      )}

      {activeStep === 0 && (
        <div className="space-y-4" data-testid="listing-step-category">
          <h2 className="text-lg font-semibold text-foreground">1. Category Selection</h2>
          <p className="text-sm text-muted-foreground">
            Category selection is mandatory and controls fields in subsequent steps.
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {LISTING_CATEGORY_OPTIONS.map((category) => {
              const selected = draft.category === category.value;
              return (
                <button
                  key={category.value}
                  type="button"
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-white hover:border-primary/40",
                    showValidationErrors && !draft.category && "border-destructive"
                  )}
                  onClick={() => updateField("category", category.value)}
                  data-testid={`listing-category-${category.value}`}
                >
                  <p className="font-semibold text-foreground">{category.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeStep === 1 && (
        <div className="space-y-4" data-testid="listing-step-basics">
          <h2 className="text-lg font-semibold text-foreground">2. Listing Basics</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="listing-title">Listing Title</Label>
              <Input
                id="listing-title"
                data-testid="listing-title"
                placeholder="2019 Toyota Prado TX-L, low mileage"
                maxLength={MAX_TITLE_LENGTH}
                className={cn(showValidationErrors && !draft.title.trim() && "border-destructive focus-visible:ring-destructive")}
                value={draft.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
              {showValidationErrors && !draft.title.trim() && (
                <p className="mt-1 text-xs text-destructive">Title is required.</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {draft.title.length}/{MAX_TITLE_LENGTH} characters
              </p>
            </div>
            <div>
              <Label>Category</Label>
              <div className={cn(
                  "flex h-12 items-center rounded-lg border border-input bg-muted px-4 text-sm font-medium",
                  showValidationErrors && !draft.category && "border-destructive"
              )}>
                {LISTING_CATEGORY_OPTIONS.find((option) => option.value === draft.category)?.label ?? "Not selected"}
              </div>
            </div>
            <div>
              <Label htmlFor="listing-condition">Condition</Label>
              <select
                id="listing-condition"
                data-testid="listing-condition"
                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
                value={draft.condition}
                onChange={(event) =>
                  updateField(
                    "condition",
                    event.target.value as (typeof LISTING_CONDITION_OPTIONS)[number]["value"]
                  )
                }
              >
                {LISTING_CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="listing-price">Price (KES only)</Label>
              <Input
                id="listing-price"
                data-testid="listing-price"
                type="text"
                inputMode="numeric"
                placeholder="2,450,000"
                className={cn(showValidationErrors && (!draft.priceKes || Number(draft.priceKes) <= 0) && "border-destructive focus-visible:ring-destructive")}
                value={formatPriceInput(draft.priceKes)}
                onChange={(event) => updateField("priceKes", unformatPrice(event.target.value))}
              />
              {draft.priceKes && Number(draft.priceKes) > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatKES(draft.priceKes)}
                </p>
              )}
              {showValidationErrors && (!draft.priceKes || Number(draft.priceKes) <= 0) && (
                <p className="mt-1 text-xs text-destructive">Valid price is required.</p>
              )}
            </div>
            <label className="flex items-end gap-3 rounded-lg border border-border p-3">
              <input
                type="checkbox"
                checked={draft.negotiable}
                onChange={(event) => updateField("negotiable", event.target.checked)}
                data-testid="listing-negotiable"
              />
              <span className="text-sm text-foreground">Negotiable</span>
            </label>
            <div>
              <Label htmlFor="listing-currency">Currency</Label>
              <div
                id="listing-currency"
                className="flex h-12 items-center rounded-lg border border-input bg-muted px-4 text-sm font-medium"
              >
                KES (Locked for MVP)
              </div>
            </div>
            <div>
              <Label htmlFor="listing-country">Country</Label>
              <Select
                value={draft.country || "Kenya"}
                onValueChange={(value) => updateField("country", value)}
              >
                <SelectTrigger id="listing-country" data-testid="listing-country" className={cn(showValidationErrors && !draft.country && "border-destructive focus:ring-destructive")}>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kenya">Kenya</SelectItem>
                  <SelectItem value="Uganda">Uganda</SelectItem>
                  <SelectItem value="Tanzania">Tanzania</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
              {showValidationErrors && !draft.country.trim() && (
                <p className="mt-1 text-xs text-destructive">Country is required.</p>
              )}
            </div>
            <div>
              <Label htmlFor="listing-city">City / Town</Label>
              <Select
                value={draft.cityTown}
                onValueChange={(value) => {
                    updateField("cityTown", value);
                    // Clear area if city changes to encourage re-entry or just keep it
                }}
              >
                <SelectTrigger id="listing-city" data-testid="listing-city" className={cn(showValidationErrors && !draft.cityTown && "border-destructive focus:ring-destructive")}>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                    {KENYA_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                            {city}
                        </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              {showValidationErrors && !draft.cityTown.trim() && (
                <p className="mt-1 text-xs text-destructive">City/Town is required.</p>
              )}
            </div>
            <div>
              <Label htmlFor="listing-location-area">Location / Area</Label>
              <Input
                id="listing-location-area"
                data-testid="listing-location-area"
                placeholder="Westlands"
                className={cn(showValidationErrors && !draft.locationArea.trim() && "border-destructive focus-visible:ring-destructive")}
                value={draft.locationArea}
                onChange={(event) => updateField("locationArea", event.target.value)}
              />
              {showValidationErrors && !draft.locationArea.trim() && (
                 <p className="mt-1 text-xs text-destructive">Area is required.</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="listing-description">Description</Label>
            <Textarea
              id="listing-description"
              data-testid="listing-description"
              maxLength={MAX_DESCRIPTION_LENGTH}
              placeholder="Add relevant history, condition notes, and current state."
              className={cn(showValidationErrors && !draft.description.trim() && "border-destructive focus-visible:ring-destructive")}
              value={draft.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {draft.description.length}/{MAX_DESCRIPTION_LENGTH} characters
            </p>
            {showValidationErrors && !draft.description.trim() && (
              <p className="mt-1 text-xs text-destructive">Description is required.</p>
            )}
          </div>
          <div>
            <Label htmlFor="listing-availability">Availability Status</Label>
            <select
              id="listing-availability"
              data-testid="listing-availability"
              className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
              value={draft.availability}
              onChange={(event) =>
                updateField(
                  "availability",
                  event.target.value as (typeof LISTING_AVAILABILITY_OPTIONS)[number]["value"]
                )
              }
            >
              {LISTING_AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {activeStep === 2 && (
        <div className="space-y-4" data-testid="listing-step-details">
          <h2 className="text-lg font-semibold text-foreground">3. Vehicle / Equipment Details</h2>
          {!draft.category && (
            <p className="text-sm text-warning">Select a category first.</p>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedCategoryFields.map((field) => {
              const hasError = showValidationErrors && field.required && !draft.details[field.key].trim();
              const options =
                draft.category === "farm_agricultural" && field.key === "equipmentType"
                  ? getFarmSubcategoryOptions(draft.details.farmCategory)
                  : field.options;
              return (
              <div key={field.key}>
                <Label htmlFor={`listing-detail-${field.key}`}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Label>
                {field.type === "select" ? (
                  <select
                    id={`listing-detail-${field.key}`}
                    data-testid={DETAIL_TEST_IDS[field.key]}
                    className={cn(
                      "flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base",
                      hasError && "border-destructive focus:ring-destructive"
                    )}
                    value={draft.details[field.key]}
                    onChange={(event) => updateDetailField(field.key, event.target.value)}
                  >
                    <option value="">Select</option>
                    {options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`listing-detail-${field.key}`}
                    data-testid={DETAIL_TEST_IDS[field.key]}
                    className={cn(hasError && "border-destructive focus-visible:ring-destructive")}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={draft.details[field.key]}
                    onChange={(event) => updateDetailField(field.key, event.target.value)}
                  />
                )}
                {hasError && (
                  <p className="mt-1 text-xs text-destructive">{field.label} is required.</p>
                )}
              </div>
            );
            })}
          </div>
        </div>
      )}

      {activeStep === 3 && (
        <div className="space-y-4" data-testid="listing-step-features">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-foreground">4. Features & Specifications</h2>
              <p className="text-sm text-muted-foreground">
                Use search, presets, and group actions to pick relevant features faster.
              </p>
            </div>
            <Badge variant="info">
              {draft.selectedFeatureIds.length} selected
            </Badge>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <Label htmlFor="listing-feature-search">Find features</Label>
                <Input
                  id="listing-feature-search"
                  placeholder="Search by name or ID"
                  value={featureQuery}
                  onChange={(event) => setFeatureQuery(event.target.value)}
                  data-testid="listing-feature-search"
                />
              </div>
              <label className="flex h-12 items-center gap-2 rounded-lg border border-border px-3 text-sm">
                <input
                  type="checkbox"
                  checked={showFeatureIds}
                  onChange={(event) => setShowFeatureIds(event.target.checked)}
                  data-testid="listing-feature-show-ids"
                />
                Show IDs
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {FEATURE_PRESET_IDS.map((presetId) => (
                <FilterChip
                  key={presetId}
                  size="sm"
                  onClick={() => applyFeaturePreset(presetId)}
                  data-testid={`listing-feature-preset-${presetId}`}
                >
                  {FEATURE_PRESET_LABELS[presetId]}
                </FilterChip>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFeatureSelection}
                disabled={draft.selectedFeatureIds.length === 0}
                data-testid="listing-feature-clear-all"
              >
                Clear all
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={undoFeaturePreset}
                disabled={!presetUndoSelection}
                data-testid="listing-feature-undo-preset"
              >
                Undo preset
              </Button>
            </div>
          </div>

          {allVisibleFeatureGroups.length === 0 && (
            <p className="rounded-lg border border-warning/20 bg-warning/10 px-3 py-2 text-sm text-warning">
              No features match your search. Try a broader keyword.
            </p>
          )}

          <div className="space-y-3">
            {allVisibleFeatureGroups.map((group) => {
              const visibleFeatureIds = group.visibleFeatures.map((feature) => feature.id);
              const selectedVisibleCount = visibleFeatureIds.filter((featureId) =>
                selectedFeatureIdSet.has(featureId)
              ).length;
              const allVisibleSelected =
                visibleFeatureIds.length > 0 && selectedVisibleCount === visibleFeatureIds.length;
              const hasVisibleSelection = selectedVisibleCount > 0;
              const groupIsExpanded = expandedFeatureGroups[group.key] ?? false;

              return (
                <article key={group.key} className="rounded-xl border border-border bg-white p-4">
                  <Collapsible open={groupIsExpanded}>
                    <div className="flex flex-wrap items-start gap-3">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                        onClick={() => toggleFeatureGroupExpansion(group.key)}
                        data-testid={`listing-feature-group-toggle-${group.key}`}
                      >
                        <div>
                          <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                          <p className="text-xs text-muted-foreground">
                            {group.selectedCount}/{group.allFeatures.length} selected
                            {normalizedFeatureQuery
                              ? ` • ${group.visibleFeatures.length} matches`
                              : ""}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          {groupIsExpanded ? "Hide" : "Show"}
                        </span>
                      </button>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={allVisibleSelected ? "secondary" : "outline"}
                          onClick={() => setFeatureSelection(visibleFeatureIds, "add")}
                          disabled={allVisibleSelected || visibleFeatureIds.length === 0}
                          data-testid={`listing-feature-group-select-${group.key}`}
                        >
                          {normalizedFeatureQuery ? "Select visible" : "Select all"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setFeatureSelection(visibleFeatureIds, "remove")}
                          disabled={!hasVisibleSelection}
                          data-testid={`listing-feature-group-clear-${group.key}`}
                        >
                          {normalizedFeatureQuery ? "Clear visible" : "Clear"}
                        </Button>
                      </div>
                    </div>
                    <CollapsibleContent>
                      <div className="grid gap-2 md:grid-cols-2">
                        {group.visibleFeatures.map((feature) => (
                          <label key={feature.id} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={selectedFeatureIdSet.has(feature.id)}
                              onChange={() => toggleFeature(feature.id)}
                              data-testid={`listing-feature-${feature.id}`}
                            />
                            <span>{feature.label}</span>
                            {showFeatureIds && (
                              <span className="rounded bg-gray-5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                {feature.id}
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </article>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Selected IDs: {draft.selectedFeatureIds.length}
          </p>
        </div>
      )}

      {activeStep === 4 && (
        <div className="space-y-6" data-testid="listing-step-media">
          <h2 className="text-lg font-semibold text-foreground">5. Media Uploads</h2>
          
          <div className="grid gap-6">
            <div>
              <Label htmlFor="listing-cover-image" className="mb-2 block">Main Cover Image</Label>
              <Dropzone
                onFilesAdded={handleCoverSelection}
                files={coverFile ? [coverFile] : []}
                onRemove={() => {
                    setCoverFile(null);
                    updateField("coverImageName", null);
                }}
                accept="image/*"
                multiple={false}
                maxSize={MAX_FILE_SIZE_BYTES}
                className="h-48"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Required. Max 10MB.
              </p>
            </div>

            <div>
              <Label htmlFor="listing-media-files" className="mb-2 block">Gallery Images</Label>
              <div className="space-y-4">
                 <Dropzone
                    onFilesAdded={handleGallerySelection}
                    // We don't show files here because we show them in the custom gallery list below
                    showFiles={false}
                    accept="image/*"
                    multiple={true}
                    maxSize={MAX_FILE_SIZE_BYTES}
                    className="h-32 border-gray-200 bg-gray-50/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum {MIN_TOTAL_IMAGES} photos total. Up to {MAX_GALLERY_IMAGES} gallery images.
                  </p>
              </div>
            </div>

            <div>
              <Label htmlFor="listing-documents" className="mb-2 block">Documents (Optional)</Label>
               <Dropzone
                onFilesAdded={handleDocumentSelection}
                files={documentFiles}
                onRemove={removeDocumentFile}
                accept="image/*,.pdf"
                multiple={true}
                maxSize={MAX_FILE_SIZE_BYTES}
                className="h-32"
              />
              <p className="mt-2 text-xs text-muted-foreground">PDF or image files. Max 10MB each.</p>
            </div>
          </div>

          <div>
            <Label htmlFor="listing-video-url">Optional Video Walkaround</Label>
            <Input
              id="listing-video-url"
              data-testid="listing-video-url"
              placeholder="https://youtube.com/watch?v=..."
              value={draft.videoUrl}
              onChange={(event) => updateField("videoUrl", event.target.value)}
            />
          </div>

          {mediaValidationError && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {mediaValidationError}
            </p>
          )}

          <div className="space-y-4 rounded-xl border border-border bg-white p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">Gallery Order & Cover Selection</p>
                <div className="text-sm text-muted-foreground">
                    {galleryFiles.length} / {MAX_GALLERY_IMAGES}
                </div>
            </div>
            
            {galleryFiles.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">No gallery images uploaded yet.</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {galleryFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="relative group overflow-hidden rounded-lg border border-border bg-gray-50">
                <div className="aspect-video w-full overflow-hidden">
                    <img 
                        src={URL.createObjectURL(file)} 
                        alt={file.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                    />
                </div>
                
                <div className="absolute top-2 right-2">
                    <Button 
                        type="button" 
                        size="icon" 
                        variant="destructive" 
                        className="h-6 w-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                        onClick={() => removeGalleryFile(file)}
                    >
                        <span className="sr-only">Remove</span>
                        ×
                    </Button>
                </div>

                <div className="border-t border-border bg-white p-2">
                    <p className="truncate text-xs font-medium text-foreground mb-2">{file.name}</p>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1">
                            <Button 
                                type="button" 
                                size="sm" 
                                variant="outline" 
                                className="h-7 w-7 p-0"
                                onClick={() => moveGalleryImage(index, "up")} 
                                disabled={index === 0}
                            >
                            ↑
                            </Button>
                            <Button
                            type="button"
                            size="sm"
                            variant="outline" 
                            className="h-7 w-7 p-0"
                            onClick={() => moveGalleryImage(index, "down")}
                            disabled={index === galleryFiles.length - 1}
                            >
                            ↓
                            </Button>
                        </div>
                        <Button
                        type="button"
                        size="sm"
                        variant={draft.coverFromGalleryIndex === index ? "default" : "secondary"}
                        className="h-7 text-xs"
                        onClick={() => updateField("coverFromGalleryIndex", index)}
                        >
                        {draft.coverFromGalleryIndex === index ? "Cover" : "Set Cover"}
                        </Button>
                    </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      )}

      {activeStep === 5 && (
        <div className="space-y-4" data-testid="listing-step-seller">
          <h2 className="text-lg font-semibold text-foreground">6. Seller Information</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.useDealerAutoFill}
              onChange={(event) => applyDealerAutofill(event.target.checked)}
              data-testid="listing-use-dealer-autofill"
            />
            Use dealer defaults (auto-fill for logged-in dealers)
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="listing-seller-type">Seller Type</Label>
              <select
                id="listing-seller-type"
                data-testid="listing-seller-type"
                className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-base"
                value={draft.sellerType}
                onChange={(event) => updateField("sellerType", event.target.value as "dealer" | "individual")}
              >
                <option value="dealer">Dealer</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div>
              <Label htmlFor="listing-contact-name">Contact Name *</Label>
              <Input
                id="listing-contact-name"
                data-testid="listing-contact-name"
                placeholder="John Doe"
                value={draft.contactName}
                onChange={(event) => updateField("contactName", event.target.value)}
                className={cn(
                  showValidationErrors && !draft.contactName.trim() &&
                  "border-destructive focus-visible:ring-destructive"
                )}
              />
              {showValidationErrors && !draft.contactName.trim() && (
                <p className="mt-1 text-xs text-destructive">Contact name is required.</p>
              )}
            </div>
            <div>
              <Label htmlFor="listing-phone">Phone Number *</Label>
              <Input
                id="listing-phone"
                data-testid="listing-phone"
                placeholder="+254 7XX XXX XXX"
                value={draft.phoneNumber}
                onChange={(event) => updateField("phoneNumber", event.target.value)}
                className={cn(
                  showValidationErrors && (!draft.phoneNumber.trim() || !isValidPhone(draft.phoneNumber)) &&
                  "border-destructive focus-visible:ring-destructive"
                )}
              />
              {showValidationErrors && !draft.phoneNumber.trim() && (
                <p className="mt-1 text-xs text-destructive">Phone number is required.</p>
              )}
              {showValidationErrors && draft.phoneNumber.trim() && !isValidPhone(draft.phoneNumber) && (
                <p className="mt-1 text-xs text-destructive">Invalid phone format.</p>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="listing-whatsapp-number">WhatsApp Number</Label>
                {draft.whatsappEnabled && draft.phoneNumber && draft.phoneNumber !== draft.whatsappNumber && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => updateField("whatsappNumber", draft.phoneNumber)}
                  >
                    Copy from phone
                  </Button>
                )}
              </div>
              <Input
                id="listing-whatsapp-number"
                data-testid="listing-whatsapp-number"
                value={draft.whatsappNumber}
                onChange={(event) => updateField("whatsappNumber", event.target.value)}
                disabled={!draft.whatsappEnabled}
                className={cn(
                  showValidationErrors && draft.whatsappEnabled && !draft.whatsappNumber.trim() &&
                  "border-destructive focus-visible:ring-destructive"
                )}
              />
              {showValidationErrors && draft.whatsappEnabled && !draft.whatsappNumber.trim() && (
                <p className="mt-1 text-xs text-destructive">WhatsApp number is required.</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.whatsappEnabled}
                onChange={(event) => updateField("whatsappEnabled", event.target.checked)}
                data-testid="listing-whatsapp-enabled"
              />
              WhatsApp Enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.allowPhoneCalls}
                onChange={(event) => updateField("allowPhoneCalls", event.target.checked)}
                data-testid="listing-allow-phone-calls"
              />
              Allow Phone Calls
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.hidePhoneNumber}
                onChange={(event) => updateField("hidePhoneNumber", event.target.checked)}
                data-testid="listing-hide-phone-number"
              />
              Hide Phone Number
            </label>
          </div>
          {sellerValidationError && (
            <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {sellerValidationError}
            </p>
          )}
        </div>
      )}

      {activeStep === 6 && (
        <div className="space-y-4" data-testid="listing-step-intelligence">
          <h2 className="text-lg font-semibold text-foreground">7. Price Intelligence (MVP)</h2>
          <p className="text-sm text-muted-foreground">
            Display-only market guidance. No AI explanation in MVP scope.
          </p>
          <div className="rounded-xl border border-border bg-white p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Market Price Indicator</p>
            <div className="mt-2 flex items-center gap-3">
              <Badge variant={marketIndicator.tone}>{marketIndicator.label}</Badge>
              <p className="text-sm text-muted-foreground">{marketIndicator.note}</p>
            </div>
            <p className="mt-3 text-sm text-foreground">Current listing price: {formatKES(draft.priceKes)}</p>
          </div>
        </div>
      )}

      {activeStep === 7 && (
        <div className="space-y-4" data-testid="listing-step-review">
          <h2 className="text-lg font-semibold text-foreground">8. Review & Submit</h2>
          <div className="grid gap-3 rounded-xl border border-border bg-white p-4 text-sm md:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Listing Title</p>
              <p className="font-semibold text-foreground">{draft.title || "-"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Category</p>
              <p className="font-semibold text-foreground">
                {LISTING_CATEGORY_OPTIONS.find((option) => option.value === draft.category)?.label ?? "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Condition</p>
              <p className="font-semibold text-foreground">{draft.condition}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price (KES)</p>
              <p className="font-semibold text-foreground">{formatKES(draft.priceKes)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-semibold text-foreground">
                {draft.locationArea || "-"}, {draft.cityTown || "-"}, {draft.country || "-"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Availability</p>
              <p className="font-semibold text-foreground">{draft.availability}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Features (IDs)</p>
              <p className="font-semibold text-foreground">{draft.selectedFeatureIds.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Media</p>
              <p className="font-semibold text-foreground">
                {draft.coverImageName ? "Cover ready" : "No cover"} • {draft.galleryImageNames.length} gallery image(s)
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Contact Preferences</p>
              <p className="font-semibold text-foreground">
                {draft.whatsappEnabled ? "WhatsApp" : "No WhatsApp"} • {draft.allowPhoneCalls ? "Phone calls allowed" : "No phone calls"}
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Submission sends listing for administrative review. Post-submission status starts at Pending Approval.
          </p>
          <p className="text-xs text-muted-foreground">
            Rejected listings include an admin reason for correction and resubmission.
          </p>
        </div>
      )}
    </WizardShell>
  );
}
