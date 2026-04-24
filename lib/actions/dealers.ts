"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { r2 } from "@/lib/r2";
import { requireAdminAction } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/utils/listings";

type DealerVerificationInsertRow = {
  dealer_id: string;
  uploaded_by: string;
  document_type: "company_logo" | "contact_photo" | "incorporation_certificate" | "contact_id";
  display_name: string;
  r2_key: string;
  mime_type: string;
  size_bytes: number;
};

type DealerVerificationDocumentType = DealerVerificationInsertRow["document_type"];

type DealerVerificationResubmissionRow = {
  id: string;
  profile_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  contact_person: { photo_url?: string | null; [key: string]: unknown } | null;
  doc_incorporation_key?: string | null;
  doc_id_key?: string | null;
  submitted_at?: string | null;
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

type PostgrestSchemaError = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
  code?: string | null;
};

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

function normalizePhone(value: string) {
  return value.replace(/\s+/g, "");
}

function sanitizeFileName(fileName: string) {
  return fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, "-");
}

function schemaErrorIncludes(error: PostgrestSchemaError | null | undefined, value: string) {
  if (!error) return false;
  return [error.message, error.details, error.hint].some((part) =>
    typeof part === "string" ? part.includes(value) : false
  );
}

function omitUpdateKeys(source: Record<string, unknown>, keys: string[]) {
  const next = { ...source };
  for (const key of keys) {
    delete next[key];
  }
  return next;
}

function isMissingDealerWorkflowColumns(error: PostgrestSchemaError | null | undefined) {
  return [
    "submitted_at",
    "reviewed_by",
    "reviewed_at",
    "review_notes",
    "verification_notes",
    "preferred_confirmation_channel",
  ].some((column) => schemaErrorIncludes(error, column));
}

