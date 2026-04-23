import sharp from "sharp";
import { getAiProviderConfig } from "@/lib/ai/provider";
import { scoreListingCoverCandidate } from "@/lib/server/listing-image-pipeline";

export type VehicleImageView =
  | "front_three_quarter"
  | "front"
  | "side"
  | "rear_three_quarter"
  | "rear"
  | "interior"
  | "dashboard"
  | "engine_bay"
  | "wheel_detail"
  | "close_up"
  | "document"
  | "unknown";

export type RankedListingImageCandidate = {
  fileName: string;
  originalIndex: number;
  score: number;
  heuristicScore: number;
  visionView: VehicleImageView | null;
  bytes: Buffer;
};

type VisionClassification = {
  view: VehicleImageView;
  confidence: number;
  wholeVehicle: boolean;
};

async function classifyVehicleImageView(bytes: Buffer): Promise<VisionClassification | null> {
  try {
    const config = getAiProviderConfig();
    if (!config.enabled || config.provider !== "openai") {
      return null;
    }

    const preview = await sharp(bytes)
      .rotate()
      .resize({ width: 768, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();

    const imageDataUrl = `data:image/jpeg;base64,${preview.toString("base64")}`;

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0,
        max_tokens: 120,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Return valid JSON only. Classify the car photo viewpoint. Use one of: front_three_quarter, front, side, rear_three_quarter, rear, interior, dashboard, engine_bay, wheel_detail, close_up, document, unknown.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  'Classify this vehicle image for listing cover selection. Return JSON with keys: view, confidence, wholeVehicle. Favor exterior shots that show the full car. Prefer straight-on front views first, then front three-quarter views. Interior, dashboard, detail, or document images should not be primary covers.',
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl,
                  detail: "low",
                },
              },
            ],
          },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as Partial<VisionClassification>;
    const view = typeof parsed.view === "string" ? (parsed.view as VehicleImageView) : "unknown";

    return {
      view,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      wholeVehicle: Boolean(parsed.wholeVehicle),
    };
  } catch {
    return null;
  }
}

function getVisionScore(classification: VisionClassification | null) {
  if (!classification) return 0;

  let score = 0;
  switch (classification.view) {
    case "front":
      score += 165;
      break;
    case "front_three_quarter":
      score += 145;
      break;
    case "side":
      score += 80;
      break;
    case "rear_three_quarter":
      score += 45;
      break;
    case "rear":
      score += 25;
      break;
    case "interior":
    case "dashboard":
      score -= 180;
      break;
    case "engine_bay":
    case "wheel_detail":
    case "close_up":
    case "document":
      score -= 130;
      break;
    default:
      break;
  }

  if (classification.wholeVehicle) {
    score += 25;
  }

  return score + Math.round((classification.confidence || 0) * 20);
}

export async function rankListingImageCandidates(
  candidates: Array<{ fileName: string; originalIndex: number; bytes: Buffer }>
): Promise<RankedListingImageCandidate[]> {
  const heuristicRanked = await Promise.all(
    candidates.map(async (candidate) => ({
      ...candidate,
      heuristicScore: await scoreListingCoverCandidate(candidate.fileName, candidate.bytes),
    }))
  );

  const topCandidates = heuristicRanked
    .slice()
    .sort((a, b) => b.heuristicScore - a.heuristicScore || a.originalIndex - b.originalIndex)
    .slice(0, Math.min(12, heuristicRanked.length));

  const visionByIndex = new Map<number, VisionClassification | null>();
  for (const candidate of topCandidates) {
    const classification = await classifyVehicleImageView(candidate.bytes);
    visionByIndex.set(candidate.originalIndex, classification);
  }

  return heuristicRanked
    .map((candidate) => {
      const classification = visionByIndex.get(candidate.originalIndex) ?? null;
      return {
        ...candidate,
        score: candidate.heuristicScore + getVisionScore(classification),
        visionView: classification?.view ?? null,
      };
    })
    .sort((a, b) => b.score - a.score || a.originalIndex - b.originalIndex);
}
