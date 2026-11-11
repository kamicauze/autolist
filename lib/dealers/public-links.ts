import type { DealerProfile } from "@/lib/types/dealer";
import { normalizeWhatsAppPhone, PHONE_REGEX } from "@/lib/utils/phone";

export type DealerPublicLink = { label: string; href: string };

export function buildDealerPublicLinks(
  dealer: Pick<DealerProfile, "status" | "website" | "social_links">,
): DealerPublicLink[] {
  // Approved dealers can show their links while paid packages are paused.
  if (dealer.status !== "APPROVED") return [];
  const candidates = [
    ["Website", dealer.website],
    ["Facebook", dealer.social_links?.facebook],
    ["Instagram", dealer.social_links?.instagram],
    ["LinkedIn", dealer.social_links?.linkedin],
    ["X", dealer.social_links?.x],
    ["TikTok", dealer.social_links?.tiktok],
    ["Other social page", dealer.social_links?.other],
  ];
  return candidates.flatMap(([label, value]) => {
    if (!value) return [];
    try {
      const url = new URL(value.trim());
      return (url.protocol === "https:" || url.protocol === "http:") && !url.username && !url.password
        ? [{ label: label!, href: url.href }] : [];
    } catch { return []; }
  });
}

function getInternationalNumber(value?: string | null) {
  const number = normalizeWhatsAppPhone(value);
  return number && !number.startsWith("0") && PHONE_REGEX.test(number) ? number : null;
}

export function buildDealerContactLinks(dealer: Pick<DealerProfile, "mobile" | "whatsapp">) {
  const callNumber = getInternationalNumber(dealer.mobile);
  const whatsappNumber = getInternationalNumber(dealer.whatsapp?.trim() || dealer.mobile);

  return {
    callHref: callNumber ? `tel:+${callNumber}` : null,
    whatsappHref: whatsappNumber ? `https://wa.me/${whatsappNumber}` : null,
  };
}
