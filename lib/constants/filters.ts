// Car Makes
export const MAKES = [
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
] as const;

// Body Types
export const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Truck",
  "Coupe",
  "Convertible",
  "Van",
  "Wagon",
  "Crossover",
  "Pickup",
  "Bus",
] as const;

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
  { value: "foreign_used", label: "Foreign Used" },
  { value: "used", label: "Locally Used" },
  { value: "new", label: "Brand New" },
] as const;

// Seller Types
export const SELLER_TYPES = [
  { value: "dealer", label: "Dealer" },
  { value: "private", label: "Private" },
] as const;

// Locations (Kenya cities)
export const LOCATIONS = [
  "All Locations",
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

// Years (last 30 years)
export const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

// Price Ranges
export const PRICE_RANGES = [
  { label: "Under Ksh 500K", min: 0, max: 500000 },
  { label: "Ksh 500K - 1M", min: 500000, max: 1000000 },
  { label: "Ksh 1M - 2M", min: 1000000, max: 2000000 },
  { label: "Ksh 2M - 5M", min: 2000000, max: 5000000 },
  { label: "Ksh 5M - 10M", min: 5000000, max: 10000000 },
  { label: "Over Ksh 10M", min: 10000000, max: undefined },
] as const;

// Mileage Ranges
export const MILEAGE_RANGES = [
  { label: "Any Km", value: undefined },
  { label: "Under 10,000 km", max: 10000 },
  { label: "Under 30,000 km", max: 30000 },
  { label: "Under 50,000 km", max: 50000 },
  { label: "Under 100,000 km", max: 100000 },
  { label: "Under 150,000 km", max: 150000 },
  { label: "Over 150,000 km", min: 150000 },
] as const;

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