function isMissingDealerVerificationDocumentsTable(error: PostgrestSchemaError | null | undefined) {
  return schemaErrorIncludes(error, "dealer_verification_documents");
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

async function uploadDealerFile(
  userId: string,
  file: File,
  folder: "branding" | "contact" | "verification"
) {
  if (!R2_BUCKET_NAME) {
    throw new Error("R2 bucket configuration is missing.");
  }

  const extension = file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf("."))
    : "";
  const baseName = extension ? file.name.slice(0, -extension.length) : file.name;
  const r2Key = `dealers/${userId}/${folder}/${Date.now()}-${nanoid(10)}-${sanitizeFileName(
    `${baseName}${extension}`
  )}`;

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

async function logAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown>
) {
  const supabase = await createClient();

  await supabase.from("audit_logs").insert({
    user_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
}

export async function submitDealerVerification(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" as const };
  }

  try {
    const dealershipName = requiredString(formData, "dealershipName");
    const dealershipAddress = requiredString(formData, "dealershipAddress");
    const cityTown = requiredString(formData, "cityTown");
    const locationArea = requiredString(formData, "locationArea");
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

    const companyLogo = getFile(formData, "companyLogo");
    const contactPhoto = getFile(formData, "contactPhoto");
    const incorporationCertificate = getFile(formData, "incorporationCertificate");
    const contactPersonId = getFile(formData, "contactPersonId");

    assertFile(companyLogo, IMAGE_ACCEPTED_TYPES, "Company logo", false);
    assertFile(contactPhoto, IMAGE_ACCEPTED_TYPES, "Primary contact photo");
    assertFile(
      incorporationCertificate,
      DOC_ACCEPTED_TYPES,
      "Certificate of incorporation"
    );
    assertFile(contactPersonId, DOC_ACCEPTED_TYPES, "Primary contact ID", false);

    const [logoUpload, contactPhotoUpload, incorporationUpload, idUpload] =
      await Promise.all([
        companyLogo ? uploadDealerFile(user.id, companyLogo, "branding") : Promise.resolve(null),
        contactPhoto ? uploadDealerFile(user.id, contactPhoto, "contact") : Promise.resolve(null),
        incorporationCertificate
          ? uploadDealerFile(user.id, incorporationCertificate, "verification")
          : Promise.resolve(null),
        contactPersonId
          ? uploadDealerFile(user.id, contactPersonId, "verification")
          : Promise.resolve(null),
      ]);

    const socialLinks = {
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
      role: "dealer",
      phone: normalizePhone(mobileNumber),
      whatsapp: normalizePhone(whatsappNumber),
      bio: optionalString(formData, "aboutDealership"),
      city: cityTown,
      address: dealershipAddress,
      website: optionalString(formData, "websiteUrl"),
      facebook_url: socialLinks.facebook ?? null,
      twitter_url: socialLinks.x ?? null,
      instagram_url: socialLinks.instagram ?? null,
    };

    const baseDealerPayload = {
      profile_id: user.id,
      name: dealershipName,
      business_name: optionalString(formData, "registeredBusinessName"),
      status: "PENDING",
      address: dealershipAddress,
      city: cityTown,
      location: locationArea,
      mobile: normalizePhone(mobileNumber),
      email: officialEmail,
      whatsapp: normalizePhone(whatsappNumber),
      website: optionalString(formData, "websiteUrl"),
      logo_url: logoUpload?.publicUrl || null,
      about_text: optionalString(formData, "aboutDealership"),
      social_links:
        Object.keys(compactSocialLinks).length > 0 ? compactSocialLinks : null,
      contact_person: {
        name: contactFullName,
        role: contactRole,
        mobile: normalizePhone(contactMobile),
        email: contactEmail,
        whatsapp: optionalString(formData, "contactWhatsapp"),
        photo_url: contactPhotoUpload?.publicUrl || null,
      },
      doc_incorporation_key: incorporationUpload?.r2Key || null,
      doc_id_key: idUpload?.r2Key || null,
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
    };

    let { data: dealer, error: dealerError } = await adminSupabase
      .from("dealers")
      .upsert(
        {
          ...baseDealerPayload,
          submitted_at: new Date().toISOString(),
          reviewed_by: null,
          reviewed_at: null,
          review_notes: null,
          verification_notes: optionalString(formData, "verificationNotes"),
          preferred_confirmation_channel:
            requiredString(formData, "preferredConfirmationChannel") || "email",
        },
        { onConflict: "profile_id" }
      )
      .select("id")
      .single();

    if (dealerError && isMissingDealerWorkflowColumns(dealerError)) {
      const legacyResult = await adminSupabase
        .from("dealers")
        .upsert(baseDealerPayload, { onConflict: "profile_id" })
        .select("id")
        .single();
      dealer = legacyResult.data;
      dealerError = legacyResult.error;
    }

    if (dealerError || !dealer) {
      return { error: dealerError?.message || "Unable to save the dealer profile." };
    }

    const documentRows = [
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
    ].filter(
      (value): value is DealerVerificationInsertRow => Boolean(value)
    );

    const { error: deleteDocumentError } = await adminSupabase
      .from("dealer_verification_documents")
      .delete()
      .eq("dealer_id", dealer.id)
      .in("document_type", [
        "company_logo",
        "contact_photo",
        "incorporation_certificate",
        "contact_id",
      ]);

    if (deleteDocumentError && !isMissingDealerVerificationDocumentsTable(deleteDocumentError)) {
      return { error: deleteDocumentError.message };
    }

    if (documentRows.length > 0) {
      const { error: documentError } = await adminSupabase
        .from("dealer_verification_documents")
        .insert(documentRows);
      
      if (documentError && !isMissingDealerVerificationDocumentsTable(documentError)) {
        return { error: documentError.message };
      }
    }

    const { error: roleError } = await adminSupabase
      .from("profiles")
      .update(profilePayload)
      .eq("id", user.id);

    if (roleError) {
      return { error: roleError.message };
    }

    await logAudit(user.id, "dealer_verification_submitted", "dealer", dealer.id, {
      submitted_at: new Date().toISOString(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/register/dealer");
    revalidatePath("/admin/dealers");

    return { success: true as const, dealerId: dealer.id };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to submit dealer verification.",
    };
  }
}

export async function resubmitDealerVerificationDocuments(formData: FormData) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized" as const };
  }

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
        "id, profile_id, status, contact_person, doc_incorporation_key, doc_id_key, submitted_at"
      )
      .eq("profile_id", user.id)
      .maybeSingle();
    let dealer = dealerResult.data as DealerVerificationResubmissionRow | null;
    let dealerError = dealerResult.error;

    if (dealerError && isMissingDealerWorkflowColumns(dealerError)) {
      const fallback = await adminSupabase
        .from("dealers")
        .select("id, profile_id, status, contact_person, doc_incorporation_key, doc_id_key")
        .eq("profile_id", user.id)
        .maybeSingle();
      dealer = fallback.data as DealerVerificationResubmissionRow | null;
      dealerError = fallback.error;
    }

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

    const hasSelectedFiles = Boolean(
      companyLogo || contactPhoto || incorporationCertificate || contactPersonId
    );

    if (!hasSelectedFiles && intent === "draft") {
      return { error: "Choose at least one file to save as a draft." };
    }

    const { data: existingDocuments, error: documentsError } = await adminSupabase
      .from("dealer_verification_documents")
      .select("document_type")
      .eq("dealer_id", dealer.id);

    if (documentsError && !isMissingDealerVerificationDocumentsTable(documentsError)) {
      return { error: documentsError.message };
    }

    const existingDocumentTypes = new Set(
      ((existingDocuments || []) as Array<{ document_type: DealerVerificationDocumentType }>).map(
        (document) => document.document_type
      )
    );

    const hasContactPhoto =
      Boolean(contactPhoto) ||
      existingDocumentTypes.has("contact_photo") ||
      Boolean(dealer.contact_person?.photo_url);
    const hasIncorporationCertificate =
      Boolean(incorporationCertificate) ||
      existingDocumentTypes.has("incorporation_certificate") ||
      Boolean(dealer.doc_incorporation_key);

    if (intent === "submit" && (!hasContactPhoto || !hasIncorporationCertificate)) {
      return {
        error:
          "Primary contact photo and certificate of incorporation are required before submitting.",
      };
    }

    const [logoUpload, contactPhotoUpload, incorporationUpload, idUpload] =
      await Promise.all([
        companyLogo ? uploadDealerFile(user.id, companyLogo, "branding") : Promise.resolve(null),
        contactPhoto ? uploadDealerFile(user.id, contactPhoto, "contact") : Promise.resolve(null),
        incorporationCertificate
          ? uploadDealerFile(user.id, incorporationCertificate, "verification")
          : Promise.resolve(null),
        contactPersonId
          ? uploadDealerFile(user.id, contactPersonId, "verification")
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
      dealerUpdates.submitted_at = new Date().toISOString();
      dealerUpdates.reviewed_by = null;
      dealerUpdates.reviewed_at = null;
      dealerUpdates.review_notes = null;
      dealerUpdates.verified_by = null;
      dealerUpdates.verified_at = null;
      dealerUpdates.rejection_reason = null;
      dealerUpdates.verification_notes = optionalString(formData, "verificationNotes");
      dealerUpdates.preferred_confirmation_channel =
        requiredString(formData, "preferredConfirmationChannel") || "email";
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

      if (updateError && isMissingDealerWorkflowColumns(updateError)) {
        const legacyUpdates = omitUpdateKeys(dealerUpdates, [
          "submitted_at",
          "reviewed_by",
          "reviewed_at",
          "review_notes",
          "verification_notes",
          "preferred_confirmation_channel",
        ]);

        const legacyResult = await adminSupabase
          .from("dealers")
          .update(legacyUpdates)
          .eq("id", dealer.id)
          .eq("profile_id", user.id);
        updateError = legacyResult.error;
      }

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

    await logAudit(
      user.id,
      intent === "draft" ? "dealer_verification_documents_saved" : "dealer_verification_resubmitted",
      "dealer",
      dealer.id,
      { document_types: uploadedTypes }
    );

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/verification");
    revalidatePath("/admin/dealers");

    return { success: true as const, intent };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update dealer verification documents.",
    };
  }
}

