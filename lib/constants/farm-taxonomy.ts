export const FARM_CATEGORY_TAXONOMY = [
  { label: "4WD Vehicles", subcategories: ["ATVS"] },
  { label: "Attachments", subcategories: ["Attachments"] },
  {
    label: "Forage and Hay",
    subcategories: [
      "Bale Wrappers",
      "Forage and Hay Attachments",
      "Forage and Hay Other",
      "Forage Harvesters",
      "Hay Bobs",
      "Mower-Conditioners",
      "Mowers",
      "Rakes",
      "Round Balers",
      "Square Balers",
      "Stacking and Loading Equipment",
      "Toppers",
      "Windrowers",
    ],
  },
  {
    label: "Forestry and Hedging",
    subcategories: [
      "Firewood Processors",
      "Forestry and Hedging Attachments",
      "Forestry and Hedging Other",
      "Forestry Mowers",
      "Hedge Mowers",
      "Loaders",
      "Log Splitters",
      "Stump Grinders",
      "Tree Harvesters",
      "Wood Chippers",
    ],
  },
  { label: "Ground Care Equipment", subcategories: ["Ride on mowers"] },
  {
    label: "Harvesters",
    subcategories: [
      "Combine Harvesters",
      "Follage Harvesters",
      "Harvester Attachments",
    ],
  },
  {
    label: "Livestock Equipment",
    subcategories: [
      "Bale Shredders and Spreaders",
      "Livestock Equipment Attachments",
      "Livestock Truck Drawbar Trailers",
    ],
  },
  {
    label: "Loaders and Excavators",
    subcategories: [
      "Attachments",
      "Plant Excavators",
      "Plant Loaders",
      "Telehandlers",
      "Tractor Based Loaders",
    ],
  },
  {
    label: "Sowing and Planting",
    subcategories: [
      "Combination Drills",
      "Planters",
      "Precision Seeders",
      "Seed Drills",
    ],
  },
  {
    label: "Spreaders and Sprayers",
    subcategories: [
      "Fertiliser Spreaders",
      "Manure Spreaders",
      "Other Sprayers and Spreaders",
      "Self Propelled Sprayers",
      "Slurry Tankers",
      "Spreaders and Sprayers Attachments",
      "Tractor Mounted Sprayers",
      "Trailer Sprayers",
    ],
  },
  { label: "Storage and Buildings", subcategories: ["Tanks"] },
  {
    label: "Tillage",
    subcategories: [
      "Aerators",
      "Cultivators",
      "Harrows",
      "Ploughs",
      "Power Harrows",
      "Rollers",
      "Stone Removal And Crushers",
      "Subsoilers",
      "Tillage Attachments",
    ],
  },
  {
    label: "Tractors",
    subcategories: [
      "Any",
      "Compact Tractor",
      "Large Tractor",
      "Medium Tractor",
      "Other Tractors",
      "Small Tractor",
      "Tractor Attachments",
    ],
  },
  {
    label: "Trailers",
    subcategories: [
      "Any",
      "Atv Trailers",
      "Bale Trailers",
      "Car And Van Trailers",
      "Dropside Trailers",
      "Dumper Trailers",
      "Farm Trailer Attachments",
      "Flatbed Trailers",
      "Grain And Silage Trailers",
      "Livestock Trailers",
      "Low Loader",
      "Other Trailers",
    ],
  },
] as const;

export function toFarmTaxonomyValue(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export const FARM_CATEGORY_OPTIONS = FARM_CATEGORY_TAXONOMY.map((category) => ({
  value: toFarmTaxonomyValue(category.label),
  label: category.label,
}));

export function getFarmSubcategoryOptions(categoryValue: string) {
  const category = FARM_CATEGORY_TAXONOMY.find(
    (item) => toFarmTaxonomyValue(item.label) === categoryValue
  );

  return (category?.subcategories ?? []).map((label) => ({
    value: toFarmTaxonomyValue(label),
    label,
  }));
}

export function getFarmCategoryLabel(categoryValue: string): string | undefined {
  return FARM_CATEGORY_OPTIONS.find((option) => option.value === categoryValue)?.label;
}

export function getFarmSubcategoryLabel(
  categoryValue: string,
  subcategoryValue: string
): string | undefined {
  return getFarmSubcategoryOptions(categoryValue).find(
    (option) => option.value === subcategoryValue
  )?.label;
}
