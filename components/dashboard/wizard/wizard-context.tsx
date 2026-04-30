"use client";

import * as React from "react";
import {
  LISTING_CATEGORY_OPTIONS,
  LISTING_AVAILABILITY_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURES_BY_CATEGORY,
  LISTING_WIZARD_STEPS,
  type ListingCategory,
} from "@/lib/constants/marketplace";
import { createClient } from "@/lib/supabase/client";
import type { Listing } from "@/lib/types/listing";
import {
  getListingMetadataBoolean,
  getListingMetadataDetails,
  getListingMetadataString,
} from "@/lib/utils/listing-details";
import { getSellerPackageAccessForUser } from "@/lib/data/membership";
import { getListingDisplayTitle, getListingTrim, getListingVariant } from "@/lib/utils/vehicle-display";
import type { SellerPackageAccessState } from "@/lib/types/membership";

// ─── Types ───
export type DetailFieldKey =
  | "make" | "model" | "trim" | "variant" | "year" | "engineType" | "transmission"
  | "driveType" | "mileage" | "bodyType" | "bodyStyle" | "loadCapacity"
  | "engineCapacity" | "fuelType" | "fuelSystem" | "bikeType" | "color"
  | "seats" | "axleConfiguration" | "equipmentType" | "operatingHours"
  | "operatingWeight" | "operationalStatus" | "powerOutput" | "usageType";

export type DetailField = {
  key: DetailFieldKey;
  label: string;
  type: "text" | "number" | "select";
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
};

// When editing an existing listing we keep the original image metadata
// (r2_key + alt text) alongside the filename so the media step can render
// real thumbnails instead of a grey "Existing image" placeholder.
export type ExistingImageRef = {
  name: string;
  r2_key: string;
  alt_text: string | null;
};

export type ListingDraft = {
  category: ListingCategory | "";
  title: string;
  condition: (typeof LISTING_CONDITION_OPTIONS)[number]["value"];
  priceKes: string;
  negotiable: boolean;
  tradeInAccepted: boolean;
  country: string;
  cityTown: string;
  locationArea: string;
  description: string;
  availability: (typeof LISTING_AVAILABILITY_OPTIONS)[number]["value"];
  details: Record<DetailFieldKey, string>;
  selectedFeatureIds: string[];
  coverImageName: string | null;
  galleryImageNames: string[];
  coverImageRef: ExistingImageRef | null;
  galleryImageRefs: ExistingImageRef[];
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

export const DEFAULT_DRAFT: ListingDraft = {
  category: "",
  title: "",
  condition: "locally_used",
  priceKes: "",
  negotiable: true,
  tradeInAccepted: false,
  country: "Kenya",
  cityTown: "",
  locationArea: "",
  description: "",
  availability: "available",
  details: {
    make: "", model: "", trim: "", variant: "", year: "", engineType: "", transmission: "",
    driveType: "", mileage: "", bodyType: "", bodyStyle: "", loadCapacity: "",
    engineCapacity: "", fuelType: "", fuelSystem: "", bikeType: "", color: "",
    seats: "", axleConfiguration: "", equipmentType: "", operatingHours: "",
    operatingWeight: "", operationalStatus: "", powerOutput: "", usageType: "",
  },
  selectedFeatureIds: [],
  coverImageName: null,
  galleryImageNames: [],
  coverImageRef: null,
  galleryImageRefs: [],
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

export const DETAIL_FIELDS_BY_CATEGORY: Record<ListingCategory, DetailField[]> = {
  car: [
    { key: "make", label: "Make", type: "select", required: true, placeholder: "Toyota" },
    { key: "model", label: "Model", type: "select", required: true, placeholder: "Corolla" },
    { key: "trim", label: "Trim", type: "select", required: false, placeholder: "TX" },
    { key: "variant", label: "Variant / Engine", type: "select", required: false, placeholder: "xDrive30d" },
    { key: "year", label: "Year of Manufacture", type: "number", required: true, placeholder: "2021" },
    { key: "engineType", label: "Engine Type", type: "select", required: true, options: [{ value: "petrol", label: "Petrol" }, { value: "diesel", label: "Diesel" }, { value: "hybrid", label: "Hybrid" }, { value: "electric", label: "Electric" }] },
    { key: "transmission", label: "Transmission", type: "select", required: true, options: [{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }] },
    { key: "driveType", label: "Drive Type", type: "select", required: true, options: [{ value: "fwd", label: "FWD" }, { value: "rwd", label: "RWD" }, { value: "awd", label: "AWD" }, { value: "4wd", label: "4WD" }] },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "58000" },
    { key: "bodyType", label: "Body Type", type: "select", required: true, options: [{ value: "saloon", label: "Saloon" }, { value: "hatchback", label: "Hatchback" }, { value: "coupe", label: "Coupe" }, { value: "wagon", label: "Station Wagon" }, { value: "convertible", label: "Convertible" }, { value: "pickup", label: "Pick Up" }, { value: "suv", label: "SUV" }] },
    { key: "color", label: "Color", type: "text", required: true, placeholder: "Pearl White" },
    { key: "seats", label: "Number of Seats", type: "number", required: true, placeholder: "5" },
  ],
  van: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Toyota" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "Hiace" },
    { key: "year", label: "Year of Manufacture", type: "number", required: true, placeholder: "2021" },
    { key: "fuelType", label: "Fuel Type", type: "select", required: true, options: [{ value: "petrol", label: "Petrol" }, { value: "diesel", label: "Diesel" }, { value: "electric", label: "Electric" }] },
    { key: "transmission", label: "Transmission", type: "select", required: true, options: [{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }] },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "110000" },
    { key: "bodyStyle", label: "Body Style", type: "select", required: true, options: [{ value: "panel_van", label: "Panel Van" }, { value: "pickup", label: "Pickup" }, { value: "minibus", label: "Minibus" }, { value: "passenger_van", label: "Passenger Van" }] },
  ],
  motorbike: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Honda" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "CB500X" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2022" },
    { key: "bikeType", label: "Bike Type", type: "select", required: true, options: [{ value: "sport", label: "Sport" }, { value: "cruiser", label: "Cruiser" }, { value: "touring", label: "Touring" }, { value: "scooter", label: "Scooter" }, { value: "dirt", label: "Dirt/Off-road" }, { value: "standard", label: "Standard/Naked" }] },
    { key: "engineCapacity", label: "Engine Capacity (cc)", type: "number", required: true, placeholder: "500" },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "8000" },
    { key: "color", label: "Color", type: "text", required: true, placeholder: "Red" },
  ],
  truck: [
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Isuzu" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "FRR" },
    { key: "year", label: "Year of Manufacture", type: "number", required: true, placeholder: "2020" },
    { key: "fuelType", label: "Fuel Type", type: "select", required: true, options: [{ value: "diesel", label: "Diesel" }, { value: "petrol", label: "Petrol" }, { value: "cng", label: "CNG" }] },
    { key: "transmission", label: "Transmission", type: "select", required: true, options: [{ value: "automatic", label: "Automatic" }, { value: "manual", label: "Manual" }] },
    { key: "mileage", label: "Mileage (km)", type: "number", required: true, placeholder: "180000" },
    { key: "axleConfiguration", label: "Axle Configuration", type: "select", required: true, options: [{ value: "4x2", label: "4x2" }, { value: "6x2", label: "6x2" }, { value: "6x4", label: "6x4" }, { value: "8x4", label: "8x4" }] },
    { key: "loadCapacity", label: "Load Capacity (tonnes)", type: "number", required: true, placeholder: "12" },
  ],
  plant_construction: [
    { key: "equipmentType", label: "Equipment Type", type: "select", required: true, options: [{ value: "excavator", label: "Excavator" }, { value: "bulldozer", label: "Bulldozer" }, { value: "loader", label: "Loader" }, { value: "crane", label: "Crane" }] },
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Caterpillar" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "320D" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2018" },
    { key: "operatingHours", label: "Hours Used", type: "number", required: true, placeholder: "6400" },
    { key: "operatingWeight", label: "Operating Weight (Optional)", type: "number", required: false, placeholder: "22000" },
    { key: "operationalStatus", label: "Operational Status", type: "select", required: true, options: [{ value: "working", label: "Working" }, { value: "needs_repair", label: "Needs Repair" }] },
  ],
  farm_agricultural: [
    { key: "equipmentType", label: "Equipment Type", type: "select", required: true, options: [{ value: "tractor", label: "Tractor" }, { value: "plough", label: "Plough" }, { value: "harvester", label: "Harvester" }] },
    { key: "make", label: "Make", type: "text", required: true, placeholder: "Massey Ferguson" },
    { key: "model", label: "Model", type: "text", required: true, placeholder: "MF 385" },
    { key: "year", label: "Year", type: "number", required: true, placeholder: "2019" },
    { key: "operatingHours", label: "Hours Used", type: "number", required: true, placeholder: "1200" },
    { key: "powerOutput", label: "Horsepower / Capacity (Optional)", type: "number", required: false, placeholder: "85" },
    { key: "operationalStatus", label: "Operational Status", type: "select", required: true, options: [{ value: "working", label: "Working" }, { value: "needs_repair", label: "Needs Repair" }] },
  ],
};

