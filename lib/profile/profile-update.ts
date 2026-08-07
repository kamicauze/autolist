import { z } from "zod";

const PHONE_REGEX = /^\+?[0-9]{8,15}$/;

const optionalPhone = z
  .string()
  .trim()
  .max(32)
  .refine(
    (value) => !value || PHONE_REGEX.test(value.replace(/\s+/g, "")),
    "Enter a valid phone number."
  );

const optionalHttpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;

    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "URLs must start with http:// or https://.");

const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine(
    (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    "Enter a valid public dealership email."
  );

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required.").max(160),
  publicEmail: optionalEmail,
  phone: optionalPhone,
  whatsapp: optionalPhone,
  bio: z.string().trim().max(3000),
  city: z.string().trim().max(160),
  address: z.string().trim().max(300),
  location: z.string().trim().max(200),
  website: optionalHttpUrl,
  facebook: optionalHttpUrl,
  twitter: optionalHttpUrl,
  instagram: optionalHttpUrl,
  linkedin: optionalHttpUrl,
  tiktok: optionalHttpUrl,
  otherSocial: optionalHttpUrl,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

type DealerOwnershipCandidate = {
  profile_id: string;
  status: string;
} | null;

function nullable(value: string) {
  return value || null;
}

function normalizedPhone(value: string) {
  return value ? value.replace(/\s+/g, "") : null;
}

export function canUpdateDealerPublicProfile({
  viewerId,
  profileRole,
  dealer,
}: {
  viewerId: string;
  profileRole: string | null;
  dealer: DealerOwnershipCandidate;
}) {
  return Boolean(
    profileRole === "dealer" &&
      dealer?.profile_id === viewerId &&
      dealer.status === "APPROVED"
  );
}

export function buildSellerProfileUpdate(input: ProfileUpdateInput) {
  return {
    full_name: input.fullName,
    phone: normalizedPhone(input.phone),
    whatsapp: normalizedPhone(input.whatsapp),
    bio: nullable(input.bio),
    city: nullable(input.city),
    address: nullable(input.address),
    website: nullable(input.website),
    facebook_url: nullable(input.facebook),
    twitter_url: nullable(input.twitter),
    instagram_url: nullable(input.instagram),
  };
}

export function buildDealerPublicProfileUpdate(
  input: ProfileUpdateInput,
  existingSocialLinks: Record<string, unknown> | null
) {
  const socialLinks: Record<string, unknown> = {
    ...(existingSocialLinks ?? {}),
  };
  const managedSocialLinks = {
    facebook: input.facebook,
    instagram: input.instagram,
    linkedin: input.linkedin,
    x: input.twitter,
    tiktok: input.tiktok,
    other: input.otherSocial,
  };

  for (const [key, value] of Object.entries(managedSocialLinks)) {
    if (value) {
      socialLinks[key] = value;
    } else {
      delete socialLinks[key];
    }
  }

  return {
    name: input.fullName,
    email: input.publicEmail,
    mobile: normalizedPhone(input.phone),
    whatsapp: normalizedPhone(input.whatsapp),
    about_text: nullable(input.bio),
    city: nullable(input.city),
    address: nullable(input.address),
    location: nullable(input.location),
    website: nullable(input.website),
    social_links: Object.keys(socialLinks).length > 0 ? socialLinks : null,
  };
}