export async function approveDealer(dealerId: string, note?: string) {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) return adminContext;

  const { user } = adminContext;
  const adminSupabase = createAdminClient();
  const reviewedAt = new Date().toISOString();
  let { data: dealer, error: dealerError } = await adminSupabase
    .from("dealers")
    .update({
      status: "APPROVED",
      reviewed_by: user.id,
      reviewed_at: reviewedAt,
      verified_by: user.id,
      verified_at: reviewedAt,
      rejection_reason: null,
      review_notes: note || null,
    })
    .eq("id", dealerId)
    .select("id, profile_id")
    .single();

  if (dealerError && isMissingDealerWorkflowColumns(dealerError)) {
    const legacyResult = await adminSupabase
      .from("dealers")
      .update({
        status: "APPROVED",
        verified_by: user.id,
        verified_at: reviewedAt,
        rejection_reason: null,
      })
      .eq("id", dealerId)
      .select("id, profile_id")
      .single();
    dealer = legacyResult.data;
    dealerError = legacyResult.error;
  }

  if (dealerError || !dealer) {
    return { error: dealerError?.message || "Dealer not found." };
  }

  await adminSupabase.from("profiles").update({ role: "dealer" }).eq("id", dealer.profile_id);
  await logAudit(user.id, "dealer_approved", "dealer", dealer.id, { note: note || null });

  revalidatePath("/admin/dealers");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath("/register/dealer");
  revalidatePath("/dealers");

  return { success: true };
}

export async function rejectDealer(dealerId: string, reason: string) {
  const adminContext = await requireAdminAction();
  if ("error" in adminContext) return adminContext;

  const { user } = adminContext;
  const adminSupabase = createAdminClient();
  const reviewedAt = new Date().toISOString();
  let { data: dealer, error: dealerError } = await adminSupabase
    .from("dealers")
    .update({
      status: "REJECTED",
      reviewed_by: user.id,
      reviewed_at: reviewedAt,
      verified_by: null,
      verified_at: null,
      rejection_reason: reason || "Needs additional review.",
      review_notes: reason || null,
    })
    .eq("id", dealerId)
    .select("id")
    .single();

  if (dealerError && isMissingDealerWorkflowColumns(dealerError)) {
    const legacyResult = await adminSupabase
      .from("dealers")
      .update({
        status: "REJECTED",
        verified_by: null,
        verified_at: null,
        rejection_reason: reason || "Needs additional review.",
      })
      .eq("id", dealerId)
      .select("id")
      .single();
    dealer = legacyResult.data;
    dealerError = legacyResult.error;
  }

  if (dealerError || !dealer) {
    return { error: dealerError?.message || "Dealer not found." };
  }

  await logAudit(user.id, "dealer_rejected", "dealer", dealer.id, {
    reason: reason || null,
  });

  revalidatePath("/admin/dealers");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/verification");
  revalidatePath("/register/dealer");

  return { success: true };
}
