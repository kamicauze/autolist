"use client";

import * as React from "react";
import {
  LISTING_AVAILABILITY_OPTIONS,
  LISTING_CONDITION_OPTIONS,
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURES_BY_CATEGORY,
  LISTING_WIZARD_STEPS,
  type ListingCategory,
} from "@/lib/constants/marketplace";
import { createClient } from "@/lib/supabase/client";

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

export type ListingDraft = {
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

export const DEFAULT_DRAFT: ListingDraft = {
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
    make: "", model: "", trim: "", variant: "", year: "", engineType: "", transmission: "",
    driveType: "", mileage: "", bodyType: "", bodyStyle: "", loadCapacity: "",
    engineCapacity: "", fuelType: "", fuelSystem: "", bikeType: "", color: "",
    seats: "", axleConfiguration: "", equipmentType: "", operatingHours: "",
    operatingWeight: "", operationalStatus: "", powerOutput: "", usageType: "",
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
    { key: "bodyType", label: "Body Type", type: "select", required: true, options: [{ value: "sedan", label: "Sedan" }, { value: "suv", label: "SUV" }, { value: "hatchback", label: "Hatchback" }, { value: "wagon", label: "Wagon" }, { value: "coupe", label: "Coupe" }] },
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
export const MAX_GALLERY_IMAGES = 10;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const PHONE_REGEX = /^\+?[0-9]{8,15}$/;
export const DRAFT_STORAGE_KEY = "autolist_listing_draft";

type AuthenticatedProfileRole = "buyer" | "seller" | "dealer" | "admin" | "support";

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
  draft: ListingDraft;
  activeStep: number;
  showValidationErrors: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  submitErrorDetails: string[];
  submitted: boolean;
  autoApproved: boolean;
  createdListingId: string | null;

  // Media file refs
  coverFile: File | null;
  galleryFiles: File[];
  documentFiles: File[];

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
  removeGalleryFile: (file: File) => void;
  moveGalleryImage: (index: number, direction: "up" | "down") => void;
  handleDocumentSelection: (newFiles: File[]) => void;
  removeDocumentFile: (file: File) => void;

  // Seller
  applyDealerAutofill: (enabled: boolean) => void;

  // Navigation
  handleContinue: () => Promise<void>;
  handleBack: () => void;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;

  // Computed
  canContinue: boolean;
  mediaValidationError: string | null;
  sellerValidationError: string | null;
  marketIndicator: { label: string; tone: string; note: string };
  selectedCategoryFields: DetailField[];
}

const WizardContext = React.createContext<WizardContextValue | null>(null);

const SUBMISSION_FIELD_METADATA: Record<
  string,
  { label: string; step: string }
> = {
  make: { label: "Make", step: "Vehicle / Equipment Details" },
  model: { label: "Model", step: "Vehicle / Equipment Details" },
  trim: { label: "Trim", step: "Vehicle / Equipment Details" },
  variant: { label: "Variant / Engine", step: "Vehicle / Equipment Details" },
  year: { label: "Year", step: "Vehicle / Equipment Details" },
  mileage: { label: "Mileage", step: "Vehicle / Equipment Details" },
  body_type: { label: "Body Type", step: "Vehicle / Equipment Details" },
  transmission: { label: "Transmission", step: "Vehicle / Equipment Details" },
  fuel_type: { label: "Fuel Type", step: "Vehicle / Equipment Details" },
  color: { label: "Color", step: "Vehicle / Equipment Details" },
  price: { label: "Price", step: "Listing Basics" },
  condition: { label: "Condition", step: "Listing Basics" },
  description: { label: "Description", step: "Listing Basics" },
  features: { label: "Features", step: "Features & Specifications" },
  currency: { label: "Currency", step: "Listing Basics" },
};

function formatSubmissionErrorDetails(error: unknown): string[] {
  if (!error || typeof error !== "object") {
    return [];
  }

  const candidate = error as {
    formErrors?: unknown;
    fieldErrors?: Record<string, unknown>;
  };

  const details: string[] = [];

  if (Array.isArray(candidate.formErrors)) {
    for (const formError of candidate.formErrors) {
      if (typeof formError === "string" && formError.trim()) {
        details.push(formError.trim());
      }
    }
  }

  if (candidate.fieldErrors && typeof candidate.fieldErrors === "object") {
    for (const [field, messages] of Object.entries(candidate.fieldErrors)) {
      if (!Array.isArray(messages)) continue;
      const metadata = SUBMISSION_FIELD_METADATA[field];
      for (const message of messages) {
        if (typeof message !== "string" || !message.trim()) continue;
        const prefix = metadata
          ? `${metadata.step}: ${metadata.label}`
          : field.replace(/_/g, " ");
        details.push(`${prefix} - ${message.trim()}`);
      }
    }
  }

  return Array.from(new Set(details));
}

export function useWizard() {
  const ctx = React.useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be used within WizardProvider");
  return ctx;
}

// ─── Provider ───
export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [autoApproved, setAutoApproved] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitErrorDetails, setSubmitErrorDetails] = React.useState<string[]>([]);
  const [createdListingId, setCreatedListingId] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState<ListingDraft>(DEFAULT_DRAFT);
  const [mediaError, setMediaError] = React.useState<string | null>(null);
  const [featureQuery, setFeatureQuery] = React.useState("");
  const [showFeatureIds, setShowFeatureIds] = React.useState(false);
  const [expandedFeatureGroups, setExpandedFeatureGroups] = React.useState<Record<string, boolean>>({});
  const [presetUndoSelection, setPresetUndoSelection] = React.useState<string[] | null>(null);
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);
  const [sellerAccountDefaults, setSellerAccountDefaults] = React.useState<SellerAccountDefaults | null>(null);

  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = React.useState<File[]>([]);

  // Auto-save draft
  React.useEffect(() => {
    if (draft.category) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [draft]);

  // Restore draft
  React.useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as Partial<ListingDraft>;
        if (parsed.category) {
          setDraft({
            ...DEFAULT_DRAFT,
            ...parsed,
            country: parsed.country?.trim() || DEFAULT_DRAFT.country,
            details: { ...DEFAULT_DRAFT.details, ...(parsed.details || {}) },
          });
        }
      } catch { /* ignore */ }
    }
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadSellerDefaults = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || !isMounted) return;

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
  }, []);

  const isLastStep = activeStep === LISTING_WIZARD_STEPS.length - 1;
  const selectedCategoryFields = draft.category ? DETAIL_FIELDS_BY_CATEGORY[draft.category] : [];
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
      setSubmitErrorDetails([]);
    }
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetailField = (key: DetailFieldKey, value: string) => {
    if (submitError) {
      setSubmitError(null);
      setSubmitErrorDetails([]);
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

      return { ...prev, details: nextDetails };
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

  const moveGalleryImage = (index: number, direction: "up" | "down") => {
    setDraft((prev) => {
      const toIndex = direction === "up" ? index - 1 : index + 1;
      if (toIndex < 0 || toIndex >= prev.galleryImageNames.length) return prev;
      const reorderedNames = [...prev.galleryImageNames];
      [reorderedNames[index], reorderedNames[toIndex]] = [reorderedNames[toIndex], reorderedNames[index]];
      const reorderedFiles = [...galleryFiles];
      [reorderedFiles[index], reorderedFiles[toIndex]] = [reorderedFiles[toIndex], reorderedFiles[index]];
      setGalleryFiles(reorderedFiles);
      let coverIdx = prev.coverFromGalleryIndex;
      if (coverIdx === index) coverIdx = toIndex;
      else if (coverIdx === toIndex) coverIdx = index;
      return { ...prev, galleryImageNames: reorderedNames, coverFromGalleryIndex: coverIdx };
    });
  };

  const handleDocumentSelection = (newFiles: File[]) => {
    const oversized = newFiles.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) { setMediaError(`"${oversized.name}" exceeds 10MB limit.`); return; }
    setMediaError(null);
    const updated = [...documentFiles, ...newFiles];
    setDocumentFiles(updated);
    setDraft((prev) => ({ ...prev, documentNames: updated.map((f) => f.name) }));
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

  // Validation
  const mediaValidationError = React.useMemo(() => {
    const totalImages = (draft.coverImageName ? 1 : 0) + draft.galleryImageNames.length;
    if (totalImages < MIN_TOTAL_IMAGES) return `Minimum ${MIN_TOTAL_IMAGES} photos required.`;
    if (!draft.coverImageName && draft.coverFromGalleryIndex === null) return "Select a cover image or choose one from gallery.";
    if (draft.galleryImageNames.length > MAX_GALLERY_IMAGES) return `Gallery supports up to ${MAX_GALLERY_IMAGES} images.`;
    return mediaError;
  }, [draft.coverFromGalleryIndex, draft.coverImageName, draft.galleryImageNames.length, mediaError]);

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
    if (activeStep === 1) return Boolean(draft.title.trim() && draft.title.trim().length <= MAX_TITLE_LENGTH && draft.priceKes && Number(draft.priceKes) > 0 && draft.country.trim() && draft.cityTown.trim() && draft.locationArea.trim() && draft.description.trim() && draft.description.trim().length <= MAX_DESCRIPTION_LENGTH);
    if (activeStep === 2) {
      if (!draft.category) return false;
      return DETAIL_FIELDS_BY_CATEGORY[draft.category].filter((f) => f.required).every((f) => draft.details[f.key].trim().length > 0);
    }
    if (activeStep === 3) return draft.selectedFeatureIds.length > 0;
    if (activeStep === 4) return !mediaValidationError;
    if (activeStep === 5) return !sellerValidationError;
    return true;
  }, [activeStep, draft, mediaValidationError, sellerValidationError]);

  const handleContinue = async () => {
    if (!canContinue) { setShowValidationErrors(true); return; }
    setShowValidationErrors(false);

    if (isLastStep) {
      const { createListing, submitListingForReview, uploadListingImages } = await import("@/lib/actions/listings");

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
      };

      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitErrorDetails([]);
      try {
        // Step 1: Create listing record (status: draft)
        const result = await createListing(listingData);
        if (result.error) {
          if (typeof result.error === "string") {
            setSubmitError(result.error);
            setSubmitErrorDetails([result.error]);
          } else {
            const details = formatSubmissionErrorDetails(result.error);
            setSubmitError("Please fix the validation issues below before submitting.");
            setSubmitErrorDetails(details);
          }
          setIsSubmitting(false);
          return;
        }
        if (!("data" in result) || !result.data) {
          setSubmitError("Failed to create listing.");
          setIsSubmitting(false);
          return;
        }

        const listingId = result.data.id;
        setCreatedListingId(listingId);

        // Step 2: Upload images server-side to avoid client-side R2 CORS failures.
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
          setSubmitErrorDetails(uploadResult.error ? [uploadResult.error] : []);
          setIsSubmitting(false);
          return;
        }

        // Step 3: Submit for review (draft → pending, or auto-approved → active for verified dealers)
        const submitResult = await submitListingForReview(listingId);
        if ("error" in submitResult) {
          setSubmitError(submitResult.error || "Unable to submit listing for review.");
          setSubmitErrorDetails(submitResult.error ? [submitResult.error] : []);
          setIsSubmitting(false);
          return;
        }

        if ('autoApproved' in submitResult && submitResult.autoApproved) {
          setAutoApproved(true);
        }

        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setSubmitted(true);
      } catch {
        setSubmitError("An unexpected error occurred. Please try again.");
        setSubmitErrorDetails([]);
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
    draft, activeStep, showValidationErrors, isSubmitting, submitError, submitErrorDetails, submitted, autoApproved, createdListingId,
    coverFile, galleryFiles, documentFiles,
    featureQuery, showFeatureIds, expandedFeatureGroups, selectedFeatureIdSet,
    updateField, updateDetailField, toggleFeature, setFeatureQuery, setShowFeatureIds,
    toggleFeatureGroupExpansion, applyFeaturePreset, undoFeaturePreset, clearFeatureSelection, setFeatureSelection,
    handleCoverSelection, handleGallerySelection, removeGalleryFile, moveGalleryImage, handleDocumentSelection, removeDocumentFile,
    applyDealerAutofill,
    handleContinue, handleBack, setActiveStep,
    canContinue, mediaValidationError, sellerValidationError, marketIndicator, selectedCategoryFields,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}
