const BODY_TYPE_SYNONYMS: Record<string, string[]> = {
  Sedan: [
    "sedan",
    "saloon",
    "premio",
    "allion",
    "axio",
    "corolla",
    "civic",
    "mark x",
    "jetta",
    "passat",
    "s60",
    "c200",
    "e200",
    "3 series",
    "5 series",
    "a4",
    "a6",
    "s class",
    "c class",
    "e class",
    "demio sedan",
    "atenza sedan",
  ],
  SUV: [
    "suv",
    "4x4",
    "prado",
    "land cruiser",
    "forester",
    "cx-5",
    "cx5",
    "cx-8",
    "cx8",
    "x-trail",
    "xtrail",
    "sportage",
    "harrier",
    "x1",
    "x2",
    "x3",
    "x4",
    "x5",
    "x6",
    "x7",
    "gla",
    "glb",
    "glc",
    "gle",
    "gls",
    "q3",
    "q5",
    "q7",
    "q8",
    "tiguan",
    "touareg",
    "macan",
    "cayenne",
    "fortuner",
    "sorento",
    "prado j250",
    "prado j120",
  ],
  Crossover: [
    "crossover",
    "vezel",
    "forester",
    "qashqai",
    "sportage",
    "x1",
    "x2",
    "q3",
    "gla",
    "glb",
    "tiguan",
    "macan",
  ],
  Hatchback: ["hatchback", "demio", "fit", "march", "vitz", "note", "a1", "polo", "swift", "passo", "yaris", "208", "axela sport", "golf"],
  Pickup: ["pickup", "pick up", "pick-up", "hilux", "d-max", "dmax", "ranger", "navara", "amarok"],
  Wagon: ["wagon", "estate", "fielder", "outback"],
  Van: ["van", "hiace", "serena", "voxy", "noah"],
  Truck: ["truck", "canter", "actros", "scania"],
  Coupe: ["coupe", "86", "mustang", "a5"],
  Convertible: ["convertible", "cabriolet", "roadster"],
};

export function normalizeBodyTypeValue(value: string) {
  const lower = value.trim().toLowerCase();
  if (!lower) return null;
  if (lower === "suv") return "SUV";
  if (lower === "saloon") return "Sedan";
  if (lower === "estate") return "Wagon";
  if (lower === "pick up" || lower === "pick-up") return "Pickup";
  if (lower === "4x4") return "SUV";
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function inferBodyTypesFromText(text: string) {
  const normalized = ` ${text.toLowerCase()} `;
  const matches = new Set<string>();

  Object.entries(BODY_TYPE_SYNONYMS).forEach(([bodyType, terms]) => {
    if (terms.some((term) => normalized.includes(` ${term} `))) {
      matches.add(bodyType);
    }
  });

  if (matches.has("Crossover")) matches.add("SUV");
  if (matches.has("SUV") && normalized.includes(" crossover ")) matches.add("Crossover");

  return Array.from(matches);
}

export function inferPrimaryBodyType(text: string) {
  const matches = inferBodyTypesFromText(text);
  return matches[0] ?? null;
}
