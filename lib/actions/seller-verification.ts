"use server";

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/admin/guard";
import { isSellerVerificationSchemaUnavailable } from "@/lib/data/seller-verification";
import { sendProviderPhoneOtp } from "@/lib/server/delivery-providers";
import { isWhatsAppEnabled } from "@/lib/server/whatsapp-availability";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasCompleteSellerIdentity, listingPhoneSchema, sellerIdentityDocuments } from "@/lib/validations/registration";
import type { SellerVerificationDocumentType } from "@/lib/types/seller-verification";
import {
  isValidPhoneNumber,
  normalizePhoneForVerification,
} from "@/lib/utils/phone";

const SELLER_KYC_BUCKET = "seller-kyc";
const MAX_KYC_FILE_BYTES = 6 * 1024 * 1024;
const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RESEND_MS = 60 * 1000;
const OTP_MAX_ATTEMPTS = 5;
const PHONE_VERIFICATION_UNAVAILABLE =
  "Phone verification is temporarily unavailable. Contact Autolist support for assistance.";
const PRIVATE_VERIFICATION_UNAVAILABLE =
  "Private seller verification is temporarily unavailable. Contact Autolist support for assistance.";

const ACCEPTED_KYC_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type UploadDescriptor = {
  documentType: SellerVerificationDocumentType;
  fileName: string;
  contentType: string;
  sizeBytes: number;
};

type UploadedSellerDocument = UploadDescriptor & { storagePath: string };

type SellerContext = Awaited<ReturnType<typeof requirePrivateSeller>>;

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

function assertUploadDescriptor(input: UploadDescriptor) {
  if (!input || !Object.hasOwn(sellerIdentityDocuments, input.documentType)) {
    throw new Error("Choose a supported ID document type.");
  }

  if (typeof input.fileName !== "string" || !input.fileName.trim() || input.fileName.length > 255) throw new Error("Choose an ID document.");
  if (!ACCEPTED_KYC_MIME_TYPES.has(input.contentType)) {
    throw new Error("Upload a PDF, JPG, PNG, or WEBP document.");
  }
  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    throw new Error("The selected document is empty.");
  }
  if (input.sizeBytes > MAX_KYC_FILE_BYTES) {
    throw new Error("The ID document must be 6MB or smaller.");
  }
}

function getOtpSecret() {
  const secret = process.env.SELLER_PHONE_OTP_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("Phone verification is not configured yet.");
  }
  return secret;
}

function digestOtp(profileId: string, phone: string, code: string) {
  return createHmac("sha256", getOtpSecret())
    .update(`${profileId}:${phone}:${code}`)
    .digest("hex");
}

function digestsMatch(expected: string, actual: string) {
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return (
    expectedBuffer.length === actualBuffer.length &&
    timingSafeEqual(expectedBuffer, actualBuffer)
  );
}

function maskPhone(phone: string) {
  return phone.length <= 6
    ? phone
    : `${phone.slice(0, 4)}••••${phone.slice(-3)}`;
}

async function requirePrivateSeller(registration = false) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { error: "Unauthorized" as const };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, deactivated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.deactivated_at ||
      (profile.role !== "seller" && !(registration && profile.role === "buyer"))) {
    return {
      error:
        "Private seller verification is only available to individual sellers." as const,
    };
  }

  return { supabase, user };
}

function isSellerContextError(
  context: SellerContext,
): context is Extract<SellerContext, { error: string }> {
  return "error" in context;
}

async function ensureSellerVerificationRow(profileId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("seller_verifications")
    .upsert(
      { profile_id: profileId },
      { onConflict: "profile_id", ignoreDuplicates: true },
    );

  if (error) throw error;
  return admin;
}

async function ensureEditableSellerVerification(profileId: string) {
  const admin = await ensureSellerVerificationRow(profileId);
  const { data, error } = await admin
    .from("seller_verifications")
    .select("status")
    .eq("profile_id", profileId)
    .single<{ status: string }>();

  if (error) throw error;
  if (data.status === "pending") {
    throw new Error("Your verification is under review and cannot be changed.");
  }
  if (data.status === "approved") {
    throw new Error("Your seller account is already verified.");
  }

  return admin;
}