export const MARKET_BENCHMARKS: Record<ListingCategory, [number, number]> = {
  car: [1_500_000, 4_500_000],
  van: [1_800_000, 5_200_000],
  motorbike: [120_000, 850_000],
  truck: [3_500_000, 12_000_000],
  plant_construction: [4_000_000, 22_000_000],
  farm_agricultural: [900_000, 8_500_000],
};

export const MAX_DESCRIPTION_LENGTH = 800;
export const MAX_TITLE_LENGTH = 120;
export const MIN_TOTAL_IMAGES = 3;
export const MAX_GALLERY_IMAGES = 100;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_FILE_SIZE_BYTES = 200 * 1024 * 1024;
export const PHONE_REGEX = /^\+?[0-9]{8,15}$/;
export const DRAFT_STORAGE_KEY = "autolist_listing_draft";
const SUBMITTABLE_STEP_INDICES = [0, 1, 2, 3, 4, 5] as const;
const VIDEO_ACCEPTED_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
]);
const LISTING_CATEGORY_VALUE_SET = new Set(
  LISTING_CATEGORY_OPTIONS.map((option) => option.value)
);
const LISTING_AVAILABILITY_VALUE_SET = new Set(
  LISTING_AVAILABILITY_OPTIONS.map((option) => option.value)
);

export type WizardIssue = {
  message: string;
  stepIndex: number | null;
};

type AuthenticatedProfileRole =
  | "buyer"
  | "seller"
  | "dealer"
  | "sales_agent"
  | "support"
  | "admin"
  | "super_admin";

type SellerAccountDefaults = {
  sellerType: ListingDraft["sellerType"];
  useDealerAutoFill: boolean;
  contactName: string;
  phoneNumber: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
};

// ─── Utility functions ───
export function formatKES(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "-";
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(amount);
}

export function formatPriceInput(value: string): string {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat("en-KE").format(Number(numericValue));
}

export function unformatPrice(value: string): string {
  return value.replace(/[^0-9]/g, "");
}

export function isValidPhone(value: string) {
  return PHONE_REGEX.test(value.replace(/\s+/g, ""));
}

