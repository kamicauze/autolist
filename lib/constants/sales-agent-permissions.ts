export const SALES_AGENT_PERMISSION_KEYS = [
  "listings.manage",
  "enquiries.respond",
  "reviews.manage",
  "billing.view",
] as const;

export type SalesAgentPermission = (typeof SALES_AGENT_PERMISSION_KEYS)[number];

export const SALES_AGENT_PERMISSIONS: {
  key: SalesAgentPermission;
  label: string;
  description: string;
}[] = [
  {
    key: "listings.manage",
    label: "Manage listings",
    description: "Create, edit, publish, and expire the dealership's vehicle listings.",
  },
  {
    key: "enquiries.respond",
    label: "Respond to enquiries",
    description: "View and reply to buyer messages and enquiries on the dealership's listings.",
  },
  {
    key: "reviews.manage",
    label: "Manage reviews",
    description: "View and respond to reviews left on the dealership's listings.",
  },
  {
    key: "billing.view",
    label: "View membership & billing",
    description: "See the dealership's package, membership, and billing status (read-only).",
  },
];

const PERMISSION_KEY_SET = new Set<string>(SALES_AGENT_PERMISSION_KEYS);

export function sanitizeSalesAgentPermissions(values: readonly string[]): SalesAgentPermission[] {
  const seen = new Set<SalesAgentPermission>();
  for (const value of values) {
    if (PERMISSION_KEY_SET.has(value)) {
      seen.add(value as SalesAgentPermission);
    }
  }
  return SALES_AGENT_PERMISSION_KEYS.filter((key) => seen.has(key));
}
