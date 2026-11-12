"use server";

import type { User } from "@supabase/supabase-js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { KENYA_COUNTIES } from "@/lib/constants/filters";
import { normalizeLocationText } from "@/lib/location/normalize";
import { profileUpdateSchema } from "@/lib/profile/profile-update";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { r2 } from "@/lib/r2";
import { requireAdminAction } from "@/lib/admin/guard";
import {
  createDealerKycReference,
  DEALER_KYC_BUCKET,
  getDealerKycStoragePath,
} from "@/lib/dealers/kyc-storage";
import {
  isDealerVerificationDocumentsUnavailable,
  schemaErrorIncludes,
  type PostgrestSchemaError,
} from "@/lib/data/dealer-verification-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/utils/listings";
import { emitNotificationEvent } from "@/lib/server/notifications";
import { findDealerAddresses } from "@/lib/location/dealer-address";
import type { DealerStatus } from "@/lib/types/dealer";
import {
  dealerRegistrationDocumentLabels,
  dealerRegistrationSchema,
  listingPhoneSchema,
  type DealerRegistration,
  type DealerRegistrationDocumentType,
} from "@/lib/validations/registration";

type DealerVerificationInsertRow = {
  dealer_id: string;
  uploaded_by: string;
  document_type:
    | "company_logo"
    | "contact_photo"
    | "incorporation_certificate"
    | "contact_id"
    | DealerRegistrationDocumentType;
  display_name: string;
  r2_key: string;
  mime_type: string;
  size_bytes: number;
};

type DealerVerificationDocumentType = DealerVerificationInsertRow["document_type"];

type DealerVerificationResubmissionRow = {
  id: string;
  profile_id: string;
  status: DealerStatus;
  contact_person: { photo_url?: string | null; [key: string]: unknown } | null;
  doc_incorporation_key?: string | null;
  doc_id_key?: string | null;
};

const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const DOC_ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const IMAGE_ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function optionalString(formData: FormData, key: string) {
  const value = requiredString(formData, key);
  return value.length > 0 ? value : null;
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

function omitUpdateKeys(source: Record<string, unknown>, keys: string[]) {
  const next = { ...source };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

function isMissingDealerVerificationDocumentsTable(error: PostgrestSchemaError | null | undefined) {
  return isDealerVerificationDocumentsUnavailable(error);
}

function isMissingDealerDocumentColumn(error: PostgrestSchemaError | null | undefined) {
  return ["doc_incorporation_key", "doc_id_key"].some((column) =>
    schemaErrorIncludes(error, column)
  );
}

function assertFile(file: File | null, allowedTypes: Set<string>, label: string, required = true) {
  if (!file) {
    if (required) {
      throw new Error(`${label} is required.`);
    }
    return;
  }

  if (!allowedTypes.has(file.type)) {
    throw new Error(`${label} must be a PNG, JPG, WEBP, or PDF file.`);
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error(`${label} exceeds the 10MB upload limit.`);
  }
}

const incorporationCertificateAttachment = {
  type: "incorporation_certificate",
  label: dealerRegistrationDocumentLabels.incorporation_certificate,
  folder: null,
} as const;

const onboardingAttachments = {
  companyLogo: { type: "company_logo", label: "Company logo", folder: "branding" },
  contactPhoto: { type: "contact_photo", label: "Primary contact photo", folder: "contact" },
  incorporationCertificate: incorporationCertificateAttachment,
  incorporation_certificate: incorporationCertificateAttachment,
  contactPersonId: { type: "contact_id", label: "Primary contact ID", folder: null },
  cr12: { type: "cr12", label: dealerRegistrationDocumentLabels.cr12, folder: null },
  national_id: { type: "national_id", label: dealerRegistrationDocumentLabels.national_id, folder: null },
  passport: { type: "passport", label: dealerRegistrationDocumentLabels.passport, folder: null },
} as const;

type OnboardingAttachment = keyof typeof onboardingAttachments;
const verificationFields = [
  "companyLogo", "contactPhoto", "incorporationCertificate", "contactPersonId",
] as const;

type DealerApplicant =
  | { user: User; role: string }
  | { error: string; code?: "session_expired" };

async function requireDealerApplicant(): Promise<DealerApplicant> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "Your session has ended. Sign in again to continue.", code: "session_expired" };
  }

  const { data: profile, error } = await supabase.from("profiles")
    .select("role, deactivated_at").eq("id", user.id).maybeSingle();
  if (error || !profile || profile.deactivated_at || !["buyer", "seller", "dealer"].includes(profile.role)) {
    return { error: "An active marketplace account is required." };
  }
  return { user, role: profile.role };
}

