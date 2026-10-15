// Exact manufacture years retain the server's supported 1900–next-year range.
// Search's "Older than 1990" bucket is not an exact manufacture year.
export const MANUFACTURE_YEAR_OPTIONS = Array.from(
  { length: new Date().getFullYear() + 2 - 1900 },
  (_, index) => {
    const value = String(new Date().getFullYear() + 1 - index);
    return { value, label: value };
  }
);

// Common car/van choices, including the supplied examples. Exact capacities
// outside these suggestions remain available through the manual option.
export const CAR_VAN_ENGINE_CC_OPTIONS = [
  660, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800,
  1900, 2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900,
  3000, 3200, 3300, 3500, 4000, 4500, 5000, 5500, 5700, 6000, 6500,
  7000, 8000,
].map((value) => ({ value: String(value), label: `${value} cc` }));

export const LISTING_DOOR_OPTIONS = [2, 3, 4, 5].map((value) => ({
  value: String(value), label: String(value),
}));