async function logSellerVerificationAudit(
  actorId: string,
  action: string,
  profileId: string,
  details: Record<string, unknown>,
) {
  const admin = createAdminClient();
  await admin.from("audit_logs").insert({
    user_id: actorId,
    action,
    entity_type: "seller_verification",
    entity_id: profileId,
    details,
  });
}

export async function createSellerKycUploadTicket(input: UploadDescriptor, registration = false) {
  const context = await requirePrivateSeller(registration);
  if (isSellerContextError(context)) return context;
  if (!registration && !isWhatsAppEnabled()) return { error: PRIVATE_VERIFICATION_UNAVAILABLE };

  try {
    assertUploadDescriptor(input);
    const admin = registration
      ? createAdminClient()
      : await ensureEditableSellerVerification(context.user.id);
    const safeName = sanitizeFileName(input.fileName) || "identity-document";
    const storagePath = `${context.user.id}/${input.documentType}/${Date.now()}-${nanoid(10)}-${safeName}`;
    const { data, error } = await admin.storage
      .from(SELLER_KYC_BUCKET)
      .createSignedUploadUrl(storagePath);

    if (error || !data?.token) {
      return {
        error: error?.message || "Unable to prepare the secure ID upload.",
      };
    }

    return {
      success: true as const,
      bucket: SELLER_KYC_BUCKET,
      path: storagePath,
      token: data.token,
    };
  } catch (error) {
    if (
      isSellerVerificationSchemaUnavailable(
        error as { code?: string; message?: string },
      )
    ) {
      return {
        error: "Private seller verification setup is not available yet.",
      };
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to prepare the secure ID upload.",
    };
  }
}

async function readSellerKycUpload(
  admin: ReturnType<typeof createAdminClient>, userId: string, input: UploadedSellerDocument,
) {
  assertUploadDescriptor(input);
  const folder = [userId, input.documentType].join("/");
  const expectedPrefix = folder + "/";
  const objectName = input.storagePath?.slice(expectedPrefix.length);
  if (!input.storagePath?.startsWith(expectedPrefix) || !objectName ||
      !/^\d+-[\w-]{10}-[a-z0-9._-]{1,120}$/.test(objectName)) {
    throw new Error("The uploaded document does not belong to this verification request.");
  }

  const { data: objects, error } = await admin.storage.from(SELLER_KYC_BUCKET)
    .list(folder, { limit: 10, search: objectName });
  const stored = objects?.find((object) => object.name === objectName);
  const sizeBytes = Number(stored?.metadata?.size);
  const mimeType = stored?.metadata?.mimetype;
  if (error || sizeBytes !== input.sizeBytes || typeof mimeType !== "string" ||
      mimeType !== input.contentType || !ACCEPTED_KYC_MIME_TYPES.has(mimeType)) {
    throw new Error("The secure upload could not be verified. Select the file again and retry.");
  }
  return {
    document_type: input.documentType,
    storage_path: input.storagePath,
    display_name: input.fileName.trim(),
    mime_type: mimeType,
    size_bytes: sizeBytes,
  };
}

