import type { ListingCategory } from "@/lib/constants/marketplace";

export type LandingSearchCountStatus = "loading" | "ready" | "error";

const RESULT_NOUNS: Record<
  ListingCategory,
  { singular: string; plural: string }
> = {
  car: { singular: "car", plural: "cars" },
  motorbike: { singular: "bike", plural: "bikes" },
  van: { singular: "van", plural: "vans" },
  truck: { singular: "truck", plural: "trucks" },
  plant_construction: {
    singular: "plant machine",
    plural: "plant machines",
  },
  farm_agricultural: {
    singular: "farm machine",
    plural: "farm machines",
  },
};

export function reconcileLandingRange({
  side,
  nextValue,
  currentFrom,
  currentTo,
}: {
  side: "from" | "to";
  nextValue: string;
  currentFrom: string;
  currentTo: string;
}) {
  const from = side === "from" ? nextValue : currentFrom;
  const to = side === "to" ? nextValue : currentTo;

  if (
    from !== "any" &&
    to !== "any" &&
    Number.isFinite(Number(from)) &&
    Number.isFinite(Number(to)) &&
    Number(from) > Number(to)
  ) {
    return { from: nextValue, to: nextValue };
  }

  return { from, to };
}

export function getLandingSearchButtonLabel({
  category,
  count,
  status,
}: {
  category: ListingCategory;
  count: number;
  status: LandingSearchCountStatus;
}) {
  const nouns = RESULT_NOUNS[category];

  if (status === "loading") {
    return `Checking ${nouns.plural}…`;
  }

  if (status === "error") {
    return `Search ${nouns.plural}`;
  }

  const noun = count === 1 ? nouns.singular : nouns.plural;
  return `Search ${new Intl.NumberFormat("en-KE").format(count)} ${noun}`;
}
