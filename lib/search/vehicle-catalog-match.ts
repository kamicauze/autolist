export type MakeModelCatalog = Array<{ make: string; models: string[] }>;

type CatalogModel = { make: string; model: string; key: string; words: string[] };

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function words(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function maxDistance(length: number) {
  if (length <= 4) return 0;
  if (length === 5) return 1;
  return 2;
}

function editDistance(a: string, b: string, limit: number) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
}

function flattenModels(catalog: MakeModelCatalog): CatalogModel[] {
  return catalog.flatMap(({ make, models }) =>
    models.map((model) => ({ make, model, key: normalizeKey(model), words: words(model) }))
  );
}

/** Unique closest name within the typo budget; ties are ambiguous and return null. */
function closestName<T>(value: string, candidates: T[], keyOf: (candidate: T) => string[]) {
  const key = normalizeKey(value);
  const limit = maxDistance(key.length);
  let best: T | null = null;
  let bestDistance = limit + 1;
  let tied = false;

  for (const candidate of candidates) {
    const distance = Math.min(...keyOf(candidate).map((candidateKey) => editDistance(key, candidateKey, limit)));
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
      tied = false;
    } else if (distance === bestDistance && distance <= limit) {
      tied = true;
    }
  }

  return best && bestDistance <= limit && !tied ? best : null;
}

function splitCsv(value?: string) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function canonicalMake(value: string, catalog: MakeModelCatalog) {
  const key = normalizeKey(value);
  const exact = catalog.find((entry) => normalizeKey(entry.make) === key);
  if (exact) return exact.make;
  return closestName(value, catalog, (entry) => [normalizeKey(entry.make)])?.make ?? value;
}

function canonicalModel(value: string, models: CatalogModel[]) {
  const key = normalizeKey(value);
  const lower = value.toLowerCase();
  const exact = models.find((candidate) => candidate.key === key);
  if (exact) return exact;
  // Already matches a catalog model through the search's substring filter
  // (e.g. "Prado" -> "Land Cruiser Prado"); keep the seller-friendly short form.
  if (models.some((candidate) => candidate.model.toLowerCase().includes(lower))) return null;
  return closestName(value, models, (candidate) => [candidate.key, ...candidate.words.filter((word) => word.length >= 4)]);
}

/**
 * Snaps model-emitted make/model values to catalog spellings so the search's
 * substring filters match stored listings (case, spacing, hyphens and small
 * typos). Values with no confident catalog match are returned unchanged.
 */
export function canonicalizeMakeModel(
  params: { make?: string; model?: string },
  catalog: MakeModelCatalog
): { make?: string; model?: string } {
  if (catalog.length === 0) return params;

  const makes = splitCsv(params.make).map((make) => canonicalMake(make, catalog));
  let model = params.model?.trim() || undefined;

  if (model) {
    const makeKeys = new Set(makes.map(normalizeKey));
    const allModels = flattenModels(catalog);
    const scoped = makeKeys.size > 0 ? allModels.filter((item) => makeKeys.has(normalizeKey(item.make))) : allModels;
    const match = canonicalModel(model, scoped.length > 0 ? scoped : allModels);
    if (match) {
      model = match.model;
      if (makes.length === 0) {
        const owners = new Set(allModels.filter((item) => item.key === match.key).map((item) => item.make));
        if (owners.size === 1) makes.push(match.make);
      }
    }
  }

  return {
    make: makes.length > 0 ? Array.from(new Set(makes)).join(",") : undefined,
    model,
  };
}

/**
 * Retrieves catalog names that a query plausibly refers to, so the prompt can
 * steer the model toward spellings that exist in inventory.
 */
function bestTokenDistance(tokens: string[], targets: string[]) {
  let best = Number.POSITIVE_INFINITY;
  for (const token of tokens) {
    const limit = maxDistance(token.length);
    for (const target of targets) {
      const distance = editDistance(token, target, limit);
      if (distance <= limit && distance < best) best = distance;
    }
  }
  return best;
}

export function findCatalogCandidates(query: string, catalog: MakeModelCatalog, limit = 8) {
  const tokens = words(query).filter((token) => token.length >= 3 && !/^\d+$/.test(token));
  if (tokens.length === 0) return [];
  const searchable = (value: string) => words(value).filter((word) => word.length >= 3 && !/^\d+$/.test(word));

  const candidates: Array<{ make: string; model?: string; distance: number }> = [];
  for (const entry of catalog) {
    const distance = bestTokenDistance(tokens, [normalizeKey(entry.make), ...searchable(entry.make)]);
    if (Number.isFinite(distance)) candidates.push({ make: entry.make, distance });
  }
  for (const item of flattenModels(catalog)) {
    const distance = bestTokenDistance(tokens, [item.key, ...searchable(item.model)]);
    if (Number.isFinite(distance)) candidates.push({ make: item.make, model: item.model, distance });
  }

  return candidates
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ make, model }) => (model ? `${make} ${model}` : make));
}