export async function savePrivateSellerRegistration(rawPhone: string, documents: UploadedSellerDocument[]) {
  const context = await requirePrivateSeller(true);
  if (isSellerContextError(context)) return context;
  const phone = listingPhoneSchema.safeParse(rawPhone);
  if (!phone.success) return { error: "Enter a valid phone number." };
  if (!Array.isArray(documents) || documents.length < 1 || documents.length > 2) {
    return { error: "Upload both sides of your national ID or your passport photo page." };
  }
  const types = documents.map((document) => document?.documentType);
  if (!hasCompleteSellerIdentity(types) || (types.includes("passport") && types.length !== 1)) {
    return { error: "Upload both sides of your national ID or your passport photo page." };
  }

  try {
    const admin = createAdminClient();
    const evidence = await Promise.all(documents.map((document) => readSellerKycUpload(admin, context.user.id, document)));
    const { data, error } = await admin.rpc("save_private_seller_registration", {
      applicant_id: context.user.id,
      listing_phone: phone.data,
      evidence,
    });
    if (error) return { error: error.message };

    const currentPaths = new Set(evidence.map((document) => document.storage_path));
    const replaced = (data as string[] | null)?.filter(
      (path) => path.startsWith(context.user.id + "/") && !currentPaths.has(path),
    );
    if (replaced?.length) {
      const { error: cleanupError } = await admin.storage.from(SELLER_KYC_BUCKET).remove(replaced);
      if (cleanupError) console.warn("Unable to remove replaced private seller documents:", cleanupError.message);
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    return { success: true as const };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to save your seller setup. Please retry." };
  }
}

export async function finalizeSellerKycDocument(input: UploadedSellerDocument) {
  const context = await requirePrivateSeller();
  if (isSellerContextError(context)) return context;
  if (!isWhatsAppEnabled()) return { error: PRIVATE_VERIFICATION_UNAVAILABLE };

  try {
    const admin = await ensureEditableSellerVerification(context.user.id);
    const document = await readSellerKycUpload(admin, context.user.id, input);
    const { data: existingDocument } = await admin
      .from("seller_verification_documents")
      .select("storage_path")
      .eq("profile_id", context.user.id)
      .eq("document_type", input.documentType)
      .maybeSingle<{ storage_path: string }>();

    const { error: documentError } = await admin
      .from("seller_verification_documents")
      .upsert(
        {
          profile_id: context.user.id,
          ...document,
          created_at: new Date().toISOString(),
        },
        { onConflict: "profile_id,document_type" },
      );

    if (documentError) {
      await admin.storage.from(SELLER_KYC_BUCKET).remove([input.storagePath]);
      return { error: documentError.message };
    }

    const { error: verificationError } = await admin
      .from("seller_verifications")
      .update({
        status: "draft",
        submitted_at: null,
        reviewed_by: null,
        reviewed_at: null,
        review_notes: null,
        updated_at: new Date().toISOString(),
      })
      .eq("profile_id", context.user.id);

    if (verificationError) return { error: verificationError.message };

    if (
      existingDocument?.storage_path &&
      existingDocument.storage_path !== input.storagePath
    ) {
      await admin.storage
        .from(SELLER_KYC_BUCKET)
        .remove([existingDocument.storage_path]);
    }

    await logSellerVerificationAudit(
      context.user.id,
      "seller_kyc_document_uploaded",
      context.user.id,
      { document_type: input.documentType },
    );

    revalidatePath("/dashboard/verification");
    revalidatePath("/admin/verification");
    return { success: true as const };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save the ID document.",
    };
  }
}

