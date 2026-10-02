import { ALL_MAKES } from "./car-data";

/**
 * @deprecated — Components now receive makes from Supabase via server props.
 * This is kept only as a static fallback. Use `getAllMakeNames()` from `lib/data/car-data.ts` instead.
 */
export const MAKES = ALL_MAKES;

// Body Types
export const BODY_TYPES = [
  "Saloon",
  "SUV",
  "Hatchback",
  "Coupe",
  "Convertible",
  "Wagon",
  "Pickup",
] as const;

export const BODY_TYPE_OPTIONS = BODY_TYPES.map((value) => ({
  value,
  label: value === "Wagon" ? "Station Wagon" : value,
})) as Array<{ value: (typeof BODY_TYPES)[number]; label: string }>;

// Transmissions
export const TRANSMISSIONS = [
  "Automatic",
  "Manual",
] as const;

export const TRANSMISSION_OPTIONS = [
  "Automatic",
  "Manual",
  "CVT",
  "AMT",
  "Dual Clutch",
] as const;

// Fuel Types
export const FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Electric",
] as const;

// Conditions
export const CONDITIONS = [
  { value: "new", label: "Brand new" },
  { value: "foreign_used", label: "Foreign used" },
  { value: "locally_used", label: "Locally used" },
] as const;

// Colors
export const COLORS = [
  "White",
  "Black",
  "Silver",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Brown",
  "Beige",
  "Orange",
  "Yellow",
  "Gold",
  "Maroon",
  "Navy",
  "Bronze",
] as const;

// Same paint swatches as the listing wizard so filter colours match seller choices.
export const COLOR_SWATCHES: Record<(typeof COLORS)[number], string> = {
  White: "#f8fafc",
  Black: "#111827",
  Silver: "#cbd5e1",
  Grey: "#6b7280",
  Blue: "#2563eb",
  Red: "#dc2626",
  Green: "#16a34a",
  Brown: "#92400e",
  Beige: "#d6c4a8",
  Orange: "#ea580c",
  Yellow: "#facc15",
  Gold: "#d4af37",
  Maroon: "#7f1d1d",
  Navy: "#1e3a8a",
  Bronze: "#b45309",
};

// Seats
export const SEATS_OPTIONS = [
  { value: 2, label: "2 Seats" },
  { value: 4, label: "4 Seats" },
  { value: 5, label: "5 Seats" },
  { value: 7, label: "7 Seats" },
  { value: 8, label: "8+ Seats" },
] as const;

// Doors
export const DOORS_OPTIONS = [
  { value: 2, label: "2 Doors" },
  { value: 3, label: "3 Doors" },
  { value: 4, label: "4 Doors" },
  { value: 5, label: "5 Doors" },
] as const;

// Drive Types
export const DRIVE_TYPES = [
  { value: "2WD", label: "2WD" },
  { value: "4WD", label: "4WD" },
] as const;

// Seller Types
export const SELLER_TYPES = [
  { value: "dealer", label: "Dealer" },
  { value: "private", label: "Private" },
] as const;

// Keep the existing city shortcuts first, then offer every county once.
const PRIORITY_LOCATIONS = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Nyeri",
] as const;

export const KENYA_COUNTIES = [
  "Baringo",
  "Bomet",
  "Bungoma",
  "Busia",
  "Elgeyo Marakwet",
  "Embu",
  "Garissa",
  "Homa Bay",
  "Isiolo",
  "Kajiado",
  "Kakamega",
  "Kericho",
  "Kiambu",
  "Kilifi",
  "Kirinyaga",
  "Kisii",
  "Kisumu",
  "Kitui",
  "Kwale",
  "Laikipia",
  "Lamu",
  "Machakos",
  "Makueni",
  "Mandera",
  "Marsabit",
  "Meru",
  "Migori",
  "Mombasa",
  "Murang'a",
  "Nairobi",
  "Nakuru",
  "Nandi",
  "Narok",
  "Nyamira",
  "Nyandarua",
  "Nyeri",
  "Samburu",
  "Siaya",
  "Taita Taveta",
  "Tana River",
  "Tharaka Nithi",
  "Trans Nzoia",
  "Turkana",
  "Uasin Gishu",
  "Vihiga",
  "Wajir",
  "West Pokot",
] as const;

export const LOCATIONS = [
  "All Locations",
  ...PRIORITY_LOCATIONS,
  ...KENYA_COUNTIES.filter(
    (county) => !PRIORITY_LOCATIONS.some((location) => location === county)
  ),
] as const;

const COUNTY_CITY_ALIASES: Record<string, readonly string[]> = {
  "Uasin Gishu": ["Eldoret"],
  Kiambu: ["Thika"],
  Kilifi: ["Malindi"],
  "Trans Nzoia": ["Kitale"],
  Laikipia: ["Nanyuki"],
  Nakuru: ["Naivasha"],
  "Taita Taveta": ["Voi"],
};

export function locationMatchesFilter(displayLocation: string, selectedLocation: string): boolean {
  const location = displayLocation.toLowerCase();
  return [selectedLocation, ...(COUNTY_CITY_ALIASES[selectedLocation] ?? [])].some((term) =>
    location.includes(term.toLowerCase())
  );
}

// Keep older vehicles in one "From" bucket instead of listing every earlier year.
export const YEARS = Array.from(
  { length: new Date().getFullYear() - 1989 },
  (_, i) => new Date().getFullYear() - i
);
export const OLDER_THAN_1990_YEAR_OPTION = { label: "Older than 1990", value: "1989" } as const;

// Price Ranges
export const PRICE_RANGES = [
  { label: "Under Ksh 500K", min: 0, max: 500000 },
  { label: "Ksh 500K - 1M", min: 500000, max: 1000000 },
  { label: "Ksh 1M - 2M", min: 1000000, max: 2000000 },
  { label: "Ksh 2M - 5M", min: 2000000, max: 5000000 },
  { label: "Ksh 5M - 10M", min: 5000000, max: 10000000 },
  { label: "Over Ksh 10M", min: 10000000, max: undefined },
] as const;

// Preset steps for the price/mileage range inputs (users can also type any value).
const formatPriceStep = (value: number) =>
  value >= 1_000_000 ? `Ksh ${value / 1_000_000}M` : `Ksh ${value / 1_000}K`;

export const PRICE_FILTER_OPTIONS = [
  { label: "Any", value: "" },
  ...[
    100_000, 300_000, 500_000, 700_000, 1_000_000, 1_500_000, 2_000_000,
    2_500_000, 3_000_000, 3_500_000, 4_000_000, 4_500_000, 5_000_000,
    6_000_000, 7_000_000, 8_000_000, 9_000_000, 10_000_000, 12_000_000,
    14_000_000, 16_000_000, 18_000_000, 20_000_000, 25_000_000, 30_000_000,
    35_000_000, 40_000_000, 45_000_000, 50_000_000,
  ].map((value) => ({ label: formatPriceStep(value), value: String(value) })),
];

export const MILEAGE_FILTER_OPTIONS = [
  { label: "Any", value: "" },
  ...[
    0, 500, 1_000, 5_000, 10_000, 20_000, 30_000, 40_000, 50_000, 60_000,
    70_000, 80_000, 90_000, 100_000, 120_000, 150_000, 200_000,
  ].map((value) => ({
    label: `${new Intl.NumberFormat("en-KE").format(value)} km`,
    value: String(value),
  })),
];

// Sort Options
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "year_new", label: "Year: Newest" },
  { value: "year_old", label: "Year: Oldest" },
  { value: "mileage_low", label: "Mileage: Low to High" },
  { value: "mileage_high", label: "Mileage: High to Low" },
] as const;
