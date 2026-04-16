import { promises as fs } from "fs";
import path from "path";
import mime from "mime";
import { ALL_MAKES, CAR_MAKES_DATA, getModelsForMake, getVariantsForModel } from "../lib/constants/car-data";
import { uploadListingImageAssets } from "../lib/server/listing-image-pipeline";
import { createAdminClient } from "../lib/supabase/admin";

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

type ListingCondition = "new" | "locally_used" | "foreign_used";

type ScanItemStatus = "parsed" | "needs_review" | "skip";

type PhotoSetType = "exterior" | "interior" | "mixed" | "unknown";

type ScanCommandOptions = {
  root: string;
  out: string;
  limit?: number;
  defaultCondition?: ListingCondition;
  defaultCurrency?: string;
  defaultYear?: number;
  defaultPrice?: number;
};

type ImportCommandOptions = {
  manifest: string;
  sellerEmail?: string;
  sellerId?: string;
  dealerId?: string;
  offset?: number;
  limit?: number;
  dryRun: boolean;
};

type ExportCsvCommandOptions = {
  manifest: string;
  out: string;
  minimal?: boolean;
};

type MergeCsvCommandOptions = {
  manifest: string;
  csv: string;
  out: string;
};

type ManifestSummary = {
  root: string;
  generatedAt: string;
  totalFolders: number;
  totalVehicleCandidates: number;
  parsed: number;
  needsReview: number;
  skipped: number;
  totalImages: number;
  unknownFolders: string[];
};

type ManifestImage = {
  path: string;
  fileName: string;
  extension: string;
  size: number;
  mimeType: string;
};

type ManifestListingDraft = {
  title: string;
  description: string;
  make: string | null;
  model: string | null;
  variant: string | null;
  trim: string | null;
  bodyType: string | null;
  color: string | null;
  year: number | null;
  price: number | null;
  currency: string;
  mileage: number | null;
  condition: ListingCondition;
  features: string[];
  metadata: Record<string, Json>;
};

type ManifestItem = {
  sourceType: "vehicle" | "unknown";
  status: ScanItemStatus;
  folderName: string;
  folderPath: string;
  imageCount: number;
  photoSetType: PhotoSetType;
  vehicleKey: string | null;
  warnings: string[];
  tokens: string[];
  images: ManifestImage[];
  listing: ManifestListingDraft;
};

type ManifestFile = {
  summary: ManifestSummary;
  items: ManifestItem[];
};

type MatchedMake = {
  make: string;
  alias: string;
};

type MatchedModel = {
  model: string | null;
  variant: string | null;
  score: number;
};

type CliOptions = Record<string, string | boolean>;

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

type DealerRow = {
  id: string;
  profile_id: string;
  name: string;
  status: string;
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const DEFAULT_CONDITION: ListingCondition = "foreign_used";
const DEFAULT_CURRENCY = "KES";

const COLOR_PATTERNS = [
  "green blue",
  "dark grey",
  "light blue",
  "light grey",
  "dark blue",
  "black",
  "blue",
  "brown",
  "green",
  "grey",
  "gray",
  "purple",
  "red",
  "silver",
  "white",
  "whiter",
  "yellow",
  "gold",
  "beige",
];

const MAKE_ALIASES: Array<[string, string]> = [
  ["mercedes benz", "Mercedes-Benz"],
  ["mercedes", "Mercedes-Benz"],
  ["merceds", "Mercedes-Benz"],
  ["merecedes", "Mercedes-Benz"],
  ["bnez", "Mercedes-Benz"],
  ["vw", "Volkswagen"],
  ["volkswagen", "Volkswagen"],
  ["peugeout", "Peugeot"],
  ["peugoet", "Peugeot"],
  ["grand cheroke", "Jeep"],
  ["jeep", "Jeep"],
  ["range rover", "Land Rover"],
  ["golf", "Volkswagen"],
];

const BODY_TYPE_HINTS: Array<[string, string]> = [
  ["sedan", "Sedan"],
  ["wagon", "Wagon"],
  ["hatchback", "Hatchback"],
  ["crossover", "Crossover"],
  ["suv", "SUV"],
  ["pickup", "Pickup"],
];

const INTERIOR_MARKERS = [" int ", " interior ", " black int ", " blck int "];
const NOISE_TERMS = ["redo", "photos"];

const NON_VEHICLE_FOLDERS = new Set(["photos"]);

const MODEL_ALIASES: Record<string, Record<string, string>> = {
  "Mercedes-Benz": {
    c200: "C Class",
    "c 200": "C Class",
    c180: "C Class",
    "c 180": "C Class",
    c220: "C Class",
    "c 220": "C Class",
    c250: "C Class",
    "c 250": "C Class",
    c300: "C Class",
    "c 300": "C Class",
    c350: "C Class",
    "c 350": "C Class",
    e200: "E Class",
    "e 200": "E Class",
    e220: "E Class",
    "e 220": "E Class",
    e250: "E Class",
    "e 250": "E Class",
    e300: "E Class",
    "e 300": "E Class",
    e350: "E Class",
    "e 350": "E Class",
    e400: "E Class",
    "e 400": "E Class",
    s350: "S Class",
    "s 350": "S Class",
    s400: "S Class",
    "s 400": "S Class",
    s400h: "S Class",
    "s 400h": "S Class",
    gle300d: "GLE",
    "gle 300d": "GLE",
    gle350d: "GLE",
    "gle 350d": "GLE",
    gle400d: "GLE",
    "gle 400d": "GLE",
    gle450: "GLE",
    "gle 450": "GLE",
  },
  Toyota: {
    lc200: "Land Cruiser",
    prado: "Land Cruiser Prado",
    crown: "Crown",
    crwon: "Crown",
    fortuner: "Fortuner",
    gaia: "Gaia",
  },
  Subaru: {
    s4: "WRX",
    "s4 wrx": "WRX",
    "imprezza s4 wrx": "WRX",
    "impreza s4 wrx": "WRX",
    foreseter: "Forester",
  },
  Volkswagen: {
    golftsi: "Golf",
  },
  Suzuki: {
    sport: "Swift",
  },
  Mazda: {
    atenza: "Atenza Sedan",
    "axela sedan": "Axela Sedan",
    "axela sport": "Axela Sport",
    axela: "Axela Sedan",
  },
  Jeep: {
    "gran cheroke": "Grand Cherokee",
    "grand cheroke": "Grand Cherokee",
  },
};

function parseArgs(argv: string[]): { command: string; options: CliOptions } {
  const [command = "scan", ...rest] = argv;
  const options: CliOptions = {};

  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const next = rest[index + 1];

    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }

    options[key] = next;
    index += 1;
  }

  return { command, options };
}