const verificationPhoneFields = [
  ["mobileNumber", "Enter a valid dealership mobile number."],
  ["whatsappNumber", "Enter a valid dealership WhatsApp number."],
  ["contactMobile", "Enter a valid primary contact mobile number."],
  ["contactWhatsapp", "Enter a valid primary contact WhatsApp number."],
] as const;

export async function createDealerOnboardingUpload(
  field: OnboardingAttachment,
  file: { name: string; type: string; size: number },
) {
  const applicant = await requireDealerApplicant();
  if ("error" in applicant) return { error: applicant.error, code: applicant.code };
  const { user } = applicant;

  if (!Object.hasOwn(onboardingAttachments, field)) return { error: "Invalid attachment." };
  const attachment = onboardingAttachments[field];
  const allowedTypes = attachment.folder ? IMAGE_ACCEPTED_TYPES : DOC_ACCEPTED_TYPES;
  if (!allowedTypes.has(file?.type)) return { error: `${attachment.label} has an unsupported file type.` };
  if (!Number.isInteger(file.size) || file.size <= 0 || file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { error: `${attachment.label} must be between 1 byte and 10 MB.` };
  }
  if (typeof file.name !== "string" || !file.name.trim()) return { error: "Invalid file name." };

  const name = sanitizeFileName(file.name).slice(-150) || "attachment";
  const path = `${user.id}/onboarding-${attachment.type}/${nanoid(20)}-${name}`;
  const { data, error } = await createAdminClient().storage
    .from(DEALER_KYC_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data?.token) return { error: `Couldn't prepare the upload for ${attachment.label}.` };
  return { path, token: data.token, bucket: DEALER_KYC_BUCKET };
}

async function resolveOnboardingAttachment(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  formData: FormData,
  field: typeof verificationFields[number],
) {
  const path = optionalString(formData, field + "UploadPath");
  if (path) {
    return resolveDirectDealerAttachment(
      admin, userId, field, path, optionalString(formData, field + "UploadName"),
    );
  }

  const file = getFile(formData, field);
  if (!file) return null;
  const attachment = onboardingAttachments[field];
  return attachment.folder
    ? uploadDealerPublicFile(userId, file, attachment.folder)
    : uploadDealerKycFile(admin, userId, file, field === "incorporationCertificate" ? "incorporation_certificate" : "contact_id");
}

async function resolveDirectDealerAttachment(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  field: OnboardingAttachment,
  path: string,
  uploadName: string | null,
) {
  const attachment = onboardingAttachments[field];
  const allowedTypes = attachment.folder ? IMAGE_ACCEPTED_TYPES : DOC_ACCEPTED_TYPES;
  const folder = `${userId}/onboarding-${attachment.type}`;
  const name = path.slice(folder.length + 1);
  if (!path.startsWith(`${folder}/`) || !/^[a-zA-Z0-9_-]{20}-[a-z0-9._-]{1,150}$/.test(name)) {
    throw new Error(`The uploaded ${attachment.label} does not belong to this application.`);
  }
  const bucket = admin.storage.from(DEALER_KYC_BUCKET);
  const { data: objects, error } = await bucket.list(folder, { search: name });
  const object = objects?.find((item) => item.name === name);
  const sizeBytes = Number(object?.metadata?.size);
  const mimeType = object?.metadata?.mimetype;
  if (error || !object || !Number.isInteger(sizeBytes) || sizeBytes <= 0 ||
      sizeBytes > MAX_UPLOAD_SIZE_BYTES || typeof mimeType !== "string" || !allowedTypes.has(mimeType)) {
    throw new Error(`Couldn't verify ${attachment.label}. Select the file again and retry.`);
  }

  const displayName = uploadName?.slice(0, 255) || name.slice(21);
  if (!attachment.folder) {
    return { displayName, mimeType, sizeBytes, r2Key: createDealerKycReference(path), publicUrl: null };
  }

  const { data: blob, error: downloadError } = await bucket.download(path);
  if (downloadError || !blob || blob.size !== sizeBytes) {
    throw new Error(`Couldn't read the uploaded ${attachment.label}. Please retry.`);
  }
  const file = new File([blob], displayName, { type: mimeType });
  return uploadDealerPublicFile(userId, file, attachment.folder, name);
}

