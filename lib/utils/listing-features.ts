import {
  LISTING_FEATURE_GROUPS_BY_CATEGORY,
  LISTING_FEATURE_INDEX,
} from "@/lib/constants/marketplace";
import { formatListingLabel } from "@/lib/utils/listing-details";

export type GroupedListingFeature = {
  key: string;
  label: string;
  features: string[];
};

const LEGACY_CAR_GROUP_RULES: Array<{ key: string; pattern: RegExp }> = [
  {
    key: "safety",
    pattern: /airbag|anti.?lock|brake|stability|traction|immobili|child lock|tyre pressure|anti.?theft|roll stability/i,
  },
  {
    key: "technology_driver_assist",
    pattern: /cruise|lane|collision|parking|pedestrian|road sign|traffic alert|driver attention|body control|blind spot/i,
  },
  {
    key: "infotainment",
    pattern: /android auto|apple carplay|bluetooth|navigation|radio|infotainment|smartphone|usb|touchscreen/i,
  },
  {
    key: "audio_visual",
    pattern: /camera|surround sound|sound system|speaker|head.?up display|audio/i,
  },
  {
    key: "exterior",
    pattern: /tailgate|mirror|sunroof|headlight|headlamp|light|wiper|wheel|roof rail/i,
  },
  {
    key: "comfort_convenience",
    pattern: /keyless|wireless charging|climate|heated|ventilated|cooled|push.?button|engine start|auto hold/i,
  },
  {
    key: "interior",
    pattern: /seat|steering|window|air conditioning|dashboard|cockpit|cup holder|interior/i,
  },
  {
    key: "performance_mechanical",
    pattern: /differential|damper|aerodynamic|suspension|exhaust|start.?stop|instrument cluster/i,
  },
];

function getGroupLabel(groupKey: string) {
  for (const definition of Object.values(LISTING_FEATURE_GROUPS_BY_CATEGORY)) {
    const label = definition.labels[groupKey];
    if (label) return label;
  }

  return "Other Features";
}

function inferLegacyCarGroup(label: string) {
  return LEGACY_CAR_GROUP_RULES.find((rule) => rule.pattern.test(label))?.key ?? "other";
}

export function groupListingFeatures(features: string[] | null | undefined) {
  const grouped = new Map<string, GroupedListingFeature>();

  for (const feature of features || []) {
    const definition = LISTING_FEATURE_INDEX[feature];
    const featureLabel = definition?.label ?? formatListingLabel(feature);
    const key = definition?.group ?? inferLegacyCarGroup(featureLabel);
    const label = key === "other" ? "Other Features" : getGroupLabel(key);
    const existing = grouped.get(key) ?? { key, label, features: [] };

    if (featureLabel && !existing.features.includes(featureLabel)) {
      existing.features.push(featureLabel);
    }

    grouped.set(key, existing);
  }

  return Array.from(grouped.values());
}