function getStringOption(options: CliOptions, key: string, fallback?: string): string | undefined {
  const value = options[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  return fallback;
}

function getNumberOption(options: CliOptions, key: string): number | undefined {
  const value = options[key];
  if (typeof value !== "string" || !value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function getBooleanOption(options: CliOptions, key: string): boolean {
  return options[key] === true;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeForMatch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function squashForMatch(value: string) {
  return normalizeForMatch(value).replace(/\s+/g, "");
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function naturalSort(values: string[]) {
  return values.sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }));
}

function levenshtein(left: string, right: string) {
  if (left === right) return 0;
  if (!left.length) return right.length;
  if (!right.length) return left.length;

  const matrix = Array.from({ length: left.length + 1 }, (_, row) => [row]);
  for (let column = 1; column <= right.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost,
      );
    }
  }

  return matrix[left.length][right.length];
}

function similarity(left: string, right: string) {
  const a = squashForMatch(left);
  const b = squashForMatch(right);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) / Math.max(a.length, b.length);
  const distance = levenshtein(a, b);
  return 1 - distance / Math.max(a.length, b.length);
}

function sanitizeFolderLabel(folderName: string) {
  return folderName
    .replace(/\(([^)]+)\)/g, " $1 ")
    .replace(/[_/]+/g, " ")
    .replace(/[-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectPhotoSetType(folderName: string) {
  const haystack = ` ${normalizeForMatch(folderName)} `;
  const hasInteriorMarker = INTERIOR_MARKERS.some((marker) => haystack.includes(marker));
  if (!hasInteriorMarker) return "exterior" as const;
  if (haystack.includes(" exterior ")) return "mixed" as const;
  return "interior" as const;
}

function detectColor(folderName: string) {
  const normalized = normalizeForMatch(folderName);
  const haystack = ` ${normalized} `;

  for (const pattern of COLOR_PATTERNS) {
    if (haystack.startsWith(` ${pattern} `) || haystack === ` ${pattern} `) {
      const value = pattern === "gray" ? "Grey" : titleCase(pattern.replace(/\s+/g, "-")).replace("Grey", "Grey");
      return { color: value, remaining: normalized.slice(pattern.length).trim() };
    }
  }

  return { color: null, remaining: normalized };
}

function detectExplicitMake(input: string): MatchedMake | null {
  const normalized = normalizeForMatch(input);
  const explicitAliases = [...MAKE_ALIASES, ...ALL_MAKES.map((make) => [normalizeForMatch(make), make] as [string, string])];

  for (const [alias, make] of explicitAliases.sort((left, right) => right[0].length - left[0].length)) {
    const candidate = normalizeForMatch(alias);
    if (!candidate) continue;
    if (normalized.startsWith(`${candidate} `) || normalized === candidate || normalized.includes(` ${candidate} `)) {
      return { make, alias: candidate };
    }
  }

  return null;
}

function detectBodyType(input: string) {
  const normalized = normalizeForMatch(input);
  for (const [pattern, bodyType] of BODY_TYPE_HINTS) {
    if (normalized.includes(pattern)) return bodyType;
  }
  return null;
}

function detectModelAlias(make: string, input: string) {
  const aliasMap = MODEL_ALIASES[make];
  if (!aliasMap) return null;
  const normalized = normalizeForMatch(input);
  const tokens = normalized.split(/\s+/).filter(Boolean);

  for (const [alias, model] of Object.entries(aliasMap)) {
    const aliasNormalized = normalizeForMatch(alias);
    const aliasTokens = aliasNormalized.split(/\s+/).filter(Boolean);
    const aliasSquashed = aliasTokens.join("");

    if (tokens.some((token) => token === aliasSquashed)) {
      return model;
    }

    for (let index = 0; index <= tokens.length - aliasTokens.length; index += 1) {
      const window = tokens.slice(index, index + aliasTokens.length);
      if (window.join(" ") === aliasNormalized || window.join("") === aliasSquashed) {
        return model;
      }
    }

  }

  return null;
}

function buildVariantCandidates(make: string) {
  return getModelsForMake(make).flatMap((modelName) =>
    getVariantsForModel(make, modelName).map((variant) => ({ model: modelName, variant })),
  );
}

function detectModel(make: string, folderLabel: string, remainder: string): MatchedModel {
  const models = getModelsForMake(make);
  if (models.length === 0) return { model: null, variant: null, score: 0 };

  const aliasHit = detectModelAlias(make, folderLabel);
  if (aliasHit) {
    return { model: aliasHit, variant: null, score: 0.97 };
  }

  const normalizedFolder = normalizeForMatch(folderLabel);
  const normalizedRemainder = normalizeForMatch(remainder);
  const squashedFolder = squashForMatch(folderLabel);
  const squashedRemainder = squashForMatch(remainder);

  let bestModel: MatchedModel = { model: null, variant: null, score: 0 };

  for (const model of models) {
    const normalizedModel = normalizeForMatch(model);
    const squashedModel = squashForMatch(model);
    let score = 0;

    if (normalizedFolder.includes(normalizedModel) || normalizedRemainder.includes(normalizedModel)) {
      score = Math.max(score, 0.99);
    }

    if (squashedFolder.includes(squashedModel) || squashedRemainder.includes(squashedModel)) {
      score = Math.max(score, 0.96);
    }

    score = Math.max(score, similarity(model, remainder), similarity(model, folderLabel) * 0.92);

    if (score > bestModel.score) {
      bestModel = { model, variant: null, score };
    }
  }

  const variantCandidates = buildVariantCandidates(make);
  for (const candidate of variantCandidates) {
    const squashedVariant = squashForMatch(candidate.variant);
    if (squashedVariant.length < 4) continue;

    const variantScore = Math.max(similarity(candidate.variant, folderLabel), similarity(candidate.variant, remainder));

    let score = variantScore;
    if (squashedFolder.includes(squashedVariant) || squashedRemainder.includes(squashedVariant)) {
      score = Math.max(score, 0.98);
    }

    if (score > bestModel.score) {
      bestModel = { model: candidate.model, variant: candidate.variant, score };
    }
  }

  if (bestModel.score < 0.58) {
    return { model: null, variant: null, score: bestModel.score };
  }

  return bestModel;
}

function detectGlobalVehicle(folderLabel: string) {
  let best: { make: string | null; model: string | null; variant: string | null; score: number } = {
    make: null,
    model: null,
    variant: null,
    score: 0,
  };

  for (const makeData of CAR_MAKES_DATA) {
    const matched = detectModel(makeData.name, folderLabel, folderLabel);
    if (matched.score > best.score) {
      best = { make: makeData.name, model: matched.model, variant: matched.variant, score: matched.score };
    }
  }

  if (best.score < 0.72) return null;
  return best;
}

function dedupeWarnings(warnings: string[]) {
  return Array.from(new Set(warnings));
}

function parseCsvBoolean(value: string | undefined) {
  if (!value) return false;
  return ["1", "true", "yes", "y"].includes(value.trim().toLowerCase());
}

function parseCsvNumber(value: string | undefined) {
  if (!value) return null;
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsvString(value: string | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function escapeCsvValue(value: string | number | null | undefined) {
  if (value == null) return "";
  const stringValue = String(value);
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, "\"\"")}"`;
}

function parseCsvText(text: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === "\"") {
      if (inQuotes && nextCharacter === "\"") {
        currentCell += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      if (currentRow.some((cell) => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => cell.length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

function rebuildListingTitle(item: ManifestItem) {
  const parts = [item.listing.year, item.listing.make, item.listing.model, item.listing.variant]
    .filter((value) => value !== null && value !== undefined && `${value}`.trim().length > 0);
  return parts.join(" ");
}

function rebuildListingDescription(item: ManifestItem) {
  const parts = [item.listing.make, item.listing.model, item.listing.variant].filter(Boolean);
  const lead = parts.length > 0
    ? `${parts.join(" ")} photo set imported from a local media archive.`
    : "Vehicle photo set imported from a local media archive.";
  const detail = item.photoSetType === "interior"
    ? "This folder appears to focus on interior shots and should be reviewed alongside any matching exterior set."
    : "Review year, price, trim, condition, and seller details before publishing.";
  return `${lead} ${detail}`.trim();
}

function refreshItemAfterManualEdits(item: ManifestItem, forceSkip = false) {
  const retainedWarnings = item.warnings.filter((warning) =>
    !warning.startsWith("Year is missing.") &&
    !warning.startsWith("Price is missing.") &&
    !warning.startsWith("Could not confidently detect the vehicle make") &&
    !warning.startsWith("Could not confidently detect the vehicle model") &&
    !warning.startsWith("Could not detect a reliable exterior color") &&
    !warning.startsWith("Fewer than 3 images found.")
  );

  if (!item.listing.make) retainedWarnings.push("Could not confidently detect the vehicle make from the folder title.");
  if (!item.listing.model) retainedWarnings.push("Could not confidently detect the vehicle model from the folder title.");
  if (!item.listing.color) retainedWarnings.push("Could not detect a reliable exterior color from the folder title.");
  if (item.listing.year == null) retainedWarnings.push("Year is missing. Add a year in the manifest before import.");
  if (item.listing.price == null) retainedWarnings.push("Price is missing. Add a price in the manifest before import.");
  if (item.imageCount < 3) retainedWarnings.push("Fewer than 3 images found. Submission rules will block publishing.");
  if (item.photoSetType === "interior" && !retainedWarnings.some((warning) => warning.includes("interior-only"))) {
    retainedWarnings.push("Folder looks like an interior-only photo set. Review before treating it as a standalone listing.");
  }

  item.warnings = dedupeWarnings(retainedWarnings);
  item.sourceType = item.listing.make && item.listing.model ? "vehicle" : "unknown";
  item.vehicleKey = item.sourceType === "vehicle"
    ? toSlug([item.listing.make, item.listing.model, item.listing.variant].filter(Boolean).join(" "))
    : null;

  if (!item.listing.title.trim()) item.listing.title = rebuildListingTitle(item);
  if (!item.listing.description.trim()) item.listing.description = rebuildListingDescription(item);

  if (forceSkip) {
    item.status = "skip";
    return item;
  }

  if (item.sourceType !== "vehicle") {
    item.status = "skip";
    return item;
  }

  item.status = item.warnings.length === 0 ? "parsed" : "needs_review";
  return item;
}

function deriveVariantFromFolder(
  folderName: string,
  make: string | null,
  model: string | null,
  existingVariant: string | null,
) {
  if (existingVariant) return existingVariant;
  if (!make || !model) return null;

  const tokens = normalizeForMatch(folderName).split(/\s+/).filter(Boolean);
  const aliasTokens = MAKE_ALIASES
    .filter(([, targetMake]) => targetMake === make)
    .flatMap(([alias]) => normalizeForMatch(alias).split(/\s+/).filter(Boolean));

  const removable = new Set([
    ...COLOR_PATTERNS.flatMap((pattern) => normalizeForMatch(pattern).split(/\s+/)),
    ...normalizeForMatch(make).split(/\s+/).filter(Boolean),
    ...aliasTokens,
    ...normalizeForMatch(model).split(/\s+/).filter(Boolean),
    "int",
    "interior",
    "blck",
    "used",
    "redo",
  ]);

  const leftovers = tokens.filter((token) => token && !removable.has(token));
  if (leftovers.length === 0) return null;

  const variant = leftovers.join(" ").trim();
  if (!variant) return null;
  if (similarity(variant, model) > 0.78) return null;
  if (variant.length < 2) return null;
  return variant
    .split(/\s+/)
    .map((part) => (/\d/.test(part) ? part.toUpperCase() : titleCase(part)))
    .join(" ");
}

function buildListingDraft(
  folderPath: string,
  folderName: string,
  options: ScanCommandOptions,
): ManifestItem {
  const sanitizedLabel = sanitizeFolderLabel(folderName);
  const warnings: string[] = [];
  const photoSetType = detectPhotoSetType(folderName);
  const bodyType = detectBodyType(sanitizedLabel);
  const normalizedFolderName = normalizeForMatch(folderName);

  if (NON_VEHICLE_FOLDERS.has(normalizedFolderName)) {
    return {
      sourceType: "unknown",
      status: "skip",
      folderName,
      folderPath,
      imageCount: 0,
      photoSetType: "unknown",
      vehicleKey: null,
      warnings: ["Folder name does not look like a vehicle listing. Treat as general website/media assets."],
      tokens: normalizedFolderName.split(/\s+/).filter(Boolean),
      images: [],
      listing: {
        title: "",
        description: "General media asset folder.",
        make: null,
        model: null,
        variant: null,
        trim: null,
        bodyType: null,
        color: null,
        year: null,
        price: null,
        currency: options.defaultCurrency ?? DEFAULT_CURRENCY,
        mileage: null,
        condition: options.defaultCondition ?? DEFAULT_CONDITION,
        features: [],
        metadata: {
          import: {
            sourceFolderName: folderName,
            sourceFolderPath: folderPath,
            photoSetType: "unknown",
            parserVersion: 1,
          },
        },
      },
    };
  }

  if (photoSetType === "interior") {
    warnings.push("Folder looks like an interior-only photo set. Review before treating it as a standalone listing.");
  }

  for (const noiseTerm of NOISE_TERMS) {
    if (normalizeForMatch(folderName).includes(noiseTerm)) {
      warnings.push(`Folder name contains "${noiseTerm}", which may indicate a duplicate or non-final set.`);
    }
  }

  const { color, remaining } = detectColor(sanitizedLabel);
  const explicitMake = detectExplicitMake(remaining);
  let detectedMake = explicitMake?.make ?? detectGlobalVehicle(remaining)?.make ?? null;

  let detectedModel: string | null = null;
  let detectedVariant: string | null = null;
  let matchScore = 0;

  if (detectedMake) {
    const matched = detectModel(detectedMake, sanitizedLabel, explicitMake ? remaining.replace(explicitMake.alias, "").trim() : remaining);
    detectedModel = matched.model;
    detectedVariant = matched.variant;
    matchScore = matched.score;
  }

  if (!detectedMake && !detectedModel) {
    const globalHit = detectGlobalVehicle(remaining);
    if (globalHit) {
      detectedMake = globalHit.make;
      detectedModel = globalHit.model;
      detectedVariant = globalHit.variant;
      matchScore = globalHit.score;
    }
  }

  detectedVariant = deriveVariantFromFolder(folderName, detectedMake, detectedModel, detectedVariant);

  const tokens = normalizeForMatch(folderName).split(/\s+/).filter(Boolean);
  const trim = detectedVariant;

  if (!detectedMake) warnings.push("Could not confidently detect the vehicle make from the folder title.");
  if (!detectedModel) warnings.push("Could not confidently detect the vehicle model from the folder title.");
  if (!color) warnings.push("Could not detect a reliable exterior color from the folder title.");
  if (matchScore > 0 && matchScore < 0.8) warnings.push("Vehicle detection is fuzzy. Confirm the suggested make/model before importing.");
  if (options.defaultYear == null) warnings.push("Year is missing. Add a year in the manifest before import.");
  if (options.defaultPrice == null) warnings.push("Price is missing. Add a price in the manifest before import.");

  const labelParts = [detectedMake, detectedModel, detectedVariant].filter(Boolean);
  const title = [options.defaultYear ?? null, ...labelParts].filter(Boolean).join(" ");
  const descriptionLead = labelParts.length > 0 ? `${labelParts.join(" ")} photo set imported from a local media archive.` : "Vehicle photo set imported from a local media archive.";
  const descriptionDetail = photoSetType === "interior"
    ? "This folder appears to focus on interior shots and should be reviewed alongside any matching exterior set."
    : "Review year, price, trim, condition, and seller details before publishing.";

  return {
    sourceType: detectedMake && detectedModel ? "vehicle" : "unknown",
    status: detectedMake && detectedModel ? (warnings.some((warning) => warning.includes("missing") || warning.includes("fuzzy") || warning.includes("interior-only")) ? "needs_review" : "parsed") : "skip",
    folderName,
    folderPath,
    imageCount: 0,
    photoSetType,
    vehicleKey: labelParts.length > 0 ? toSlug(labelParts.join(" ")) : null,
    warnings: dedupeWarnings(warnings),
    tokens,
    images: [],
    listing: {
      title,
      description: `${descriptionLead} ${descriptionDetail}`.trim(),
      make: detectedMake,
      model: detectedModel,
      variant: detectedVariant,
      trim,
      bodyType,
      color,
      year: options.defaultYear ?? null,
      price: options.defaultPrice ?? null,
      currency: options.defaultCurrency ?? DEFAULT_CURRENCY,
      mileage: null,
      condition: options.defaultCondition ?? DEFAULT_CONDITION,
      features: [],
      metadata: {
        import: {
          sourceFolderName: folderName,
          sourceFolderPath: folderPath,
          photoSetType,
          parserVersion: 1,
        },
      },
    },
  };
}

async function listImageFiles(folderPath: string) {
  const entries = await fs.readdir(folderPath, { withFileTypes: true });
  const fileNames = naturalSort(
    entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())),
  );

  const images: ManifestImage[] = [];
  for (const fileName of fileNames) {
    const absolutePath = path.join(folderPath, fileName);
    const stat = await fs.stat(absolutePath);
    const mimeType = mime.getType(fileName) || "application/octet-stream";
    images.push({
      path: absolutePath,
      fileName,
      extension: path.extname(fileName).toLowerCase(),
      size: stat.size,
      mimeType,
    });
  }

  return images;
}

async function scanRoot(options: ScanCommandOptions): Promise<ManifestFile> {
  const rootEntries = await fs.readdir(options.root, { withFileTypes: true });
  const folderEntries = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith("."));

  const items: ManifestItem[] = [];
  const limitedFolders = typeof options.limit === "number" ? folderEntries.slice(0, options.limit) : folderEntries;

  for (const folderName of limitedFolders.sort((left, right) => left.localeCompare(right))) {
    const folderPath = path.join(options.root, folderName);
    const item = buildListingDraft(folderPath, folderName, options);
    item.images = await listImageFiles(folderPath);
    item.imageCount = item.images.length;

    if (item.imageCount === 0) {
      item.status = "skip";
      item.warnings.push("Folder contains no supported images.");
    } else if (item.imageCount < 3) {
      item.warnings.push("Fewer than 3 images found. Submission rules will block publishing.");
      if (item.status === "parsed") item.status = "needs_review";
    }

    items.push(item);
  }

  const summary: ManifestSummary = {
    root: options.root,
    generatedAt: new Date().toISOString(),
    totalFolders: items.length,
    totalVehicleCandidates: items.filter((item) => item.sourceType === "vehicle").length,
    parsed: items.filter((item) => item.status === "parsed").length,
    needsReview: items.filter((item) => item.status === "needs_review").length,
    skipped: items.filter((item) => item.status === "skip").length,
    totalImages: items.reduce((total, item) => total + item.imageCount, 0),
    unknownFolders: items.filter((item) => item.sourceType === "unknown").map((item) => item.folderName),
  };

  return { summary, items };
}

async function ensureDirectoryForFile(filePath: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function writeManifest(manifest: ManifestFile, outputPath: string) {
  await ensureDirectoryForFile(outputPath);
  await fs.writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function exportReviewCsv(options: ExportCsvCommandOptions) {
  const manifest = JSON.parse(await fs.readFile(options.manifest, "utf8")) as ManifestFile;
  const header = options.minimal
    ? [
        "folder_name",
        "skip",
        "make",
        "model",
        "variant",
        "year",
        "price",
        "warnings",
      ]
    : [
        "folder_name",
        "status",
        "skip",
        "image_count",
        "photo_set_type",
        "make",
        "model",
        "variant",
        "trim",
        "color",
        "body_type",
        "year",
        "price",
        "currency",
        "mileage",
        "condition",
        "title",
        "description",
        "warnings",
      ];

  const lines = [header.join(",")];
  for (const item of manifest.items) {
    const row = options.minimal
      ? [
          item.folderName,
          item.status === "skip" ? "true" : "false",
          item.listing.make,
          item.listing.model,
          item.listing.variant,
          item.listing.year,
          item.listing.price,
          item.warnings.join(" | "),
        ]
      : [
          item.folderName,
          item.status,
          item.status === "skip" ? "true" : "false",
          item.imageCount,
          item.photoSetType,
          item.listing.make,
          item.listing.model,
          item.listing.variant,
          item.listing.trim,
          item.listing.color,
          item.listing.bodyType,
          item.listing.year,
          item.listing.price,
          item.listing.currency,
          item.listing.mileage,
          item.listing.condition,
          item.listing.title,
          item.listing.description,
          item.warnings.join(" | "),
        ];
    lines.push(row.map(escapeCsvValue).join(","));
  }

  await ensureDirectoryForFile(options.out);
  await fs.writeFile(options.out, `${lines.join("\n")}\n`, "utf8");
  return {
    output: options.out,
    rows: manifest.items.length,
  };
}

async function mergeReviewCsv(options: MergeCsvCommandOptions) {
  const manifest = JSON.parse(await fs.readFile(options.manifest, "utf8")) as ManifestFile;
  const csvText = await fs.readFile(options.csv, "utf8");
  const rows = parseCsvText(csvText);
  if (rows.length === 0) {
    throw new Error("CSV file is empty.");
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((cell) => cell.trim().toLowerCase());
  const headerSet = new Set(headers);
  const folderNameIndex = headers.indexOf("folder_name");
  if (folderNameIndex === -1) {
    throw new Error('CSV must include a "folder_name" column.');
  }

  const updates = new Map<string, Record<string, string>>();
  for (const row of dataRows) {
    const entry: Record<string, string> = {};
    headers.forEach((header, index) => {
      entry[header] = row[index] ?? "";
    });
    const folderName = entry.folder_name?.trim();
    if (folderName) {
      updates.set(folderName, entry);
    }
  }

  for (const item of manifest.items) {
    const update = updates.get(item.folderName);
    if (!update) continue;

    const forceSkip = parseCsvBoolean(update.skip);
    const make = parseCsvString(update.make);
    const model = parseCsvString(update.model);
    const variant = parseCsvString(update.variant);
    const trim = parseCsvString(update.trim);
    const color = parseCsvString(update.color);
    const bodyType = parseCsvString(update.body_type);
    const title = parseCsvString(update.title);
    const description = parseCsvString(update.description);
    const condition = parseCsvString(update.condition) as ListingCondition | null;
    const currency = parseCsvString(update.currency);

    if (headerSet.has("make") && make !== null) item.listing.make = make;
    if (headerSet.has("model") && model !== null) item.listing.model = model;
    if (headerSet.has("variant")) item.listing.variant = variant;
    if (headerSet.has("trim")) item.listing.trim = trim ?? item.listing.variant;
    if (headerSet.has("color") && color !== null) item.listing.color = color;
    if (headerSet.has("body_type") && bodyType !== null) item.listing.bodyType = bodyType;
    if (headerSet.has("year")) item.listing.year = parseCsvNumber(update.year);
    if (headerSet.has("price")) item.listing.price = parseCsvNumber(update.price);
    if (headerSet.has("mileage")) item.listing.mileage = parseCsvNumber(update.mileage);
    if (headerSet.has("currency") && currency !== null) item.listing.currency = currency;
    if (headerSet.has("condition") && condition !== null) item.listing.condition = condition;
    if (headerSet.has("title") && title !== null) item.listing.title = title;
    if (headerSet.has("description") && description !== null) item.listing.description = description;

    refreshItemAfterManualEdits(item, forceSkip);
  }

  manifest.summary = {
    root: manifest.summary.root,
    generatedAt: new Date().toISOString(),
    totalFolders: manifest.items.length,
    totalVehicleCandidates: manifest.items.filter((item) => item.sourceType === "vehicle").length,
    parsed: manifest.items.filter((item) => item.status === "parsed").length,
    needsReview: manifest.items.filter((item) => item.status === "needs_review").length,
    skipped: manifest.items.filter((item) => item.status === "skip").length,
    totalImages: manifest.items.reduce((total, item) => total + item.imageCount, 0),
    unknownFolders: manifest.items.filter((item) => item.sourceType === "unknown").map((item) => item.folderName),
  };

  await writeManifest(manifest, options.out);
  return {
    output: options.out,
    summary: manifest.summary,
  };
}

async function uploadFileToR2(listingId: string, image: ManifestImage) {
  const bytes = await fs.readFile(image.path);
  return uploadListingImageAssets({
    listingId,
    fileName: image.fileName,
    bytes,
    contentType: image.mimeType,
  });
}

async function resolveSeller(options: ImportCommandOptions) {
  const supabase = createAdminClient();

  let seller: ProfileRow | null = null;
  if (options.sellerId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", options.sellerId)
      .single();
    if (error) throw error;
    seller = data as ProfileRow;
  } else if (options.sellerEmail) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, full_name, role")
      .ilike("email", options.sellerEmail)
      .single();
    if (error) throw error;
    seller = data as ProfileRow;
  }

  if (!seller) {
    throw new Error("Provide --seller-email or --seller-id for import.");
  }

  let dealer: DealerRow | null = null;
  if (options.dealerId) {
    const { data, error } = await supabase
      .from("dealers")
      .select("id, profile_id, name, status")
      .eq("id", options.dealerId)
      .single();
    if (error) throw error;
    dealer = data as DealerRow;
  } else {
    const { data } = await supabase
      .from("dealers")
      .select("id, profile_id, name, status")
      .eq("profile_id", seller.id)
      .maybeSingle();
    dealer = (data as DealerRow | null) ?? null;
  }

  return { supabase, seller, dealer };
}

function assertImportable(item: ManifestItem) {
  if (item.status === "skip") return "Marked to skip.";
  if (item.sourceType !== "vehicle") return "Not classified as a vehicle listing.";
  if (!item.listing.make || !item.listing.model) return "Make or model is missing.";
  if (item.listing.year == null) return "Year is missing.";
  if (item.listing.price == null) return "Price is missing.";
  if (item.imageCount < 3) return "At least 3 images are required.";
  return null;
}

async function createListingIfMissing(
  supabase: ReturnType<typeof createAdminClient>,
  sellerId: string,
  dealerId: string | null,
  item: ManifestItem,
) {
  const importMetadata = item.listing.metadata.import as Record<string, Json>;

  const { data: existing } = await supabase
    .from("listings")
    .select("id")
    .eq("seller_id", sellerId)
    .contains("metadata", { import: { sourceFolderName: importMetadata.sourceFolderName } })
    .maybeSingle();

  if (existing?.id) {
    return { id: existing.id, created: false };
  }

  const insertPayload = {
    seller_id: sellerId,
    dealer_id: dealerId,
    status: "draft",
    make: item.listing.make,
    model: item.listing.model,
    year: item.listing.year,
    price: item.listing.price,
    currency: item.listing.currency,
    mileage: item.listing.mileage,
    body_type: item.listing.bodyType,
    transmission: null,
    fuel_type: null,
    color: item.listing.color,
    condition: item.listing.condition,
    description: item.listing.description,
    features: item.listing.features,
    metadata: item.listing.metadata,
  };

  const { data, error } = await supabase.from("listings").insert(insertPayload).select("id").single();
  if (error) throw error;
  return { id: data.id as string, created: true };
}

async function saveListingImages(
  supabase: ReturnType<typeof createAdminClient>,
  listingId: string,
  item: ManifestItem,
  dryRun: boolean,
) {
  const uploaded: Array<{ key: string; hash: string; fileName: string; coverScore: number; originalIndex: number }> = [];

  for (const [index, image] of item.images.entries()) {
    if (dryRun) {
      uploaded.push({
        key: `dry-run/${listingId}/${image.fileName}`,
        hash: "dry-run",
        fileName: image.fileName,
        coverScore: 0,
        originalIndex: index,
      });
      continue;
    }

    const { key, hash, coverScore } = await uploadFileToR2(listingId, image);
    uploaded.push({ key, hash, fileName: image.fileName, coverScore, originalIndex: index });
  }

  const ordered = uploaded
    .slice()
    .sort((a, b) => {
      if (b.coverScore !== a.coverScore) return b.coverScore - a.coverScore;
      return a.originalIndex - b.originalIndex;
    });

  for (const [index, image] of ordered.entries()) {
    const { error } = await supabase.from("listing_images").insert({
      listing_id: listingId,
      r2_key: image.key,
      alt_text: `${item.listing.title || `${item.listing.make} ${item.listing.model}`.trim()} - Photo ${index + 1}`,
      image_order: index,
      image_hash: image.hash,
    });
    if (error) throw error;
  }

  return ordered;
}

async function runImport(options: ImportCommandOptions) {
  const manifest = JSON.parse(await fs.readFile(options.manifest, "utf8")) as ManifestFile;
  const { supabase, seller, dealer } = await resolveSeller(options);
  const offset = options.offset ?? 0;
  const items = typeof options.limit === "number"
    ? manifest.items.slice(offset, offset + options.limit)
    : manifest.items.slice(offset);
  const results: Array<{ folderName: string; action: string; listingId?: string; reason?: string }> = [];

  for (const item of items) {
    const importError = assertImportable(item);
    if (importError) {
      results.push({ folderName: item.folderName, action: "skipped", reason: importError });
      continue;
    }

    if (options.dryRun) {
      results.push({ folderName: item.folderName, action: "would-import" });
      continue;
    }

    const listing = await createListingIfMissing(supabase, seller.id, dealer?.id ?? null, item);
    if (!listing.created) {
      results.push({ folderName: item.folderName, action: "skipped", listingId: listing.id, reason: "Listing already exists for this source folder." });
      continue;
    }

    await saveListingImages(supabase, listing.id, item, false);
    results.push({ folderName: item.folderName, action: "imported", listingId: listing.id });
  }

  return {
    seller,
    dealer,
    results,
  };
}

function printUsage() {
  console.log(`Usage:
  npx tsx scripts/car-folder-import.ts scan --root "/Volumes/System/LANCHASTER EDITED" --out output/car-folder-manifest.json
  npx tsx scripts/car-folder-import.ts export-csv --manifest output/car-folder-manifest.json --out output/car-folder-review.csv
  npx tsx scripts/car-folder-import.ts export-csv --manifest output/car-folder-manifest.json --out output/car-folder-review-minimal.csv --minimal
  npx tsx scripts/car-folder-import.ts merge-csv --manifest output/car-folder-manifest.json --csv output/car-folder-review.csv --out output/car-folder-manifest.enriched.json
  npx tsx scripts/car-folder-import.ts import --manifest output/car-folder-manifest.json --seller-email martin.admin@autolist.africa --dry-run

Optional scan flags:
  --limit 10
  --default-condition foreign_used
  --default-currency KES
  --default-year 2019
  --default-price 2500000

Optional import flags:
  --seller-id <uuid>
  --dealer-id <uuid>
  --offset 10
  --limit 10
  --dry-run

CSV notes:
  export-csv writes one row per folder for spreadsheet review.
  export-csv --minimal writes only folder_name, skip, make, model, variant, year, price, warnings.
  merge-csv reads edited values back from columns like year, price, make, model, variant, color, and skip.
`);
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));

  if (command === "scan") {
    const root = getStringOption(options, "root");
    const out = getStringOption(options, "out", path.join(process.cwd(), "output", "car-folder-manifest.json"));
    if (!root) {
      printUsage();
      throw new Error("Missing required --root argument.");
    }

    const manifest = await scanRoot({
      root,
      out: out!,
      limit: getNumberOption(options, "limit"),
      defaultCondition: (getStringOption(options, "default-condition") as ListingCondition | undefined) ?? DEFAULT_CONDITION,
      defaultCurrency: getStringOption(options, "default-currency", DEFAULT_CURRENCY),
      defaultYear: getNumberOption(options, "default-year"),
      defaultPrice: getNumberOption(options, "default-price"),
    });

    await writeManifest(manifest, out!);
    console.log(JSON.stringify({
      output: out,
      summary: manifest.summary,
      examples: manifest.items.slice(0, 5).map((item) => ({
        folderName: item.folderName,
        status: item.status,
        make: item.listing.make,
        model: item.listing.model,
        variant: item.listing.variant,
        warnings: item.warnings,
      })),
    }, null, 2));
    return;
  }

  if (command === "import") {
    const manifest = getStringOption(options, "manifest");
    if (!manifest) {
      printUsage();
      throw new Error("Missing required --manifest argument.");
    }

    const result = await runImport({
      manifest,
      sellerEmail: getStringOption(options, "seller-email"),
      sellerId: getStringOption(options, "seller-id"),
      dealerId: getStringOption(options, "dealer-id"),
      offset: getNumberOption(options, "offset"),
      limit: getNumberOption(options, "limit"),
      dryRun: getBooleanOption(options, "dry-run"),
    });

    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "export-csv") {
    const manifest = getStringOption(options, "manifest");
    const out = getStringOption(options, "out", path.join(process.cwd(), "output", "car-folder-review.csv"));
    if (!manifest) {
      printUsage();
      throw new Error("Missing required --manifest argument.");
    }

    const result = await exportReviewCsv({
      manifest,
      out: out!,
      minimal: getBooleanOption(options, "minimal"),
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (command === "merge-csv") {
    const manifest = getStringOption(options, "manifest");
    const csv = getStringOption(options, "csv");
    const out = getStringOption(options, "out", path.join(process.cwd(), "output", "car-folder-manifest.enriched.json"));
    if (!manifest || !csv) {
      printUsage();
      throw new Error("Missing required --manifest or --csv argument.");
    }

    const result = await mergeReviewCsv({
      manifest,
      csv,
      out: out!,
    });
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  printUsage();
  throw new Error(`Unknown command: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