function buildTrimTokens(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function buildAutoListingTitle(details: ListingDraft["details"]) {
  const trimValue = buildTrimTokens(details.trim).join(", ");
  const parts = [
    details.year.trim(),
    details.make.trim(),
    details.model.trim(),
    trimValue || details.variant.trim(),
  ].filter(Boolean);

  return parts.join(" ").slice(0, MAX_TITLE_LENGTH);
}

export function getMarketIndicator(category: ListingCategory | "", priceKes: string) {
  if (!category) return { label: "Select a category", tone: "outline" as const, note: "Category required." };
  const amount = Number(priceKes);
  if (!Number.isFinite(amount) || amount <= 0) return { label: "Enter listing price", tone: "outline" as const, note: "Price required to estimate market range." };
  const [min, max] = MARKET_BENCHMARKS[category];
  if (amount < min) return { label: "Below Market", tone: "success" as const, note: `Typical range ${formatKES(String(min))} - ${formatKES(String(max))}.` };
  if (amount > max) return { label: "Above Market", tone: "warning" as const, note: `Typical range ${formatKES(String(min))} - ${formatKES(String(max))}.` };
  return { label: "Within Market", tone: "info" as const, note: `Typical range ${formatKES(String(min))} - ${formatKES(String(max))}.` };
}

// ─── Context ───
interface WizardContextValue {
  isEditing: boolean;
  editingListingId: string | null;
  draft: ListingDraft;
  activeStep: number;
  showValidationErrors: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  submitIssues: WizardIssue[];
  submitted: boolean;
  autoApproved: boolean;
  createdListingId: string | null;
  stepCompletion: boolean[];
  packageAccess: SellerPackageAccessState | null;
  isLoadingPackageAccess: boolean;
  packageAccessError: string | null;

  // Media file refs
  coverFile: File | null;
  galleryFiles: File[];
  documentFiles: File[];
  videoFile: File | null;

  // Feature state
  featureQuery: string;
  showFeatureIds: boolean;
  expandedFeatureGroups: Record<string, boolean>;
  selectedFeatureIdSet: Set<string>;

  // Actions
  updateField: <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => void;
  updateDetailField: (key: DetailFieldKey, value: string) => void;
  toggleFeature: (id: string) => void;
  setFeatureQuery: (q: string) => void;
  setShowFeatureIds: (show: boolean) => void;
  toggleFeatureGroupExpansion: (groupKey: string) => void;
  applyFeaturePreset: (presetId: string) => void;
  undoFeaturePreset: () => void;
  clearFeatureSelection: () => void;
  setFeatureSelection: (ids: string[], mode: "add" | "remove") => void;

  // Media handlers
  handleCoverSelection: (files: File[]) => void;
  handleGallerySelection: (newFiles: File[]) => void;
  selectExistingGalleryCover: (index: number) => void;
  removeGalleryFile: (file: File) => void;
  moveGalleryImage: (index: number, direction: "up" | "down") => void;
  reorderGalleryImages: (fromIndex: number, toIndex: number) => void;
  handleDocumentSelection: (newFiles: File[]) => void;
  removeDocumentFile: (file: File) => void;
  handleVideoSelection: (files: File[]) => void;
  removeVideoFile: () => void;

  // Seller
  applyDealerAutofill: (enabled: boolean) => void;
  resetDraft: () => void;

  // Navigation
  handleContinue: () => Promise<void>;
  handleBack: () => void;
  goToStep: (stepIndex: number, options?: { showValidationErrors?: boolean }) => void;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;

  // Computed
  canContinue: boolean;
  mediaValidationError: string | null;
  sellerValidationError: string | null;
  marketIndicator: { label: string; tone: string; note: string };
  selectedCategoryFields: DetailField[];
}

const WizardContext = React.createContext<WizardContextValue | null>(null);

function extractFileName(pathLike: string | null | undefined) {
  if (!pathLike) return null;
  const normalized = pathLike.split("?")[0] ?? pathLike;
  const segments = normalized.split("/");
  return segments[segments.length - 1] || normalized;
}

function getExistingImageKeyOrder(draft: ListingDraft) {
  return [
    draft.coverImageRef?.r2_key,
    ...draft.galleryImageRefs.map((image) => image.r2_key),
  ].filter((key): key is string => Boolean(key));
}

function didExistingImageOrderChange(current: string[], initial: string[]) {
  return (
    current.length > 0 &&
    current.length === initial.length &&
    current.some((key, index) => key !== initial[index])
  );
}

function getDraftCategory(listing: Listing): ListingCategory {
  const metadataCategory = getListingMetadataString(listing, "category");
  if (
    metadataCategory &&
    LISTING_CATEGORY_VALUE_SET.has(metadataCategory as ListingCategory)
  ) {
    return metadataCategory as ListingCategory;
  }

  return "car";
}

function getDraftAvailability(
  listing: Listing
): ListingDraft["availability"] {
  const metadataAvailability = getListingMetadataString(listing, "availability");
  if (
    metadataAvailability &&
    LISTING_AVAILABILITY_VALUE_SET.has(
      metadataAvailability as ListingDraft["availability"]
    )
  ) {
    return metadataAvailability as ListingDraft["availability"];
  }

  return DEFAULT_DRAFT.availability;
}

function buildDraftFromListing(listing: Listing): ListingDraft {
  const detailMetadata = getListingMetadataDetails(listing);
  const sortedImages = [...(listing.images ?? [])].sort((a, b) => a.image_order - b.image_order);
  const [coverImage, ...galleryImages] = sortedImages;
  const sellerTypeMetadata = getListingMetadataString(listing, "sellerType");
  const cityTown =
    getListingMetadataString(listing, "cityTown") ||
    listing.dealer?.city?.trim() ||
    "";
  const locationArea =
    getListingMetadataString(listing, "locationArea") ||
    listing.dealer?.address?.trim() ||
    "";
  const contactName =
    getListingMetadataString(listing, "contactName") ||
    listing.dealer?.name?.trim() ||
    listing.seller?.full_name?.trim() ||
    "";
  const phoneNumber =
    getListingMetadataString(listing, "phoneNumber") ||
    listing.dealer?.mobile?.trim() ||
    "";
  const whatsappNumber =
    getListingMetadataString(listing, "whatsappNumber") ||
    listing.dealer?.whatsapp?.trim() ||
    phoneNumber;
  const sellerType =
    sellerTypeMetadata === "dealer" || sellerTypeMetadata === "individual"
      ? sellerTypeMetadata
      : listing.dealer_id
        ? "dealer"
        : "individual";

  return {
    ...DEFAULT_DRAFT,
    category: getDraftCategory(listing),
    title: getListingDisplayTitle(listing),
    condition: (listing.condition === "new" || listing.condition === "foreign_used" || listing.condition === "locally_used")
      ? listing.condition
      : DEFAULT_DRAFT.condition,
    priceKes: String(listing.price ?? ""),
    negotiable:
      getListingMetadataBoolean(listing, "negotiable") ?? DEFAULT_DRAFT.negotiable,
    tradeInAccepted:
      getListingMetadataBoolean(listing, "tradeInAccepted") ?? DEFAULT_DRAFT.tradeInAccepted,
    country: getListingMetadataString(listing, "country") || DEFAULT_DRAFT.country,
    cityTown,
    locationArea,
    description: listing.description ?? "",
    availability: getDraftAvailability(listing),
    videoUrl: getListingMetadataString(listing, "videoUrl") || "",
    details: {
      ...DEFAULT_DRAFT.details,
      make: listing.make ?? "",
      model: listing.model ?? "",
      trim: getListingTrim(listing) ?? "",
      variant: getListingVariant(listing) ?? "",
      year: listing.year ? String(listing.year) : "",
      mileage: typeof listing.mileage === "number" ? String(listing.mileage) : detailMetadata.mileage ?? "",
      bodyType: listing.body_type ?? detailMetadata.bodyType ?? detailMetadata.body_type ?? "",
      transmission: listing.transmission ?? detailMetadata.transmission ?? "",
      fuelType: listing.fuel_type ?? detailMetadata.fuelType ?? detailMetadata.fuel_type ?? "",
      engineType: listing.fuel_type ?? detailMetadata.engineType ?? detailMetadata.fuelType ?? detailMetadata.fuel_type ?? "",
      color: listing.color ?? detailMetadata.color ?? "",
      seats:
        typeof listing.seats === "number"
          ? String(listing.seats)
          : getListingMetadataString(listing, "seats") ?? "",
      driveType:
        listing.drive_type ??
        detailMetadata.driveType ??
        detailMetadata.drive_type ??
        "",
    },
    selectedFeatureIds: Array.isArray(listing.features) ? listing.features : [],
    coverImageName: extractFileName(coverImage?.r2_key),
    galleryImageNames: galleryImages.map((image) => extractFileName(image.r2_key)).filter((name): name is string => Boolean(name)),
    coverImageRef: coverImage
      ? {
          name: extractFileName(coverImage.r2_key) || coverImage.r2_key,
          r2_key: coverImage.r2_key,
          alt_text: coverImage.alt_text,
        }
      : null,
    galleryImageRefs: galleryImages
      .map<ExistingImageRef | null>((image) =>
        image.r2_key
          ? {
              name: extractFileName(image.r2_key) || image.r2_key,
              r2_key: image.r2_key,
              alt_text: image.alt_text,
            }
          : null
      )
      .filter((ref): ref is ExistingImageRef => Boolean(ref)),
    sellerType,
    useDealerAutoFill:
      getListingMetadataBoolean(listing, "useDealerAutoFill") ?? Boolean(listing.dealer_id),
    contactName,
    phoneNumber,
    whatsappEnabled:
      getListingMetadataBoolean(listing, "whatsappEnabled") ?? Boolean(whatsappNumber),
    whatsappNumber,
    allowPhoneCalls:
      getListingMetadataBoolean(listing, "allowPhoneCalls") ?? Boolean(phoneNumber),
    hidePhoneNumber:
      getListingMetadataBoolean(listing, "hidePhoneNumber") ?? DEFAULT_DRAFT.hidePhoneNumber,
  };
}

function buildFreshDraft(
  sellerAccountDefaults: SellerAccountDefaults | null,
  initialDraft: ListingDraft
): ListingDraft {
  if (!sellerAccountDefaults) {
    return { ...DEFAULT_DRAFT, details: { ...DEFAULT_DRAFT.details } };
  }

  return {
    ...DEFAULT_DRAFT,
    details: { ...DEFAULT_DRAFT.details },
    sellerType: sellerAccountDefaults.sellerType,
    useDealerAutoFill: sellerAccountDefaults.useDealerAutoFill,
    contactName: sellerAccountDefaults.contactName || initialDraft.contactName,
    phoneNumber: sellerAccountDefaults.phoneNumber || initialDraft.phoneNumber,
    whatsappEnabled: sellerAccountDefaults.whatsappEnabled,
    whatsappNumber: sellerAccountDefaults.whatsappNumber || initialDraft.whatsappNumber,
  };
}

const SUBMISSION_FIELD_METADATA: Record<
  string,
  { label: string; stepId: (typeof LISTING_WIZARD_STEPS)[number]["id"] }
> = {
  make: { label: "Make", stepId: "details" },
  model: { label: "Model", stepId: "details" },
  trim: { label: "Trim", stepId: "details" },
  variant: { label: "Variant / Engine", stepId: "details" },
  year: { label: "Year", stepId: "details" },
  mileage: { label: "Mileage", stepId: "details" },
  body_type: { label: "Body Type", stepId: "details" },
  transmission: { label: "Transmission", stepId: "details" },
  fuel_type: { label: "Fuel Type", stepId: "details" },
  color: { label: "Color", stepId: "details" },
  price: { label: "Price", stepId: "basics" },
  condition: { label: "Condition", stepId: "basics" },
  description: { label: "Description", stepId: "basics" },
  features: { label: "Features", stepId: "features" },
  currency: { label: "Currency", stepId: "basics" },
};

const WIZARD_STEP_INDEX_BY_ID = Object.fromEntries(
  LISTING_WIZARD_STEPS.map((step, index) => [step.id, index])
) as Record<(typeof LISTING_WIZARD_STEPS)[number]["id"], number>;

function formatSubmissionIssues(error: unknown): WizardIssue[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const candidate = error as {
    formErrors?: unknown;
    fieldErrors?: Record<string, unknown>;
  };

  const issues: WizardIssue[] = [];

  if (Array.isArray(candidate.formErrors)) {
    for (const formError of candidate.formErrors) {
      if (typeof formError === "string" && formError.trim()) {
        issues.push({
          message: formError.trim(),
          stepIndex: null,
        });
      }
    }
  }

  if (candidate.fieldErrors && typeof candidate.fieldErrors === "object") {
    for (const [field, messages] of Object.entries(candidate.fieldErrors)) {
      if (!Array.isArray(messages)) continue;
      const metadata = SUBMISSION_FIELD_METADATA[field];
      for (const message of messages) {
        if (typeof message !== "string" || !message.trim()) continue;
        const stepIndex = metadata ? WIZARD_STEP_INDEX_BY_ID[metadata.stepId] : null;
        const stepTitle =
          stepIndex === null ? null : LISTING_WIZARD_STEPS[stepIndex]?.title ?? null;
        const prefix = metadata
          ? `${stepTitle}: ${metadata.label}`
          : field.replace(/_/g, " ");
        issues.push({
          message: `${prefix} - ${message.trim()}`,
          stepIndex,
        });
      }
    }
  }

  return Array.from(
    new Map(
      issues.map((issue) => [`${issue.stepIndex ?? "none"}:${issue.message}`, issue])
    ).values()
  );
}

export function useWizard() {
  const ctx = React.useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

// ─── Provider ───
export function WizardProvider({
  children,
  initialListing,
}: {
  children: React.ReactNode;
  initialListing?: Listing | null;
}) {
  const initialDraft = React.useMemo(
    () => (initialListing ? buildDraftFromListing(initialListing) : DEFAULT_DRAFT),
    [initialListing]
  );
  const storageKey = initialListing ? `${DRAFT_STORAGE_KEY}:${initialListing.id}` : DRAFT_STORAGE_KEY;
  const isEditing = Boolean(initialListing);
  const editingListingId = initialListing?.id ?? null;
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [autoApproved, setAutoApproved] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitIssues, setSubmitIssues] = React.useState<WizardIssue[]>([]);
  const [createdListingId, setCreatedListingId] = React.useState<string | null>(editingListingId);
  const [draft, setDraft] = React.useState<ListingDraft>(initialDraft);
  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [packageAccess, setPackageAccess] = React.useState<SellerPackageAccessState | null>(null);
  const [isLoadingPackageAccess, setIsLoadingPackageAccess] = React.useState(!isEditing);
  const [packageAccessError, setPackageAccessError] = React.useState<string | null>(null);
  const [featureQuery, setFeatureQuery] = React.useState("");
  const [showFeatureIds, setShowFeatureIds] = React.useState(false);
  const [expandedFeatureGroups, setExpandedFeatureGroups] = React.useState<Record<string, boolean>>({});
  const [presetUndoSelection, setPresetUndoSelection] = React.useState<string[] | null>(null);
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);
  const [sellerAccountDefaults, setSellerAccountDefaults] = React.useState<SellerAccountDefaults | null>(null);

  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);
  const [videoFile, setVideoFile] = React.useState<File | null>(null);

  // Auto-save draft
  React.useEffect(() => {
    if (draft.category) {
      localStorage.setItem(storageKey, JSON.stringify(draft));
    }
  }, [draft, storageKey]);

  // Restore draft
  React.useEffect(() => {
    const savedDraft = localStorage.getItem(storageKey);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as Partial<ListingDraft>;
        if (parsed.category) {
          const restoredDraft = {
            ...initialDraft,
            ...parsed,
            country: parsed.country?.trim() || initialDraft.country,
            details: { ...initialDraft.details, ...(parsed.details || {}) },
          };
          setDraft({
            ...restoredDraft,
            title: buildAutoListingTitle(restoredDraft.details),
          });
        }
      } catch { /* ignore */ }
    }
  }, [initialDraft, storageKey]);

  React.useEffect(() => {
    let isMounted = true;

    const loadSellerDefaults = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || !isMounted) {
        if (isMounted) {
          setPackageAccess(null);
          setPackageAccessError(authError?.message ?? null);
          setIsLoadingPackageAccess(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single<{
          full_name: string | null;
          role: AuthenticatedProfileRole | null;
        }>();

      const profileRole = profile?.role ?? null;
      const fallbackName =
        profile?.full_name?.trim() ||
        (typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "") ||
        "";
      const fallbackPhone =
        (typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone.trim() : "") ||
        "";

      let defaults: SellerAccountDefaults = {
        sellerType: profileRole === "dealer" ? "dealer" : "individual",
        useDealerAutoFill: profileRole === "dealer",
        contactName: fallbackName,
        phoneNumber: fallbackPhone,
        whatsappEnabled: Boolean(fallbackPhone),
        whatsappNumber: fallbackPhone,
      };

      if (profileRole === "dealer") {
        const { data: dealer } = await supabase
          .from("dealers")
          .select("status, mobile, whatsapp, contact_person")
          .eq("profile_id", user.id)
          .maybeSingle<{
            status: "PENDING" | "APPROVED" | "REJECTED" | null;
            mobile: string | null;
            whatsapp: string | null;
            contact_person: {
              name?: string;
              mobile?: string;
              whatsapp?: string;
            } | null;
          }>();

        const dealerPhone =
          dealer?.contact_person?.mobile?.trim() ||
          dealer?.mobile?.trim() ||
          fallbackPhone;
        const dealerWhatsapp =
          dealer?.contact_person?.whatsapp?.trim() ||
          dealer?.whatsapp?.trim() ||
          dealerPhone;

        defaults = {
          sellerType: "dealer",
          useDealerAutoFill: true,
          contactName:
            dealer?.contact_person?.name?.trim() ||
            fallbackName,
          phoneNumber: dealerPhone,
          whatsappEnabled: Boolean(dealerWhatsapp),
          whatsappNumber: dealerWhatsapp,
        };
      }

      if (!isEditing) {
        const packageAccessResult = await getSellerPackageAccessForUser(supabase, user.id);

        if (!isMounted) return;

        if (packageAccessResult.error) {
          setPackageAccess(null);
          setPackageAccessError(packageAccessResult.error);
        } else {
          setPackageAccess(packageAccessResult.access);
          setPackageAccessError(null);
        }

        setIsLoadingPackageAccess(false);
      } else if (isMounted) {
        setPackageAccess(null);
        setPackageAccessError(null);
        setIsLoadingPackageAccess(false);
      }

      if (!isMounted) return;
      setSellerAccountDefaults(defaults);
      setDraft((prev) => ({
        ...prev,
        sellerType: prev.sellerType === DEFAULT_DRAFT.sellerType ? defaults.sellerType : prev.sellerType,
        useDealerAutoFill:
          prev.useDealerAutoFill === DEFAULT_DRAFT.useDealerAutoFill
            ? defaults.useDealerAutoFill
            : prev.useDealerAutoFill,
        contactName: prev.contactName.trim() ? prev.contactName : defaults.contactName,
        phoneNumber: prev.phoneNumber.trim() ? prev.phoneNumber : defaults.phoneNumber,
        whatsappEnabled:
          prev.whatsappEnabled === DEFAULT_DRAFT.whatsappEnabled
            ? defaults.whatsappEnabled
            : prev.whatsappEnabled,
        whatsappNumber: prev.whatsappNumber.trim() ? prev.whatsappNumber : defaults.whatsappNumber,
      }));
    };

    void loadSellerDefaults();

    return () => {
      isMounted = false;
    };
  }, [isEditing]);

  const isLastStep = activeStep === LISTING_WIZARD_STEPS.length - 1;
  const selectedCategoryFields = React.useMemo(
    () => (draft.category ? DETAIL_FIELDS_BY_CATEGORY[draft.category] : []),
    [draft.category]
  );
  const selectedFeatureGroups = draft.category ? LISTING_FEATURES_BY_CATEGORY[draft.category] : null;
  const selectedFeatureGroupDefinition = draft.category ? LISTING_FEATURE_GROUPS_BY_CATEGORY[draft.category] : null;
  const selectedFeatureIdSet = React.useMemo(() => new Set(draft.selectedFeatureIds), [draft.selectedFeatureIds]);
  const marketIndicator = getMarketIndicator(draft.category, draft.priceKes);

  // Feature group expansion
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

  const updateField = <K extends keyof ListingDraft>(key: K, value: ListingDraft[K]) => {
    if (submitError) {
      setSubmitError(null);
      setSubmitIssues([]);
    }
    setDraft((prev) => {
      if (key !== "category") {
        return { ...prev, [key]: value };
      }

      const nextCategory = value as ListingDraft["category"];
      if (prev.category === nextCategory) {
        return prev;
      }

      setFeatureQuery("");
      setExpandedFeatureGroups({});
      setPresetUndoSelection(null);
      setMediaError(null);
      setCoverFile(null);
      setGalleryFiles([]);
      setDocumentFiles([]);
      setVideoFile(null);

      return {
        ...prev,
        category: nextCategory,
        title: "",
        details: { ...DEFAULT_DRAFT.details },
        selectedFeatureIds: [],
        coverImageName: null,
        galleryImageNames: [],
        coverImageRef: null,
        galleryImageRefs: [],
        coverFromGalleryIndex: null,
        documentNames: [],
        videoUrl: "",
      };
    });
  };

  const updateDetailField = (key: DetailFieldKey, value: string) => {
    if (submitError) {
      setSubmitError(null);
      setSubmitIssues([]);
    }
    setDraft((prev) => {
      const nextDetails = { ...prev.details, [key]: value };

      if (key === "make" && value !== prev.details.make) {
        nextDetails.model = "";
        nextDetails.trim = "";
        nextDetails.variant = "";
      }

      if (key === "model" && value !== prev.details.model) {
        nextDetails.trim = "";
        nextDetails.variant = "";
      }

      return {
        ...prev,
        details: nextDetails,
        title: buildAutoListingTitle(nextDetails),
      };
    });
  };

  const toggleFeature = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      selectedFeatureIds: prev.selectedFeatureIds.includes(id)
        ? prev.selectedFeatureIds.filter((fid) => fid !== id)
        : [...prev.selectedFeatureIds, id],
    }));
    setPresetUndoSelection(null);
  };

  const setFeatureSelection = (featureIds: string[], mode: "add" | "remove") => {
    if (featureIds.length === 0) return;
    setDraft((prev) => {
      const selection = new Set(prev.selectedFeatureIds);
      if (mode === "add") featureIds.forEach((id) => selection.add(id));
      else featureIds.forEach((id) => selection.delete(id));
      return { ...prev, selectedFeatureIds: Array.from(selection) };
    });
    setPresetUndoSelection(null);
  };

  const clearFeatureSelection = () => {
    updateField("selectedFeatureIds", []);
    setPresetUndoSelection(null);
  };

  const toggleFeatureGroupExpansion = (groupKey: string) => {
    setExpandedFeatureGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const applyFeaturePreset = (presetId: string) => {
    if (!selectedFeatureGroupDefinition || !selectedFeatureGroups) return;
    const allFeatures = selectedFeatureGroupDefinition.order.flatMap(
      (gk) => selectedFeatureGroups[gk] ?? []
    );
    const keywords =
      presetId === "popular" ? ["air conditioning", "abs", "airbag", "bluetooth", "navigation", "cruise control"] :
      presetId === "safety" ? ["safety", "airbag", "abs", "brake", "collision", "stability", "traction"] :
      ["assist", "cruise", "parking", "camera", "sensor", "monitor", "navigation"];

    const matched = allFeatures.filter((f) => {
      const hay = [f.label, f.id, ...(f.aliases ?? [])].join(" ").toLowerCase();
      return keywords.some((kw) => hay.includes(kw));
    });
    if (matched.length === 0) return;
    setPresetUndoSelection([...draft.selectedFeatureIds]);
    setDraft((prev) => {
      const selection = new Set(prev.selectedFeatureIds);
      matched.forEach((f) => selection.add(f.id));
      return { ...prev, selectedFeatureIds: Array.from(selection) };
    });
  };

  const undoFeaturePreset = () => {
    if (!presetUndoSelection) return;
    updateField("selectedFeatureIds", presetUndoSelection);
    setPresetUndoSelection(null);
  };

  // Media handlers
  const handleCoverSelection = (files: File[]) => {
    const file = files[0];
    if (!file) { updateField("coverImageName", null); setCoverFile(null); return; }
    if (file.size > MAX_FILE_SIZE_BYTES) { setMediaError("Cover image exceeds 10MB limit."); return; }
    setMediaError(null);
    updateField("coverImageName", file.name);
    setCoverFile(file);
  };

  const handleGallerySelection = (newFiles: File[]) => {
    if (galleryFiles.length + newFiles.length > MAX_GALLERY_IMAGES) {
      setMediaError(`Gallery supports up to ${MAX_GALLERY_IMAGES} images.`);
      return;
    }
    const oversized = newFiles.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) { setMediaError(`"${oversized.name}" exceeds 10MB limit.`); return; }
    setMediaError(null);
    const updated = [...galleryFiles, ...newFiles];
    setGalleryFiles(updated);
    setDraft((prev) => ({
      ...prev,
      galleryImageNames: updated.map((f) => f.name),
      coverFromGalleryIndex: prev.coverFromGalleryIndex !== null && prev.coverFromGalleryIndex < updated.length
        ? prev.coverFromGalleryIndex : updated.length > 0 ? 0 : null,
    }));
  };

  const selectExistingGalleryCover = (index: number) => {
    if (!isEditing || coverFile || galleryFiles.length > 0) return;

    setMediaError(null);
    setDraft((prev) => {
      const selectedImage = prev.galleryImageRefs[index];
      if (!selectedImage) return prev;

      const nextGalleryImageRefs = prev.galleryImageRefs.filter(
        (_, imageIndex) => imageIndex !== index
      );

      if (prev.coverImageRef) {
        nextGalleryImageRefs.unshift(prev.coverImageRef);
      }

      return {
        ...prev,
        coverImageName: selectedImage.name,
        coverImageRef: selectedImage,
        galleryImageNames: nextGalleryImageRefs.map((image) => image.name),
        galleryImageRefs: nextGalleryImageRefs,
        coverFromGalleryIndex: null,
      };
    });
  };

  const removeGalleryFile = (fileToRemove: File) => {
    const updated = galleryFiles.filter((f) => f !== fileToRemove);
    setGalleryFiles(updated);
    setDraft((prev) => {
      const newNames = updated.map((f) => f.name);
      let newCoverIndex = prev.coverFromGalleryIndex;
      if (newCoverIndex !== null && newCoverIndex >= newNames.length) newCoverIndex = newNames.length > 0 ? 0 : null;
      return { ...prev, galleryImageNames: newNames, coverFromGalleryIndex: newCoverIndex };
    });
  };

  const reorderGalleryImages = (fromIndex: number, toIndex: number) => {
    setDraft((prev) => {
      if (toIndex < 0 || toIndex >= prev.galleryImageNames.length) return prev;
      if (fromIndex < 0 || fromIndex >= prev.galleryImageNames.length) return prev;
      if (fromIndex === toIndex) return prev;
      const reorderedNames = [...prev.galleryImageNames];
      const [movedName] = reorderedNames.splice(fromIndex, 1);
      reorderedNames.splice(toIndex, 0, movedName);
      const reorderedFiles = [...galleryFiles];
      const [movedFile] = reorderedFiles.splice(fromIndex, 1);
      reorderedFiles.splice(toIndex, 0, movedFile);
      setGalleryFiles(reorderedFiles);
      let coverIdx = prev.coverFromGalleryIndex;
      if (coverIdx === fromIndex) {
        coverIdx = toIndex;
      } else if (coverIdx !== null) {
        const direction = fromIndex < toIndex ? -1 : 1;
        if (coverIdx > Math.min(fromIndex, toIndex) && coverIdx < Math.max(fromIndex, toIndex)) {
          coverIdx += direction;
        }
      }
      return { ...prev, galleryImageNames: reorderedNames, coverFromGalleryIndex: coverIdx };
    });
  };

  const moveGalleryImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    reorderGalleryImages(index, targetIndex);
  };

  const handleDocumentSelection = (newFiles: File[]) => {
    const oversized = newFiles.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) { setMediaError(`"${oversized.name}" exceeds 10MB limit.`); return; }
    setMediaError(null);
    const updated = [...documentFiles, ...newFiles];
    setDocumentFiles(updated);
    setDraft((prev) => ({ ...prev, documentNames: updated.map((f) => f.name) }));
  };

  const handleVideoSelection = (files: File[]) => {
    const file = files[0];
    if (!file) {
      setVideoFile(null);
      return;
    }
    if (!VIDEO_ACCEPTED_TYPES.has(file.type)) {
      setMediaError("Video must be an MP4, WEBM, or MOV file.");
      return;
    }
    if (file.size > MAX_VIDEO_FILE_SIZE_BYTES) {
      setMediaError("Video exceeds the 200MB upload limit.");
      return;
    }
    setMediaError(null);
    setVideoFile(file);
  };

  const removeVideoFile = () => {
    setVideoFile(null);
  };

  const removeDocumentFile = (fileToRemove: File) => {
    const updated = documentFiles.filter((f) => f !== fileToRemove);
    setDocumentFiles(updated);
    setDraft((prev) => ({ ...prev, documentNames: updated.map((f) => f.name) }));
  };

  const applyDealerAutofill = (enabled: boolean) => {
    if (!enabled) { setDraft((prev) => ({ ...prev, useDealerAutoFill: false })); return; }
    if (!sellerAccountDefaults) {
      setDraft((prev) => ({ ...prev, useDealerAutoFill: true }));
      return;
    }
    setDraft((prev) => ({
      ...prev,
      sellerType: sellerAccountDefaults.sellerType,
      useDealerAutoFill: sellerAccountDefaults.useDealerAutoFill,
      contactName: sellerAccountDefaults.contactName || prev.contactName,
      phoneNumber: sellerAccountDefaults.phoneNumber || prev.phoneNumber,
      whatsappEnabled: sellerAccountDefaults.whatsappEnabled,
      whatsappNumber: sellerAccountDefaults.whatsappNumber || prev.whatsappNumber,
    }));
  };

  const resetDraft = () => {
    const nextDraft = buildFreshDraft(sellerAccountDefaults, initialDraft);
    localStorage.removeItem(storageKey);
    setDraft(nextDraft);
    setActiveStep(0);
    setSubmitted(false);
    setAutoApproved(false);
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitIssues([]);
    setCreatedListingId(editingListingId);
    setMediaError(null);
    setFeatureQuery("");
    setShowFeatureIds(false);
    setExpandedFeatureGroups({});
    setPresetUndoSelection(null);
    setShowValidationErrors(false);
    setCoverFile(null);
    setGalleryFiles([]);
    setDocumentFiles([]);
    setVideoFile(null);
  };

  // Validation
  const mediaValidationError = React.useMemo(() => {
    const replacingImages = isEditing && (coverFile !== null || galleryFiles.length > 0);
    if (replacingImages) {
      if (!coverFile) return "Upload a new cover image to replace the current media set.";
      if (galleryFiles.length < 2) return "Upload at least two gallery images when replacing the current media set.";
    }
    const totalImages = (draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length;
    if (totalImages < MIN_TOTAL_IMAGES) return `Minimum ${MIN_TOTAL_IMAGES} photos required.`;
    if (!draft.coverImageName && draft.coverFromGalleryIndex === null) return "Select a cover image or choose one from gallery.";
    if (draft.galleryImageNames.length > MAX_GALLERY_IMAGES) return `Gallery supports up to ${MAX_GALLERY_IMAGES} images.`;
    return mediaError;
  }, [coverFile, draft.coverFromGalleryIndex, draft.coverImageName, draft.galleryImageNames.length, galleryFiles.length, isEditing, mediaError]);

  const sellerValidationError = React.useMemo(() => {
    if (!draft.contactName.trim() || !draft.phoneNumber.trim()) return "Contact name and phone number are required.";
    if (!isValidPhone(draft.phoneNumber)) return "Phone number format is invalid.";
    if (draft.whatsappEnabled) {
      if (!draft.whatsappNumber.trim()) return "WhatsApp number is required when WhatsApp is enabled.";
      if (!isValidPhone(draft.whatsappNumber)) return "WhatsApp number format is invalid.";
    }
    return null;
  }, [draft.contactName, draft.phoneNumber, draft.whatsappEnabled, draft.whatsappNumber]);

  const canContinue = React.useMemo(() => {
    if (activeStep === 0) return Boolean(draft.category);
    if (activeStep === 1) {
      if (!draft.category) return false;
      return DETAIL_FIELDS_BY_CATEGORY[draft.category].filter((f) => f.required).every((f) => draft.details[f.key].trim().length > 0);
    }
    if (activeStep === 2) return Boolean(draft.title.trim() && draft.title.trim().length <= MAX_TITLE_LENGTH && draft.priceKes && Number(draft.priceKes) > 0 && draft.country.trim() && draft.cityTown.trim() && draft.locationArea.trim() && draft.description.trim() && draft.description.trim().length <= MAX_DESCRIPTION_LENGTH);
    if (activeStep === 3) return draft.selectedFeatureIds.length > 0;
    if (activeStep === 4) return !mediaValidationError;
    if (activeStep === 5) return !sellerValidationError;
    return true;
  }, [activeStep, draft, mediaValidationError, sellerValidationError]);

  const stepCompletion = React.useMemo(() => {
    const completion = Array.from({ length: LISTING_WIZARD_STEPS.length }, () => false);

    completion[0] = Boolean(draft.category);
    completion[1] = Boolean(
      draft.category &&
      selectedCategoryFields
        .filter((field) => field.required)
        .every((field) => draft.details[field.key].trim().length > 0)
    );
    completion[2] = Boolean(
      draft.title.trim() &&
      draft.title.trim().length <= MAX_TITLE_LENGTH &&
      draft.priceKes &&
      Number(draft.priceKes) > 0 &&
      draft.country.trim() &&
      draft.cityTown.trim() &&
      draft.locationArea.trim() &&
      draft.description.trim() &&
      draft.description.trim().length <= MAX_DESCRIPTION_LENGTH
    );
    completion[3] = draft.selectedFeatureIds.length > 0;
    completion[4] = !mediaValidationError;
    completion[5] = !sellerValidationError;
    completion[6] = true;
    completion[7] = SUBMITTABLE_STEP_INDICES.every((index) => completion[index]);

    return completion;
  }, [draft, mediaValidationError, selectedCategoryFields, sellerValidationError]);

  const firstIncompleteRequiredStep = React.useMemo(
    () => SUBMITTABLE_STEP_INDICES.find((index) => !stepCompletion[index]) ?? null,
    [stepCompletion]
  );

  const goToStep = React.useCallback(
    (stepIndex: number, options?: { showValidationErrors?: boolean }) => {
      const nextStep = Math.max(0, Math.min(stepIndex, LISTING_WIZARD_STEPS.length - 1));
      setActiveStep(nextStep);

      if (typeof options?.showValidationErrors === "boolean") {
        setShowValidationErrors(options.showValidationErrors);
      }
    },
    []
  );

  const handleContinue = async () => {
    if (!canContinue) { setShowValidationErrors(true); return; }
    setShowValidationErrors(false);

    if (isLastStep) {
      if (firstIncompleteRequiredStep !== null) {
        setSubmitError("Complete the missing required details before submitting this listing.");
        setSubmitIssues([
          {
            message: `${LISTING_WIZARD_STEPS[firstIncompleteRequiredStep].title} still has required fields to complete.`,
            stepIndex: firstIncompleteRequiredStep,
          },
        ]);
        goToStep(firstIncompleteRequiredStep, { showValidationErrors: true });
        return;
      }

      if (!isEditing) {
        if (isLoadingPackageAccess) {
          setSubmitError("Checking your seller package access. Please try again in a moment.");
          setSubmitIssues([
            {
              message: "Seller package access is still loading.",
              stepIndex: 7,
            },
          ]);
          return;
        }

        if (packageAccessError) {
          setSubmitError(packageAccessError);
          setSubmitIssues([
            {
              message: packageAccessError,
              stepIndex: 7,
            },
          ]);
          return;
        }

        if (!packageAccess?.hasActivePlan) {
          setSubmitError("Choose a seller package before publishing this listing.");
          setSubmitIssues([
            {
              message: "Activate a seller package from Membership before you submit this listing.",
              stepIndex: 7,
            },
          ]);
          return;
        }

        if (!packageAccess.canCreateListing) {
          const currentPlanName = packageAccess.currentPlan?.name || "current";
          setSubmitError(
            `Your ${currentPlanName} package has no listing slots left. Upgrade or switch package before publishing this listing.`
          );
          setSubmitIssues([
            {
              message: `Your ${currentPlanName} package has reached its listing limit.`,
              stepIndex: 7,
            },
          ]);
          return;
        }
      }

      const {
        createListing,
        submitListingForReview,
        updateListing,
        uploadListingImages,
        uploadListingVideo,
        reorderListingImages,
      } = await import("@/lib/actions/listings");

      const listingData = {
        make: draft.details.make || "",
        model: draft.details.model || "",
        trim: draft.details.trim || undefined,
        variant: draft.details.variant || undefined,
        year: parseInt(draft.details.year) || new Date().getFullYear(),
        price: parseFloat(draft.priceKes.replace(/,/g, "")) || 0,
        currency: "KES" as const,
        mileage: draft.details.mileage ? parseInt(draft.details.mileage) : undefined,
        condition: draft.condition as "new" | "locally_used" | "foreign_used",
        description: draft.description,
        features: draft.selectedFeatureIds,
        body_type: draft.details.bodyType || draft.details.bodyStyle || undefined,
        transmission: draft.details.transmission || undefined,
        fuel_type: draft.details.engineType || draft.details.fuelType || undefined,
        color: draft.details.color || undefined,
        details: draft.details,
        category: draft.category || undefined,
        country: draft.country,
        cityTown: draft.cityTown,
        locationArea: draft.locationArea,
        availability: draft.availability,
        negotiable: draft.negotiable,
        tradeInAccepted: draft.tradeInAccepted,
        videoUrl: draft.videoUrl,
        sellerType: draft.sellerType,
        useDealerAutoFill: draft.useDealerAutoFill,
        contactName: draft.contactName,
        phoneNumber: draft.phoneNumber,
        whatsappEnabled: draft.whatsappEnabled,
        whatsappNumber: draft.whatsappNumber,
        allowPhoneCalls: draft.allowPhoneCalls,
        hidePhoneNumber: draft.hidePhoneNumber,
      };

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitIssues([]);
      try {
        let listingId = editingListingId;

        if (isEditing && listingId) {
          const updateResult = await updateListing(listingId, listingData);
          if (updateResult.error) {
            setSubmitError(updateResult.error);
            setSubmitIssues([{ message: updateResult.error, stepIndex: null }]);
            setIsSubmitting(false);
            return;
          }
        } else {
          const result = await createListing(listingData);
          if (result.error) {
            if (typeof result.error === "string") {
              setSubmitError(result.error);
              setSubmitIssues([{ message: result.error, stepIndex: null }]);
            } else {
              const issues = formatSubmissionIssues(result.error);
              setSubmitError("Please fix the validation issues below before submitting.");
              setSubmitIssues(issues);
            }
            setIsSubmitting(false);
            return;
          }
          if (!("data" in result) || !result.data) {
            setSubmitError("Failed to create listing.");
            setIsSubmitting(false);
            return;
          }

          listingId = result.data.id;
          setCreatedListingId(listingId);
        }

        if (!listingId) {
          setSubmitError("Listing not found.");
          setSubmitIssues([{ message: "Listing not found.", stepIndex: null }]);
          setIsSubmitting(false);
          return;
        }

        if (videoFile) {
          const videoFormData = new FormData();
          videoFormData.set("listingId", listingId);
          videoFormData.set("videoFile", videoFile);

          const videoUploadResult = await uploadListingVideo(videoFormData);

          if ("error" in videoUploadResult) {
            setSubmitError(videoUploadResult.error || "Unable to upload the video file.");
            setSubmitIssues(
              videoUploadResult.error
                ? [{ message: videoUploadResult.error, stepIndex: 4 }]
                : []
            );
            setIsSubmitting(false);
            return;
          }
        }

        const hasReplacementMedia = coverFile !== null || galleryFiles.length > 0;
        const initialExistingImageKeyOrder = getExistingImageKeyOrder(initialDraft);
        const existingImageKeyOrder = getExistingImageKeyOrder(draft);
        const existingImageOrderChanged =
          isEditing &&
          !hasReplacementMedia &&
          didExistingImageOrderChange(existingImageKeyOrder, initialExistingImageKeyOrder);

        if (!isEditing || hasReplacementMedia) {
          const uploadFormData = new FormData();
          uploadFormData.set("listingId", listingId);
          uploadFormData.set("altTextBase", `${draft.details.make} ${draft.details.model}`.trim());

          if (coverFile) {
            uploadFormData.set("coverImage", coverFile);
          } else if (
            draft.coverFromGalleryIndex !== null &&
            galleryFiles[draft.coverFromGalleryIndex]
          ) {
            uploadFormData.set("coverImage", galleryFiles[draft.coverFromGalleryIndex]);
          }

          galleryFiles.forEach((file, index) => {
            if (!coverFile && draft.coverFromGalleryIndex === index) {
              return;
            }
            uploadFormData.append("galleryImages", file);
          });

          const uploadResult = await uploadListingImages(uploadFormData);
          if ("error" in uploadResult) {
            setSubmitError(uploadResult.error || "Unable to upload listing images.");
            setSubmitIssues(
              uploadResult.error
                ? [{ message: uploadResult.error, stepIndex: 4 }]
                : []
            );
            setIsSubmitting(false);
            return;
          }
        } else if (existingImageOrderChanged) {
          const reorderFormData = new FormData();
          reorderFormData.set("listingId", listingId);
          reorderFormData.set("orderedImageKeys", JSON.stringify(existingImageKeyOrder));

          const reorderResult = await reorderListingImages(reorderFormData);
          if ("error" in reorderResult) {
            setSubmitError(reorderResult.error || "Unable to update the listing cover.");
            setSubmitIssues(
              reorderResult.error
                ? [{ message: reorderResult.error, stepIndex: 4 }]
                : []
            );
            setIsSubmitting(false);
            return;
          }
        }

        if (!isEditing) {
          const submitResult = await submitListingForReview(listingId);
          if ("error" in submitResult) {
            setSubmitError(submitResult.error || "Unable to submit listing for review.");
            setSubmitIssues(
              submitResult.error
                ? [{ message: submitResult.error, stepIndex: 7 }]
                : []
            );
            setIsSubmitting(false);
            return;
          }

          if ('autoApproved' in submitResult && submitResult.autoApproved) {
            setAutoApproved(true);
          }
        }

        localStorage.removeItem(storageKey);
        setSubmitted(true);
      } catch {
        setSubmitError("An unexpected error occurred. Please try again.");
        setSubmitIssues([]);
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

  const value: WizardContextValue = {
    isEditing, editingListingId,
    draft, activeStep, showValidationErrors, isSubmitting, submitError, submitIssues, submitted, autoApproved, createdListingId, stepCompletion,
    packageAccess, isLoadingPackageAccess, packageAccessError,
    coverFile, galleryFiles, documentFiles, videoFile,
    featureQuery, showFeatureIds, expandedFeatureGroups, selectedFeatureIdSet,
    updateField, updateDetailField, toggleFeature, setFeatureQuery, setShowFeatureIds,
    toggleFeatureGroupExpansion, applyFeaturePreset, undoFeaturePreset, clearFeatureSelection, setFeatureSelection,
    handleCoverSelection, handleGallerySelection, selectExistingGalleryCover, removeGalleryFile, moveGalleryImage, reorderGalleryImages, handleDocumentSelection, removeDocumentFile, handleVideoSelection, removeVideoFile,
    applyDealerAutofill, resetDraft,
    handleContinue, handleBack, goToStep, setActiveStep,
    canContinue, mediaValidationError, sellerValidationError, marketIndicator, selectedCategoryFields,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