async function uploadDealerPublicFile(
  userId: string,
  file: File,
  folder: "branding" | "contact",
  objectName?: string,
) {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 bucket configuration is missing.");
  }

  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const baseName = extension ? file.name.slice(0, -extension.length) : file.name;
  const r2Key = `dealers/${userId}/${folder}/${objectName ?? `${Date.now()}-${nanoid(10)}-${sanitizeFileName(`${baseName}${extension}`)}`}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2Key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type || "application/octet-stream",
    })
  );

  return {
    displayName: file.name,
    mimeType: file.type || "application/octet-stream",
    publicUrl: getImageUrl(r2Key),
    r2Key,
    sizeBytes: file.size,
  };
}

async function uploadDealerKycFile(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  file: File,
  documentType: "incorporation_certificate" | "contact_id",
) {
  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const baseName = extension ? file.name.slice(0, -extension.length) : file.name;
  const storagePath = `${userId}/${documentType}/${Date.now()}-${nanoid(10)}-${sanitizeFileName(
    `${baseName}${extension}`,
  )}`;
  const { error } = await admin.storage.from(DEALER_KYC_BUCKET).upload(
    storagePath,
    Buffer.from(await file.arrayBuffer()),
    {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    },
  );

  if (error) {
    throw new Error(`Unable to store ${file.name} securely: ${error.message}`);
  }

  return {
    displayName: file.name,
    mimeType: file.type || "application/octet-stream",
    publicUrl: null,
    r2Key: createDealerKycReference(storagePath),
    sizeBytes: file.size,
  };
}

async function removeDealerKycReferences(
  admin: ReturnType<typeof createAdminClient>,
  references: Array<string | null | undefined>,
) {
  const storagePaths = references
    .map((reference) => (reference ? getDealerKycStoragePath(reference) : null))
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length > 0) {
    await admin.storage.from(DEALER_KYC_BUCKET).remove(storagePaths);
  }
}

async function logAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>
) {
  try {
    const { error } = await createAdminClient().from("audit_logs").insert({
      user_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
    if (error) throw error;
  } catch (error) {
    console.warn("Unable to record dealer audit log:", error);
    return "The change was saved, but its audit log could not be recorded. Please contact support.";
  }
}

export async function searchDealerAddresses(rawQuery: string) {
  const applicant = await requireDealerApplicant();
  if ("error" in applicant) return { error: applicant.error, code: applicant.code };
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";
  if (query.length < 3 || query.length > 160) return { error: "Enter a building or street name." };
  try {
    return { results: await findDealerAddresses(query) };
  } catch {
    return { error: "Address search is unavailable. You can enter the address manually." };
  }
}

export async function createDealerRegistration(input: DealerRegistration) {
  const applicant = await requireDealerApplicant();
  if ("error" in applicant) return { error: applicant.error, code: applicant.code };

  const parsed = dealerRegistrationSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter a dealership name, valid listing phone, address, town, and county. Select a type for any attached document." };
  const { name, phone, address, town, county, area, document } = parsed.data;
  const admin = createAdminClient();

  try {
    const uploaded = document
      ? await resolveDirectDealerAttachment(admin, applicant.user.id, document.type, document.path, document.name)
      : null;
    const evidence = document && uploaded ? [{
      document_type: document.type,
      display_name: uploaded.displayName,
      r2_key: uploaded.r2Key,
      mime_type: uploaded.mimeType,
      size_bytes: uploaded.sizeBytes,
    }] : [];

    const { data, error } = await admin.rpc("save_dealer_registration", {
      applicant_id: applicant.user.id,
      dealership: {
        name, mobile: phone, address, city: town, county, location: area || address,
        doc_incorporation_key: document?.type === "incorporation_certificate" ? uploaded?.r2Key : null,
      },
      profile_details: { phone, city: town, address },
      evidence,
      submit_for_review: false,
      review_notes: null,
    });
    if (error || !data) return { error: error?.message || "Unable to save your dealership. Please retry." };
    revalidatePath("/dashboard");
    return { success: true as const, dealershipName: data.name as string };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to create your dealership. Please retry." };
  }
}

export async function leaveDealerSetup() {
  const applicant = await requireDealerApplicant();
  if ("error" in applicant) return { error: applicant.error, code: applicant.code };
  if (applicant.role !== "dealer") return { success: true as const };

  const admin = createAdminClient();
  const { data: dealer, error: dealerError } = await admin.from("dealers")
    .select("id").eq("profile_id", applicant.user.id).maybeSingle();
  if (dealerError) return { error: "Unable to switch your account. Please retry." };
  if (dealer) return { error: "Your dealership is already saved, so this account stays a dealer account." };

  const { error } = await admin.from("profiles").update({ role: "buyer" })
    .eq("id", applicant.user.id).eq("role", "dealer");
  if (error) return { error: "Unable to switch your account. Please retry." };
  revalidatePath("/dashboard");
  return { success: true as const };
}

export async function submitDealerVerification(formData: FormData) {
  const applicant = await requireDealerApplicant();
  if ("error" in applicant) return { error: applicant.error, code: applicant.code };
  const { user } = applicant;
  const adminSupabase = createAdminClient();

  try {
    const dealershipName = requiredString(formData, "dealershipName");
    const dealershipAddress = normalizeLocationText(requiredString(formData, "dealershipAddress"));
    const county = requiredString(formData, "county");
    if (county && !KENYA_COUNTIES.some((candidate) => candidate === county)) return { error: "Select a valid Kenyan county." };
    const cityTown = normalizeLocationText(requiredString(formData, "cityTown"));
    const locationArea = normalizeLocationText(requiredString(formData, "locationArea"));
    const mobileNumber = requiredString(formData, "mobileNumber");
    const officialEmail = requiredString(formData, "officialEmail");
    const whatsappNumber = requiredString(formData, "whatsappNumber");
    const contactFullName = requiredString(formData, "contactFullName");
    const contactRole = requiredString(formData, "contactRole");
    const contactMobile = requiredString(formData, "contactMobile");
    const contactEmail = requiredString(formData, "contactEmail");
    const acceptDealerTerms = requiredString(formData, "acceptDealerTerms") === "true";
    const acceptPrivacyPolicy = requiredString(formData, "acceptPrivacyPolicy") === "true";

    if (
      !dealershipName ||
      !dealershipAddress ||
      !cityTown ||
      !locationArea ||
      !mobileNumber ||
      !officialEmail ||
      !whatsappNumber ||
      !contactFullName ||
      !contactRole ||
      !contactMobile ||
      !contactEmail
    ) {
      return { error: "Complete all required dealership and contact fields." as const };
    }

    if (!acceptDealerTerms || !acceptPrivacyPolicy) {
      return { error: "Accept the dealer terms and privacy policy before submitting." as const };
    }

    const openingHours = profileUpdateSchema.shape.openingHours.safeParse(optionalString(formData, "openingHours") ?? "");
    if (!openingHours.success) return { error: openingHours.error.issues[0].message };

    const phones: Record<string, string | null> = {};
    for (const [field, message] of verificationPhoneFields) {
      const value = optionalString(formData, field);
      if (!value) {
        phones[field] = null;
        continue;
      }
      const parsed = listingPhoneSchema.safeParse(value);
      if (!parsed.success) return { error: message };
      phones[field] = parsed.data;
    }

    const existing = await adminSupabase.from("dealers").select("status, doc_incorporation_key")
      .eq("profile_id", user.id).maybeSingle();
    if (existing.error) return { error: existing.error.message };
    if (existing.data && existing.data.status !== "INCOMPLETE") {
      return { error: "This dealership already has a verification request." };
    }

    const storedCertificateKey = existing.data?.doc_incorporation_key;
    const storedCertificatePath = storedCertificateKey ? getDealerKycStoragePath(storedCertificateKey) : null;
    let verifiedCertificateKey: string | null = null;
    for (const field of verificationFields) {
      if (optionalString(formData, `${field}UploadPath`)) continue;
      const attachment = onboardingAttachments[field];
      const file = getFile(formData, field);
      if (field === "incorporationCertificate" && !file && storedCertificatePath) {
        const certificate = await resolveDirectDealerAttachment(adminSupabase, user.id, field, storedCertificatePath, null);
        verifiedCertificateKey = certificate.r2Key;
        continue;
      }
      assertFile(
        file,
        attachment.folder ? IMAGE_ACCEPTED_TYPES : DOC_ACCEPTED_TYPES,
        attachment.label,
        field === "incorporationCertificate",
      );
    }

    const [logoUpload, contactPhotoUpload, incorporationUpload, idUpload] =
      await Promise.all([
        resolveOnboardingAttachment(adminSupabase, user.id, formData, "companyLogo"),
        resolveOnboardingAttachment(adminSupabase, user.id, formData, "contactPhoto"),
        resolveOnboardingAttachment(adminSupabase, user.id, formData, "incorporationCertificate"),
        resolveOnboardingAttachment(adminSupabase, user.id, formData, "contactPersonId"),
      ]);

    const socialLinks = {
      opening_hours: openingHours.data || null,
      facebook: optionalString(formData, "facebookUrl"),
      instagram: optionalString(formData, "instagramUrl"),
      x: optionalString(formData, "xUrl"),
      tiktok: optionalString(formData, "tiktokUrl"),
      other: optionalString(formData, "otherSocialUrl"),
    };

    const compactSocialLinks = Object.fromEntries(
      Object.entries(socialLinks).filter(([, value]) => Boolean(value))
    );
    const profilePayload = {
      phone: phones.mobileNumber,
      whatsapp: phones.whatsappNumber,
      bio: optionalString(formData, "aboutDealership"),
      city: cityTown,
      address: dealershipAddress,
      website: optionalString(formData, "websiteUrl"),
      facebook_url: socialLinks.facebook ?? null,
      twitter_url: socialLinks.x ?? null,
      instagram_url: socialLinks.instagram ?? null,
    };

    const baseDealerPayload = {
      name: dealershipName,
      business_name: optionalString(formData, "registeredBusinessName"),
      address: dealershipAddress,
      city: cityTown,
      county: county || null,
      location: locationArea,
      mobile: phones.mobileNumber,
      email: officialEmail,
      whatsapp: phones.whatsappNumber,
      website: optionalString(formData, "websiteUrl"),
      logo_url: logoUpload?.publicUrl || null,
      about_text: optionalString(formData, "aboutDealership"),
      social_links:
        Object.keys(compactSocialLinks).length > 0 ? compactSocialLinks : null,
      contact_person: {
        name: contactFullName,
        role: contactRole,
        mobile: phones.contactMobile,
        email: contactEmail,
        whatsapp: phones.contactWhatsapp,
        photo_url: contactPhotoUpload?.publicUrl || null,
      },
      doc_incorporation_key: incorporationUpload?.r2Key || verifiedCertificateKey,
      doc_id_key: idUpload?.r2Key || null,
    };

    const uploads = [
      ["company_logo", logoUpload],
      ["contact_photo", contactPhotoUpload],
      ["incorporation_certificate", incorporationUpload],
      ["contact_id", idUpload],
    ] as const;
    const evidence = uploads.flatMap(([type, upload]) => upload ? [{
      document_type: type,
      display_name: upload.displayName,
      r2_key: upload.r2Key,
      mime_type: upload.mimeType,
      size_bytes: upload.sizeBytes,
    }] : []);
    const { data: dealer, error: dealerError } = await adminSupabase.rpc("save_dealer_registration", {
      applicant_id: user.id,
      dealership: baseDealerPayload,
      profile_details: profilePayload,
      evidence,
      submit_for_review: true,
      review_notes: optionalString(formData, "verificationNotes"),
    });
    if (dealerError || !dealer) {
      await removeDealerKycReferences(adminSupabase, [
        optionalString(formData, "incorporationCertificateUploadPath") ? null : incorporationUpload?.r2Key,
        optionalString(formData, "contactPersonIdUploadPath") ? null : idUpload?.r2Key,
      ]);
      return { error: dealerError?.message || "Unable to submit dealer verification. Please retry." };
    }

    const stagedPhotoPaths = ["companyLogo", "contactPhoto"]
      .map((field) => optionalString(formData, `${field}UploadPath`))
      .filter((path): path is string => Boolean(path));
    if (stagedPhotoPaths.length > 0) {
      try {
        const { error } = await adminSupabase.storage.from(DEALER_KYC_BUCKET).remove(stagedPhotoPaths);
        if (error) console.warn("Unable to remove staged dealer photos:", error.message);
      } catch (error) {
        console.warn("Unable to remove staged dealer photos:", error);
      }
    }

    const warning = await logAudit(user.id, "dealer_verification_submitted", "dealer", dealer.id, {
      submitted_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/register/dealer");
    revalidatePath("/admin/dealers");

    return { success: true as const, dealerId: dealer.id, warning };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to submit dealer verification.",
    };
  }
}

export async function resubmitDealerVerificationDocuments(formData: FormData) {
  const applicant = await requireDealerApplicant();
  // The verification panel redirects to sign-in when it receives this exact error.
  if ("error" in applicant) {
    return { error: applicant.code === "session_expired" ? "Unauthorized" : applicant.error, code: applicant.code };
  }
  const { user } = applicant;
  const adminSupabase = createAdminClient();

  try {
    const intent = requiredString(formData, "intent") === "draft" ? "draft" : "submit";
    const companyLogo = getFile(formData, "companyLogo");
    const contactPhoto = getFile(formData, "contactPhoto");
    const incorporationCertificate = getFile(formData, "incorporationCertificate");
    const contactPersonId = getFile(formData, "contactPersonId");

    assertFile(companyLogo, IMAGE_ACCEPTED_TYPES, "Company logo", false);
    assertFile(contactPhoto, IMAGE_ACCEPTED_TYPES, "Primary contact photo", false);
    assertFile(
      incorporationCertificate,
      DOC_ACCEPTED_TYPES,
      "Certificate of incorporation",
      false
    );
    assertFile(contactPersonId, DOC_ACCEPTED_TYPES, "Primary contact ID", false);

    const dealerResult = await adminSupabase
      .from("dealers")
      .select(
        "id, profile_id, status, contact_person, doc_incorporation_key, doc_id_key"
      )
      .eq("profile_id", user.id)
      .maybeSingle();
    let dealer = dealerResult.data as DealerVerificationResubmissionRow | null;
    let dealerError = dealerResult.error;

    if (dealerError && isMissingDealerDocumentColumn(dealerError)) {
      const fallback = await adminSupabase
        .from("dealers")
        .select("id, profile_id, status, contact_person")
        .eq("profile_id", user.id)
        .maybeSingle();
      dealer = fallback.data as DealerVerificationResubmissionRow | null;
      dealerError = fallback.error;
    }

    if (dealerError) {
      return { error: dealerError.message };
    }

    if (!dealer) {
      return { error: "Create a dealer verification request before uploading documents." };
    }

    if (dealer.status === "INCOMPLETE") {
      return { error: "Complete the dealership details before submitting verification." };
    }
    if (dealer.status === "APPROVED") {
      return { error: "This dealership is already verified." };
    }

    const hasSelectedFiles = Boolean(
      companyLogo || contactPhoto || incorporationCertificate || contactPersonId
    );

    if (!hasSelectedFiles && intent === "draft" && !formData.has("verificationNotes")) {
      return { error: "Choose a file or add verification notes to save a draft." };
    }

    const { data: existingDocuments, error: documentsError } = await adminSupabase
      .from("dealer_verification_documents")
      .select("document_type, r2_key")
      .eq("dealer_id", dealer.id);

    if (documentsError && !isMissingDealerVerificationDocumentsTable(documentsError)) {
      return { error: documentsError.message };
    }

    const existingDocumentTypes = new Set(
      ((existingDocuments || []) as Array<{
        document_type: DealerVerificationDocumentType;
        r2_key: string;
      }>).map(
        (document) => document.document_type
      )
    );

    const hasIncorporationCertificate =
      Boolean(incorporationCertificate) ||
      existingDocumentTypes.has("incorporation_certificate") ||
      Boolean(dealer.doc_incorporation_key);

    if (intent === "submit" && !hasIncorporationCertificate) {
      return {
        error:
          "Certificate of incorporation is required before submitting.",
      };
    }

    const [logoUpload, contactPhotoUpload, incorporationUpload, idUpload] =
      await Promise.all([
        companyLogo ? uploadDealerPublicFile(user.id, companyLogo, "branding") : Promise.resolve(null),
        contactPhoto ? uploadDealerPublicFile(user.id, contactPhoto, "contact") : Promise.resolve(null),
        incorporationCertificate
          ? uploadDealerKycFile(
              adminSupabase,
              user.id,
              incorporationCertificate,
              "incorporation_certificate",
            )
          : Promise.resolve(null),
        contactPersonId
          ? uploadDealerKycFile(adminSupabase, user.id, contactPersonId, "contact_id")
          : Promise.resolve(null),
      ]);

    const uploadedRows = [
      logoUpload
        ? {
            dealer_id: dealer.id,
            uploaded_by: user.id,
            document_type: "company_logo",
            display_name: logoUpload.displayName,
            r2_key: logoUpload.r2Key,
            mime_type: logoUpload.mimeType,
            size_bytes: logoUpload.sizeBytes,
          }
        : null,
      contactPhotoUpload
        ? {
            dealer_id: dealer.id,
            uploaded_by: user.id,
            document_type: "contact_photo",
            display_name: contactPhotoUpload.displayName,
            r2_key: contactPhotoUpload.r2Key,
            mime_type: contactPhotoUpload.mimeType,
            size_bytes: contactPhotoUpload.sizeBytes,
          }
        : null,
      incorporationUpload
        ? {
            dealer_id: dealer.id,
            uploaded_by: user.id,
            document_type: "incorporation_certificate",
            display_name: incorporationUpload.displayName,
            r2_key: incorporationUpload.r2Key,
            mime_type: incorporationUpload.mimeType,
            size_bytes: incorporationUpload.sizeBytes,
          }
        : null,
      idUpload
        ? {
            dealer_id: dealer.id,
            uploaded_by: user.id,
            document_type: "contact_id",
            display_name: idUpload.displayName,
            r2_key: idUpload.r2Key,
            mime_type: idUpload.mimeType,
            size_bytes: idUpload.sizeBytes,
          }
        : null,
    ].filter((value): value is DealerVerificationInsertRow => Boolean(value));

    const uploadedTypes = uploadedRows.map((row) => row.document_type);

    if (uploadedTypes.length > 0) {
      const { error: deleteDocumentError } = await adminSupabase
        .from("dealer_verification_documents")
        .delete()
        .eq("dealer_id", dealer.id)
        .in("document_type", uploadedTypes);

      if (deleteDocumentError && !isMissingDealerVerificationDocumentsTable(deleteDocumentError)) {
        return { error: deleteDocumentError.message };
      }

      const { error: insertDocumentError } = await adminSupabase
        .from("dealer_verification_documents")
        .insert(uploadedRows);

      if (insertDocumentError && !isMissingDealerVerificationDocumentsTable(insertDocumentError)) {
        return { error: insertDocumentError.message };
      }
    }

    const dealerUpdates: Record<string, unknown> = {};

    if (intent === "submit") {
      dealerUpdates.status = "PENDING";
      dealerUpdates.verified_by = null;
      dealerUpdates.verified_at = null;
      dealerUpdates.rejection_reason = null;
    }

    if (logoUpload) {
      dealerUpdates.logo_url = logoUpload.publicUrl;
    }

    if (contactPhotoUpload) {
      dealerUpdates.contact_person = {
        ...(dealer.contact_person || {}),
        photo_url: contactPhotoUpload.publicUrl,
      };
    }

    if (incorporationUpload) {
      dealerUpdates.doc_incorporation_key = incorporationUpload.r2Key;
    }

    if (idUpload) {
      dealerUpdates.doc_id_key = idUpload.r2Key;
    }

    if (Object.keys(dealerUpdates).length > 0) {
      let { error: updateError } = await adminSupabase
        .from("dealers")
        .update(dealerUpdates)
        .eq("id", dealer.id)
        .eq("profile_id", user.id);

      if (updateError && isMissingDealerDocumentColumn(updateError)) {
        const legacyUpdates = omitUpdateKeys(dealerUpdates, [
          "doc_incorporation_key",
          "doc_id_key",
        ]);
        const legacyResult = await adminSupabase
          .from("dealers")
          .update(legacyUpdates)
          .eq("id", dealer.id)
          .eq("profile_id", user.id);
        updateError = legacyResult.error;
      }

      if (updateError) {
        return { error: updateError.message };
      }
    }

    const { error: workflowError } = await adminSupabase
      .from("dealer_verification_workflows")
      .upsert({
        dealer_id: dealer.id,
        verification_notes: optionalString(formData, "verificationNotes"),
        preferred_confirmation_channel: "email",
        ...(intent === "submit" ? {
          submitted_at: new Date().toISOString(),
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
        } : {}),
      }, { onConflict: "dealer_id" });
    if (workflowError) {
      return { error: "Your documents were saved, but verification details could not be saved. Please retry." };
    }

    await removeDealerKycReferences(
      adminSupabase,
      ((existingDocuments || []) as Array<{
        document_type: DealerVerificationDocumentType;
        r2_key: string;
      }>)
        .filter((document) => uploadedTypes.includes(document.document_type))
        .map((document) => document.r2_key),
    );

    const warning = await logAudit(
      user.id,
      intent === "draft" ? "dealer_verification_documents_saved" : "dealer_verification_resubmitted",
      "dealer",
      dealer.id,
      { document_types: uploadedTypes }
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/admin/dealers");

    return { success: true as const, intent, warning };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update dealer verification documents.",
    };
  }
}

async function finishDealerReview(input: {
  dealerId: string;
  profileId: string;
  actorId: string;
  status: "APPROVED" | "REJECTED";
  reviewedAt: string;
  note: string | null;
}) {
  const warnings: string[] = [];
  const { error: workflowError } = await createAdminClient()
    .from("dealer_verification_workflows")
    .upsert({
      dealer_id: input.dealerId,
      reviewed_by: input.actorId,
      reviewed_at: input.reviewedAt,
      review_notes: input.note,
    }, { onConflict: "dealer_id" });
  if (workflowError) {
    warnings.push("The review was saved, but its private notes and timeline could not be saved.");
  }

  const approved = input.status === "APPROVED";
  try {
    await emitNotificationEvent({
      eventType: "dealer_verification_status_changed",
      actorId: input.actorId,
      payload: { dealer_id: input.dealerId, status: input.status, reviewed_at: input.reviewedAt },
      deliveries: (["in_app", "email"] as const).map((channel) => ({
        recipientId: input.profileId,
        channel,
        title: approved ? "Your dealership is approved" : "Your dealership verification needs attention",
        body: approved
          ? "Your dealership has been approved. Sign in to manage your profile and publish vehicle listings."
          : `Please sign in to review the feedback and resubmit your dealership documents.${input.note ? ` Feedback: ${input.note}` : ""}`,
        href: approved ? "/dashboard" : "/dashboard/verification",
      })),
    });
  } catch (error) {
    console.error("Unable to queue dealer review notification:", error);
    warnings.push("The review was saved, but its email notification could not be queued. Please contact the dealer directly.");
  }
  return warnings.length > 0 ? warnings.join(" ") : undefined;
}

export async function approveDealer(dealerId: string, note?: string) {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) return adminContext;

  const { user } = adminContext;
  const adminSupabase = createAdminClient();
  const reviewedAt = new Date().toISOString();
  const { data: dealer, error: dealerError } = await adminSupabase
    .from("dealers")
    .update({
      status: "APPROVED",
      verified_by: user.id,
      verified_at: reviewedAt,
      rejection_reason: null,
    })
    .eq("id", dealerId)
    .neq("status", "APPROVED")
    .neq("status", "INCOMPLETE")
    .select("id, profile_id")
    .maybeSingle();

  if (dealerError) return { error: dealerError.message };
  if (!dealer) {
    const { data: existing, error } = await adminSupabase.from("dealers").select("status").eq("id", dealerId).maybeSingle();
    if (error || !existing) return { error: error?.message || "Dealer not found." };
    if (existing.status === "INCOMPLETE") return { error: "This dealership has not submitted verification." };
    return { success: true };
  }

  await adminSupabase.from("profiles").update({ role: "dealer" }).eq("id", dealer.profile_id);
  const auditWarning = await logAudit(user.id, "dealer_approved", "dealer", dealer.id, { note: note || null });
  const reviewWarning = await finishDealerReview({
    dealerId: dealer.id, profileId: dealer.profile_id, actorId: user.id,
    status: "APPROVED", reviewedAt, note: note || null,
  });
  const warning = [auditWarning, reviewWarning].filter(Boolean).join(" ") || undefined;

  revalidatePath("/admin/dealers");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath("/register/dealer");
  revalidatePath("/dealers");

  return { success: true, warning };
}

export async function rejectDealer(dealerId: string, reason: string) {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) return adminContext;

  const { user } = adminContext;
  const adminSupabase = createAdminClient();
  const reviewedAt = new Date().toISOString();
  const { data: dealer, error: dealerError } = await adminSupabase
    .from("dealers")
    .update({
      status: "REJECTED",
      verified_by: null,
      verified_at: null,
      rejection_reason: reason || "Needs additional review.",
    })
    .eq("id", dealerId)
    .neq("status", "REJECTED")
    .neq("status", "INCOMPLETE")
    .select("id, profile_id")
    .maybeSingle();

  if (dealerError) return { error: dealerError.message };
  if (!dealer) {
    const { data: existing, error } = await adminSupabase.from("dealers").select("status").eq("id", dealerId).maybeSingle();
    if (error || !existing) return { error: error?.message || "Dealer not found." };
    if (existing.status === "INCOMPLETE") return { error: "This dealership has not submitted verification." };
    return { success: true };
  }

  const auditWarning = await logAudit(user.id, "dealer_rejected", "dealer", dealer.id, {
    reason: reason || null,
  });
  const reviewWarning = await finishDealerReview({
    dealerId: dealer.id, profileId: dealer.profile_id, actorId: user.id,
    status: "REJECTED", reviewedAt, note: reason || "Needs additional review.",
  });
  const warning = [auditWarning, reviewWarning].filter(Boolean).join(" ") || undefined;

  revalidatePath("/admin/dealers");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath("/register/dealer");

  return { success: true, warning };
}