export async function requestSellerPhoneOtp(rawPhone: string) {
  const context = await requirePrivateSeller();
  if (isSellerContextError(context)) return context;
  if (!isWhatsAppEnabled()) return { error: PHONE_VERIFICATION_UNAVAILABLE };

  const phone = normalizePhoneForVerification(rawPhone);
  if (!isValidPhoneNumber(phone) || !phone.startsWith("+")) {
    return { error: "Enter a valid phone number with country code." };
  }

  try {
    const admin = await ensureEditableSellerVerification(context.user.id);
    const { data: existing, error: existingError } = await admin
      .from("seller_phone_verification_challenges")
      .select("resend_available_at")
      .eq("profile_id", context.user.id)
      .maybeSingle<{ resend_available_at: string }>();

    if (
      existingError &&
      !isSellerVerificationSchemaUnavailable(existingError)
    ) {
      return { error: existingError.message };
    }

    const now = Date.now();
    const resendAt = existing?.resend_available_at
      ? new Date(existing.resend_available_at).getTime()
      : 0;
    if (resendAt > now) {
      return {
        error: `Wait ${Math.ceil((resendAt - now) / 1000)} seconds before requesting another code.`,
      };
    }

    const code = randomInt(100000, 1000000).toString();
    const codeDigest = digestOtp(context.user.id, phone, code);
    const expiresAt = new Date(now + OTP_TTL_MS).toISOString();
    const resendAvailableAt = new Date(now + OTP_RESEND_MS).toISOString();
    const { error: challengeError } = await admin
      .from("seller_phone_verification_challenges")
      .upsert({
        profile_id: context.user.id,
        phone,
        code_digest: codeDigest,
        expires_at: expiresAt,
        resend_available_at: resendAvailableAt,
        attempt_count: 0,
        consumed_at: null,
        updated_at: new Date(now).toISOString(),
      });

    if (challengeError) return { error: challengeError.message };

    const delivery = await sendProviderPhoneOtp({
      to: phone,
      code,
    });

    if (!delivery.success) {
      await admin
        .from("seller_phone_verification_challenges")
        .delete()
        .eq("profile_id", context.user.id);
      return {
        error: delivery.skipped
          ? "Phone verification delivery is not configured yet."
          : delivery.error || "The verification code could not be sent.",
      };
    }

    const { data: verification } = await admin
      .from("seller_verifications")
      .select("phone")
      .eq("profile_id", context.user.id)
      .single<{ phone: string | null }>();

    if (verification?.phone !== phone) {
      await admin
        .from("seller_verifications")
        .update({
          phone,
          phone_verified_at: null,
          status: "draft",
          submitted_at: null,
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", context.user.id);
    }

    return {
      success: true as const,
      channel: "WhatsApp" as const,
      maskedPhone: maskPhone(phone),
      expiresInSeconds: OTP_TTL_MS / 1000,
      resendAfterSeconds: OTP_RESEND_MS / 1000,
    };
  } catch (error) {
    if (
      isSellerVerificationSchemaUnavailable(
        error as { code?: string; message?: string },
      )
    ) {
      return {
        error: "Private seller verification setup is not available yet.",
      };
    }
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to send the verification code.",
    };
  }
}

export async function verifySellerPhoneOtp(rawCode: string) {
  const context = await requirePrivateSeller();
  if (isSellerContextError(context)) return context;
  if (!isWhatsAppEnabled()) return { error: PHONE_VERIFICATION_UNAVAILABLE };

  const code = rawCode.replace(/\D/g, "");
  if (!/^\d{6}$/.test(code))
    return { error: "Enter the six-digit verification code." };

  try {
    const admin = await ensureEditableSellerVerification(context.user.id);
    const { data: challenge, error: challengeError } = await admin
      .from("seller_phone_verification_challenges")
      .select("phone, code_digest, expires_at, attempt_count, consumed_at")
      .eq("profile_id", context.user.id)
      .maybeSingle<{
        phone: string;
        code_digest: string;
        expires_at: string;
        attempt_count: number;
        consumed_at: string | null;
      }>();

    if (challengeError) return { error: challengeError.message };
    if (!challenge || challenge.consumed_at) {
      return { error: "Request a new verification code." };
    }
    if (new Date(challenge.expires_at).getTime() <= Date.now()) {
      return {
        error: "This verification code has expired. Request a new one.",
      };
    }
    if (challenge.attempt_count >= OTP_MAX_ATTEMPTS) {
      return { error: "Too many incorrect attempts. Request a new code." };
    }

    const actualDigest = digestOtp(context.user.id, challenge.phone, code);
    if (!digestsMatch(challenge.code_digest, actualDigest)) {
      const nextAttemptCount = challenge.attempt_count + 1;
      await admin
        .from("seller_phone_verification_challenges")
        .update({
          attempt_count: nextAttemptCount,
          updated_at: new Date().toISOString(),
        })
        .eq("profile_id", context.user.id)
        .eq("attempt_count", challenge.attempt_count);

      const remaining = Math.max(0, OTP_MAX_ATTEMPTS - nextAttemptCount);
      return {
        error:
          remaining > 0
            ? `That code is incorrect. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many incorrect attempts. Request a new code.",
      };
    }

    const verifiedAt = new Date().toISOString();
    const { error: profileError } = await admin
      .from("profiles")
      .update({ phone: challenge.phone })
      .eq("id", context.user.id)
      .eq("role", "seller");
    if (profileError) return { error: profileError.message };

    const { error: verificationError } = await admin
      .from("seller_verifications")
      .update({
        phone: challenge.phone,
        phone_verified_at: verifiedAt,
        updated_at: verifiedAt,
      })
      .eq("profile_id", context.user.id);
    if (verificationError) return { error: verificationError.message };

    await admin
      .from("seller_phone_verification_challenges")
      .update({ consumed_at: verifiedAt, updated_at: verifiedAt })
      .eq("profile_id", context.user.id);

    await logSellerVerificationAudit(
      context.user.id,
      "seller_phone_verified",
      context.user.id,
      { channel: "whatsapp" },
    );

    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/verification");
    return {
      success: true as const,
      phone: challenge.phone,
      verifiedAt,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to verify the phone number.",
    };
  }
}

export async function submitSellerVerification() {
  const context = await requirePrivateSeller();
  if (isSellerContextError(context)) return context;
  if (!isWhatsAppEnabled()) return { error: PRIVATE_VERIFICATION_UNAVAILABLE };

  try {
    const admin = createAdminClient();
    const [
      { data: verification, error: verificationError },
      { data: documents, error: documentsError },
    ] = await Promise.all([
      admin
        .from("seller_verifications")
        .select("status, phone, phone_verified_at")
        .eq("profile_id", context.user.id)
        .maybeSingle<{
          status: string;
          phone: string | null;
          phone_verified_at: string | null;
        }>(),
      admin
        .from("seller_verification_documents")
        .select("document_type")
        .eq("profile_id", context.user.id),
    ]);

    if (verificationError) return { error: verificationError.message };
    if (documentsError) return { error: documentsError.message };
    if (!verification?.phone || !verification.phone_verified_at) {
      return { error: "Verify your phone number before submitting KYC." };
    }
    if (!hasCompleteSellerIdentity((documents || []).map((document) => document.document_type))) {
      return { error: "Upload both sides of your national ID or your passport photo page before submitting." };
    }
    if (verification.status === "approved") {
      return { error: "This seller account is already verified." };
    }
    if (verification.status === "pending") {
      return { error: "This verification is already under review." };
    }

    const submittedAt = new Date().toISOString();
    const { error: updateError } = await admin
      .from("seller_verifications")
      .update({
        status: "pending",
        submitted_at: submittedAt,
        reviewed_by: null,
        reviewed_at: null,
        review_notes: null,
        updated_at: submittedAt,
      })
      .eq("profile_id", context.user.id);

    if (updateError) return { error: updateError.message };

    await logSellerVerificationAudit(
      context.user.id,
      "seller_verification_submitted",
      context.user.id,
      {},
    );
    revalidatePath("/dashboard/verification");
    revalidatePath("/admin/verification");
    return { success: true as const };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit seller verification.",
    };
  }
}

export async function approveSellerVerification(
  profileId: string,
  note?: string,
) {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) return adminContext;

  const admin = createAdminClient();
  const [
    { data: verification, error: verificationError },
    { data: documents, error: documentError },
  ] = await Promise.all([
    admin
      .from("seller_verifications")
      .select("status, phone_verified_at")
      .eq("profile_id", profileId)
      .maybeSingle<{ status: string; phone_verified_at: string | null }>(),
    admin
      .from("seller_verification_documents")
      .select("document_type")
      .eq("profile_id", profileId),
  ]);

  if (verificationError) return { error: verificationError.message };
  if (documentError) return { error: documentError.message };
  if (!verification || verification.status !== "pending") {
    return { error: "Seller verification is not pending review." };
  }
  if (!verification.phone_verified_at) {
    return { error: "The seller phone number is not verified." };
  }
  if (!hasCompleteSellerIdentity((documents || []).map((document) => document.document_type))) {
    return { error: "Both sides of the seller national ID or the passport photo page are required." };
  }

  const reviewedAt = new Date().toISOString();
  const { error } = await admin
    .from("seller_verifications")
    .update({
      status: "approved",
      reviewed_by: adminContext.user.id,
      reviewed_at: reviewedAt,
      review_notes: note?.trim() || null,
      updated_at: reviewedAt,
    })
    .eq("profile_id", profileId)
    .eq("status", "pending");

  if (error) return { error: error.message };

  await logSellerVerificationAudit(
    adminContext.user.id,
    "seller_verification_approved",
    profileId,
    {},
  );
  revalidatePath("/admin/verification");
  revalidatePath("/dashboard/verification");
  return { success: true as const };
}

export async function rejectSellerVerification(
  profileId: string,
  reason: string,
) {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) return adminContext;

  const normalizedReason = reason.trim();
  if (!normalizedReason) return { error: "Add a reason for the seller." };

  const reviewedAt = new Date().toISOString();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("seller_verifications")
    .update({
      status: "rejected",
      reviewed_by: adminContext.user.id,
      reviewed_at: reviewedAt,
      review_notes: normalizedReason,
      updated_at: reviewedAt,
    })
    .eq("profile_id", profileId)
    .eq("status", "pending")
    .select("profile_id")
    .maybeSingle();

  if (error) return { error: error.message };
  if (!data) return { error: "Seller verification is not pending review." };

  await logSellerVerificationAudit(
    adminContext.user.id,
    "seller_verification_rejected",
    profileId,
    { reason: normalizedReason },
  );
  revalidatePath("/admin/verification");
  revalidatePath("/dashboard/verification");
  return { success: true as const };
}
