const GOOGLE_MAPS_BASE_URL = "https://www.google.com/maps";

export function buildGoogleMapsQuery(parts: Array<string | null | undefined>) {
  const normalizedParts: string[] = [];

  for (const part of parts) {
    if (!part) continue;

    for (const item of String(part)
      .split(/[,\n]/)
      .map((value) => value.trim())
      .filter(Boolean)) {
      if (!normalizedParts.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
        normalizedParts.push(item);
      }
    }
  }

  return normalizedParts.length > 0 ? normalizedParts.join(", ") : null;
}

export function getGoogleMapsEmbedUrl(
  apiKey: string | null | undefined,
  query: string | null | undefined
) {
  const trimmedApiKey = apiKey?.trim();
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return null;
  }

  if (!trimmedApiKey) {
    const params = new URLSearchParams({
      q: trimmedQuery,
      output: "embed",
    });

    return `${GOOGLE_MAPS_BASE_URL}?${params.toString()}`;
  }

  const params = new URLSearchParams({
    key: trimmedApiKey,
    q: trimmedQuery,
  });

  return `${GOOGLE_MAPS_BASE_URL}/embed/v1/search?${params.toString()}`;
}

export function getGoogleMapsDirectionsUrl(query: string | null | undefined) {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return GOOGLE_MAPS_BASE_URL;
  }

  const params = new URLSearchParams({
    api: "1",
    destination: trimmedQuery,
  });

  return `${GOOGLE_MAPS_BASE_URL}/dir/?${params.toString()}`;
}

export function getGoogleMapsSearchUrl(query: string | null | undefined) {
  const trimmedQuery = query?.trim();

  if (!trimmedQuery) {
    return GOOGLE_MAPS_BASE_URL;
  }

  const params = new URLSearchParams({
    api: "1",
    query: trimmedQuery,
  });

  return `${GOOGLE_MAPS_BASE_URL}/search/?${params.toString()}`;
}
